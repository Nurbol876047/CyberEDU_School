"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MODULES } from "@/data/modules";
import { useProgress, completedCount, allModulesCompleted } from "@/store/progress";
import { cn } from "@/lib/utils";

const KazCyberMap = dynamic(() => import("@/components/hero/KazCyberMap").then((m) => m.KazCyberMap), {
  ssr: false,
  loading: () => <div className="glass aspect-[1180/686] w-full animate-pulse rounded-3xl" />,
});

export default function Home() {
  const modules = useProgress((s) => s.modules);
  const finalCompleted = useProgress((s) => s.finalCompleted);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const done = hydrated ? completedCount(modules) : 0;
  const pct = Math.round((done / MODULES.length) * 100);
  const allDone = hydrated && allModulesCompleted(modules);
  // modules list is hidden until the player presses «Начать игру» / «Список модулей»
  const [showModules, setShowModules] = useState(false);
  const modulesRef = useRef<HTMLElement>(null);
  const revealModules = useCallback(() => {
    setShowModules(true);
    setTimeout(() => modulesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }, []);
  useEffect(() => {
    // direct link /#modules (header nav) should open the list too
    if (window.location.hash === "#modules") revealModules();
    const onHash = () => { if (window.location.hash === "#modules") revealModules(); };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [revealModules]);

  return (
    <main>
      {/* HERO */}
      <section className="mx-auto flex max-w-7xl flex-col items-center gap-10 px-[5%] pb-16 pt-14 md:min-h-[calc(100vh-80px)] md:flex-row md:justify-between md:pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl text-center md:max-w-[44%] md:text-left">
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Стань настоящим <span className="text-teal" style={{ textShadow: "0 0 20px var(--glow)" }}>КиберБатыром</span> интернета!
          </h1>
          <p className="mt-5 text-lg text-fg2">
            Увлекательные миссии на 3D-островах: защита данных, распознавание фейков, безопасное общение в сети. ИИ-наставник, управление жестами и аналитика для учителя.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
            <button type="button" onClick={revealModules} className="btn-teal px-8 py-4 text-base">Начать игру 🚀</button>
            <button type="button" onClick={revealModules} className="btn-soft px-8 py-4 text-base">Список модулей</button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="w-full max-w-2xl md:max-w-[52%]">
          <KazCyberMap />
        </motion.div>
      </section>

      {/* MODULES */}
      <AnimatePresence>
      {showModules && (
      <motion.section
        id="modules"
        ref={modulesRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl scroll-mt-20 px-[5%] py-16"
      >
        <div className="mb-10 flex flex-col items-start gap-5 md:flex-row md:items-end md:justify-between">
          <h2 className="text-3xl font-extrabold md:text-4xl">Твои миссии</h2>
          <div className="flex items-center gap-4 rounded-pill border border-line bg-card px-6 py-3">
            <span className="text-sm text-fg2">Общий прогресс:</span>
            <div className="h-2 w-36 overflow-hidden rounded bg-line">
              <div className="h-full bg-teal shadow-[0_0_10px_var(--accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-semibold text-sun">{pct}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => {
            const r = modules[m.slug];
            return (
              <motion.div key={m.slug} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Link href={`/modules/${m.slug}`} className="glass group flex h-full flex-col items-center rounded-3xl p-8 text-center transition-all hover:-translate-y-2 hover:border-teal/50 hover:shadow-glow">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: m.iconBg, boxShadow: `0 4px 15px ${m.iconBg}66` }}>
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="white"><path d={m.icon} /></svg>
                  </div>
                  <h3 className="font-sans text-lg font-semibold text-fg">{m.title}</h3>
                  <p className="mt-1 text-sm text-fg3">{m.subtitle}</p>
                  <div className="mt-4 flex gap-1 text-xl">
                    {[0, 1, 2].map((k) => (
                      <span key={k} className={cn(hydrated && r.stars > k ? "text-sun drop-shadow-[0_0_8px_rgba(255,217,0,.6)]" : "text-fg3/50")}>{hydrated && r.stars > k ? "★" : "☆"}</span>
                    ))}
                  </div>
                  {hydrated && r.status === "completed" && <span className="mt-3 rounded-pill bg-teal/15 px-3 py-1 text-xs font-semibold text-teal">Пройдено ✓ {r.quizPct}%</span>}
                </Link>
              </motion.div>
            );
          })}

          {/* final mission */}
          <Link href={allDone ? "/final" : "#modules"} onClick={(e) => { if (!allDone) e.preventDefault(); }} className={cn("glass flex h-full flex-col items-center justify-center rounded-3xl border-dashed p-8 text-center transition-all", allDone ? "border-sun/60 hover:-translate-y-2 hover:shadow-glow-sun" : "opacity-70")}>
            <div className="text-5xl">{allDone ? "🏁" : "🔒"}</div>
            <h3 className="mt-4 font-sans text-lg font-semibold">Финальная миссия</h3>
            <p className="mt-1 text-sm text-fg3">{allDone ? (finalCompleted ? "Пройдена — можно ещё раз" : "Открыта! Сюжет сочинит наставник") : `Откроется после всех модулей (${done}/${MODULES.length})`}</p>
          </Link>

          {/* teachers / parents */}
          <div className="glass col-span-full flex flex-wrap items-center justify-between gap-6 rounded-3xl border-teal/40 p-6 sm:p-8">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-teal text-navy-900 shadow-[0_0_15px_var(--glow)]">
                <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" /></svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">Родителям и учителям</h3>
                <p className="mt-1 text-sm text-fg2">Прогресс ребёнка, советы по безопасности, сертификат и аналитика пилота с экспортом в PDF</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link href="/parents" className="btn-teal">Открыть панель</Link>
              <Link href="/dashboard" className="btn-ghost">Аналитика</Link>
            </div>
          </div>
        </div>
      </motion.section>
      )}
      </AnimatePresence>

    </main>
  );
}
