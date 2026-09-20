"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MODULES } from "@/data/modules";
import { useProgress, completedCount, allModulesCompleted } from "@/store/progress";
import { useAnalytics, LOCAL_STUDENT_ID } from "@/store/analytics";
import { formatMs, sessionDuration, pct } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type Tab = "progress" | "guides" | "settings";

const GUIDES = [
  {
    img: "/assets/parental_control.png", color: "var(--accent)", title: "Родительский контроль",
    text: "Настройте Google Family Link или Экранное время iOS: ограничьте опасные приложения и время перед экраном, включите безопасный поиск.",
    tags: ["Лимит времени", "Блокировка"],
  },
  {
    img: "/assets/family.png", color: "var(--accent-purple)", title: "Доверительные отношения",
    text: "Если в сети что-то пошло не так (буллинг, мошенники, странный «друг»), ребёнок должен первым делом рассказать вам. Не ругайте — поддержите и разберите ситуацию вместе.",
    tags: ["Психология", "Поддержка"],
  },
];

export default function ParentsPage() {
  const [tab, setTab] = useState<Tab>("progress");
  const [hydrated, setHydrated] = useState(false);
  const modules = useProgress((s) => s.modules);
  const totalScore = useProgress((s) => s.totalScore);
  const badges = useProgress((s) => s.badges);
  const finalCompleted = useProgress((s) => s.finalCompleted);
  const playerName = useProgress((s) => s.playerName);
  const setPlayerName = useProgress((s) => s.setPlayerName);
  const soundEnabled = useProgress((s) => s.soundEnabled);
  const toggleSound = useProgress((s) => s.toggleSound);
  const handTracking = useProgress((s) => s.handTrackingEnabled);
  const setHandTracking = useProgress((s) => s.setHandTracking);
  const theme = useProgress((s) => s.theme);
  const setTheme = useProgress((s) => s.setTheme);
  const reset = useProgress((s) => s.reset);
  const sessions = useAnalytics((s) => s.sessions);
  useEffect(() => setHydrated(true), []);

  const mine = useMemo(() => sessions.filter((s) => s.studentId === LOCAL_STUDENT_ID), [sessions]);
  const done = hydrated ? completedCount(modules) : 0;
  const progress = Math.round((done / MODULES.length) * 100);
  const allDone = hydrated && allModulesCompleted(modules);
  const timeMs = mine.reduce((a, s) => a + sessionDuration(s), 0);
  const mentorCalls = mine.reduce((a, s) => a + s.mentorCalls, 0);

  if (!hydrated) return null;

  return (
    <main className="mx-auto max-w-6xl px-[5%] py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="btn-soft px-5 py-2.5 text-xs">← К миссиям</Link>
        <h1 className="flex-1 text-center text-2xl font-extrabold sm:text-3xl">Родителям и учителям</h1>
        <Link href="/dashboard" className="btn-ghost px-4 py-2 text-xs">📊 Аналитика пилота</Link>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="glass flex h-max flex-row gap-2 rounded-2xl p-3 md:w-64 md:flex-col">
          {([["progress", "📊 Успеваемость"], ["guides", "📚 Советы и примеры"], ["settings", "⚙️ Настройки"]] as [Tab, string][]).map(([t, l]) => (
            <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-colors", tab === t ? "bg-teal text-navy-900" : "text-fg hover:bg-card")}>{l}</button>
          ))}
        </aside>

        <motion.section key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass flex-1 rounded-2xl p-6 sm:p-10">
          {tab === "progress" && (
            <>
              <h2 className="text-2xl font-extrabold">Панель успеваемости</h2>
              <p className="mt-1 text-fg2">Активность и результаты ученика {playerName ? <b>{playerName}</b> : "на этом устройстве"}.</p>
              <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <Stat value={`${progress}%`} label="Общий прогресс" accent="var(--accent)" />
                <Stat value={`${done}/${MODULES.length}`} label="Модулей пройдено" accent="var(--accent-yellow)" />
                <Stat value={formatMs(timeMs)} label="Время на платформе" accent="var(--accent-purple)" />
                <Stat value={`${totalScore}`} label="Очков · ИИ-вопросов: " suffix={`${mentorCalls}`} accent="var(--accent)" />
              </div>
              <h3 className="mt-8 border-b border-line pb-3 text-lg font-bold">Модули</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {MODULES.map((m) => {
                  const r = modules[m.slug];
                  const s = [...mine].reverse().find((x) => x.module === m.slug);
                  return (
                    <div key={m.slug} className="flex items-center justify-between gap-3 rounded-xl border border-line bg-card p-4">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{m.title}</div>
                        <div className="text-xs text-fg3">
                          {r.status === "completed" ? `Квиз ${r.quizPct}%` : "Не пройден"}
                          {s && s.preTest !== null && ` · до ${pct(s.preTest)}%${s.postTest !== null ? ` → после ${pct(s.postTest)}%` : ""}`}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sun">{"★".repeat(r.stars)}<span className="text-fg3/40">{"☆".repeat(3 - r.stars)}</span></span>
                        <span className={cn("rounded-pill px-2.5 py-1 text-[11px] font-bold", r.status === "completed" ? "bg-teal/15 text-teal" : "bg-line text-fg3")}>{r.status === "completed" ? "Завершён ✅" : "В процессе ⏳"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {badges.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">{badges.map((b) => <span key={b} className="rounded-pill bg-sun/15 px-3 py-1 text-sm text-sun">{b}</span>)}</div>
              )}
              <p className="mt-6 text-xs text-fg3">Подробная аналитика (до/после, топ ошибок, экспорт PDF) — на странице <Link href="/dashboard" className="text-teal underline">/dashboard</Link>.</p>
            </>
          )}

          {tab === "guides" && (
            <>
              <h2 className="text-2xl font-extrabold">Советы для родителей</h2>
              <p className="mt-1 text-fg2">Наглядные рекомендации и меры безопасности.</p>
              <div className="mt-8 flex flex-col gap-8">
                {GUIDES.map((g, i) => (
                  <div key={g.title} className={cn("flex flex-wrap items-center gap-8 rounded-2xl border border-line bg-card p-6", i % 2 === 1 && "flex-row-reverse")}>
                    <Image src={g.img} alt={g.title} width={220} height={220} className="h-52 w-52 rounded-2xl object-cover" style={{ boxShadow: `0 0 30px ${g.color}33` }} />
                    <div className="min-w-[240px] flex-1">
                      <h3 className="text-xl font-bold" style={{ color: g.color }}>{g.title}</h3>
                      <p className="mt-3 leading-relaxed text-fg2">{g.text}</p>
                      <div className="mt-4 flex gap-2">{g.tags.map((t) => <span key={t} className="rounded-lg px-3 py-1 text-xs font-bold" style={{ color: g.color, background: `${g.color}1a` }}>{t}</span>)}</div>
                    </div>
                  </div>
                ))}
                <div className="rounded-2xl border border-line bg-card p-6">
                  <h3 className="text-xl font-bold text-teal">Что говорить ребёнку — короткие правила</h3>
                  <ul className="mt-3 grid gap-2 text-sm text-fg2 sm:grid-cols-2">
                    <li>🔑 Пароль — как зубная щётка: свой и не даём никому.</li>
                    <li>📍 Адрес, школа, телефон, документы — не публикуем.</li>
                    <li>🎭 Человек из интернета — незнакомец, даже если «ровесник».</li>
                    <li>🧊 Буллинг: не отвечай — заблокируй — расскажи.</li>
                    <li>🎣 Спешка + подарок + ссылка = обман.</li>
                    <li>⏱️ Экран для отдыха — до 2 часов и не перед сном.</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {tab === "settings" && (
            <>
              <h2 className="text-2xl font-extrabold">Настройки</h2>
              <p className="mt-1 text-fg2">Режим работы платформы на этом устройстве.</p>
              <div className="mt-6 flex flex-col gap-4">
                <Setting title="Имя ученика" desc="Печатается на сертификате и в аналитике">
                  <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} placeholder="Имя" className="w-40 rounded-xl border border-line bg-navy-700 px-3 py-2 text-fg outline-none focus:border-teal" />
                </Setting>
                <Setting title="Режим оформления" desc="Тёмный — для старших классов, светлый — для младших">
                  <Toggle on={theme === "light"} onChange={(v) => setTheme(v ? "light" : "dark")} labels={["Старшие", "Младшие"]} />
                </Setting>
                <Setting title="Звук" desc="Музыка, эффекты и голос наставника">
                  <Toggle on={soundEnabled} onChange={() => toggleSound()} />
                </Setting>
                <Setting title="Управление жестами" desc="Камера и распознавание руки в тренажёре фишинга">
                  <Toggle on={handTracking} onChange={setHandTracking} />
                </Setting>
                <div className="rounded-2xl border border-line bg-card p-5">
                  <h3 className="text-lg font-bold">Сертификат</h3>
                  <p className="mt-1 text-sm text-fg2">Выдаётся после всех 6 модулей и финальной миссии.</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link href={finalCompleted ? "/certificate" : allDone ? "/final" : "#"} className={cn("btn-teal", !allDone && "pointer-events-none opacity-40")}>{finalCompleted ? "Открыть сертификат" : allDone ? "Пройти финальную миссию" : "Сертификат заблокирован"}</Link>
                    {!allDone && <span className="self-center text-xs text-danger">Пройдено {done} из {MODULES.length} модулей</span>}
                  </div>
                </div>
                <div className="rounded-2xl border border-line bg-card p-5">
                  <h3 className="text-lg font-bold">Сброс</h3>
                  <p className="mt-1 text-sm text-fg2">Удалить прогресс ученика на этом устройстве (аналитика сохранится).</p>
                  <button className="btn-soft mt-3 text-xs" onClick={() => confirm("Сбросить прогресс?") && reset()}>Сбросить прогресс</button>
                </div>
              </div>
            </>
          )}
        </motion.section>
      </div>
    </main>
  );
}

function Stat({ value, label, suffix, accent }: { value: string; label: string; suffix?: string; accent: string }) {
  return (
    <div className="rounded-2xl border p-5 text-center" style={{ borderColor: accent, background: `${accent}12` }}>
      <div className="text-3xl font-extrabold" style={{ color: accent }}>{value}</div>
      <div className="mt-1 text-sm text-fg2">{label}{suffix && <b className="text-fg">{suffix}</b>}</div>
    </div>
  );
}

function Setting({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-card p-5">
      <div>
        <h3 className="text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-fg2">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, labels }: { on: boolean; onChange: (v: boolean) => void; labels?: [string, string] }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      {labels && <span className={cn(!on ? "font-semibold text-fg" : "text-fg3")}>{labels[0]}</span>}
      <span className="relative inline-block h-8 w-14">
        <input type="checkbox" className="peer sr-only" checked={on} onChange={(e) => onChange(e.target.checked)} />
        <span className="absolute inset-0 rounded-full bg-line transition-colors peer-checked:bg-teal" />
        <span className="absolute bottom-1 left-1 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-6" />
      </span>
      {labels && <span className={cn(on ? "font-semibold text-fg" : "text-fg3")}>{labels[1]}</span>}
    </label>
  );
}
