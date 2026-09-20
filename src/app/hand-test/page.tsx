"use client";
import { useState } from "react";
import Link from "next/link";
import { useHandTracking, type Gesture } from "@/components/hand-tracking/useHandTracking";
import { HandOverlay } from "@/components/hand-tracking/HandOverlay";

export default function HandTestPage() {
  const [enabled, setEnabled] = useState(true);
  const [log, setLog] = useState<string[]>([]);
  const { videoRef, landmarks, gesture, pinch, handedness, status, error } = useHandTracking({
    enabled,
    onGesture: (g: Gesture) =>
      setLog((l) => [`${new Date().toLocaleTimeString()} — ${g}`, ...l].slice(0, 12)),
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Link href="/" className="text-xs text-fg2 hover:text-teal">← На карту</Link>
      <h1 className="mb-4 mt-2 text-2xl font-semibold text-teal">Тест трекинга руки</h1>
      <div className="grid gap-6 md:grid-cols-[640px_1fr]">
        <div className="relative w-full max-w-[640px] overflow-hidden rounded-2xl border border-line bg-black" style={{ aspectRatio: "4/3" }}>
          <video ref={videoRef} playsInline muted className="h-full w-full object-cover" style={{ transform: "scaleX(-1)" }} />
          <HandOverlay landmarks={landmarks} width={640} height={480} />
          <div className="absolute left-3 top-3 rounded-lg bg-navy-700 px-3 py-1 text-sm">
            статус: <b className="text-sun">{status}</b> {error && <span className="text-red-400">({error})</span>}
          </div>
        </div>
        <div className="glass rounded-2xl p-4 text-sm">
          <div className="mb-3 flex gap-2">
            <button className="btn-teal" onClick={() => setEnabled((v) => !v)}>
              {enabled ? "Выключить камеру" : "Включить камеру"}
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-y-1">
            <dt className="text-fg2">Рука</dt><dd>{handedness ?? "—"}</dd>
            <dt className="text-fg2">Жест</dt><dd className="text-sun">{gesture}</dd>
            <dt className="text-fg2">Pinch</dt><dd>{pinch !== null ? pinch.toFixed(3) : "—"}</dd>
            <dt className="text-fg2">Точек</dt><dd>{landmarks?.length ?? 0}</dd>
          </dl>
          <h2 className="mb-1 mt-4 font-semibold text-teal">События</h2>
          <ul className="space-y-0.5 font-mono text-xs text-fg2">
            {log.length === 0 && <li className="text-fg3">Проведи рукой влево/вправо или сведи большой и указательный пальцы.</li>}
            {log.map((l, i) => <li key={i}>{l}</li>)}
          </ul>
          <p className="mt-4 text-xs text-fg2">
            Свайп — быстрое движение запястья по горизонтали (&gt;22% ширины кадра за 0.35 с). Pinch — расстояние между кончиками большого и указательного пальцев &lt; 0.05.
          </p>
        </div>
      </div>
    </main>
  );
}
