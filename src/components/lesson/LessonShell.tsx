"use client";
import { ReactNode, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MentorDialog } from "@/components/hud/MentorDialog";
import { AskMentor } from "@/components/hud/AskMentor";
import type { ModuleInfo } from "@/data/modules";

interface Props {
  info: ModuleInfo;
  stageLabel: string;
  mentorText: string;
  mentorLoading?: boolean;
  mentorOffline?: boolean;
  onAsk: (q: string) => void;
  extraActions?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}

/** Layout of a module page: header row (как в QALQAN AI), content, mentor dialog snapped to the bottom. */
export function LessonShell({ info, stageLabel, mentorText, mentorLoading, mentorOffline, onAsk, extraActions, wide, children }: Props) {
  const [askOpen, setAskOpen] = useState(false);
  return (
    <main className="relative min-h-screen">
      <div className={`mx-auto px-[5%] pb-56 pt-8 ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="btn-soft px-5 py-2.5 text-xs">← К миссиям</Link>
          <h2 className="order-last w-full text-center text-2xl font-extrabold sm:order-none sm:w-auto sm:flex-1 sm:text-3xl" style={{ color: info.color }}>{info.title}</h2>
          <span className="rounded-pill bg-line px-4 py-2 text-sm font-semibold text-teal">{stageLabel}</span>
        </div>
        <motion.div key={stageLabel} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {children}
        </motion.div>
      </div>
      <MentorDialog
        text={mentorText}
        loading={mentorLoading}
        actions={
          <div className="flex w-full flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <button className="btn-ghost px-3 py-1.5 text-[11px]" onClick={() => setAskOpen((v) => !v)} aria-expanded={askOpen}>
                💬 {askOpen ? "Скрыть" : "Спросить наставника"}
              </button>
              {extraActions}
            </div>
            {askOpen && <AskMentor onAsk={onAsk} loading={mentorLoading} offline={mentorOffline} />}
          </div>
        }
      />
    </main>
  );
}
