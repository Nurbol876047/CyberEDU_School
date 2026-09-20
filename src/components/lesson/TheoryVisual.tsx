"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { VisualKind } from "@/data/lessons";

const box = "glass relative my-6 overflow-hidden rounded-2xl p-8 text-center";
const pw = "inline-block rounded-lg px-6 py-3 font-mono text-2xl font-bold tracking-widest";

/** Small animated scenes for theory slides (framer-motion port of the anime.js originals). */
export function TheoryVisual({ kind }: { kind: VisualKind }) {
  switch (kind) {
    case "hacked-password":
      return (
        <div className={box}>
          <div className={`${pw} border border-dashed border-red-400 bg-red-500/10 text-red-400`}>123456</div>
          <motion.div className="my-4 text-7xl" animate={{ rotate: [0, -20, 20, -20, 20, 0] }} transition={{ duration: 0.8, repeat: Infinity }}>🔓</motion.div>
          <div className="text-xl font-extrabold uppercase tracking-wide text-danger">Хакер взломал!</div>
        </div>
      );
    case "shield-password":
      return (
        <div className={box}>
          <div className={`${pw} border border-teal bg-teal/10 text-teal`}>#Qalqan_2026!</div>
          <div className="relative my-4 flex justify-center">
            <motion.div className="absolute h-36 w-36 rounded-full" style={{ background: "radial-gradient(circle, var(--glow) 0%, transparent 70%)" }} animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 2, repeat: Infinity }} />
            <motion.div className="relative text-7xl" animate={{ y: [-10, 10] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}>🛡️</motion.div>
          </div>
          <div className="text-xl font-extrabold uppercase tracking-wide text-teal">Надёжная защита!</div>
        </div>
      );
    case "data-cards":
      return (
        <div className={`${box} flex flex-wrap items-center justify-center gap-4`}>
          <motion.div className="rounded-xl border border-line bg-card px-5 py-3 text-lg font-bold" initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring" }}>🏠 Адрес</motion.div>
          <motion.div className="rounded-xl border border-teal bg-teal/10 px-7 py-4 text-xl font-bold text-teal" animate={{ boxShadow: ["0 0 0 var(--glow)", "0 0 25px var(--glow)"] }} transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}>👤 Твой профиль</motion.div>
          <motion.div className="rounded-xl border border-line bg-card px-5 py-3 text-lg font-bold" initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", delay: 0.2 }}>📱 Телефон</motion.div>
        </div>
      );
    case "data-leak":
      return (
        <div className={`${box} flex flex-col items-center gap-4`}>
          <div className="text-6xl">💻</div>
          <motion.div className="rounded bg-white px-3 py-1 text-xl font-bold text-black" animate={{ y: [50, -50], scale: [1, 0.5], opacity: [1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeIn" }}>📞 8701…</motion.div>
          <motion.div className="text-xl font-extrabold uppercase text-danger" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}>Идёт мошенничество!</motion.div>
        </div>
      );
    case "mask":
      return (
        <div className={`${box} flex flex-col items-center gap-4`}>
          <motion.div className="text-8xl" animate={{ rotateY: [0, 360] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>🎭</motion.div>
          <div className="text-xl font-bold text-orange-400">Ты не знаешь точно, кто он!</div>
        </div>
      );
    case "meet-stranger":
      return <MeetStranger />;
    case "mean-messages":
      return (
        <div className={`${box} flex flex-col items-center gap-4`}>
          <motion.div className="text-6xl" animate={{ x: [-3, 3, -3] }} transition={{ duration: 0.4, repeat: Infinity }}>😢</motion.div>
          <div className="flex flex-wrap justify-center gap-2">
            {["Ты глупый!", "Твоё фото ужасное!"].map((t, i) => (
              <motion.div key={t} className="rounded-lg bg-red-500/20 px-3 py-1.5 text-red-300" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 + i * 0.5 }}>{t}</motion.div>
            ))}
          </div>
        </div>
      );
    case "three-steps":
      return (
        <div className={`${box} flex flex-wrap items-center justify-center gap-3`}>
          {["1. Не отвечай 🤫", "2. Заблокируй 🚫", "3. Попроси помощи 👨‍👩‍👦"].map((t, i) => (
            <motion.div key={t} className="rounded-xl border border-line bg-card px-4 py-3 font-semibold" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.4, type: "spring" }}>{t}</motion.div>
          ))}
        </div>
      );
    case "fake-url":
      return (
        <div className={`${box} flex flex-col items-center gap-3`}>
          <div className="rounded-lg border-2 border-green-500 bg-card px-5 py-2 font-mono">✅ www.roblox.com</div>
          <motion.div className="rounded-lg border-2 border-red-400 bg-red-500/10 px-5 py-2 font-mono" animate={{ x: [-4, 4, -4] }} transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 1.5 }}>❌ www.r0bl0x-free.com</motion.div>
        </div>
      );
    case "prize-banner":
      return <PrizeBanner />;
    case "battery":
      return (
        <div className={`${box} flex justify-around`}>
          <div>
            <motion.div className="text-6xl" animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1, repeat: Infinity }}>🪫</motion.div>
            <p className="mt-2 font-bold text-danger">Весь день в телефоне</p>
          </div>
          <div>
            <motion.div className="text-6xl" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>🔋</motion.div>
            <p className="mt-2 font-bold text-teal">Пользуюсь по времени</p>
          </div>
        </div>
      );
    case "rule-202020":
      return (
        <div className={`${box} flex flex-wrap items-center justify-center gap-4`}>
          {["20 мин", "20 сек", "6 м"].map((t, i) => (
            <div key={t} className="flex items-center gap-4">
              {i > 0 && <span className="text-2xl">➡️</span>}
              <motion.div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal/10 text-xl font-extrabold text-teal" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.4 }}>{t}</motion.div>
            </div>
          ))}
        </div>
      );
  }
}

function MeetStranger() {
  const [blocked, setBlocked] = useState(false);
  return (
    <div className={`${box} flex flex-wrap items-center justify-center gap-6`}>
      <div className="text-5xl">👤</div>
      <div className={`rounded-lg border px-4 py-2 transition-all ${blocked ? "border-fg3 text-fg3 line-through" : "border-red-400"}`}>«Встретимся в парке?»</div>
      <motion.button className="text-5xl" onClick={() => setBlocked(true)} animate={blocked ? { scale: [1, 1.3, 1] } : { opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: blocked ? 0 : Infinity }} title="Нажми, чтобы заблокировать">
        {blocked ? "🛡️" : "🚫"}
      </motion.button>
      <p className="w-full text-sm text-fg3">{blocked ? "Верно: заблокировать и рассказать родителям." : "Нажми на значок, чтобы заблокировать."}</p>
    </div>
  );
}

function PrizeBanner() {
  const [clicked, setClicked] = useState(false);
  return (
    <div className={box}>
      <motion.button
        onClick={() => setClicked(true)}
        className="w-full rounded-xl p-5 text-white"
        style={{ background: "linear-gradient(45deg, #ff00cc, #3333ff)" }}
        animate={clicked ? {} : { scale: [1, 1.03, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <h3 className="text-xl font-extrabold">🎉 ВЫИГРАЙ БЕСПЛАТНЫЙ iPHONE! 🎉</h3>
        <p className="mt-1 text-sm">Жми прямо сейчас и введи свой адрес!</p>
      </motion.button>
      {clicked && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-xl font-extrabold text-danger">🚨 ЭТО ОБМАН! НЕ НАЖИМАЙ!</motion.div>}
    </div>
  );
}
