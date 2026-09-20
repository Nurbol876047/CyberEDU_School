"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HandLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { detectPinch, detectSwipe, type SwipeSample } from "@/lib/gestures";

export type Gesture = "swipe-left" | "swipe-right" | "pinch" | "open" | "none";

export interface HandState {
  landmarks: NormalizedLandmark[] | null;
  gesture: Gesture;
  /** Pinch distance thumb↔index (0..1), null if no hand. */
  pinch: number | null;
  handedness: string | null;
}

interface Options {
  enabled?: boolean;
  onGesture?: (g: Gesture) => void;
  /** Minimum ms between two emitted swipes. */
  cooldown?: number;
  mirror?: boolean;
}

const WASM_PATH = "/mediapipe/wasm";
const MODEL_PATH = "/models/hand_landmarker.task";
const MODEL_FALLBACK =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

let landmarkerPromise: Promise<HandLandmarker> | null = null;

async function loadLandmarker(): Promise<HandLandmarker> {
  if (landmarkerPromise) return landmarkerPromise;
  landmarkerPromise = (async () => {
    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const vision = await FilesetResolver.forVisionTasks(WASM_PATH);
    const make = (modelAssetPath: string, delegate: "GPU" | "CPU") =>
      HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath, delegate },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
    try {
      return await make(MODEL_PATH, "GPU");
    } catch {
      try {
        return await make(MODEL_PATH, "CPU");
      } catch {
        return await make(MODEL_FALLBACK, "CPU");
      }
    }
  })();
  landmarkerPromise.catch(() => (landmarkerPromise = null));
  return landmarkerPromise;
}

/**
 * Tracks one hand with MediaPipe HandLandmarker and derives simple gestures:
 * swipe-left / swipe-right (fast horizontal wrist motion), pinch (thumb tip ↔ index tip close).
 */
export function useHandTracking({ enabled = true, onGesture, cooldown = 900, mirror = true }: Options = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [state, setState] = useState<HandState>({ landmarks: null, gesture: "none", pinch: null, handedness: null });
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error" | "denied">("idle");
  const [error, setError] = useState<string | null>(null);
  const onGestureRef = useRef(onGesture);
  onGestureRef.current = onGesture;

  const raf = useRef<number>(0);
  const stream = useRef<MediaStream | null>(null);
  const history = useRef<SwipeSample[]>([]);
  const lastSwipe = useRef(0);
  const pinchDown = useRef(false);
  const lastTs = useRef(-1);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setState({ landmarks: null, gesture: "none", pinch: null, handedness: null });
    setStatus("idle");
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    let landmarker: HandLandmarker | null = null;

    const start = async () => {
      setStatus("loading");
      setError(null);
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-camera-api");
        const [lm, ms] = await Promise.all([
          loadLandmarker(),
          navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: "user" }, audio: false }),
        ]);
        if (cancelled) {
          ms.getTracks().forEach((t) => t.stop());
          return;
        }
        landmarker = lm;
        stream.current = ms;
        const video = videoRef.current;
        if (!video) throw new Error("no-video-element");
        video.srcObject = ms;
        await video.play().catch(() => undefined);
        setStatus("ready");
        loop();
      } catch (e) {
        if (cancelled) return;
        const name = e instanceof Error ? e.name || e.message : String(e);
        setStatus(/NotAllowed|Permission|denied/i.test(name) ? "denied" : "error");
        setError(name);
      }
    };

    const loop = () => {
      const video = videoRef.current;
      if (!video || !landmarker || cancelled) return;
      if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
        const now = performance.now();
        if (now > lastTs.current) {
          lastTs.current = now;
          try {
            const res = landmarker.detectForVideo(video, now);
            const lms = res.landmarks?.[0] ?? null;
            const handed = res.handedness?.[0]?.[0]?.categoryName ?? null;
            if (lms) {
              const wristX = mirror ? 1 - lms[0].x : lms[0].x;
              const thumb = lms[4];
              const index = lms[8];
              const pinch = Math.hypot(thumb.x - index.x, thumb.y - index.y, (thumb.z ?? 0) - (index.z ?? 0));
              let gesture: Gesture = "open";

              const p = detectPinch(pinch, pinchDown.current);
              pinchDown.current = p.down;
              if (p.down) gesture = "pinch";
              if (p.fired) onGestureRef.current?.("pinch");

              const swipe = detectSwipe(history.current, wristX, now);
              if (swipe && now - lastSwipe.current > cooldown) {
                lastSwipe.current = now;
                gesture = swipe;
                onGestureRef.current?.(swipe);
              }
              setState({ landmarks: lms, gesture, pinch, handedness: handed });
            } else {
              history.current = [];
              setState((s) => (s.landmarks ? { landmarks: null, gesture: "none", pinch: null, handedness: null } : s));
            }
          } catch (err) {
            // keep the loop alive; MediaPipe throws occasionally on frame 0
            console.warn("[hand] detect", err);
          }
        }
      }
      raf.current = requestAnimationFrame(loop);
    };

    start();
    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, cooldown, mirror, stop]);

  return { videoRef, ...state, status, error, stop };
}

/** Connections of the 21 hand landmarks (for drawing skeletons). */
export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];
