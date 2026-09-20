export const cn = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const clamp = (v: number, a: number, b: number) =>
  Math.min(b, Math.max(a, v));

export const isBrowser = typeof window !== "undefined";

/** Heuristic for weak devices / small screens. */
export function detectLowPerf(): boolean {
  if (!isBrowser) return false;
  const nav = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const smallScreen = window.innerWidth < 768;
  const lowMem = (nav.deviceMemory ?? 8) <= 4;
  const lowCpu = (nav.hardwareConcurrency ?? 8) <= 4;
  const reducedMotion = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  return smallScreen || (lowMem && lowCpu) || !!reducedMotion;
}
