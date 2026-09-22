"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeSwitch } from "./ThemeSwitch";
import { SoundToggle } from "@/components/hud/SoundToggle";
import { useProgress, completedCount } from "@/store/progress";
import { MODULES } from "@/data/modules";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/#modules", label: "Модули" },
  { href: "/map", label: "3D-карта" },
  { href: "/parents", label: "Родителям" },
];

export function Header() {
  const pathname = usePathname() ?? "/";
  const modules = useProgress((s) => s.modules);
  const totalScore = useProgress((s) => s.totalScore);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const done = hydrated ? completedCount(modules) : 0;
  const pct = Math.round((done / MODULES.length) * 100);

  return (
    <header className="sticky top-0 z-40 border-b border-line px-[5%] py-3 backdrop-blur-md" style={{ background: "var(--header-bg)" }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/" className="font-heading text-xl font-extrabold tracking-wider text-fg sm:text-2xl">
          QALQAN <span className="text-teal">AI</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={cn("text-sm font-semibold text-fg2 transition-colors hover:text-teal", pathname === n.href.split("#")[0] && n.href.indexOf("#") < 0 && "text-teal")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-pill border border-line bg-card px-3 py-1.5 text-xs sm:flex" title="Общий прогресс">
            <div className="h-2 w-20 overflow-hidden rounded bg-line">
              <div className="h-full bg-teal transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="font-semibold text-sun">{pct}%</span>
            <span className="text-fg3">·</span>
            <span className="font-semibold text-sun">⭐ {hydrated ? totalScore : 0}</span>
          </div>
          <ThemeSwitch />
          <SoundToggle inline />
        </div>
      </div>
    </header>
  );
}
