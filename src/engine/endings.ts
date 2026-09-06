import { computeScore, isRanked } from "./score";
import type { ContentRegistry, EndingId, RunState } from "./types";

/** The ending an exhausted resource forces, if any: death before madness. */
export const resourceEnding = (run: RunState): EndingId | null => {
  const { hp, sanity } = run.character;
  if (hp <= 0) {
    return "death";
  }
  return sanity <= 0 ? "madness" : null;
};

/** Priority within one resolution: explicit `end` effect > death > madness > retire. */
export const determineEnding = (run: RunState, pendingEnding: EndingId | null): EndingId | null =>
  pendingEnding ?? resourceEnding(run) ?? (run.character.xp >= 100 ? "retire" : null);

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
