import type { useMentor } from "@/components/hud/useMentor";
import type { ModuleTracker } from "@/components/hud/useModuleTracker";

export interface SimulatorProps {
  mentor: ReturnType<typeof useMentor>;
  tracker: ModuleTracker;
  /** Called once when the simulator is passed; `score` — points earned. */
  onComplete: (score: number) => void;
}
