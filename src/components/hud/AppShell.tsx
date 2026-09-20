"use client";
import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useProgress } from "@/store/progress";
import { detectLowPerf } from "@/lib/utils";
import { applyMute, playTheme, stopTheme, unlockAudio, type Theme } from "@/lib/sound";
import { Header } from "@/components/layout/Header";
import { SoundToggle } from "./SoundToggle";
import { MODULE_ORDER } from "@/data/modules";

function themeFor(path: string): Theme | null {
  if (path.startsWith("/dashboard")) return null;
  for (const m of MODULE_ORDER) if (path.startsWith(`/modules/${m}`)) return m;
  if (path.startsWith("/final") || path.startsWith("/certificate")) return "final";
  return "map";
}

const FULLSCREEN = ["/map", "/dashboard"];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const soundEnabled = useProgress((s) => s.soundEnabled);
  const theme = useProgress((s) => s.theme);
  const setLowPerf = useProgress((s) => s.setLowPerf);
  const setHandTracking = useProgress((s) => s.setHandTracking);

  // light/dark palette («для младших/старших классов»)
  useEffect(() => {
    if (theme === "light") document.documentElement.setAttribute("data-theme", "light");
    else document.documentElement.removeAttribute("data-theme");
  }, [theme]);

  // responsive / weak-device fallback
  useEffect(() => {
    const apply = () => {
      const low = detectLowPerf();
      setLowPerf(low);
      if (low) setHandTracking(false);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [setLowPerf, setHandTracking]);

  // music per route; audio can only start after a user gesture
  useEffect(() => {
    const t = themeFor(pathname);
    if (!t) {
      stopTheme();
      return;
    }
    const start = () => {
      unlockAudio();
      playTheme(t);
    };
    start();
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [pathname]);

  useEffect(() => {
    applyMute(!soundEnabled);
    const t = themeFor(pathname);
    if (soundEnabled && t) playTheme(t);
  }, [soundEnabled, pathname]);

  const fullscreen = FULLSCREEN.some((p) => pathname.startsWith(p));

  return (
    <div className="relative min-h-screen">
      {!fullscreen && <Header />}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }}>
          {children}
        </motion.div>
      </AnimatePresence>
      {pathname.startsWith("/map") && <SoundToggle />}
    </div>
  );
}
