"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { LessonShell } from "./LessonShell";
import { TheoryVisual } from "./TheoryVisual";
import { ChoiceTask, SortTask } from "./tasks";
import { MiniTest } from "@/components/hud/MiniTest";
import { useMentor } from "@/components/hud/useMentor";
import { useModuleTracker, type WrongAnswer } from "@/components/hud/useModuleTracker";
import { getModule, MODULES, type ModuleSlug } from "@/data/modules";
import { LESSONS, PRE_TEST_SIZE } from "@/data/lessons";
import { TESTS } from "@/data/tests";
import { useProgress, allModulesCompleted } from "@/store/progress";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { SimulatorProps } from "@/components/simulators/types";

const loading = () => <div className="glass animate-pulse rounded-3xl p-10 text-center text-teal">Загрузка симулятора…</div>;
const PasswordSimulator = dynamic(() => import("@/components/simulators/PasswordSimulator").then((m) => m.PasswordSimulator), { ssr: false, loading });
const PrivacySimulator = dynamic(() => import("@/components/simulators/PrivacySimulator").then((m) => m.PrivacySimulator), { ssr: false, loading });
const ChatSimulator = dynamic(() => import("@/components/simulators/ChatSimulator").then((m) => m.ChatSimulator), { ssr: false, loading });
const PhishingSimulator = dynamic(() => import("@/components/simulators/PhishingSimulator").then((m) => m.PhishingSimulator), { ssr: false, loading });
const ScreenTimeSimulator = dynamic(() => import("@/components/simulators/ScreenTimeSimulator").then((m) => m.ScreenTimeSimulator), { ssr: false, loading });

type Stage = "pre" | "theory" | "trainer" | "simulator" | "quiz" | "result";
const STAGES: Stage[] = ["pre", "theory", "trainer", "simulator", "quiz", "result"];

export function LessonModule({ slug }: { slug: ModuleSlug }) {
  const info = getModule(slug)!;
  const lesson = LESSONS[slug];
  const tracker = useModuleTracker(slug);
  const mentor = useMentor({ topic: slug, initial: info.intro, context: `Ученик проходит модуль «${info.title}».` });
  const finishQuiz = useProgress((s) => s.finishQuiz);
  const markSimulatorDone = useProgress((s) => s.markSimulatorDone);
  const addScore = useProgress((s) => s.addScore);
  const modules = useProgress((s) => s.modules);

  const [stage, setStage] = useState<Stage>("pre");
  const [step, setStep] = useState(0);
  const [simDone, setSimDone] = useState(false);
  const [simScore, setSimScore] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ correct: boolean; chosen: string }[]>([]);
  const [quizPct, setQuizPct] = useState(0);
  const [passed, setPassed] = useState(false);

  // skip the pre-test if this session already has one (page reload)
  useEffect(() => {
    if (tracker.ready && tracker.preDone && stage === "pre") setStage("theory");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tracker.ready, tracker.preDone]);

  const goto = useCallback((s: Stage) => {
    setStage(s);
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const stageLabel = useMemo(() => {
    switch (stage) {
      case "pre": return "Разминка";
      case "theory": return `Этап 1: Теория (${step + 1}/${lesson.theory.length})`;
      case "trainer": return `Этап 2: Тренажёр (${step + 1}/${lesson.tasks.length})`;
      case "simulator": return "Этап 3: Симулятор";
      case "quiz": return `Этап 4: Квиз (${Math.min(step + 1, lesson.quiz.length)}/${lesson.quiz.length})`;
      case "result": return "Результат";
    }
  }, [stage, step, lesson]);

  // ---- handlers
  const onPre = (correct: number, wrong: WrongAnswer[]) => {
    tracker.submitPreTest(correct, wrong);
    mentor.say(correct === PRE_TEST_SIZE ? "Ого, ты уже многое знаешь! Давай закрепим и попробуем на практике." : "Отлично, теперь посмотрим, как это работает, — после модуля ответим на те же вопросы.");
    goto("theory");
  };

  const nextTheory = () => {
    playSfx("click");
    if (step + 1 < lesson.theory.length) setStep(step + 1);
    else {
      mentor.say("Теория позади. Теперь — тренажёр: ошибаться можно, главное — разобраться.");
      goto("trainer");
    }
  };

  const nextTask = () => {
    if (step + 1 < lesson.tasks.length) setStep(step + 1);
    else {
      mentor.say(`Тренажёр пройден! Впереди главное — ${info.simulatorTitle.toLowerCase()}.`);
      goto("simulator");
    }
  };

  const onSimComplete = (score: number) => {
    setSimDone(true);
    setSimScore(score);
    markSimulatorDone(slug);
    addScore(slug, score);
  };

  const onQuizAnswer = (correct: boolean, chosen: string) => {
    const q = lesson.quiz[step];
    if (!correct) tracker.mistake(`quiz:${q.id}`, chosen);
    const answers = [...quizAnswers, { correct, chosen }];
    setQuizAnswers(answers);
    if (step + 1 < lesson.quiz.length) setStep(step + 1);
    else finishAll(answers);
  };

  const finishAll = (answers: { correct: boolean; chosen: string }[]) => {
    const correct = answers.filter((a) => a.correct).length;
    const pct = Math.round((correct / lesson.quiz.length) * 100);
    const postCorrect = answers.slice(0, PRE_TEST_SIZE).filter((a) => a.correct).length;
    const wrong: WrongAnswer[] = answers
      .slice(0, PRE_TEST_SIZE)
      .map((a, i) => ({ a, q: lesson.quiz[i] }))
      .filter(({ a }) => !a.correct)
      .map(({ a, q }) => ({ questionId: `test:${q.id}`, chosen: a.chosen }));
    const ok = finishQuiz(slug, pct, 50 + correct * 10);
    tracker.finish(postCorrect, wrong, simScore + correct * 10);
    setQuizPct(pct);
    setPassed(ok);
    playSfx(ok ? "unlock" : "error");
    const mistakes = answers.map((a, i) => (!a.correct ? `«${lesson.quiz[i].q}» — выбрал «${a.chosen}», верно «${lesson.quiz[i].opts[lesson.quiz[i].a]}»` : null)).filter(Boolean);
    mentor.ask(
      `Ученик закончил модуль «${info.title}»: квиз ${correct} из ${lesson.quiz.length} (${pct}%). ${mistakes.length ? `Ошибки: ${mistakes.join("; ")}.` : "Без ошибок."} ${ok ? "Поздравь коротко и назови одно главное правило темы." : "Подбодри, объясни главную ошибку простыми словами и предложи пройти ещё раз."}`,
    );
    goto("result");
  };

  const retryQuiz = () => {
    setQuizAnswers([]);
    goto("quiz");
  };

  const simProps: SimulatorProps = { mentor, tracker, onComplete: onSimComplete };
  const stageIdx = STAGES.indexOf(stage);
  const allDone = allModulesCompleted(modules);
  const nextModule = MODULES[MODULES.findIndex((m) => m.slug === slug) + 1];

  return (
    <LessonShell
      info={info}
      stageLabel={stageLabel}
      mentorText={mentor.text}
      mentorLoading={mentor.loading}
      mentorOffline={mentor.offline}
      onAsk={(q) => mentor.ask(q, stage === "quiz" ? `Сейчас вопрос квиза: «${lesson.quiz[step]?.q}». Не называй правильный ответ, помоги рассуждать.` : undefined)}
      wide={stage === "simulator"}
    >
      {/* stage stepper */}
      <ol className="mb-6 flex flex-wrap gap-2 text-xs">
        {[["Разминка", "pre"], ["Теория", "theory"], ["Тренажёр", "trainer"], ["Симулятор", "simulator"], ["Квиз", "quiz"]].map(([label, s], i) => (
          <li key={s} className={cn("rounded-pill border px-3 py-1", STAGES.indexOf(s as Stage) < stageIdx ? "border-teal/40 bg-teal/10 text-teal" : s === stage ? "border-sun bg-sun/15 font-semibold text-sun" : "border-line text-fg3")}>
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {stage === "pre" && tracker.ready && (
        <MiniTest key="pre" phase="pre" questions={TESTS[slug]} color={info.color} onSubmit={onPre} />
      )}

      {stage === "theory" && (
        <div className="glass rounded-3xl p-6 sm:p-10">
          <h2 className="text-2xl font-extrabold text-teal sm:text-3xl">{lesson.theory[step].title}</h2>
          <TheoryVisual key={step} kind={lesson.theory[step].visual} />
          <p className="text-lg leading-relaxed sm:text-xl">{lesson.theory[step].text}</p>
          <button className="btn-teal mt-6" onClick={nextTheory}>{step + 1 < lesson.theory.length ? "Далее" : "К тренажёру →"}</button>
        </div>
      )}

      {stage === "trainer" && (() => {
        const t = lesson.tasks[step];
        return t.type === "choice" ? (
          <ChoiceTask key={t.id} task={t} onDone={(ok, chosen) => (ok ? nextTask() : tracker.mistake(`task:${t.id}`, chosen))} />
        ) : (
          <SortTask key={t.id} task={t} onDone={nextTask} onMistake={(item, zone) => tracker.mistake(`task:${t.id}:${item}`, zone)} />
        );
      })()}

      {stage === "simulator" && (
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold sm:text-2xl">{info.simulatorTitle}</h2>
            <button className={cn(simDone ? "btn-sun" : "btn-soft")} onClick={() => { mentor.say("Итоговый квиз: 5 вопросов, первые три ты уже видел в разминке."); goto("quiz"); }}>
              {simDone ? "К квизу →" : "Пропустить симулятор"}
            </button>
          </div>
          {info.simulator === "password" && <PasswordSimulator {...simProps} />}
          {info.simulator === "privacy" && <PrivacySimulator {...simProps} />}
          {info.simulator === "chat" && <ChatSimulator {...simProps} module={slug} required={2} />}
          {info.simulator === "phishing" && <PhishingSimulator {...simProps} />}
          {info.simulator === "screentime" && <ScreenTimeSimulator {...simProps} />}
        </div>
      )}

      {stage === "quiz" && (
        <ChoiceTask key={`quiz-${step}-${quizAnswers.length}`} task={lesson.quiz[step]} quiz onDone={onQuizAnswer} />
      )}

      {stage === "result" && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-8 text-center sm:p-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Модуль завершён!</h2>
          <div className="my-5 text-6xl font-extrabold" style={{ color: passed ? "var(--accent)" : "var(--danger)" }}>{quizPct}%</div>
          <div className="mb-4 text-3xl">
            {[0, 1, 2].map((k) => <span key={k} className={modules[slug].stars > k ? "text-sun" : "text-fg3/40"}>{modules[slug].stars > k ? "★" : "☆"}</span>)}
          </div>
          <p className="text-lg text-fg2">{passed ? `Керемет! Бейдж «${info.badge}» твой.` : "Нужно 70 %. Посмотри объяснение наставника и попробуй ещё раз."}</p>
          {!simDone && <p className="mt-2 text-sm text-fg3">Третья звезда — за симулятор. Его можно пройти при повторном заходе.</p>}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {!passed && <button className="btn-teal" onClick={retryQuiz}>🔁 Пройти квиз ещё раз</button>}
            {passed && nextModule && <Link href={`/modules/${nextModule.slug}`} className="btn-teal">Следующий модуль →</Link>}
            {passed && allDone && <Link href="/final" className="btn-sun">🏁 Финальная миссия</Link>}
            <Link href="/map" className="btn-soft">3D-карта</Link>
            <Link href="/" className="btn-soft">На главную</Link>
          </div>
        </motion.div>
      )}
    </LessonShell>
  );
}
