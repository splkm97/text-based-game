import { computeScore, isRanked } from "./score";
import type { ContentRegistry, EndingId, RunState } from "./types";

/** Priority within one resolution: explicit `end` effect > death > madness > retire. */
export const determineEnding = (run: RunState, pendingEnding: EndingId | null): EndingId | null => {
  if (pendingEnding !== null) {
    return pendingEnding;
  }
  const { hp, sanity, xp } = run.character;
  if (hp <= 0) {
    return "death";
  }
  if (sanity <= 0) {
    return "madness";
  }
  return xp >= 100 ? "retire" : null;
};

export const finishRun = (run: RunState, ending: EndingId, content: ContentRegistry): RunState => ({
  ...run,
  pendingEnding: null,
  phase: {
    kind: "ended",
    ending,
    score: computeScore(run, ending, content),
    ranked: isRanked(run),
  },
  log: [...run.log, { day: run.day, text: content.endings[ending].title }],
});
