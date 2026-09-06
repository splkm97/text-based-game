// Ending check, run once after every night in this priority order.

import type { EndingId, RunState } from "../types";
import { countOf } from "./crew";
import { ARRIVAL_DAY } from "./lag";

/** Dead plus sick crew at which the ship is lost. */
export const OUTBREAK_THRESHOLD = 5;

export const determineEnding = (run: RunState): EndingId | null => {
  if (run.captain.hp <= 0) {
    return "captain_dead";
  }
  if (run.trust <= 0) {
    return "mutiny";
  }
  if (countOf(run, "dead") + countOf(run, "sick") >= OUTBREAK_THRESHOLD) {
    return "outbreak";
  }
  return run.day > ARRIVAL_DAY ? "arrival" : null;
};
