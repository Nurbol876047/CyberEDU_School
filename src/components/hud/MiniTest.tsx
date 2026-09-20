"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import type { TestQuestion } from "@/data/tests";
import { cn } from "@/lib/utils";
import { playSfx } from "@/lib/sound";

interface Props {
  phase: "pre" | "post";
  questions: TestQuestion[];
  color: string;
  onSubmit: (correct: number, wrong: { questionId: string; chosen: string }[]) => void;
}

/** Three-question check shown before and after a module (same questions → comparable). */
export function MiniTest({ phase, questions, color, onSubmit }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const done = questions.every((q) => answers[q.id] !== undefined);

  const submit = () => {
    let correct = 0;
    const wrong: { questionId: string; chosen: string }[] = [];
    for (const q of questions) {
      if (answers[q.id] === q.answer) correct += 1;
      else wrong.push({ questionId: `test:${q.id}`, chosen: q.options[answers[q.id]] });
    }
    playSfx(correct === questions.length ? "success" : "ding");
    onSubmit(correct, wrong);
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass mx-auto max-w-2xl rounded-2xl p-5 sm:p-6">
      <div className="mb-1 text-xs uppercase tracking-wider" style={{ color }}>
        {phase === "pre" ? "Разминка перед островом" : "Проверка после острова"}
      </div>
      <h2 className="text-xl font-semibold">
        {phase === "pre" ? "Ответь на 3 вопроса — посмотрим, что ты уже знаешь" : "Те же 3 вопроса — проверим, что изменилось"}
      </h2>
      <ol className="mt-4 space-y-4">
        {questions.map((q, qi) => (
          <li key={q.id}>
            <div className="mb-2 text-sm font-semibold text-fg">{qi + 1}. {q.text}</div>
            <div className="flex flex-col gap-1.5">
              {q.options.map((o, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                    answers[q.id] === oi ? "border-teal bg-teal/15 text-fg" : "border-line bg-navy-700 text-fg2 hover:border-teal/50",
                  )}
                >
                  {o}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-5 flex justify-end">
        <button className="btn-teal" disabled={!done} onClick={submit}>
          {phase === "pre" ? "Начать остров →" : "Показать результат →"}
        </button>
      </div>
    </motion.section>
  );
}
