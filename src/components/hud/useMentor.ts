"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { askMentor, plainText } from "@/lib/mentor";
import { speak, stopSpeaking } from "@/lib/speech";
import { useProgress } from "@/store/progress";
import type { ModuleSlug } from "@/data/modules";

interface Options {
  topic?: ModuleSlug | "default";
  context?: string;
  /** Text shown before user asks anything. */
  initial: string;
  voice?: boolean;
}

/** State for the mentor dialog on a page: current text, loading, ask(). */
export function useMentor({ topic = "default", context, initial, voice = true }: Options) {
  const [text, setText] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const soundEnabled = useProgress((s) => s.soundEnabled);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    setText(initial);
  }, [initial]);

  useEffect(() => () => stopSpeaking(), []);

  const ask = useCallback(
    async (prompt: string, extraContext?: string) => {
      abort.current?.abort();
      const ctl = new AbortController();
      abort.current = ctl;
      setLoading(true);
      const r = await askMentor(prompt, {
        topic,
        context: [context, extraContext].filter(Boolean).join("\n"),
        signal: ctl.signal,
      });
      if (ctl.signal.aborted) return r;
      const clean = plainText(r.text);
      setOffline(!!r.offline);
      setText(clean);
      setLoading(false);
      if (voice && soundEnabled) speak(clean);
      return r;
    },
    [topic, context, voice, soundEnabled],
  );

  const say = useCallback(
    (t: string) => {
      abort.current?.abort();
      setLoading(false);
      setText(t);
      if (voice && soundEnabled) speak(t);
    },
    [voice, soundEnabled],
  );

  return { text, loading, offline, ask, say, setText };
}
