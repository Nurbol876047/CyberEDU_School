"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { SimulatorProps } from "./types";

interface Activity {
  id: string;
  label: string;
  emoji: string;
  color: string;
  min: number;
  max: number;
  /** healthy range */
  ok: [number, number];
  tip: string;
}

const ACTIVITIES: Activity[] = [
  { id: "sleep", label: "Сон", emoji: "😴", color: "#a78bfa", min: 4, max: 12, ok: [9, 11], tip: "В 10–13 лет нужно 9–11 часов сна." },
  { id: "school", label: "Школа и уроки", emoji: "📚", color: "#4B9BFF", min: 0, max: 10, ok: [5, 8], tip: "Школа плюс домашние задания — обычно 5–8 часов." },
  { id: "outdoor", label: "Улица и спорт", emoji: "⚽", color: "#5BD15B", min: 0, max: 8, ok: [1.5, 8], tip: "Хотя бы полтора часа движения на воздухе каждый день." },
  { id: "family", label: "Семья, еда, хобби", emoji: "👨‍👩‍👧", color: "#F6C243", min: 0, max: 8, ok: [2, 8], tip: "Еда без телефона, разговоры, кружки — минимум 2 часа." },
  { id: "screen", label: "Экран для отдыха", emoji: "📱", color: "#FF6B6B", min: 0, max: 12, ok: [0, 2], tip: "Игры и видео — не больше 2 часов в день, и не перед сном." },
];

const START: Record<string, number> = { sleep: 7, school: 6, outdoor: 0.5, family: 1.5, screen: 9 };

export function ScreenTimeSimulator({ mentor, tracker, onComplete }: SimulatorProps) {
  const [hours, setHours] = useState<Record<string, number>>(START);
  const [done, setDone] = useState(false);
  const [checks, setChecks] = useState(0);
  const total = useMemo(() => Object.values(hours).reduce((a, b) => a + b, 0), [hours]);
  const issues = ACTIVITIES.filter((a) => hours[a.id] < a.ok[0] || hours[a.id] > a.ok[1]);
  const balanced = Math.abs(total - 24) < 0.01 && issues.length === 0;
  const health = Math.max(0, Math.round(100 - issues.length * 18 - Math.abs(total - 24) * 4));

  const set = (id: string, v: number) => setHours((h) => ({ ...h, [id]: v }));

  const check = () => {
    setChecks((c) => c + 1);
    tracker.attempt();
    if (balanced) {
      if (!done) {
        setDone(true);
        playSfx("success");
        mentor.say("Керемет! День собран правильно: сон, движение, семья и немного экрана. Так и живи — переходи к квизу!");
        onComplete(80 + Math.max(0, 3 - checks) * 10);
      }
      return;
    }
    playSfx("error");
    issues.forEach((a) => tracker.mistake(`screen:${a.id}`, `${hours[a.id]} ч`));
    const first = issues[0];
    const totalMsg = Math.abs(total - 24) >= 0.01 ? `В сутках 24 часа, а у тебя ${total.toFixed(1)}. ` : "";
    mentor.say(`${totalMsg}${first ? `${first.emoji} ${first.label}: ${first.tip}` : ""}`);
  };

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="glass rounded-3xl p-5 sm:p-7">
        <h3 className="text-xl font-bold">Собери здоровый день</h3>
        <p className="mt-1 text-sm text-fg2">Распредели 24 часа между занятиями. У героя пока слишком много экрана — исправь это.</p>
        <div className="mt-5 space-y-4">
          {ACTIVITIES.map((a) => {
            const v = hours[a.id];
            const bad = v < a.ok[0] || v > a.ok[1];
            return (
              <div key={a.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold">{a.emoji} {a.label}</span>
                  <span className={cn("font-bold", bad && checks > 0 ? "text-danger" : "text-fg2")}>{v} ч</span>
                </div>
                <input type="range" min={a.min} max={a.max} step={0.5} value={v} onChange={(e) => set(a.id, Number(e.target.value))} className="w-full accent-[var(--accent)]" style={{ accentColor: a.color }} aria-label={a.label} />
              </div>
            );
          })}
        </div>
        {/* 24h bar */}
        <div className="mt-6 flex h-6 w-full overflow-hidden rounded-full bg-line">
          {ACTIVITIES.map((a) => (
            <motion.div key={a.id} className="h-full" style={{ background: a.color }} animate={{ width: `${(hours[a.id] / 24) * 100}%` }} transition={{ type: "spring", stiffness: 120 }} title={`${a.label}: ${hours[a.id]} ч`} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-fg3">
          <span>Итого: <b className={cn(Math.abs(total - 24) < 0.01 ? "text-teal" : "text-danger")}>{total.toFixed(1)} / 24 ч</b></span>
          <span>Проверок: {checks}</span>
        </div>
        <button className="btn-teal mt-5" onClick={check}>{done ? "✓ День собран" : "Проверить день"}</button>
      </div>
      <aside className="glass flex flex-col items-center rounded-3xl p-5 text-center">
        <div className="text-sm font-semibold text-fg2">Индекс здоровья</div>
        <motion.div className="mt-2 text-5xl font-extrabold" animate={{ color: health >= 80 ? "#5BD15B" : health >= 50 ? "#F6C243" : "#FF6B6B" }}>{health}</motion.div>
        <div className="mt-1 text-5xl">{health >= 80 ? "😄" : health >= 50 ? "😐" : "🥱"}</div>
        <ul className="mt-4 w-full space-y-1 text-left text-xs text-fg2">
          <li>😴 Сон 9–11 ч</li>
          <li>⚽ Улица ≥ 1.5 ч</li>
          <li>👨‍👩‍👧 Семья ≥ 2 ч</li>
          <li>📱 Экран ≤ 2 ч</li>
          <li>🕐 Всего ровно 24 ч</li>
        </ul>
      </aside>
    </div>
  );
}
