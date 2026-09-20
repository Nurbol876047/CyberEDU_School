"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ModuleSlug } from "@/data/modules";

export type InputMethod = "hand" | "keyboard" | "mouse";

export interface Mistake {
  /** e.g. "email:3", "bully:group-chat:s1", "post:8", "test:t-ph-2" */
  questionId: string;
  chosen: string;
  phase: "pre" | "play" | "post";
  at: number;
}

export interface ModuleSession {
  id: string;
  studentId: string;
  studentName: string;
  module: ModuleSlug;
  startedAt: number;
  finishedAt: number | null;
  attempts: number;
  mistakes: Mistake[];
  /** correct answers out of 3, null = not taken */
  preTest: number | null;
  postTest: number | null;
  mentorCalls: number;
  voiceCalls: number;
  inputs: InputMethod[];
  score: number;
  demo?: boolean;
}

export const LOCAL_STUDENT_ID = "local";

interface AnalyticsState {
  sessions: ModuleSession[];
  activeSessionId: string | null;
  totalMentorCalls: number;

  startSession: (module: ModuleSlug) => string;
  /** Resume an unfinished local session for the module or start a new one. */
  ensureSession: (module: ModuleSlug) => string;
  setActive: (id: string | null) => void;
  recordAttempt: (id: string) => void;
  recordMistake: (id: string, m: Omit<Mistake, "at">) => void;
  setTest: (id: string, phase: "pre" | "post", correct: number) => void;
  noteMentorCall: () => void;
  /** A question was asked by voice (counted in addition to the mentor call). */
  noteVoice: () => void;
  noteInput: (id: string, method: InputMethod) => void;
  finishSession: (id: string, score: number) => void;
  addSessions: (s: ModuleSession[]) => void;
  clearDemo: () => void;
  clearAll: () => void;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const patch = (sessions: ModuleSession[], id: string, fn: (s: ModuleSession) => Partial<ModuleSession>) =>
  sessions.map((s) => (s.id === id ? { ...s, ...fn(s) } : s));

export const useAnalytics = create<AnalyticsState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSessionId: null,
      totalMentorCalls: 0,

      startSession: (module) => {
        const id = uid();
        const name = (() => {
          try {
            const raw = localStorage.getItem("qalqan-progress");
            return raw ? (JSON.parse(raw).state?.playerName as string) || "Ученик" : "Ученик";
          } catch {
            return "Ученик";
          }
        })();
        const s: ModuleSession = {
          id, studentId: LOCAL_STUDENT_ID, studentName: name, module,
          startedAt: Date.now(), finishedAt: null, attempts: 0, mistakes: [],
          preTest: null, postTest: null, mentorCalls: 0, voiceCalls: 0, inputs: [], score: 0,
        };
        set((st) => ({ sessions: [...st.sessions, s], activeSessionId: id }));
        return id;
      },

      ensureSession: (module) => {
        const open = [...get().sessions].reverse().find((s) => s.module === module && s.studentId === LOCAL_STUDENT_ID && !s.finishedAt);
        if (open) {
          set({ activeSessionId: open.id });
          return open.id;
        }
        return get().startSession(module);
      },

      setActive: (activeSessionId) => set({ activeSessionId }),

      recordAttempt: (id) => set((st) => ({ sessions: patch(st.sessions, id, (s) => ({ attempts: s.attempts + 1 })) })),

      recordMistake: (id, m) =>
        set((st) => ({ sessions: patch(st.sessions, id, (s) => ({ mistakes: [...s.mistakes, { ...m, at: Date.now() }] })) })),

      setTest: (id, phase, correct) =>
        set((st) => ({ sessions: patch(st.sessions, id, () => (phase === "pre" ? { preTest: correct } : { postTest: correct })) })),

      noteMentorCall: () =>
        set((st) => ({
          totalMentorCalls: st.totalMentorCalls + 1,
          sessions: st.activeSessionId
            ? patch(st.sessions, st.activeSessionId, (s) => ({ mentorCalls: s.mentorCalls + 1 }))
            : st.sessions,
        })),

      noteVoice: () =>
        set((st) => ({
          sessions: st.activeSessionId ? patch(st.sessions, st.activeSessionId, (s) => ({ voiceCalls: s.voiceCalls + 1 })) : st.sessions,
        })),

      noteInput: (id, method) =>
        set((st) => ({ sessions: patch(st.sessions, id, (s) => ({ inputs: s.inputs.includes(method) ? s.inputs : [...s.inputs, method] })) })),

      finishSession: (id, score) =>
        set((st) => ({ sessions: patch(st.sessions, id, (s) => ({ finishedAt: s.finishedAt ?? Date.now(), score })) })),

      addSessions: (extra) => set((st) => ({ sessions: [...st.sessions, ...extra] })),
      clearDemo: () => set((st) => ({ sessions: st.sessions.filter((s) => !s.demo) })),
      clearAll: () => set({ sessions: [], activeSessionId: null, totalMentorCalls: 0 }),
    }),
    { name: "qalqan-analytics", storage: createJSONStorage(() => localStorage) },
  ),
);
