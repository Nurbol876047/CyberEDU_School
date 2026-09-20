"use client";
import { useProgress } from "@/store/progress";
import { stopSpeaking } from "@/lib/speech";
import { cn } from "@/lib/utils";

export function SoundToggle({ inline = false }: { inline?: boolean }) {
  const soundEnabled = useProgress((s) => s.soundEnabled);
  const toggle = useProgress((s) => s.toggleSound);
  return (
    <button
      type="button"
      onClick={() => {
        if (soundEnabled) stopSpeaking();
        toggle();
      }}
      className={cn(
        "glass flex h-10 w-10 items-center justify-center rounded-full text-lg transition-transform hover:scale-110",
        !inline && "fixed right-3 top-[72px] z-50 sm:right-5 sm:top-[84px]",
      )}
      title={soundEnabled ? "Выключить звук" : "Включить звук"}
      aria-label={soundEnabled ? "Выключить звук" : "Включить звук"}
      aria-pressed={!soundEnabled}
    >
      {soundEnabled ? "🔊" : "🔇"}
    </button>
  );
}
