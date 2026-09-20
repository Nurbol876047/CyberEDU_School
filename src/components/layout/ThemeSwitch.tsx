"use client";
import { useProgress } from "@/store/progress";

/** «Для старших классов» (тёмная) ↔ «Для младших классов» (светлая), как в исходном QALQAN AI. */
export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const theme = useProgress((s) => s.theme);
  const setTheme = useProgress((s) => s.setTheme);
  const light = theme === "light";
  return (
    <label className="flex cursor-pointer items-center gap-3 select-none" title="Режим оформления">
      {!compact && <span className="hidden text-sm font-semibold text-fg2 md:inline">{light ? "Для младших классов" : "Для старших классов"}</span>}
      <span className="relative inline-block h-[34px] w-[60px]">
        <input type="checkbox" className="peer sr-only" checked={light} onChange={(e) => setTheme(e.target.checked ? "light" : "dark")} aria-label="Переключить режим оформления" />
        <span className="absolute inset-0 flex items-center justify-between rounded-full bg-line px-1.5 text-base transition-colors">
          <span>😎</span>
          <span>👶</span>
        </span>
        <span className="absolute bottom-1 left-1 h-[26px] w-[26px] rounded-full bg-teal transition-transform peer-checked:translate-x-[26px] peer-checked:bg-sun" />
      </span>
    </label>
  );
}
