"use client";
import { Howl, Howler } from "howler";
import { useProgress } from "@/store/progress";

export type Sfx = "ding" | "success" | "error" | "swipe" | "click" | "unlock";
export type Theme = "map" | "passwords" | "privacy" | "strangers" | "bullying" | "phishing" | "screentime" | "final";

const sfxCache: Partial<Record<Sfx, Howl>> = {};
const musicCache: Partial<Record<Theme, Howl>> = {};
let currentTheme: Theme | null = null;

const isMuted = () => !useProgress.getState().soundEnabled;

export function playSfx(name: Sfx, volume = 0.6) {
  if (typeof window === "undefined" || isMuted()) return;
  let h = sfxCache[name];
  if (!h) {
    h = new Howl({ src: [`/audio/sfx-${name}.wav`], volume, preload: true });
    sfxCache[name] = h;
  }
  try {
    h.play();
  } catch {
    /* autoplay blocked */
  }
}

/** Cross-fades background music to a theme. Safe to call repeatedly. */
export function playTheme(theme: Theme) {
  if (typeof window === "undefined") return;
  if (currentTheme === theme) {
    if (!isMuted()) musicCache[theme]?.play();
    return;
  }
  const prev = currentTheme ? musicCache[currentTheme] : null;
  currentTheme = theme;
  if (prev) {
    prev.fade(prev.volume(), 0, 700);
    setTimeout(() => prev.stop(), 750);
  }
  if (isMuted()) return;
  let h = musicCache[theme];
  if (!h) {
    h = new Howl({ src: [`/audio/music-${theme}.wav`], loop: true, volume: 0, html5: false });
    musicCache[theme] = h;
  }
  h.play();
  h.fade(0, 0.25, 1200);
}

export function stopTheme() {
  if (currentTheme) {
    musicCache[currentTheme]?.fade(0.25, 0, 500);
    const h = musicCache[currentTheme];
    setTimeout(() => h?.stop(), 550);
  }
}

export function applyMute(muted: boolean) {
  Howler.mute(muted);
  if (!muted && currentTheme) {
    const h = musicCache[currentTheme];
    if (h && !h.playing()) {
      h.play();
      h.fade(0, 0.25, 800);
    }
  }
}

/** Browsers block audio until first interaction; call once on any click. */
export function unlockAudio() {
  try {
    if (Howler.ctx && Howler.ctx.state === "suspended") Howler.ctx.resume();
  } catch {
    /* ignore */
  }
}
