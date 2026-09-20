"use client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { MODULES, MODULE_ORDER, type ModuleSlug, type ModuleStatus } from "@/data/modules";
export { MODULES, MODULE_ORDER };
export type { ModuleSlug, ModuleStatus };

export type Theme = "dark" | "light";

export interface ModuleResult {
  status: ModuleStatus;
  /** 0–3 */
  stars: number;
  /** best quiz result, % */
  quizPct: number;
  simulatorDone: boolean;
}

interface ProgressState {
  modules: Record<ModuleSlug, ModuleResult>;
  scores: Record<ModuleSlug, number>;
  totalScore: number;
  badges: string[];
  finalCompleted: boolean;
  playerName: string;
  soundEnabled: boolean;
  handTrackingEnabled: boolean;
  lowPerf: boolean;
  theme: Theme;

  addScore: (slug: ModuleSlug, points: number) => void;
  markSimulatorDone: (slug: ModuleSlug) => void;
  /** Called at the end of the quiz. Marks the module completed when passed (≥70%). */
  finishQuiz: (slug: ModuleSlug, quizPct: number, score?: number) => boolean;
  completeFinal: (bonus?: number) => void;
  setPlayerName: (n: string) => void;
  toggleSound: () => void;
  setHandTracking: (v: boolean) => void;
  setLowPerf: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  reset: () => void;
}

const emptyResult = (): ModuleResult => ({ status: "unlocked", stars: 0, quizPct: 0, simulatorDone: false });
const initialModules = () => Object.fromEntries(MODULE_ORDER.map((s) => [s, emptyResult()])) as Record<ModuleSlug, ModuleResult>;
const initialScores = () => Object.fromEntries(MODULE_ORDER.map((s) => [s, 0])) as Record<ModuleSlug, number>;

/** ★ for passing the quiz, ★★ for ≥90 %, +★ for the simulator. */
export const starsFor = (quizPct: number, simulatorDone: boolean) =>
  (quizPct >= 70 ? 1 : 0) + (quizPct >= 90 ? 1 : 0) + (simulatorDone ? 1 : 0);

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      modules: initialModules(),
      scores: initialScores(),
      totalScore: 0,
      badges: [],
      finalCompleted: false,
      playerName: "",
      soundEnabled: true,
      handTrackingEnabled: true,
      lowPerf: false,
      theme: "dark",

      addScore: (slug, points) =>
        set((s) => ({ scores: { ...s.scores, [slug]: s.scores[slug] + points }, totalScore: s.totalScore + points })),

      markSimulatorDone: (slug) =>
        set((s) => {
          const m = s.modules[slug];
          if (m.simulatorDone) return s;
          const nm = { ...m, simulatorDone: true, stars: starsFor(m.quizPct, true) };
          return { modules: { ...s.modules, [slug]: nm } };
        }),

      finishQuiz: (slug, quizPct, score = 0) => {
        const s = get();
        const m = s.modules[slug];
        const passed = quizPct >= 70;
        const best = Math.max(m.quizPct, quizPct);
        const nm: ModuleResult = {
          ...m,
          quizPct: best,
          stars: starsFor(best, m.simulatorDone),
          status: passed || m.status === "completed" ? "completed" : "unlocked",
        };
        const badge = MODULES.find((x) => x.slug === slug)?.badge;
        const badges = passed && badge && !s.badges.includes(badge) ? [...s.badges, badge] : s.badges;
        const firstPass = passed && m.status !== "completed";
        set({
          modules: { ...s.modules, [slug]: nm },
          badges,
          scores: { ...s.scores, [slug]: s.scores[slug] + (firstPass ? score : 0) },
          totalScore: s.totalScore + (firstPass ? score : 0),
        });
        return passed;
      },

      completeFinal: (bonus = 0) =>
        set((s) => ({
          finalCompleted: true,
          totalScore: s.totalScore + (s.finalCompleted ? 0 : bonus),
          badges: s.badges.includes("🏆 КиберБатыр") ? s.badges : [...s.badges, "🏆 КиберБатыр"],
        })),

      setPlayerName: (playerName) => set({ playerName }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
      setHandTracking: (handTrackingEnabled) => set({ handTrackingEnabled }),
      setLowPerf: (lowPerf) => set({ lowPerf }),
      setTheme: (theme) => set({ theme }),
      reset: () => set({ modules: initialModules(), scores: initialScores(), totalScore: 0, badges: [], finalCompleted: false }),
    }),
    {
      name: "qalqan-progress",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      migrate: (persisted) => {
        // v1 stored modules as plain status strings — rebuild the richer shape
        const p = (persisted ?? {}) as Partial<ProgressState> & { modules?: Record<string, unknown> };
        const modules = initialModules();
        for (const slug of MODULE_ORDER) {
          const v = p.modules?.[slug];
          if (typeof v === "string") modules[slug] = { ...emptyResult(), status: v === "completed" ? "completed" : "unlocked", quizPct: v === "completed" ? 70 : 0, stars: v === "completed" ? 1 : 0 };
          else if (v && typeof v === "object") modules[slug] = { ...emptyResult(), ...(v as ModuleResult) };
        }
        return { ...p, modules, scores: { ...initialScores(), ...(p.scores ?? {}) } } as ProgressState;
      },
      // always guarantee an entry for every module even if the stored state is partial or stale
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ProgressState>;
        const modules = initialModules();
        for (const slug of MODULE_ORDER) if (p.modules?.[slug]) modules[slug] = { ...emptyResult(), ...p.modules[slug] };
        return { ...current, ...p, modules, scores: { ...initialScores(), ...(p.scores ?? {}) } };
      },
      partialize: (s) => ({
        modules: s.modules,
        scores: s.scores,
        totalScore: s.totalScore,
        badges: s.badges,
        finalCompleted: s.finalCompleted,
        playerName: s.playerName,
        soundEnabled: s.soundEnabled,
        handTrackingEnabled: s.handTrackingEnabled,
        theme: s.theme,
      }),
    },
  ),
);

export const allModulesCompleted = (m: Record<ModuleSlug, ModuleResult>) => MODULE_ORDER.every((k) => m[k].status === "completed");
export const completedCount = (m: Record<ModuleSlug, ModuleResult>) => MODULE_ORDER.filter((k) => m[k].status === "completed").length;
