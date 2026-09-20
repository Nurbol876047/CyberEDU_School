"use client";
import { useState } from "react";
import { useHandTracking, type Gesture } from "./useHandTracking";
import { HandOverlay } from "./HandOverlay";
import { cn } from "@/lib/utils";

interface Props {
  enabled: boolean;
  onGesture?: (g: Gesture) => void;
  className?: string;
  size?: "sm" | "lg";
}

/** Small camera preview with skeleton; used inside modules that support gestures. */
export function HandCam({ enabled, onGesture, className, size = "sm" }: Props) {
  const [last, setLast] = useState<Gesture>("none");
  const { videoRef, landmarks, status, error, gesture } = useHandTracking({
    enabled,
    onGesture: (g) => {
      setLast(g);
      onGesture?.(g);
    },
  });
  const w = size === "sm" ? 240 : 640;
  const h = size === "sm" ? 180 : 480;

  return (
    <div className={cn("glass relative overflow-hidden rounded-xl", className)} style={{ aspectRatio: `${w}/${h}` }}>
      <video ref={videoRef} playsInline muted className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
      <HandOverlay landmarks={landmarks} width={w} height={h} />
      <div className="absolute left-2 top-2 rounded-md bg-navy-700 px-2 py-0.5 text-[11px] text-fg">
        {status === "loading" && "Загрузка трекера…"}
        {status === "ready" && (landmarks ? `✋ ${gesture}` : "Покажи ладонь")}
        {status === "denied" && "Нет доступа к камере"}
        {status === "error" && `Ошибка: ${error}`}
        {status === "idle" && "Камера выключена"}
      </div>
      {last !== "none" && (
        <div className="absolute bottom-2 right-2 rounded-md bg-sun/80 px-2 py-0.5 text-[11px] font-semibold text-navy-900">
          {last}
        </div>
      )}
    </div>
  );
}
