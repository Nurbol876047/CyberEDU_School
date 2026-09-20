"use client";

type RecognitionCtor = new () => SpeechRecognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const speechRecognitionSupported = () => getRecognition() !== null;
export const speechSynthesisSupported = () =>
  typeof window !== "undefined" && "speechSynthesis" in window;

/** Listen once and resolve with the transcript. */
export function listenOnce(lang = "ru-RU"): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = getRecognition();
    if (!Ctor) return reject(new Error("unsupported"));
    const rec = new Ctor();
    rec.lang = lang;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    let settled = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      settled = true;
      resolve(e.results[0]?.[0]?.transcript ?? "");
    };
    rec.onerror = (e: Event & { error?: string }) => {
      if (!settled) reject(new Error(e.error ?? "error"));
    };
    rec.onend = () => {
      if (!settled) reject(new Error("no-speech"));
    };
    try {
      rec.start();
    } catch (err) {
      reject(err);
    }
  });
}

export function speak(text: string, lang = "ru-RU") {
  if (!speechSynthesisSupported() || !text) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 1;
  u.pitch = 1.05;
  const voices = window.speechSynthesis.getVoices();
  const v = voices.find((x) => x.lang.startsWith("ru")) ?? voices[0];
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (speechSynthesisSupported()) window.speechSynthesis.cancel();
}

export const isSpeaking = () =>
  speechSynthesisSupported() && window.speechSynthesis.speaking;
