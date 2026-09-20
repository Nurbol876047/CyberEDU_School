"use client";
import { useAnalytics } from "@/store/analytics";

export interface MentorResult {
  text: string;
  ok: boolean;
  offline?: boolean;
}

const FALLBACKS: Record<string, string> = {
  default:
    "Сейчас я не могу связаться с базой знаний, но главное правило простое: думай, прежде чем нажимать, и никому не выдавай свои секреты!",
  passwords:
    "Надёжный пароль — длинный (12+ символов), с буквами разного регистра, цифрами и знаками. Лучше всего — фраза, которую легко запомнить только тебе.",
  phishing:
    "Проверяй адрес отправителя, не спеши, когда тебя торопят, и никогда не переходи по подозрительным ссылкам. Сомневаешься — спроси взрослого.",
  bullying:
    "Не отвечай агрессией, сохрани скриншоты, заблокируй обидчика и расскажи взрослому, которому доверяешь. Ты не один!",
  privacy:
    "Адрес, номер телефона, школа и геолокация — это личные данные. Их не стоит выкладывать в открытый доступ.",
  strangers:
    "В интернете любой может назваться кем угодно. Не отправляй фото и данные незнакомым, не ходи на встречи, а просьба «не говори родителям» — сигнал сразу рассказать родителям.",
  screentime:
    "Правило 20-20-20: каждые 20 минут смотри 20 секунд на что-то за 6 метров. Экран для отдыха — до 2 часов в день и не перед сном.",
};

/**
 * Ask the mentor (Gemini via server route). Never throws — returns fallback text when API is unavailable.
 */
export async function askMentor(
  prompt: string,
  opts: { context?: string; json?: boolean; topic?: keyof typeof FALLBACKS; signal?: AbortSignal } = {},
): Promise<MentorResult> {
  try {
    useAnalytics.getState().noteMentorCall();
  } catch {
    /* analytics must never break the mentor */
  }
  try {
    const res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, context: opts.context, json: opts.json }),
      signal: opts.signal,
    });
    const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
    if (res.ok && data.text) return { text: data.text, ok: true };
    return { text: FALLBACKS[opts.topic ?? "default"] ?? FALLBACKS.default, ok: false, offline: true };
  } catch {
    return { text: FALLBACKS[opts.topic ?? "default"] ?? FALLBACKS.default, ok: false, offline: true };
  }
}

/** Strip markdown so speech synthesis and the dialog don't read asterisks. */
export function plainText(md: string) {
  return md
    .replace(/[*_`#>]+/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
