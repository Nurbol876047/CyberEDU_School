"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { REGIONS, CITIES, MAP_W, MAP_H } from "@/data/kazMap";
import { cn } from "@/lib/utils";

/**
 * Live-style map of Kazakhstan with incoming cyber-attack arcs.
 * The feed is a simulation (weighted by city size) — swap `nextAttack`
 * for a real source (API route / websocket) when one is available.
 */

type AttackType = "phishing" | "ddos" | "malware" | "bruteforce" | "scam";

const TYPES: Record<AttackType, { label: string; color: string; weight: number }> = {
  phishing: { label: "Фишинг", color: "#ffd900", weight: 5 },
  scam: { label: "Мошенничество", color: "#ff8a3d", weight: 3 },
  malware: { label: "Вредоносное ПО", color: "#ff4d6d", weight: 3 },
  ddos: { label: "DDoS", color: "#7c9cff", weight: 2 },
  bruteforce: { label: "Подбор пароля", color: "#d5cbf6", weight: 2 },
};
const TYPE_KEYS = Object.keys(TYPES) as AttackType[];

interface Attack {
  id: number;
  type: AttackType;
  city: (typeof CITIES)[number];
  sx: number;
  sy: number;
  path: string;
  len: number;
  at: number; // timestamp
}

// padding around the country so arcs can start off-shore
const PAD_X = 90;
const PAD_Y = 70;
const VIEW = `${-PAD_X} ${-PAD_Y} ${MAP_W + PAD_X * 2} ${MAP_H + PAD_Y * 2}`;

const pick = <T,>(items: T[], weight: (t: T) => number): T => {
  const total = items.reduce((s, t) => s + weight(t), 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= weight(it);
    if (r <= 0) return it;
  }
  return items[items.length - 1];
};

let seq = 0;
function nextAttack(): Attack {
  const city = pick(CITIES, (c) => (c.major ? 4 : 1));
  const type = pick(TYPE_KEYS, (t) => TYPES[t].weight);
  // source: random point on an ellipse just outside the map
  const a = Math.random() * Math.PI * 2;
  const sx = MAP_W / 2 + Math.cos(a) * (MAP_W / 2 + PAD_X * 0.8);
  const sy = MAP_H / 2 + Math.sin(a) * (MAP_H / 2 + PAD_Y * 0.8);
  // quadratic curve bulging perpendicular to the chord
  const mx = (sx + city.x) / 2;
  const my = (sy + city.y) / 2;
  const dx = city.x - sx;
  const dy = city.y - sy;
  const dist = Math.hypot(dx, dy) || 1;
  const bulge = dist * 0.25 * (Math.random() > 0.5 ? 1 : -1);
  const cx = mx - (dy / dist) * bulge;
  const cy = my + (dx / dist) * bulge;
  return {
    id: ++seq,
    type,
    city,
    sx,
    sy,
    path: `M${sx.toFixed(1)},${sy.toFixed(1)} Q${cx.toFixed(1)},${cy.toFixed(1)} ${city.x},${city.y}`,
    len: dist * 1.1,
    at: Date.now(),
  };
}

const ARC_MS = 1400; // travel time
const LIFE_MS = 2600; // arc + burst before removal
const fmtTime = (t: number) =>
  new Date(t).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

export function KazCyberMap({ className }: { className?: string }) {
  const [active, setActive] = useState<Attack[]>([]);
  const [log, setLog] = useState<Attack[]>([]);
  const [total, setTotal] = useState(0);
  const [hits, setHits] = useState<Record<string, number>>({});
  const [hover, setHover] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let stopped = false;
    const tick = () => {
      if (stopped) return;
      const atk = nextAttack();
      setActive((a) => [...a.filter((x) => Date.now() - x.at < LIFE_MS), atk]);
      setLog((l) => [atk, ...l].slice(0, 6));
      setTotal((n) => n + 1);
      setHits((h) => ({ ...h, [atk.city.name]: (h[atk.city.name] ?? 0) + 1 }));
      // bursts of activity: mostly 0.6–1.6s apart, occasionally a quick volley
      const gap = Math.random() < 0.2 ? 250 : 600 + Math.random() * 1000;
      timer.current = setTimeout(tick, reduced ? gap * 2.5 : gap);
    };
    // pause when the tab is hidden so the log doesn't explode
    const onVis = () => {
      if (document.hidden) clearTimeout(timer.current);
      else tick();
    };
    document.addEventListener("visibilitychange", onVis);
    timer.current = setTimeout(tick, 400);
    return () => {
      stopped = true;
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const perMinute = useMemo(() => {
    const now = Date.now();
    return log.filter((a) => now - a.at < 60_000).length;
  }, [log]);

  const hovered = hover ? REGIONS.find((r) => r.id === hover) : null;
  const top = useMemo(
    () => Object.entries(hits).sort((a, b) => b[1] - a[1]).slice(0, 3),
    [hits],
  );

  return (
    <div className={cn("glass relative overflow-hidden rounded-3xl p-3 sm:p-4", className)} style={{ boxShadow: "0 0 60px var(--glow)" }}>
      {/* header */}
      <div className="flex items-center justify-between gap-3 px-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff4d6d] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#ff4d6d]" />
          </span>
          <span className="font-heading text-xs font-extrabold uppercase tracking-widest text-fg">Live</span>
          <span className="hidden text-xs text-fg2 sm:inline">· Киберугрозы · Казахстан</span>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="text-fg2">
            всего <b className="text-teal">{total}</b>
          </span>
          <span className="text-fg2">
            /мин <b className="text-sun">{perMinute}</b>
          </span>
        </div>
      </div>

      <svg viewBox={VIEW} className="block h-auto w-full" role="img" aria-label="Карта Казахстана с кибератаками в реальном времени">
        <defs>
          <radialGradient id="kzGlow" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </radialGradient>
          <pattern id="kzGrid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="var(--accent)" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>
          <filter id="kzBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <rect x={-PAD_X} y={-PAD_Y} width={MAP_W + PAD_X * 2} height={MAP_H + PAD_Y * 2} fill="url(#kzGrid)" />
        <ellipse cx={MAP_W / 2} cy={MAP_H / 2} rx={MAP_W * 0.62} ry={MAP_H * 0.7} fill="url(#kzGlow)" />

        {/* regions */}
        <g>
          {REGIONS.map((r) => (
            <path
              key={r.id}
              d={r.d}
              fill="var(--accent)"
              fillOpacity={hover === r.id ? 0.28 : 0.1}
              stroke="var(--accent)"
              strokeOpacity={0.55}
              strokeWidth={1.2}
              strokeLinejoin="round"
              className="transition-[fill-opacity] duration-200"
              onMouseEnter={() => setHover(r.id)}
              onMouseLeave={() => setHover(null)}
            >
              <title>{r.name}</title>
            </path>
          ))}
        </g>

        {/* attack arcs */}
        <g fill="none" strokeLinecap="round">
          {active.map((a) => {
            const c = TYPES[a.type].color;
            return (
              <g key={a.id} style={{ ["--arc-ms" as string]: `${ARC_MS}ms` }}>
                <path d={a.path} pathLength={1} stroke={c} strokeWidth={5} strokeOpacity={0.35} filter="url(#kzBlur)" className="kz-arc" />
                <path d={a.path} pathLength={1} stroke={c} strokeWidth={1.8} className="kz-arc" />
                <circle cx={a.sx} cy={a.sy} r={3} fill={c} className="kz-src" />
                <circle cx={a.city.x} cy={a.city.y} r={4} fill={c} className="kz-burst" />
                <circle cx={a.city.x} cy={a.city.y} r={4} fill="none" stroke={c} strokeWidth={2} className="kz-burst kz-burst-2" />
              </g>
            );
          })}
        </g>

        {/* cities */}
        <g>
          {CITIES.map((c) => (
            <g key={c.name}>
              <circle cx={c.x} cy={c.y} r={c.major ? 10 : 7} fill="var(--accent)" fillOpacity={0.12} className="kz-pulse" />
              <circle cx={c.x} cy={c.y} r={c.major ? 3.2 : 2.2} fill="var(--accent)" />
              {c.major && (
                <text x={c.x + 8} y={c.y - 6} fontSize={15} fontWeight={700} fill="var(--text-primary)" fillOpacity={0.9} style={{ paintOrder: "stroke", stroke: "var(--bg-start)", strokeWidth: 3 }}>
                  {c.name}
                </text>
              )}
            </g>
          ))}
        </g>
      </svg>

      {/* bottom: legend + event feed */}
      <div className="mt-2 grid gap-3 px-1 sm:grid-cols-2">
        <ul className="min-w-0 space-y-1 overflow-hidden font-mono text-[11px] leading-tight">
          {log.map((a, i) => (
            <li key={a.id} className={cn("flex items-center gap-2 whitespace-nowrap transition-opacity", i === 0 ? "opacity-100" : i < 3 ? "opacity-80" : "opacity-45")}>
              <span className="text-fg3">{fmtTime(a.at)}</span>
              <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: TYPES[a.type].color }} />
              <span className="text-fg">{TYPES[a.type].label}</span>
              <span className="text-fg3">→</span>
              <span className="text-teal">{a.city.name}</span>
            </li>
          ))}
          {log.length === 0 && <li className="text-fg3">Подключение к потоку…</li>}
        </ul>
        <div className="flex flex-col gap-1.5 text-[11px] sm:items-end">
          <div className="flex flex-wrap gap-x-3 gap-y-1 sm:justify-end">
            {TYPE_KEYS.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-fg2">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: TYPES[t].color }} />
                {TYPES[t].label}
              </span>
            ))}
          </div>
          {top.length > 0 && (
            <div className="text-fg3">
              Чаще всего: {top.map(([n, k]) => `${n} (${k})`).join(", ")}
            </div>
          )}
          <div className="text-fg3">{hovered ? `${hovered.name} область` : "Демо-поток · симуляция угроз"}</div>
        </div>
      </div>

    </div>
  );
}
