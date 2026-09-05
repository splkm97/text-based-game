import type { ContentRegistry, EndingId, RunState } from "./types";

const UNRANKED_LOAD_COUNT = 3;
const HARD_MODE_SCORE_MULTIPLIER = 1.5;

export const computeScore = (run: RunState, ending: EndingId, content: ContentRegistry): number => {
  const { xp, gold } = run.character;
  const base = xp * 10 + gold + run.kills * 15 + run.day * 2 + content.endings[ending].scoreBonus;
  return Math.floor(run.hardMode ? base * HARD_MODE_SCORE_MULTIPLIER : base);
};

export const isRanked = (run: RunState): boolean => run.loadCount < UNRANKED_LOAD_COUNT;
