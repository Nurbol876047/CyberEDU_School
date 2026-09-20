"use client";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTypewriter } from "./useTypewriter";
import { cn } from "@/lib/utils";

interface Props {
  text: string;
  name?: string;
  /** Extra controls rendered under the text (e.g. ask-mentor button). */
  actions?: ReactNode;
  className?: string;
  loading?: boolean;
  /** Force dark glass (for the 3D map, which is always dark). */
  dark?: boolean;
}

export function MentorDialog({ text, name = "Қалқан-бот", actions, className, loading, dark }: Props) {
  const { out, done, skip } = useTypewriter(text);

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5", className)}>
      <motion.div
        className={cn("glass pointer-events-auto mx-auto flex max-w-3xl gap-3 rounded-2xl p-3 sm:gap-4 sm:p-4", dark && "text-white")}
        style={dark ? { background: "rgba(10,14,32,.7)", borderColor: "rgba(0,255,237,.3)" } : undefined}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        onClick={() => !done && skip()}
      >
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal/20 text-2xl sm:h-14 sm:w-14">
          🤖
          <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-sun animate-pulse" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 text-xs font-semibold uppercase tracking-wider text-teal">{name}</div>
          <p className={cn("min-h-[2.5rem] text-sm leading-relaxed sm:text-base", dark ? "text-white" : "text-fg")}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-fg3">
                  Думаю<span className="animate-pulse">…</span>
                </motion.span>
              ) : (
                <span key="text">
                  {out}
                  {!done && <span className="ml-0.5 inline-block w-2 animate-pulse bg-teal">&nbsp;</span>}
                </span>
              )}
            </AnimatePresence>
          </p>
          {actions && <div className="mt-2 flex flex-wrap gap-2">{actions}</div>}
        </div>
      </motion.div>
    </div>
  );
}
