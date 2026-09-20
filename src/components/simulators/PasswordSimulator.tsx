"use client";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { scorePassword } from "@/lib/password";
import { playSfx } from "@/lib/sound";
import type { SimulatorProps } from "./types";

const Shield3D = dynamic(() => import("@/components/scene/Shield3D").then((m) => m.Shield3D), { ssr: false });
const GOAL = 3; // «Сильный» or better

export function PasswordSimulator({ mentor, tracker, onComplete }: SimulatorProps) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const result = useMemo(() => scorePassword(pw), [pw]);

  // each pause in typing counts as one attempt (the password itself is never stored)
  useEffect(() => {
    if (!pw) return;
    const t = setTimeout(() => tracker.attempt(), 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pw]);

  useEffect(() => {
    if (result.score >= GOAL && !done) {
      setDone(true);
      playSfx("success");
      mentor.say("Жарайсың! Ты создал по-настоящему надёжный пароль. Щит на полной мощности — переходи к квизу!");
      onComplete(100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.score]);

  const explain = () =>
    mentor.ask(
      `Объясни ученику, почему пароль оценён как «${result.label}» (энтропия ${result.entropy} бит, время взлома ${result.crackLabel}). Не повторяй сам пароль. Дай один конкретный совет, как его улучшить.`,
      `Характеристики: длина ${pw.length}, заглавные: ${/[A-ZА-Я]/.test(pw)}, цифры: ${/\d/.test(pw)}, символы: ${/[^\w\sа-яё]/i.test(pw)}.`,
    );

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="glass relative h-72 overflow-hidden rounded-3xl md:h-96">
        <Shield3D strength={result.score / 4} color={result.color} />
        <div className="absolute bottom-3 left-0 right-0 text-center text-sm font-semibold" style={{ color: result.color }}>{result.label}</div>
      </div>
      <div className="flex flex-col gap-4">
        <label className="glass rounded-3xl p-5">
          <span className="mb-2 block text-sm text-fg2">Придумай пароль (он никуда не отправляется)</span>
          <div className="flex gap-2">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Например: Сүт+Балмұздақ_2!"
              className="min-w-0 flex-1 rounded-xl border border-line bg-navy-700 px-3 py-2 text-lg tracking-wider text-fg outline-none focus:border-teal"
            />
            <button type="button" className="btn-ghost px-3" onClick={() => setShow((v) => !v)} aria-label="Показать пароль">{show ? "🙈" : "👁️"}</button>
          </div>
          <div className="mt-3 flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-2 flex-1 rounded-full transition-colors" style={{ background: i < result.score ? result.color : "var(--card-border)" }} />
            ))}
          </div>
        </label>
        <div className="glass rounded-3xl p-5 text-sm">
          <div className="flex justify-between"><span className="text-fg2">Энтропия</span><b>{result.entropy} бит</b></div>
          <div className="flex justify-between"><span className="text-fg2">Длина</span><b>{pw.length}</b></div>
          <div className="mt-2 flex items-center justify-between rounded-xl bg-navy-700 px-3 py-2">
            <span className="text-fg2">⏱️ Взлом займёт</span>
            <AnimatePresence mode="wait">
              <motion.b key={result.crackLabel} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} style={{ color: result.color }}>{result.crackLabel}</motion.b>
            </AnimatePresence>
          </div>
          <ul className="mt-3 space-y-1 text-fg2">{result.tips.map((t) => <li key={t}>• {t}</li>)}</ul>
          <button className="btn-ghost mt-4 px-3 py-1.5 text-[11px]" onClick={explain} disabled={!pw || mentor.loading}>💡 Объясни оценку</button>
        </div>
      </div>
    </div>
  );
}
