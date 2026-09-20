import { MODULES, MODULE_ORDER, type ModuleSlug } from "@/data/modules";
import { EMAILS } from "@/data/emails";
import { SCENARIOS } from "@/data/scenarios";
import { POSTS } from "@/data/privacy";
import { TESTS } from "@/data/tests";
import { LESSONS } from "@/data/lessons";
import type { ModuleSession, InputMethod } from "@/store/analytics";

export const TEST_SIZE = 3;

export interface QuestionInfo {
  id: string;
  module: ModuleSlug;
  label: string;
  correct: string;
}

/** Every question the platform can ask, keyed by mistake id. */
export const QUESTIONS: Record<string, QuestionInfo> = (() => {
  const q: Record<string, QuestionInfo> = {};
  for (const e of EMAILS) q[`email:${e.id}`] = { id: `email:${e.id}`, module: "phishing", label: `Письмо «${e.subject}» (${e.from})`, correct: e.isPhishing ? "фишинг" : "безопасно" };
  for (const s of SCENARIOS) for (const n of Object.values(s.nodes)) if (n.choices) {
    const id = `bully:${s.id}:${n.id}`;
    const sys = [...n.messages].reverse().find((m) => m.from === "system")?.text ?? n.messages[0]?.text ?? "";
    q[id] = { id, module: "bullying", label: `${s.title}: ${sys.slice(0, 70)}`, correct: n.choices.find((c) => c.score > 0)?.text ?? "" };
  }
  for (const p of POSTS) q[`post:${p.id}`] = { id: `post:${p.id}`, module: "privacy", label: `Пост: ${p.text}`, correct: p.safe ? "можно публиковать" : "нельзя" };
  for (const m of MODULE_ORDER) for (const t of TESTS[m]) q[`test:${t.id}`] = { id: `test:${t.id}`, module: m, label: `Тест до/после: ${t.text}`, correct: t.options[t.answer] };
  for (const m of MODULE_ORDER) {
    for (const t of LESSONS[m].quiz) q[`quiz:${t.id}`] = { id: `quiz:${t.id}`, module: m, label: `Квиз: ${t.q}`, correct: t.opts[t.a] };
    for (const t of LESSONS[m].tasks) {
      if (t.type === "choice") q[`task:${t.id}`] = { id: `task:${t.id}`, module: m, label: `Тренажёр: ${t.question}`, correct: t.opts[t.a] };
      else for (const i of t.items) q[`task:${t.id}:${i.text}`] = { id: `task:${t.id}:${i.text}`, module: m, label: `Сортировка «${t.title}»: ${i.text}`, correct: i.type === t.zone1.id ? t.zone1.label : t.zone2.label };
    }
  }
  const screen: Record<string, string> = { sleep: "Сон", school: "Школа и уроки", outdoor: "Улица и спорт", family: "Семья и хобби", screen: "Экран для отдыха" };
  for (const [k, v] of Object.entries(screen)) q[`screen:${k}`] = { id: `screen:${k}`, module: "screentime", label: `Планировщик дня: ${v}`, correct: k === "screen" ? "≤ 2 ч" : k === "sleep" ? "9–11 ч" : "в норме" };
  return q;
})();

export const moduleTitle = (m: ModuleSlug) => MODULES.find((x) => x.slug === m)?.title ?? m;
export const moduleColor = (m: ModuleSlug) => MODULES.find((x) => x.slug === m)?.color ?? "#2dd4bf";

export const pct = (n: number | null | undefined, of = TEST_SIZE) => (n === null || n === undefined ? null : Math.round((n / of) * 100));

export function sessionDuration(s: ModuleSession, now = Date.now()) {
  const end = s.finishedAt ?? Math.min(now, s.startedAt + 30 * 60 * 1000);
  return Math.max(0, end - s.startedAt);
}

export function formatMs(ms: number) {
  const m = Math.round(ms / 60000);
  if (m < 60) return `${m} мин`;
  return `${Math.floor(m / 60)} ч ${m % 60} мин`;
}

export interface ModuleAgg {
  module: ModuleSlug;
  title: string;
  color: string;
  sessions: number;
  completed: number;
  pre: number | null; // avg %
  post: number | null;
  gain: number | null;
  avgAttempts: number;
  avgMinutes: number;
}

const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);

export function aggregateByModule(sessions: ModuleSession[]): ModuleAgg[] {
  return MODULE_ORDER.map((module) => {
    const ss = sessions.filter((s) => s.module === module);
    const pre = avg(ss.filter((s) => s.preTest !== null).map((s) => pct(s.preTest)!));
    const post = avg(ss.filter((s) => s.postTest !== null).map((s) => pct(s.postTest)!));
    return {
      module,
      title: moduleTitle(module),
      color: moduleColor(module),
      sessions: ss.length,
      completed: ss.filter((s) => s.finishedAt).length,
      pre: pre === null ? null : Math.round(pre),
      post: post === null ? null : Math.round(post),
      gain: pre === null || post === null ? null : Math.round(post - pre),
      avgAttempts: ss.length ? Math.round((avg(ss.map((s) => s.attempts)) ?? 0) * 10) / 10 : 0,
      avgMinutes: ss.length ? Math.round((avg(ss.map((s) => sessionDuration(s))) ?? 0) / 60000) : 0,
    };
  });
}

export interface MistakeAgg {
  questionId: string;
  module: ModuleSlug;
  label: string;
  correct: string;
  count: number;
  students: number;
  topChosen: string;
}

export function topMistakes(sessions: ModuleSession[], limit = 12): MistakeAgg[] {
  const map = new Map<string, { count: number; students: Set<string>; chosen: Map<string, number> }>();
  for (const s of sessions) for (const m of s.mistakes) {
    const e = map.get(m.questionId) ?? { count: 0, students: new Set<string>(), chosen: new Map<string, number>() };
    e.count += 1;
    e.students.add(s.studentId);
    e.chosen.set(m.chosen, (e.chosen.get(m.chosen) ?? 0) + 1);
    map.set(m.questionId, e);
  }
  return Array.from(map.entries())
    .map(([questionId, e]) => {
      const q = QUESTIONS[questionId];
      const topChosen = Array.from(e.chosen.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
      return { questionId, module: q?.module ?? ("passwords" as ModuleSlug), label: q?.label ?? questionId, correct: q?.correct ?? "", count: e.count, students: e.students.size, topChosen };
    })
    .sort((a, b) => b.count - a.count || b.students - a.students)
    .slice(0, limit);
}

export interface Summary {
  students: number;
  totalMs: number;
  completedModules: number;
  avgGain: number | null;
  mentorCalls: number;
  voiceCalls: number;
  handUsers: number;
  keyboardUsers: number;
  mouseUsers: number;
}

export function summarize(sessions: ModuleSession[]): Summary {
  const students = new Set(sessions.map((s) => s.studentId)).size;
  const gains = sessions.filter((s) => s.preTest !== null && s.postTest !== null).map((s) => pct(s.postTest)! - pct(s.preTest)!);
  const users = (m: InputMethod) => new Set(sessions.filter((s) => s.inputs.includes(m)).map((s) => s.studentId)).size;
  return {
    students,
    totalMs: sessions.reduce((a, s) => a + sessionDuration(s), 0),
    completedModules: sessions.filter((s) => s.finishedAt).length,
    avgGain: gains.length ? Math.round(gains.reduce((a, b) => a + b, 0) / gains.length) : null,
    mentorCalls: sessions.reduce((a, s) => a + s.mentorCalls, 0),
    voiceCalls: sessions.reduce((a, s) => a + s.voiceCalls, 0),
    handUsers: users("hand"),
    keyboardUsers: users("keyboard"),
    mouseUsers: users("mouse"),
  };
}

/** Radar profile: 0..100 per module = mean of post-test % and normalised in-module accuracy. */
export function radarProfile(sessions: ModuleSession[]) {
  return MODULE_ORDER.map((module) => {
    const ss = sessions.filter((s) => s.module === module);
    const post = avg(ss.filter((s) => s.postTest !== null).map((s) => pct(s.postTest)!));
    const playMistakes = avg(ss.map((s) => s.mistakes.filter((m) => m.phase === "play").length));
    const poolSize = module === "phishing" ? 10 : module === "privacy" ? 12 : module === "bullying" || module === "strangers" ? 4 : module === "screentime" ? 5 : 4;
    const accuracy = playMistakes === null ? null : Math.max(0, 100 - (playMistakes / poolSize) * 100);
    const parts = [post, accuracy].filter((x): x is number => x !== null);
    return { module, subject: moduleTitle(module), value: parts.length ? Math.round(parts.reduce((a, b) => a + b, 0) / parts.length) : 0 };
  });
}
