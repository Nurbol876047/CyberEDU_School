export interface SwipeSample {
  x: number;
  t: number;
}

export interface SwipeConfig {
  /** window of samples considered, ms */
  windowMs: number;
  /** minimal horizontal displacement as a fraction of the frame width */
  minDx: number;
  /** minimal velocity, fraction of frame per ms */
  minVelocity: number;
}

export const DEFAULT_SWIPE: SwipeConfig = { windowMs: 500, minDx: 0.18, minVelocity: 0.0006 };

/**
 * Pushes a wrist sample and returns a swipe direction if the motion over the window qualifies.
 * Mutates `history` (trims old samples, clears on detection).
 */
export function detectSwipe(
  history: SwipeSample[],
  x: number,
  now: number,
  cfg: SwipeConfig = DEFAULT_SWIPE,
): "swipe-left" | "swipe-right" | null {
  history.push({ x, t: now });
  while (history.length && now - history[0].t > cfg.windowMs) history.shift();
  if (history.length < 2) return null;
  const first = history[0];
  const last = history[history.length - 1];
  const dx = last.x - first.x;
  const dt = Math.max(last.t - first.t, 1);
  if (Math.abs(dx) >= cfg.minDx && Math.abs(dx) / dt >= cfg.minVelocity) {
    history.length = 0;
    return dx > 0 ? "swipe-right" : "swipe-left";
  }
  return null;
}

/** Pinch: thumb tip (4) and index tip (8) distance. Returns true on a fresh close (hysteresis). */
export function detectPinch(distance: number, wasDown: boolean, closeAt = 0.05, openAt = 0.08): { down: boolean; fired: boolean } {
  if (distance < closeAt) return { down: true, fired: !wasDown };
  if (distance > openAt) return { down: false, fired: false };
  return { down: wasDown, fired: false };
}
