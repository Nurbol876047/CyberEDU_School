"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ModuleSlug } from "@/data/modules";
import { SCENARIOS, type ChatMessage, type Scenario } from "@/data/scenarios";
import { useProgress } from "@/store/progress";
import { playSfx } from "@/lib/sound";
import { cn } from "@/lib/utils";
import type { SimulatorProps } from "./types";


export function ChatSimulator({ mentor, tracker, onComplete, module, required = 2 }: SimulatorProps & { module: ModuleSlug; required?: number }) {
  const list = SCENARIOS.filter((s) => s.module === module);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [doneIds, setDoneIds] = useState<string[]>([]);
  const addScore = useProgress((s) => s.addScore);

  const onFinish = (s: Scenario, path: string[], kind: "good" | "neutral" | "bad", score: number) => {
    const pts = kind === "good" ? 40 : kind === "neutral" ? 20 : 5;
    addScore(module, pts);
    tracker.attempt();
    playSfx(kind === "good" ? "success" : kind === "bad" ? "error" : "ding");
    setDoneIds((d) => (d.includes(s.id) ? d : [...d, s.id]));
    mentor.ask(
      `Ученик прошёл сценарий «${s.title}» (${s.description}). Его выборы по порядку: ${path.map((p, i) => `${i + 1}) ${p}`).join("; ")}. Итог: ${kind === "good" ? "хорошая концовка" : kind === "neutral" ? "нейтральная" : "плохая концовка"}. Дай короткую добрую обратную связь: что было сделано правильно, что можно улучшить, одно главное правило поведения при кибербуллинге.`,
    );
    if (doneIds.length + 1 >= required && !doneIds.includes(s.id)) onComplete(30 + Math.max(0, score) * 10);
  };

  return (
    <>
      {!scenario ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {list.map((s) => {
            const done = doneIds.includes(s.id);
            return (
              <motion.button
                key={s.id}
                whileHover={{ y: -4 }}
                onClick={() => { playSfx("click"); setScenario(s); }}
                className={cn("glass flex flex-col items-start gap-2 rounded-2xl p-5 text-left transition-colors hover:border-teal", done && "border-sun/50")}
              >
                <div className="text-3xl">{s.avatar}</div>
                <div className="font-semibold">{s.title}</div>
                <div className="text-sm text-fg2">{s.description}</div>
                {done && <div className="mt-auto text-xs text-sun">✓ пройден</div>}
              </motion.button>
            );
          })}
          <div className="glass rounded-2xl p-4 text-sm text-fg2 sm:col-span-3">
            Пройди минимум {required === 1 ? "один сценарий" : `${required} сценария`}, чтобы перейти к квизу. Пройдено: {doneIds.length}.
          </div>
        </div>
      ) : (
        <ChatScenario key={scenario.id} scenario={scenario} onBack={() => setScenario(null)} onFinish={onFinish} onMistake={(node, text) => tracker.mistake(`bully:${scenario.id}:${node}`, text)} />
      )}
    </>
  );
}

function ChatScenario({ scenario, onBack, onFinish, onMistake }: { scenario: Scenario; onBack: () => void; onFinish: (s: Scenario, path: string[], kind: "good" | "neutral" | "bad", score: number) => void; onMistake: (nodeId: string, chosen: string) => void }) {
  const [nodeId, setNodeId] = useState(scenario.start);
  const [shown, setShown] = useState<ChatMessage[]>([]);
  const [queue, setQueue] = useState<ChatMessage[]>([]);
  const [path, setPath] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const node = scenario.nodes[nodeId];
  const finishedRef = useRef(false);

  // enqueue node messages
  useEffect(() => {
    setQueue(node.messages);
  }, [node]);

  // reveal queue one by one
  useEffect(() => {
    if (queue.length === 0) {
      if (node.ending && !finishedRef.current) {
        finishedRef.current = true;
        onFinish(scenario, path, node.ending.kind, score);
      }
      return;
    }
    const [next, ...rest] = queue;
    setTyping(next.from === "them");
    const t = setTimeout(() => {
      setShown((s) => [...s, next]);
      setQueue(rest);
      setTyping(false);
      if (next.from === "them") playSfx("click", 0.25);
    }, next.from === "me" ? 150 : next.from === "system" ? 500 : 700 + Math.min(next.text.length * 12, 1000));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  const choose = (c: { text: string; next: string; score: number }) => {
    playSfx("click");
    if (c.score < 0) onMistake(nodeId, c.text);
    setPath((p) => [...p, c.text]);
    setScore((s) => s + c.score);
    setNodeId(c.next);
  };

  const ready = queue.length === 0 && !typing;

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_280px]">
      <div className="glass flex h-[460px] flex-col overflow-hidden rounded-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <button onClick={onBack} className="text-fg2 hover:text-teal">←</button>
          <div className="text-2xl">{scenario.avatar}</div>
          <div>
            <div className="font-semibold">{scenario.chatName}</div>
            <div className="text-xs text-fg2">{typing ? "печатает…" : "в сети"}</div>
          </div>
        </div>
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto p-4">
          <AnimatePresence initial={false}>
            {shown.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn("flex", m.from === "me" ? "justify-end" : m.from === "system" ? "justify-center" : "justify-start")}
              >
                {m.from === "system" ? (
                  <div className="max-w-[85%] rounded-full bg-sun/15 px-3 py-1 text-center text-xs text-sun">{m.text}</div>
                ) : (
                  <div className={cn("max-w-[78%] rounded-2xl px-3 py-2 text-sm", m.from === "me" ? "rounded-br-sm bg-teal text-navy-900" : "rounded-bl-sm bg-navy-700 text-fg")}>
                    {m.name && m.from === "them" && <div className="mb-0.5 text-[11px] font-semibold text-pink-300">{m.name}</div>}
                    {m.text}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {typing && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm bg-navy-700 px-3 py-2 text-sm text-fg2">
                <span className="animate-pulse">● ● ●</span>
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-line p-3">
          {node.ending ? (
            ready && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
                <div className={cn("font-semibold", node.ending.kind === "good" ? "text-teal" : node.ending.kind === "bad" ? "text-red-400" : "text-sun")}>
                  {node.ending.kind === "good" ? "🌟" : node.ending.kind === "bad" ? "💔" : "🤔"} {node.ending.title}
                </div>
                <p className="mt-1 text-xs text-fg2">{node.ending.summary}</p>
                <button className="btn-teal mt-3" onClick={onBack}>К сценариям</button>
              </motion.div>
            )
          ) : (
            <div className="flex flex-col gap-2">
              {ready &&
                node.choices?.map((c) => (
                  <motion.button
                    key={c.text}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="rounded-xl border border-line bg-navy-700 px-3 py-2 text-left text-sm hover:border-teal hover:bg-teal/10"
                    onClick={() => choose(c)}
                  >
                    {c.text}
                  </motion.button>
                ))}
            </div>
          )}
        </div>
      </div>
      <aside className="glass rounded-2xl p-4 text-sm text-fg2">
        <div className="mb-2 font-semibold text-pink-300">{scenario.title}</div>
        <p>{scenario.description}</p>
        <div className="mt-4 text-xs font-semibold uppercase tracking-wider text-fg3">Правила</div>
        <ul className="mt-1 space-y-1 text-xs">
          <li>🧊 Не отвечай агрессией</li>
          <li>📸 Сохраняй скриншоты</li>
          <li>🚫 Блокируй и жалуйся</li>
          <li>🧑‍🏫 Расскажи взрослому</li>
        </ul>
      </aside>
    </div>
  );
}
