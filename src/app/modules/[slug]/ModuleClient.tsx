"use client";
import { useEffect, useState } from "react";
import type { ModuleSlug } from "@/data/modules";
import { LessonModule } from "@/components/lesson/LessonModule";

export function ModuleClient({ slug }: { slug: ModuleSlug }) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  if (!hydrated) return <div className="flex min-h-[60vh] items-center justify-center text-teal animate-pulse">Загрузка модуля…</div>;
  return <LessonModule slug={slug} />;
}
