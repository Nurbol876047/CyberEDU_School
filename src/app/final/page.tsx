"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MentorDialog } from "@/components/hud/MentorDialog";
import { AskMentor } from "@/components/hud/AskMentor";
import { useMentor } from "@/components/hud/useMentor";
import { askMentor } from "@/lib/mentor";
import { FALLBACK_MISSION, MISSION_PROMPT, parseMission, type Mission } from "@/data/finalMission";
import { allModulesCompleted, useProgress } from "@/store/progress";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";

export default function FinalPage() {
  const router = useRouter();
  const modules = useProgress((s) => s.modules);
  const completeFinal = useProgress((s) => s.completeFinal);
  const [hydrated, setHydrated] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [generated, setGenerated] = useState<boolean | null>(null);
  const [step, setStep] = useState(-1); // -1 intro
  const [picked, setPicked] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [askOpen, setAskOpen] = useState(false);
  const loadedRef = useRef(false);
  const mentor = useMentor({ initial: "Готовлю для тебя уникальную миссию…", context: "Финальная миссия, объединяющая все темы." });

  useEffect(() => setHydrated(true), []);
  const unlocked = hydrated && allModulesCompleted(modules);

  const load = useCallback(async () => {
    setMission(null);
    setGenerated(null);
    setStep(-1);
    setPicked(null);
    setCorrect(0);
    mentor.setText("Готовлю для тебя уникальную миссию…");
    const r = await askMentor(MISSION_PROMPT, { json: true });
    const m = r.ok ? parseMission(r.text) : null;
    setMission(m ?? FALLBACK_MISSION);
    setGenerated(!!m);
    mentor.setText(
      m
        ? "Миссия сгенерирована специально для тебя! Прочитай завязку и нажми «Начать»."
        : "Наставник офлайн — даю проверенную миссию из архива. Прочитай завязку и нажми «Начать».",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!unlocked || loadedRef.current) return;
    loadedRef.current = true;
    load();
  }, [unlocked, load]);

  if (!hydrated) return null;

  if (!unlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="text-6xl">🔒</div>
        <h1 className="text-2xl font-semibold">Финальная миссия закрыта</h1>
        <p className="max-w-md text-fg2">Пройди все шесть модулей, чтобы открыть финальное испытание.</p>
        <Link href="/" className="btn-teal">← К модулям</Link>
      </main>
    );
  }

  const total = mission?.steps.length ?? 0;
  const cur = mission && step >= 0 && step < total ? mission.steps[step] : null;
  const finished = mission && step >= total;

  const choose = (i: number) => {
    if (!cur || picked !== null) return;
    setPicked(i);
    const ok = cur.options[i].correct;
    playSfx(ok ? "ding" : "error");
    if (ok) setCorrect((c) => c + 1);
    mentor.say((ok ? "✅ " : "❌ ") + cur.options[i].feedback);
  };

  const next = () => {
    setPicked(null);
    const n = step + 1;
    setStep(n);
    if (n >= total) {
      playSfx("unlock");
      completeFinal(correct * 20);
      mentor.say(mission?.outro ?? "Миссия выполнена!");
    }
  };

  return (
    <main className="relative min-h-screen">
      <MentorDialog
        text={mentor.text}
        loading={mentor.loading}
        actions={
          <div className="flex w-full flex-col gap-2">
            <div className="flex gap-2">
              <button className="btn-ghost px-3 py-1.5 text-[11px]" onClick={() => setAskOpen((v) => !v)}>💬 {askOpen ? "Скрыть" : "Спросить наставника"}</button>
            </div>
            {askOpen && <AskMentor onAsk={(q) => mentor.ask(q, cur ? `Текущая ситуация: ${cur.situation}. Не называй правильный ответ напрямую.` : undefined)} loading={mentor.loading} offline={mentor.offline} />}
          </div>
        }
      />
      <div className="mx-auto max-w-3xl px-[5%] pb-56 pt-8">
        <Link href="/map" className="btn-soft px-5 py-2.5 text-xs">← К карте</Link>
        <h1 className="mt-1 text-3xl font-semibold text-sun sm:text-4xl">Финальная миссия</h1>
        {generated !== null && (
          <p className="text-xs text-fg3">{generated ? "✨ Сгенерировано наставником" : "📚 Миссия из архива (наставник офлайн)"}</p>
        )}

        <AnimatePresence mode="wait">
          {!mission ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="glass mt-6 rounded-2xl p-8 text-center">
              <div className="animate-pulse text-4xl">🛰️</div>
              <p className="mt-3 text-fg2">Наставник придумывает сюжет…</p>
            </motion.div>
          ) : step === -1 ? (
            <motion.div key="intro" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass mt-6 rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-teal">{mission.title}</h2>
              <p className="mt-3 leading-relaxed text-fg">{mission.intro}</p>
              <div className="mt-5 flex gap-3">
                <button className="btn-sun" onClick={() => { playSfx("click"); setStep(0); }}>Начать миссию →</button>
                <button className="btn-ghost" onClick={load}>🎲 Другой сюжет</button>
              </div>
            </motion.div>
          ) : cur ? (
            <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="mt-6">
              <div className="mb-2 flex justify-between text-sm text-fg3">
                <span>Шаг {step + 1} из {total}</span>
                <span className="text-sun">✓ {correct}</span>
              </div>
              <div className="glass rounded-2xl p-6">
                <p className="text-lg leading-relaxed">{cur.situation}</p>
                <div className="mt-5 flex flex-col gap-2">
                  {cur.options.map((o, i) => (
                    <button
                      key={i}
                      onClick={() => choose(i)}
                      disabled={picked !== null}
                      className={cn(
                        "rounded-xl border px-4 py-3 text-left text-sm transition-all",
                        picked === null && "border-line bg-navy-700 hover:border-teal hover:bg-teal/10",
                        picked !== null && o.correct && "border-teal bg-teal/20",
                        picked === i && !o.correct && "border-red-400 bg-red-500/20",
                        picked !== null && picked !== i && !o.correct && "opacity-40",
                      )}
                    >
                      {o.text}
                    </button>
                  ))}
                </div>
                {picked !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex justify-end">
                    <button className="btn-teal" onClick={next}>{step + 1 < total ? "Дальше →" : "Завершить миссию 🏁"}</button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ) : finished ? (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass mt-6 rounded-2xl p-8 text-center">
              <div className="text-6xl">🏆</div>
              <h2 className="mt-2 text-2xl font-semibold text-sun">Миссия выполнена: {correct} из {total}</h2>
              <p className="mt-2 text-fg">{mission.outro}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button className="btn-sun" onClick={() => router.push("/certificate")}>Получить сертификат 🎓</button>
                <button className="btn-ghost" onClick={load}>🎲 Новая миссия</button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
