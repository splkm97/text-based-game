// Phase guards and the transition into the resolution phase, shared by combat and the run reducer.

import { EngineError } from "./errors";
import type { LogEntry, RunPhase, RunState } from "./types";

type PhaseKind = RunPhase["kind"];

export const requirePhase = <K extends PhaseKind>(
  run: RunState,
  kind: K,
): Extract<RunPhase, { kind: K }> => {
  if (run.phase.kind !== kind) {
    throw new EngineError("INVALID_PHASE", `expected phase ${kind}, got ${run.phase.kind}`);
  }
  return run.phase as Extract<RunPhase, { kind: K }>;
};

export const requireOneOfPhases = (run: RunState, kinds: readonly PhaseKind[]): void => {
  if (!kinds.includes(run.phase.kind)) {
    throw new EngineError("INVALID_PHASE", `action not allowed in phase ${run.phase.kind}`);
  }
};

const journal = (day: number, lines: readonly string[]): readonly LogEntry[] =>
  lines.map((text) => ({ day, text }));

/** Shows `text` and the effect lines; the player taps 계속 to `continueRun`. */
export const enterResolution = (
  run: RunState,
  text: string,
  effectsLog: readonly string[],
): RunState => ({
  ...run,
  phase: { kind: "resolution", text, effectsLog },
  log: [...run.log, ...journal(run.day, [text, ...effectsLog])],
});
