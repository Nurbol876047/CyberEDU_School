import { MODULE_ORDER, type ModuleSlug } from "@/data/modules";
import { EMAILS } from "@/data/emails";
import { POSTS } from "@/data/privacy";
import { SCENARIOS } from "@/data/scenarios";
import { TESTS } from "@/data/tests";
import { LESSONS } from "@/data/lessons";
import type { ModuleSession, Mistake, InputMethod } from "@/store/analytics";

const NAMES = ["Айсұлу", "Арсен", "Дана", "Алихан", "Мадина", "Ерасыл", "Аружан", "Нұрдаулет", "Камила", "Санжар"];

// deterministic-ish PRNG so demo looks the same on every page load within a run
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Questions that "tend" to be missed — makes the top-mistakes table meaningful. */
const HARD: Record<ModuleSlug, string[]> = {
  passwords: ["test:pw-q2", "test:pw-q1", "task:pw-store"],
  privacy: ["post:11", "post:6", "post:4", "test:pr-q2"],
  strangers: ["bully:meetup:s1", "bully:stranger:s2-refuse", "test:st-q3"],
  bullying: ["bully:friend:s1", "bully:group-chat:s2-calm", "test:bl-q1"],
  phishing: ["email:13", "email:11", "email:9", "test:ph-q3"],
  screentime: ["screen:screen", "screen:sleep", "test:sc-q2", "task:sc-sleep"],
};

const chatPool = (module: ModuleSlug) =>
  SCENARIOS.filter((s) => s.module === module).flatMap((s) =>
    Object.values(s.nodes).filter((n) => n.choices).map((n) => ({ id: `bully:${s.id}:${n.id}`, wrong: n.choices!.find((c) => c.score < 0)?.text ?? n.choices![0].text })),
  );
const taskPool = (module: ModuleSlug) =>
  LESSONS[module].tasks.flatMap((t) => (t.type === "choice" ? [{ id: `task:${t.id}`, wrong: t.opts[(t.a + 1) % t.opts.length] }] : t.items.map((i) => ({ id: `task:${t.id}:${i.text}`, wrong: i.type === t.zone1.id ? t.zone2.id : t.zone1.id }))));

const POOL: Record<ModuleSlug, { id: string; wrong: string }[]> = {
  passwords: taskPool("passwords"),
  privacy: [...POSTS.map((p) => ({ id: `post:${p.id}`, wrong: p.safe ? "нельзя" : "можно публиковать" })), ...taskPool("privacy")],
  strangers: [...chatPool("strangers"), ...taskPool("strangers")],
  bullying: [...chatPool("bullying"), ...taskPool("bullying")],
  phishing: [...EMAILS.map((e) => ({ id: `email:${e.id}`, wrong: e.isPhishing ? "безопасно" : "фишинг" })), ...taskPool("phishing")],
  screentime: [{ id: "screen:screen", wrong: "6 ч" }, { id: "screen:sleep", wrong: "7 ч" }, { id: "screen:outdoor", wrong: "0.5 ч" }, ...taskPool("screentime")],
};

export function generateDemoSessions(count = 8, seed = Date.now()): ModuleSession[] {
  const r = rng(seed);
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
  const out: ModuleSession[] = [];
  const dayStart = Date.now() - 6 * 24 * 3600 * 1000;
  const n = Math.max(5, Math.min(10, count));

  for (let i = 0; i < n; i++) {
    const studentId = `demo-${seed.toString(36)}-${i}`;
    const name = NAMES[i % NAMES.length];
    const skill = 0.35 + r() * 0.4; // base ability
    const learns = 0.2 + r() * 0.35; // how much the module helps
    const usesHand = r() < 0.55;
    const usesVoice = r() < 0.4;
    let t = dayStart + Math.floor(r() * 3) * 24 * 3600 * 1000 + (9 + r() * 6) * 3600 * 1000;
    const modulesDone = r() < 0.6 ? MODULE_ORDER.length : 3 + Math.floor(r() * 3);

    MODULE_ORDER.slice(0, modulesDone).forEach((module, mi) => {
      const pre = Math.min(3, Math.max(0, Math.round(skill * 3 + (r() - 0.5))));
      const post = Math.min(3, Math.max(pre, Math.round((skill + learns) * 3 + (r() - 0.6))));
      const unfinished = mi === modulesDone - 1 && r() < 0.15;
      const durationMs = (6 + r() * 12) * 60 * 1000;
      const mistakes: Mistake[] = [];
      const tests = TESTS[module];

      const wrongTest = (phase: "pre" | "post", correct: number) => {
        const ids = [...tests].sort(() => r() - 0.5).slice(0, tests.length - correct);
        ids.forEach((q) => {
          const hard = HARD[module].includes(`test:${q.id}`);
          const target = hard || r() < 0.5 ? q : pick(tests);
          const wrongIdx = pick(target.options.map((_, k) => k).filter((k) => k !== target.answer));
          mistakes.push({ questionId: `test:${target.id}`, chosen: target.options[wrongIdx], phase, at: t + (phase === "pre" ? 60_000 : durationMs - 60_000) });
        });
      };
      wrongTest("pre", pre);

      const playErrors = Math.round((1 - skill) * (module === "privacy" ? 5 : module === "phishing" ? 4 : module === "bullying" || module === "strangers" ? 2 : module === "screentime" ? 3 : 1) * (0.6 + r() * 0.8));
      for (let k = 0; k < playErrors; k++) {
        const hardIds = HARD[module].filter((h) => !h.startsWith("test:"));
        const useHard = hardIds.length && r() < 0.6;
        const id = useHard ? pick(hardIds) : pick(POOL[module])?.id;
        const item = POOL[module].find((p) => p.id === id);
        if (item) mistakes.push({ questionId: item.id, chosen: item.wrong, phase: "play", at: t + 120_000 + k * 40_000 });
      }
      if (!unfinished) wrongTest("post", post);

      const inputs: InputMethod[] = [];
      if (module === "phishing") {
        if (usesHand) inputs.push("hand");
        if (!usesHand || r() < 0.5) inputs.push("keyboard");
      } else if (module === "privacy" || module === "screentime") inputs.push("mouse");

      const mentorCalls = Math.floor(r() * (usesVoice ? 5 : 3)) + (skill < 0.5 ? 1 : 0);
      out.push({
        id: `${studentId}-${module}`,
        studentId,
        studentName: name,
        module,
        startedAt: t,
        finishedAt: unfinished ? null : t + durationMs,
        attempts: module === "passwords" ? 3 + Math.floor(r() * 8) : 1 + (r() < 0.3 ? 1 : 0),
        mistakes,
        preTest: pre,
        postTest: unfinished ? null : post,
        mentorCalls,
        voiceCalls: usesVoice ? Math.min(mentorCalls, Math.floor(r() * 3)) : 0,
        inputs,
        score: unfinished ? 0 : 40 + post * 20 + Math.floor(r() * 40),
        demo: true,
      });
      t += durationMs + (3 + r() * 20) * 60 * 1000;
    });
  }
  return out;
}
