"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useTransform } from "framer-motion";
import { HandCam } from "@/components/hand-tracking/HandCam";
import type { Gesture } from "@/components/hand-tracking/useHandTracking";
import { EMAILS, type EmailCard } from "@/data/emails";
import { useProgress } from "@/store/progress";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { SimulatorProps } from "./types";

const ROUND = 10;

function shuffle<T>(a: T[]) {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

type Answer = { email: EmailCard; saidPhishing: boolean; correct: boolean };

export function PhishingSimulator({ mentor, tracker, onComplete }: SimulatorProps) {
  const [deck, setDeck] = useState<EmailCard[]>(() => shuffle(EMAILS).slice(0, ROUND));
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [flash, setFlash] = useState<"ok" | "bad" | null>(null);
  const [exitDir, setExitDir] = useState<1 | -1>(1);
  const handEnabled = useProgress((s) => s.handTrackingEnabled && !s.lowPerf);
  const setHandTracking = useProgress((s) => s.setHandTracking);
  const lowPerf = useProgress((s) => s.lowPerf);
  const addScore = useProgress((s) => s.addScore);
  const finishedRef = useRef(false);

  const current = deck[idx];
  const finished = idx >= deck.length;
  const correctCount = answers.filter((a) => a.correct).length;

  const answer = useCallback(
    (saidPhishing: boolean) => {
      if (!current || flash) return;
      const correct = saidPhishing === current.isPhishing;
      setExitDir(saidPhishing ? -1 : 1);
      setFlash(correct ? "ok" : "bad");
      playSfx(correct ? "ding" : "error");
      if (correct) addScore("phishing", 10);
      else tracker.mistake(`email:${current.id}`, saidPhishing ? "фишинг" : "безопасно");
      setAnswers((a) => [...a, { email: current, saidPhishing, correct }]);
      mentor.setText(
        correct
          ? `✅ Верно! ${current.hint}`
          : `❌ Ой, это ${current.isPhishing ? "был фишинг" : "было безопасное письмо"}. ${current.hint}`,
      );
      setTimeout(() => {
        setFlash(null);
        setIdx((i) => i + 1);
      }, 650);
    },
    [current, flash, addScore, mentor, tracker],
  );

  // keyboard fallback
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      tracker.input("keyboard");
      if (e.key === "ArrowLeft") answer(true);
      if (e.key === "ArrowRight") answer(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [answer, tracker]);

  const onGesture = useCallback(
    (g: Gesture) => {
      if (g === "swipe-left" || g === "swipe-right") tracker.input("hand");
      if (g === "swipe-left") { playSfx("swipe"); answer(true); }
      if (g === "swipe-right") { playSfx("swipe"); answer(false); }
    },
    [answer, tracker],
  );

  // finish
  useEffect(() => {
    if (!finished || finishedRef.current) return;
    finishedRef.current = true;
    tracker.attempt();
    const passed = correctCount >= Math.ceil(deck.length * 0.7);
    if (passed) {
      playSfx("success");
      onComplete(correctCount * 10 + 50);
    }
    const mistakes = answers.filter((a) => !a.correct);
    if (mistakes.length === 0) {
      mentor.say("Керемет! Ни одной ошибки — ты настоящий охотник на фишинг. Остров пройден!");
    } else {
      mentor.ask(
        `Ученик закончил тренировку по фишингу: ${correctCount} из ${deck.length} правильно. Ошибки: ${mistakes
          .map((m) => `письмо от «${m.email.from}» (${m.email.address}), тема «${m.email.subject}» — ${m.email.isPhishing ? "это фишинг, ученик посчитал безопасным" : "это безопасное письмо, ученик посчитал фишингом"}`)
          .join("; ")}. Кратко и по-доброму объясни главные признаки, на которые стоит обращать внимание, чтобы не повторять эти ошибки. ${passed ? "Поздравь с прохождением." : "Подбодри и предложи попробовать ещё раз."}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const restart = () => {
    finishedRef.current = false;
    setDeck(shuffle(EMAILS).slice(0, ROUND));
    setIdx(0);
    setAnswers([]);
    mentor.setText("Новый раунд! Влево — фишинг, вправо — безопасно.");
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div>
          {!finished ? (
            <>
              <div className="mb-3 flex items-center justify-between text-sm text-fg2">
                <span>Письмо {idx + 1} из {deck.length}</span>
                <span className="text-sun">✓ {correctCount}</span>
              </div>
              <div className="relative h-[380px]">
                <AnimatePresence custom={exitDir} initial={false}>
                  {current && (
                    <SwipeCard key={current.id} email={current} exitDir={exitDir} flash={flash} onSwipe={(v) => { tracker.input("mouse"); answer(v); }} />
                  )}
                </AnimatePresence>
              </div>
              <div className="mt-4 flex justify-between gap-3">
                <button className="btn rounded-2xl bg-red-500/20 px-5 py-3 text-red-300 hover:bg-red-500/30" onClick={() => answer(true)}>
                  ← 🎣 Фишинг
                </button>
                <button className="btn rounded-2xl bg-teal/20 px-5 py-3 text-teal hover:bg-teal/30" onClick={() => answer(false)}>
                  ✅ Безопасно →
                </button>
              </div>
              <p className="mt-2 text-center text-xs text-fg3">
                Стрелки ← → на клавиатуре, перетаскивание карточки или взмах рукой перед камерой
              </p>
            </>
          ) : (
            <Result answers={answers} onRestart={restart} passed={correctCount >= Math.ceil(deck.length * 0.7)} />
          )}
        </div>

        <aside className="flex flex-col gap-3">
          {!lowPerf && (
            <>
              <HandCam enabled={handEnabled && !finished} onGesture={onGesture} />
              <button className="btn-ghost text-xs" onClick={() => setHandTracking(!handEnabled)}>
                {handEnabled ? "📷 Выключить камеру" : "📷 Включить управление рукой"}
              </button>
            </>
          )}
          <div className="glass rounded-xl p-3 text-xs text-fg2">
            <div className="mb-1 font-semibold text-teal">На что смотреть</div>
            <ul className="space-y-1">
              <li>• Адрес отправителя (домен после @)</li>
              <li>• Спешка и угрозы</li>
              <li>• Просьба ввести пароль или код</li>
              <li>• Слишком щедрые подарки</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}

function SwipeCard({ email, exitDir, flash, onSwipe }: { email: EmailCard; exitDir: 1 | -1; flash: "ok" | "bad" | null; onSwipe: (phishing: boolean) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-250, 250], [-12, 12]);
  const leftOpacity = useTransform(x, [-120, -30], [1, 0]);
  const rightOpacity = useTransform(x, [30, 120], [0, 1]);

  return (
    <motion.article
      className={cn(
        "glass absolute inset-0 flex cursor-grab flex-col overflow-hidden rounded-2xl p-5 active:cursor-grabbing",
        flash === "ok" && "border-teal shadow-glow",
        flash === "bad" && "border-red-500 shadow-[0_0_30px_rgba(239,68,68,.4)]",
      )}
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, i) => {
        if (i.offset.x < -110) onSwipe(true);
        else if (i.offset.x > 110) onSwipe(false);
      }}
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ x: exitDir * 500, opacity: 0, rotate: exitDir * 15, transition: { duration: 0.35 } }}
    >
      <motion.div style={{ opacity: leftOpacity }} className="pointer-events-none absolute left-4 top-4 rounded-lg border-2 border-red-400 px-2 py-1 text-sm font-bold text-red-400">🎣 ФИШИНГ</motion.div>
      <motion.div style={{ opacity: rightOpacity }} className="pointer-events-none absolute right-4 top-4 rounded-lg border-2 border-teal px-2 py-1 text-sm font-bold text-teal">✅ ОК</motion.div>
      <div className="mb-3 flex items-center gap-3 border-b border-line pb-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-lg">✉️</div>
        <div className="min-w-0">
          <div className="truncate font-semibold">{email.from}</div>
          <div className="truncate text-xs text-fg2">{email.address}</div>
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold">{email.subject}</h3>
      <p className="flex-1 text-sm leading-relaxed text-fg">{email.body}</p>
      {email.link && (
        <div className="mt-3 truncate rounded-lg bg-navy-700 px-3 py-2 text-xs text-sky-300 underline">🔗 {email.link}</div>
      )}
    </motion.article>
  );
}

function Result({ answers, passed, onRestart }: { answers: Answer[]; passed: boolean; onRestart: () => void }) {
  const correct = answers.filter((a) => a.correct).length;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-6">
      <div className="text-center">
        <div className="text-5xl">{passed ? "🏆" : "💪"}</div>
        <h2 className="mt-2 text-2xl font-semibold text-sun">{correct} из {answers.length}</h2>
        <p className="text-fg2">{passed ? "Тренажёр пройден! Впереди итоговый квиз." : "Нужно 70% правильных ответов. Попробуй ещё раз!"}</p>
      </div>
      <ul className="mt-4 max-h-56 space-y-1 overflow-y-auto text-sm">
        {answers.map((a) => (
          <li key={a.email.id} className={cn("flex items-start gap-2 rounded-lg px-2 py-1", a.correct ? "bg-teal/10" : "bg-red-500/10")}>
            <span>{a.correct ? "✅" : "❌"}</span>
            <span className="min-w-0">
              <span className="font-semibold">{a.email.from}</span> — {a.email.subject}
              {!a.correct && <span className="block text-xs text-fg2">{a.email.hint}</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex justify-center gap-3">
        <button className="btn-ghost" onClick={onRestart}>🔁 Ещё раз</button>
      </div>
    </motion.div>
  );
}
