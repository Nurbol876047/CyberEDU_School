import type { ModuleSlug } from "./modules";
import { LESSONS, PRE_TEST_SIZE } from "./lessons";

export interface TestQuestion {
  id: string;
  text: string;
  options: string[];
  answer: number;
}

/** Pre-test = first three quiz questions of the module (asked again inside the final quiz). */
export const TESTS: Record<ModuleSlug, TestQuestion[]> = Object.fromEntries(
  (Object.keys(LESSONS) as ModuleSlug[]).map((slug) => [
    slug,
    LESSONS[slug].quiz.slice(0, PRE_TEST_SIZE).map((q) => ({ id: q.id, text: q.q, options: q.opts, answer: q.a })),
  ]),
) as Record<ModuleSlug, TestQuestion[]>;
