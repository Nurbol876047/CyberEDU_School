"use client";
import { useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import type { ChoiceTask as ChoiceTaskT, SortTask as SortTaskT, QuizQuestion } from "@/data/lessons";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

/* ---------- Choice (trainer: retry until correct; quiz: one shot) ---------- */
export function ChoiceTask({ task, quiz, onDone }: { task: ChoiceTaskT | (QuizQuestion & { exp?: string }); quiz?: boolean; onDone: (correct: boolean, chosen: string) => void }) {
  const question = "question" in task ? task.question : task.q;
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const correct = selected === task.a;

  const check = () => {
    if (selected === null) return;
    if (!checked) {
      setChecked(true);
      playSfx(correct ? "ding" : "error");
      if (quiz) onDone(correct, task.opts[selected]);
      return;
    }
    if (correct) onDone(true, task.opts[selected]);
    else {
      onDone(false, task.opts[selected]);
      setChecked(false);
      setSelected(null);
    }
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-10">
      <h3 className="text-xl font-bold sm:text-2xl">{question}</h3>
      <div className="mt-6 flex flex-col gap-3">
        {task.opts.map((o, i) => (
          <button
            key={i}
            disabled={checked}
            onClick={() => setSelected(i)}
            className={cn(
              "rounded-2xl border px-5 py-4 text-left text-base transition-all sm:text-lg",
              !checked && selected === i && "border-teal bg-teal/15",
              !checked && selected !== i && "border-line bg-card hover:border-teal/50",
              checked && i === task.a && "border-green-500 bg-green-500/25",
              checked && i === selected && i !== task.a && "border-red-400 bg-red-500/25",
              checked && i !== selected && i !== task.a && "border-line opacity-40",
            )}
          >
            {o}
          </button>
        ))}
      </div>
      {checked && !correct && "exp" in task && task.exp && <p className="mt-4 font-semibold text-danger">{task.exp}</p>}
      {checked && quiz ? null : (
        <button className="btn-teal mt-6" disabled={selected === null} onClick={check}>
          {!checked ? "Проверить" : correct ? "Дальше →" : "Попробовать ещё раз"}
        </button>
      )}
      {checked && quiz && (
        <button className="btn-teal mt-6" onClick={() => onDone(correct, task.opts[selected!])}>Дальше →</button>
      )}
    </div>
  );
}

/* ---------- Sort (drag into two zones; tap-to-place fallback) ---------- */
export function SortTask({ task, onDone, onMistake }: { task: SortTaskT; onDone: () => void; onMistake: (item: string, zone: string) => void }) {
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [wrong, setWrong] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const z1 = useRef<HTMLDivElement>(null);
  const z2 = useRef<HTMLDivElement>(null);
  const pool = task.items.filter((i) => !placed[i.text]);

  const zoneAt = (x: number, y: number) => {
    for (const [ref, id] of [[z1, task.zone1.id], [z2, task.zone2.id]] as const) {
      const r = ref.current?.getBoundingClientRect();
      if (r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return id;
    }
    return null;
  };

  const place = (text: string, zone: string) => {
    setPlaced((p) => ({ ...p, [text]: zone }));
    setWrong((w) => w.filter((x) => x !== text));
    setSelected(null);
    playSfx("click");
  };

  const check = () => {
    const bad = task.items.filter((i) => placed[i.text] !== i.type).map((i) => i.text);
    if (bad.length === 0) {
      playSfx("success");
      onDone();
    } else {
      playSfx("error");
      setWrong(bad);
      bad.forEach((b) => onMistake(b, placed[b]));
      setPlaced((p) => {
        const n = { ...p };
        bad.forEach((b) => delete n[b]);
        return n;
      });
    }
  };

  return (
    <div className="glass rounded-3xl p-6 sm:p-10">
      <h3 className="text-xl font-bold sm:text-2xl">{task.title}</h3>
      <p className="mt-2 text-fg2">{task.desc} <span className="text-fg3">(перетащи или нажми на карточку, затем на корзину)</span></p>
      <div className="mt-5 flex min-h-[64px] flex-wrap gap-2 rounded-xl border border-dashed border-line bg-card p-3">
        {pool.map((i) => (
          <motion.button
            key={i.text}
            drag
            dragSnapToOrigin
            dragElastic={0.8}
            whileDrag={{ scale: 1.08, zIndex: 20 }}
            onDragEnd={(_: unknown, info: PanInfo) => { const z = zoneAt(info.point.x, info.point.y); if (z) place(i.text, z); }}
            onClick={() => setSelected((s) => (s === i.text ? null : i.text))}
            className={cn("cursor-grab select-none rounded-lg border-2 bg-navy-700 px-4 py-2 font-semibold active:cursor-grabbing", selected === i.text ? "border-teal shadow-glow" : wrong.includes(i.text) ? "border-red-400" : "border-line")}
          >
            {i.text}
          </motion.button>
        ))}
        {pool.length === 0 && <span className="text-sm text-fg3">Все карточки разложены — нажми «Проверить»</span>}
      </div>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row">
        {([[task.zone1, z1], [task.zone2, z2]] as const).map(([zone, refEl]) => (
          <div
            key={zone.id}
            ref={refEl}
            onClick={() => selected && place(selected, zone.id)}
            className={cn(
              "flex min-h-[180px] flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-4 transition-all",
              zone.kind === "good" ? "border-teal/40" : "border-red-400/40",
              selected && "cursor-pointer bg-card",
            )}
          >
            <h4 className={cn("mb-2 text-lg font-bold", zone.kind === "good" ? "text-teal" : "text-danger")}>{zone.label}</h4>
            {task.items.filter((i) => placed[i.text] === zone.id).map((i) => (
              <button key={i.text} onClick={(e) => { e.stopPropagation(); setPlaced((p) => { const n = { ...p }; delete n[i.text]; return n; }); }} className={cn("rounded-lg border-2 bg-card px-4 py-2 font-semibold", wrong.includes(i.text) ? "border-red-400" : "border-line")} title="Вернуть">
                {i.text}
              </button>
            ))}
          </div>
        ))}
      </div>
      <button className="btn-teal mt-6" disabled={pool.length > 0} onClick={check}>Проверить</button>
    </div>
  );
}
