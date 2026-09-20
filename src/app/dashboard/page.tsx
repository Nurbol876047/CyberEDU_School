"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAnalytics, LOCAL_STUDENT_ID } from "@/store/analytics";
import { aggregateByModule, formatMs, moduleTitle, moduleColor, radarProfile, summarize, topMistakes, pct, sessionDuration } from "@/lib/analytics";
import { generateDemoSessions } from "@/lib/demoData";
import { MODULE_ORDER } from "@/data/modules";
import { PrePostChart, ProfileRadar } from "@/components/dashboard/Charts";
import { exportElementToPdf } from "@/lib/exportPdf";
import { cn } from "@/lib/utils";

const ALL = "__all__";

export default function DashboardPage() {
  const [hydrated, setHydrated] = useState(false);
  const sessions = useAnalytics((s) => s.sessions);
  const addSessions = useAnalytics((s) => s.addSessions);
  const clearDemo = useAnalytics((s) => s.clearDemo);
  const clearAll = useAnalytics((s) => s.clearAll);
  const [student, setStudent] = useState(ALL);
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHydrated(true), []);

  const students = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of sessions) m.set(s.studentId, s.studentName + (s.demo ? " (демо)" : s.studentId === LOCAL_STUDENT_ID ? " (это устройство)" : ""));
    return Array.from(m.entries());
  }, [sessions]);

  const filtered = useMemo(() => (student === ALL ? sessions : sessions.filter((s) => s.studentId === student)), [sessions, student]);
  const summary = useMemo(() => summarize(filtered), [filtered]);
  const byModule = useMemo(() => aggregateByModule(filtered), [filtered]);
  const radar = useMemo(() => radarProfile(filtered), [filtered]);
  const mistakes = useMemo(() => topMistakes(filtered), [filtered]);
  const hasDemo = sessions.some((s) => s.demo);

  const fillDemo = () => {
    const n = 5 + Math.floor(Math.random() * 6);
    addSessions(generateDemoSessions(n));
  };

  const exportPdf = async () => {
    if (!reportRef.current) return;
    setExporting(true);
    try {
      await exportElementToPdf(reportRef.current, `qalqan-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Не удалось сформировать PDF. Попробуйте ещё раз.");
    } finally {
      setExporting(false);
    }
  };

  if (!hydrated) return <div className="p-8 text-slate-400">Загрузка…</div>;

  return (
    <main className="min-h-screen px-4 py-6 text-slate-100 sm:px-8" style={{ background: "#0a0e20" }}>
      <div className="mx-auto max-w-6xl">
        {/* toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div>
            <Link href="/" className="text-xs text-slate-400 hover:text-white">← К платформе</Link>
            <h1 className="text-2xl font-semibold text-white">Аналитика пилотного тестирования</h1>
            <p className="text-sm text-slate-400">Режим учителя / жюри · данные хранятся локально в браузере</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={student} onChange={(e) => setStudent(e.target.value)} className="rounded-lg border border-slate-600 bg-[#141a38] px-3 py-2 text-sm text-slate-100 outline-none" aria-label="Ученик">
              <option value={ALL}>Все ученики ({students.length})</option>
              {students.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
            </select>
            <button className="rounded-lg border border-slate-600 px-3 py-2 text-sm hover:border-[#00ffed] hover:text-[#00ffed]" onClick={fillDemo}>Заполнить демо-данными</button>
            {hasDemo && <button className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:border-red-400 hover:text-red-300" onClick={() => { if (confirm("Удалить демо-данные?")) { clearDemo(); setStudent(ALL); } }}>Очистить демо</button>}
            <button className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-[#f0fdfa]0 disabled:opacity-50" onClick={exportPdf} disabled={exporting || sessions.length === 0}>
              {exporting ? "Формируем PDF…" : "Экспортировать отчёт (PDF)"}
            </button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-600 p-10 text-center text-slate-400">
            Данных пока нет. Пройдите модули на платформе или нажмите «Заполнить демо-данными».
          </div>
        ) : (
          <div ref={reportRef} className="space-y-6 rounded-xl p-1" style={{ background: "#0a0e20" }}>
            <header className="flex flex-wrap items-baseline justify-between gap-2 px-1">
              <div>
                <div className="text-xs uppercase tracking-[0.2em]" style={{ color: "#00ffed" }}>QALQAN AI · отчёт</div>
                <h2 className="text-lg font-semibold text-white">{student === ALL ? `Сводка по ${summary.students} ученикам` : students.find(([id]) => id === student)?.[1]}</h2>
              </div>
              <div className="text-xs text-slate-400">{new Date().toLocaleString("ru-RU")}</div>
            </header>

            {/* summary cards */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <Metric label="Время в платформе" value={formatMs(summary.totalMs)} hint="суммарно по сессиям" />
              <Metric label="Завершено модулей" value={`${summary.completedModules}`} hint={`из ${filtered.length} начатых`} />
              <Metric label="Средний прирост" value={summary.avgGain === null ? "—" : `${summary.avgGain > 0 ? "+" : ""}${summary.avgGain}%`} hint="пост-тест − пре-тест" accent />
              <Metric label="Обращений к ИИ" value={`${summary.mentorCalls}`} hint={`из них голосом: ${summary.voiceCalls}`} />
              <Metric label="Жесты рукой" value={`${summary.handUsers}`} hint={`клавиатура: ${summary.keyboardUsers} · мышь: ${summary.mouseUsers}`} />
              <Metric label="Учеников" value={`${summary.students}`} hint={`${filtered.length} сессий`} />
            </section>

            {/* charts */}
            <section className="grid gap-4 lg:grid-cols-5">
              <Card className="lg:col-span-3" title="Результат до и после модуля" sub="% правильных ответов в 3-вопросном тесте (одинаковые вопросы до и после)">
                <PrePostChart data={byModule} />
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs lg:grid-cols-6">
                  {byModule.map((m) => (
                    <div key={m.module} className="rounded-lg bg-slate-100 px-2 py-1.5">
                      <div className="font-semibold text-slate-700">{m.title}</div>
                      <div className={cn("text-sm font-semibold", (m.gain ?? 0) >= 0 ? "text-[#0d9488]" : "text-red-500")}>{m.gain === null ? "—" : `${m.gain > 0 ? "+" : ""}${m.gain}%`}</div>
                      <div className="text-[11px] text-slate-500">{m.completed}/{m.sessions} заверш. · {m.avgMinutes} мин · {m.avgAttempts} попыт.</div>
                    </div>
                  ))}
                </div>
              </Card>
              <Card className="lg:col-span-2" title="Профиль по темам" sub="0–100: пост-тест и точность в симуляторе">
                <ProfileRadar data={radar} />
                <div className="mt-1 flex flex-wrap justify-center gap-2 text-xs">
                  {radar.map((r) => {
                    const weak = r.value < 60;
                    return <span key={r.module} className={cn("rounded-full px-2 py-0.5", weak ? "bg-amber-100 text-amber-800" : "bg-[#f0fdfa] text-[#0f766e]")} style={{ borderLeft: `3px solid ${moduleColor(r.module)}` }}>{r.subject}: {r.value}{weak ? " · пробел" : ""}</span>;
                  })}
                </div>
              </Card>
            </section>

            {/* mistakes */}
            <Card title="Топ ошибок" sub="какие вопросы проваливались чаще всего — тему стоит разобрать в классе дополнительно">
              {mistakes.length === 0 ? (
                <div className="py-6 text-center text-sm text-slate-500">Ошибок не зафиксировано.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wider text-slate-500">
                      <tr className="border-b border-slate-200">
                        <th className="py-2 pr-3">#</th>
                        <th className="py-2 pr-3">Модуль</th>
                        <th className="py-2 pr-3">Вопрос / ситуация</th>
                        <th className="py-2 pr-3">Типичный ответ</th>
                        <th className="py-2 pr-3">Верно</th>
                        <th className="py-2 pr-3 text-right">Ошибок</th>
                        <th className="py-2 text-right">Учеников</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-700">
                      {mistakes.map((m, i) => (
                        <tr key={m.questionId} className="border-b border-slate-100 align-top">
                          <td className="py-2 pr-3 text-slate-400">{i + 1}</td>
                          <td className="py-2 pr-3 whitespace-nowrap"><span className="inline-block h-2 w-2 rounded-full" style={{ background: moduleColor(m.module) }} /> {moduleTitle(m.module)}</td>
                          <td className="py-2 pr-3">{m.label}</td>
                          <td className="py-2 pr-3 text-red-600">{m.topChosen}</td>
                          <td className="py-2 pr-3 text-[#0f766e]">{m.correct}</td>
                          <td className="py-2 pr-3 text-right font-semibold">{m.count}</td>
                          <td className="py-2 text-right">{m.students}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>

            {/* sessions */}
            <Card title="Сессии" sub="каждая строка — прохождение модуля одним учеником">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-slate-500">
                    <tr className="border-b border-slate-200">
                      <th className="py-2 pr-3">Ученик</th>
                      <th className="py-2 pr-3">Модуль</th>
                      <th className="py-2 pr-3">Начало</th>
                      <th className="py-2 pr-3">Длит.</th>
                      <th className="py-2 pr-3 text-right">Попыток</th>
                      <th className="py-2 pr-3 text-right">Ошибок</th>
                      <th className="py-2 pr-3 text-right">До</th>
                      <th className="py-2 pr-3 text-right">После</th>
                      <th className="py-2 pr-3 text-right">ИИ</th>
                      <th className="py-2">Ввод</th>
                    </tr>
                  </thead>
                  <tbody className="text-slate-700">
                    {[...filtered].sort((a, b) => a.studentName.localeCompare(b.studentName) || MODULE_ORDER.indexOf(a.module) - MODULE_ORDER.indexOf(b.module)).map((s) => (
                      <tr key={s.id} className="border-b border-slate-100">
                        <td className="py-1.5 pr-3 whitespace-nowrap">{s.studentName}{s.demo && <span className="ml-1 text-[10px] text-slate-400">демо</span>}</td>
                        <td className="py-1.5 pr-3 whitespace-nowrap" style={{ color: moduleColor(s.module) }}>{moduleTitle(s.module)}</td>
                        <td className="py-1.5 pr-3 whitespace-nowrap text-slate-500">{new Date(s.startedAt).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</td>
                        <td className="py-1.5 pr-3 whitespace-nowrap">{s.finishedAt ? formatMs(sessionDuration(s)) : <span className="text-amber-600">не завершён</span>}</td>
                        <td className="py-1.5 pr-3 text-right">{s.attempts}</td>
                        <td className="py-1.5 pr-3 text-right">{s.mistakes.length}</td>
                        <td className="py-1.5 pr-3 text-right">{pct(s.preTest) ?? "—"}{s.preTest !== null && "%"}</td>
                        <td className="py-1.5 pr-3 text-right font-semibold">{pct(s.postTest) ?? "—"}{s.postTest !== null && "%"}</td>
                        <td className="py-1.5 pr-3 text-right">{s.mentorCalls}{s.voiceCalls ? ` (🎤${s.voiceCalls})` : ""}</td>
                        <td className="py-1.5 text-slate-500">{s.inputs.map((i) => ({ hand: "✋ рука", keyboard: "⌨ клавиатура", mouse: "🖱 мышь" })[i]).join(", ") || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 print:hidden">
          <span>Данные: localStorage «qalqan-analytics». Прямая ссылка: /dashboard</span>
          <button className="hover:text-red-400" onClick={() => { if (confirm("Удалить ВСЕ данные аналитики, включая реальные?")) { clearAll(); setStudent(ALL); } }}>Сбросить всё</button>
        </footer>
      </div>
    </main>
  );
}

function Metric({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={cn("rounded-xl bg-slate-100 p-4 text-[#0a0e20]", accent && "bg-[#f0fdfa] ring-1 ring-[#14b8a6]/40")}>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={cn("mt-1 text-2xl font-semibold", accent ? "text-[#0d9488]" : "text-[#0a0e20]")}>{value}</div>
      {hint && <div className="mt-0.5 text-[11px] text-slate-500">{hint}</div>}
    </div>
  );
}

function Card({ title, sub, className, children }: { title: string; sub?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("rounded-xl bg-white p-4 text-[#0a0e20] sm:p-5", className)}>
      <h3 className="text-base font-semibold text-[#0a0e20]">{title}</h3>
      {sub && <p className="mb-3 text-xs text-slate-500">{sub}</p>}
      {children}
    </section>
  );
}
