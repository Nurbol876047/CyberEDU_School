"use client";
import { useEffect, useState } from "react";
import { listenOnce, speechRecognitionSupported, stopSpeaking } from "@/lib/speech";
import { cn } from "@/lib/utils";
import { useAnalytics } from "@/store/analytics";

interface Props {
  onAsk: (question: string) => void;
  loading?: boolean;
  placeholder?: string;
  offline?: boolean;
}

/** "Ask the mentor" input with voice recognition. */
export function AskMentor({ onAsk, loading, placeholder = "Спроси наставника…", offline }: Props) {
  const [q, setQ] = useState("");
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => setVoiceOk(speechRecognitionSupported()), []);

  const submit = () => {
    const v = q.trim();
    if (!v || loading) return;
    stopSpeaking();
    onAsk(v);
    setQ("");
  };

  const voice = async () => {
    if (listening) return;
    setErr(null);
    setListening(true);
    stopSpeaking();
    try {
      const t = await listenOnce();
      setListening(false);
      if (t.trim()) {
        useAnalytics.getState().noteVoice();
        setQ(t);
        onAsk(t.trim());
        setQ("");
      }
    } catch (e) {
      setListening(false);
      const m = e instanceof Error ? e.message : "";
      setErr(m === "not-allowed" ? "Нет доступа к микрофону" : "Не расслышал, попробуй ещё раз");
      setTimeout(() => setErr(null), 2500);
    }
  };

  return (
    <div className="flex w-full flex-wrap items-center gap-2">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder={listening ? "Слушаю…" : placeholder}
        className="min-w-0 flex-1 rounded-xl border border-line bg-navy-700 px-3 py-2 text-sm text-fg outline-none placeholder:text-fg3 focus:border-teal"
        aria-label="Вопрос наставнику"
      />
      {voiceOk && (
        <button
          type="button"
          onClick={voice}
          disabled={loading}
          className={cn("btn-ghost px-3", listening && "bg-sun/20 text-sun border-sun animate-pulse")}
          title="Голосовой вопрос"
          aria-label="Голосовой вопрос"
        >
          🎤
        </button>
      )}
      <button type="button" onClick={submit} disabled={loading || !q.trim()} className="btn-teal">
        {loading ? "…" : "Спросить"}
      </button>
      {err && <span className="w-full text-xs text-sun">{err}</span>}
      {offline && (
        <span className="w-full text-[11px] text-fg2">
          Наставник офлайн — отвечаю из встроенной базы знаний.
        </span>
      )}
    </div>
  );
}
