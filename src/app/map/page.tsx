"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MentorDialog } from "@/components/hud/MentorDialog";
import { ThemeSwitch } from "@/components/layout/ThemeSwitch";
import { useProgress, completedCount, allModulesCompleted } from "@/store/progress";
import { MODULES } from "@/data/modules";
import { cn } from "@/lib/utils";

const IslandMap = dynamic(() => import("@/components/scene/IslandMap").then((m) => m.IslandMap), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 flex items-center justify-center bg-[#0a0e20]">
      <div className="animate-pulse text-xl text-teal">Загружаем острова…</div>
    </div>
  ),
});

export default function MapPage() {
  const modules = useProgress((s) => s.modules);
  const finalCompleted = useProgress((s) => s.finalCompleted);
  const totalScore = useProgress((s) => s.totalScore);
  const badges = useProgress((s) => s.badges);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const done = hydrated ? completedCount(modules) : 0;
  const allDone = hydrated && allModulesCompleted(modules);
  const next = MODULES.find((m) => modules[m.slug].status !== "completed");

  const text =
    done === 0
      ? "Сәлем! Я Қалқан-бот, твой наставник. Перед тобой шесть островов — по одному на каждую тему. Нажми на любой, чтобы начать миссию!"
      : allDone
        ? "Все острова пройдены! Финальная миссия ждёт тебя — нажми на кнопку в центре карты."
        : `Отлично, ${done} из ${MODULES.length} островов пройдено! Следующий — «${next?.title}». Нажми на него, когда будешь готов.`;

  return (
    <main className="relative min-h-screen">
      <IslandMap />

      {/* top bar */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-40 p-3 sm:p-4">
        <div className="glass pointer-events-auto mx-auto flex max-w-5xl items-center gap-3 rounded-2xl px-3 py-2 sm:gap-4 sm:px-5" style={{ background: "rgba(10,14,32,.6)" }}>
          <Link href="/" className="font-heading text-lg font-extrabold tracking-wider text-white">QALQAN <span className="text-[#00ffed]">AI</span></Link>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full rounded-full bg-gradient-to-r from-[#00ffed] to-[#ffd900]" initial={{ width: 0 }} animate={{ width: `${(done / MODULES.length) * 100}%` }} transition={{ duration: 0.8 }} />
            </div>
            <div className="hidden justify-between gap-1 md:flex">
              {MODULES.map((m) => (
                <Link key={m.slug} href={`/modules/${m.slug}`} className={cn("truncate text-[11px]", hydrated && modules[m.slug].status === "completed" ? "text-[#ffd900]" : "text-white/70 hover:text-white")}>
                  {hydrated && modules[m.slug].status === "completed" ? "✓" : "●"} {m.title}
                </Link>
              ))}
            </div>
          </div>
          <span className="rounded-lg bg-[#ffd900]/15 px-2 py-1 text-sm font-semibold text-[#ffd900]">⭐ {hydrated ? totalScore : 0}</span>
          <span className="hidden rounded-lg bg-[#00ffed]/15 px-2 py-1 text-sm text-[#00ffed] sm:inline" title={badges.join(", ")}>🏅 {hydrated ? badges.length : 0}</span>
          <div className="hidden sm:block"><ThemeSwitch compact /></div>
        </div>
      </div>

      {allDone && (
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }} className="fixed left-1/2 top-1/2 z-30 -translate-x-1/2 -translate-y-1/2">
          <Link href="/final" className="glass flex flex-col items-center gap-1 rounded-3xl border-[#ffd900]/60 px-8 py-5 text-center text-white shadow-glow-sun animate-pulseGlow" style={{ background: "rgba(10,14,32,.7)" }}>
            <span className="text-4xl">🏁</span>
            <span className="text-lg font-semibold text-[#ffd900]">Финальная миссия</span>
            <span className="text-xs text-white/70">{finalCompleted ? "Пройти ещё раз" : "Все острова пройдены!"}</span>
          </Link>
        </motion.div>
      )}

      <MentorDialog text={text} dark />
    </main>
  );
}
