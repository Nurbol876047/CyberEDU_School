"use client";
import { useEffect, useRef } from "react";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { HAND_CONNECTIONS } from "./useHandTracking";

interface Props {
  landmarks: NormalizedLandmark[] | null;
  width: number;
  height: number;
  mirror?: boolean;
  color?: string;
}

/** Canvas drawing the hand skeleton over a video of the same size. */
export function HandOverlay({ landmarks, width, height, mirror = true, color = "#2dd4bf" }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    if (!landmarks) return;
    const px = (l: NormalizedLandmark) => ((mirror ? 1 - l.x : l.x) * width);
    const py = (l: NormalizedLandmark) => l.y * height;
    ctx.lineWidth = 3;
    ctx.strokeStyle = color;
    ctx.beginPath();
    for (const [a, b] of HAND_CONNECTIONS) {
      ctx.moveTo(px(landmarks[a]), py(landmarks[a]));
      ctx.lineTo(px(landmarks[b]), py(landmarks[b]));
    }
    ctx.stroke();
    landmarks.forEach((l, i) => {
      ctx.beginPath();
      ctx.arc(px(l), py(l), i === 4 || i === 8 ? 7 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i === 4 || i === 8 ? "#facc15" : "#ffffff";
      ctx.fill();
    });
  }, [landmarks, width, height, mirror, color]);
  return <canvas ref={ref} width={width} height={height} className="pointer-events-none absolute inset-0 h-full w-full" />;
}
