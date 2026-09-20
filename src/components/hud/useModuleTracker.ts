"use client";
import { useCallback, useEffect, useState } from "react";
import type { ModuleSlug } from "@/data/modules";
import { useAnalytics, type InputMethod } from "@/store/analytics";

export type WrongAnswer = { questionId: string; chosen: string };

/**
 * Owns the analytics session of a module page. The lesson engine calls
 * `submitPreTest` at the start, `mistake/attempt/input` while playing and `finish` after the quiz.
 */
export function useModuleTracker(slug: ModuleSlug) {
  const ensureSession = useAnalytics((s) => s.ensureSession);
  const setActive = useAnalytics((s) => s.setActive);
  const [id, setId] = useState<string | null>(null);
  const [preDone, setPreDone] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sid = ensureSession(slug);
    setId(sid);
    const s = useAnalytics.getState().sessions.find((x) => x.id === sid);
    setPreDone(s?.preTest !== null && s?.preTest !== undefined);
    setReady(true);
    return () => setActive(null);
  }, [slug, ensureSession, setActive]);

  const st = useAnalytics.getState;

  const submitPreTest = useCallback(
    (correct: number, wrong: WrongAnswer[]) => {
      if (!id) return;
      st().setTest(id, "pre", correct);
      wrong.forEach((w) => st().recordMistake(id, { ...w, phase: "pre" }));
      setPreDone(true);
    },
    [id, st],
  );

  /** Quiz finished: `postCorrect` — correct answers among the 3 shared pre-test questions. */
  const finish = useCallback(
    (postCorrect: number, wrong: WrongAnswer[], score: number) => {
      if (!id) return;
      st().setTest(id, "post", postCorrect);
      wrong.forEach((w) => st().recordMistake(id, { ...w, phase: "post" }));
      st().finishSession(id, score);
    },
    [id, st],
  );

  const mistake = useCallback((questionId: string, chosen: string) => id && st().recordMistake(id, { questionId, chosen, phase: "play" }), [id, st]);
  const attempt = useCallback(() => id && st().recordAttempt(id), [id, st]);
  const input = useCallback((m: InputMethod) => id && st().noteInput(id, m), [id, st]);

  return { id, ready, preDone, submitPreTest, finish, mistake, attempt, input };
}

export type ModuleTracker = ReturnType<typeof useModuleTracker>;
