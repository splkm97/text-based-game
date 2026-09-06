// Only arrival scores: survivors * 10 + healthy survivors * 5 + trust.

import type { EndingId, RunState } from "../types";
import { countOf } from "./crew";

const SURVIVOR_POINTS = 10;
const HEALTHY_POINTS = 5;

export const computeScore = (run: RunState, ending: EndingId): number =>
  ending === "arrival"
    ? countOf(run, "alive") * SURVIVOR_POINTS + countOf(run, "healthy") * HEALTHY_POINTS + run.trust
    : 0;
