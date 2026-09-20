"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MODULES } from "@/data/modules";
import { useProgress } from "@/store/progress";
import { playSfx } from "@/lib/sound";

const CONFETTI = 40;

export default function CertificatePage() {
  const [hydrated, setHydrated] = useState(false);
  const finalCompleted = useProgress((s) => s.finalCompleted);
  const playerName = useProgress((s) => s.playerName);
  const setPlayerName = useProgress((s) => s.setPlayerName);
  const totalScore = useProgress((s) => s.totalScore);
  const badges = useProgress((s) => s.badges);
  const lowPerf = useProgress((s) => s.lowPerf);
  const reset = useProgress((s) => s.reset);
  const modules = useProgress((s) => s.modules);
  const [name, setName] = useState("");

  useEffect(() => {
    setHydrated(true);
    setName(useProgress.getState().playerName);
    playSfx("success");
  }, []);

  const confetti = useMemo(
    () =>
      Array.from({ length: lowPerf ? 12 : CONFETTI }, (_, i) => ({
        x: Math.random() * 100,
        delay: Math.random() * 2,
        dur: 3 + Math.random() * 3,
        color: ["#2dd4bf", "#facc15", "#f472b6", "#a78bfa", "#fff"][i % 5],
        size: 6 + Math.random() * 8,
      })),
    [lowPerf],
  );

  if (!hydrated) return null;
  if (!finalCompleted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-6xl">🎓</div>
        <p className="text-fg2">Сертификат выдаётся после финальной миссии.</p>
        <Link href="/final" className="btn-teal">К финальной миссии</Link>
      </main>
    );
  }

  const date = new Date().toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });

  return (
    <main className="relative flex min-h-[calc(100vh-70px)] items-center justify-center overflow-hidden p-4 sm:p-8">
      {confetti.map((c, i) => (
        <motion.span
          key={i}
          className="pointer-events-none absolute top-0 rounded-sm"
          style={{ left: `${c.x}%`, width: c.size, height: c.size * 1.6, background: c.color }}
          initial={{ y: -40, rotate: 0, opacity: 0 }}
          animate={{ y: "110vh", rotate: 720, opacity: [0, 1, 1, 0] }}
          transition={{ duration: c.dur, delay: c.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotateX: 30 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="glass relative w-full max-w-2xl rounded-3xl border-2 border-sun/50 p-6 text-center shadow-glow-sun sm:p-10"
      >
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4, type: "spring" }} className="text-6xl">🛡️</motion.div>
        <div className="mt-2 text-xs uppercase tracking-[0.3em] text-teal">QALQAN AI</div>
        <h1 className="mt-1 text-3xl font-semibold text-sun sm:text-4xl">Сертификат</h1>
        <p className="mt-3 text-fg2">Настоящим подтверждается, что</p>
        {playerName ? (
          <div className="my-2 text-2xl font-semibold text-fg sm:text-3xl">{playerName}</div>
        ) : (
          <form
            className="my-3 flex justify-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setPlayerName(name.trim());
            }}
          >
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Твоё имя" className="rounded-xl border border-line bg-navy-700 px-3 py-2 text-center text-lg outline-none focus:border-sun" />
            <button className="btn-sun" type="submit">OK</button>
          </form>
        )}
        <p className="text-fg2">прошёл(ла) все шесть модулей QALQAN AI и финальную миссию по кибербезопасности</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {badges.map((b, i) => (
            <motion.span key={b} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.15 }} className="rounded-full bg-navy-700 px-3 py-1 text-sm">
              {b}
            </motion.span>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          {MODULES.map((m) => (
            <div key={m.slug} className="rounded-xl bg-navy-700 p-2">
              <div className="text-xs text-fg3">{m.title}</div>
              <div className="font-semibold text-sun">{"★".repeat(modules[m.slug].stars) || "✓"}</div>
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-fg3">
          <span>⭐ {totalScore} очков</span>
          <span>{date}</span>
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3 print:hidden">
          <button className="btn-teal" onClick={() => window.print()}>🖨️ Распечатать</button>
          <Link href="/" className="btn-ghost">К карте</Link>
          <button className="btn-ghost text-xs" onClick={() => { if (confirm("Сбросить весь прогресс?")) { reset(); location.href = "/"; } }}>Начать заново</button>
        </div>
      </motion.div>
    </main>
  );
}
