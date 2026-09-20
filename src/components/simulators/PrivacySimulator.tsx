"use client";
import { forwardRef, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { POSTS, LEAK_LABELS, type PostCard } from "@/data/privacy";
import { useProgress } from "@/store/progress";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { SimulatorProps } from "./types";

const Footprint3D = dynamic(() => import("@/components/scene/Footprint3D").then((m) => m.Footprint3D), { ssr: false });

type Zone = "safe" | "unsafe";
type Placed = Record<number, Zone>;

export function PrivacySimulator({ mentor, tracker, onComplete }: SimulatorProps) {
  const [placed, setPlaced] = useState<Placed>({});
  const [over, setOver] = useState<Zone | null>(null);
  const [stage, setStage] = useState<"sort" | "result">("sort");
  const safeRef = useRef<HTMLDivElement>(null);
  const unsafeRef = useRef<HTMLDivElement>(null);
  const addScore = useProgress((s) => s.addScore);

  const remaining = POSTS.filter((p) => placed[p.id] === undefined);
  const current = remaining[0];

  const zoneAt = (x: number, y: number): Zone | null => {
    const hit = (el: HTMLDivElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    if (hit(safeRef.current)) return "safe";
    if (hit(unsafeRef.current)) return "unsafe";
    return null;
  };

  const place = (card: PostCard, zone: Zone) => {
    const correct = (zone === "safe") === card.safe;
    playSfx(correct ? "ding" : "error");
    if (correct) addScore("privacy", 10);
    else tracker.mistake(`post:${card.id}`, zone === "safe" ? "можно публиковать" : "нельзя");
    mentor.setText(correct ? `✅ Верно! ${card.why}` : `❌ Не совсем. ${card.why}`);
    const next = { ...placed, [card.id]: zone };
    setPlaced(next);
    setOver(null);
    if (Object.keys(next).length === POSTS.length) {
      setTimeout(() => finish(next), 900);
    }
  };

  const finish = (all: Placed) => {
    setStage("result");
    const wrong = POSTS.filter((p) => (all[p.id] === "safe") !== p.safe);
    const leaked = POSTS.filter((p) => !p.safe && all[p.id] === "safe");
    const safety = 1 - wrong.length / POSTS.length;
    tracker.attempt();
    if (safety >= 0.75) {
      playSfx("success");
      onComplete((POSTS.length - wrong.length) * 10 + 40);
    }
    mentor.ask(
      `Ученик завершил модуль о приватности: ${POSTS.length - wrong.length} из ${POSTS.length} верно. ${
        leaked.length
          ? `Он бы опубликовал опасные посты: ${leaked.map((l) => `«${l.text}»`).join(", ")}.`
          : "Он не опубликовал ни одного опасного поста."
      } ${wrong.filter((w) => w.safe).length ? `Также он зря побоялся публиковать: ${wrong.filter((w) => w.safe).map((w) => `«${w.text}»`).join(", ")}.` : ""} Объясни, какой цифровой след он оставил бы, и дай 2 правила про личные данные.${safety >= 0.75 ? " Поздравь с прохождением." : " Подбодри и предложи пройти ещё раз."}`,
    );
  };

  const leaks = useMemo(
    () => POSTS.filter((p) => !p.safe && placed[p.id] === "safe" && p.leak).map((p) => LEAK_LABELS[p.leak!]),
    [placed],
  );
  const wrongCount = POSTS.filter((p) => placed[p.id] !== undefined && (placed[p.id] === "safe") !== p.safe).length;
  const safety = 1 - wrongCount / POSTS.length;

  const onDragEnd = (card: PostCard, _: unknown, i: PanInfo) => {
    const z = zoneAt(i.point.x, i.point.y);
    if (z) place(card, z);
    else setOver(null);
  };

  const restart = () => {
    setPlaced({});
    setStage("sort");
    mentor.setText("Ещё раз: перетащи карточки в зону «можно» или «нельзя».");
  };

  return (
    <>
      {stage === "sort" ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-fg2">
            <span>Карточка {POSTS.length - remaining.length + 1} из {POSTS.length}</span>
            <span className="text-sun">✓ {POSTS.length - remaining.length - wrongCount}</span>
          </div>
          <div className="grid grid-cols-[1fr_minmax(200px,1.3fr)_1fr] gap-3 sm:gap-5">
            <DropZone ref={safeRef} kind="safe" active={over === "safe"} count={POSTS.filter((p) => placed[p.id] === "safe").length} />
            <div className="relative flex min-h-[260px] items-center justify-center">
              <AnimatePresence mode="popLayout">
                {current && (
                  <motion.div
                    key={current.id}
                    layout
                    drag
                    dragSnapToOrigin
                    dragElastic={0.9}
                    whileDrag={{ scale: 1.05, rotate: 2, zIndex: 20 }}
                    onDrag={(_, i) => setOver(zoneAt(i.point.x, i.point.y))}
                    onDragEnd={(e, i) => { tracker.input("mouse"); onDragEnd(current, e, i); }}
                    initial={{ opacity: 0, scale: 0.8, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="glass w-full max-w-xs cursor-grab select-none rounded-2xl p-5 text-center shadow-glow active:cursor-grabbing"
                  >
                    <div className="text-5xl">{current.emoji}</div>
                    <p className="mt-3 text-sm leading-relaxed text-fg">{current.text}</p>
                    <div className="mt-4 flex justify-center gap-2 sm:hidden">
                      <button className="btn rounded-lg bg-red-500/20 px-3 py-1 text-xs text-red-300" onClick={() => place(current, "unsafe")}>Нельзя</button>
                      <button className="btn rounded-lg bg-teal/20 px-3 py-1 text-xs text-teal" onClick={() => place(current, "safe")}>Можно</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <DropZone ref={unsafeRef} kind="unsafe" active={over === "unsafe"} count={POSTS.filter((p) => placed[p.id] === "unsafe").length} />
          </div>
          <p className="text-center text-xs text-fg3">Перетащи карточку в зону «Можно публиковать» или «Нельзя»</p>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-4 md:grid-cols-[1fr_300px]">
          <div className="glass relative h-[420px] overflow-hidden rounded-2xl">
            <Footprint3D leaks={leaks} safety={safety} />
            <div className="pointer-events-none absolute left-4 top-3 text-sm font-semibold text-fg">Твой цифровой след</div>
          </div>
          <div className="glass flex flex-col gap-3 rounded-2xl p-4 text-sm">
            <div className="text-center">
              <div className="text-4xl">{safety >= 0.75 ? "🔒" : "🕵️"}</div>
              <div className="mt-1 text-xl font-semibold text-sun">{POSTS.length - wrongCount} из {POSTS.length}</div>
              <div className="text-xs text-fg2">{safety >= 0.75 ? "Тренажёр пройден! Впереди итоговый квиз." : "Нужно 75% верных ответов."}</div>
            </div>
            <div>
              <div className="mb-1 text-xs uppercase tracking-wider text-fg3">Что узнали бы о тебе</div>
              {leaks.length ? (
                <ul className="flex flex-wrap gap-1">
                  {leaks.map((l) => (
                    <li key={l} className="rounded-md bg-red-500/20 px-2 py-0.5 text-xs text-red-300">{l}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-xs text-teal">Ничего лишнего — керемет!</div>
              )}
            </div>
            <div className="mt-auto flex gap-2">
              <button className="btn-ghost flex-1" onClick={restart}>🔁 Ещё раз</button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}

const DropZone = forwardRef<HTMLDivElement, { kind: Zone; active: boolean; count: number }>(function DropZone({ kind, active, count }, ref) {
  const safe = kind === "safe";
  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-[260px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-3 text-center transition-all",
        safe ? "border-teal/40 text-teal" : "border-red-400/40 text-red-300",
        active && (safe ? "bg-teal/15 border-teal scale-[1.03]" : "bg-red-500/15 border-red-400 scale-[1.03]"),
      )}
    >
      <div className="text-3xl">{safe ? "✅" : "🚫"}</div>
      <div className="mt-2 text-sm font-semibold">{safe ? "Можно публиковать" : "Нельзя"}</div>
      <div className="mt-1 text-xs opacity-70">{count} карт.</div>
    </div>
  );
});
