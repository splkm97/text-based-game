import { describe, expect, test } from "vitest";
import { computeScore, isRanked } from "./score";
import { makeHero, makeRun, TEST_CONTENT } from "./testContent";

describe("computeScore", () => {
  const run = makeRun({ character: makeHero({ xp: 5, gold: 40 }), kills: 1, day: 3 });

  test("xp*10 + gold + kills*15 + day*2 + ending bonus", () => {
    expect(computeScore(run, "retire", TEST_CONTENT)).toBe(161);
  });

  test("hard mode multiplies by 1.5 and floors", () => {
    expect(computeScore({ ...run, hardMode: true }, "retire", TEST_CONTENT)).toBe(241);
  });
});

describe("isRanked", () => {
  test("a run loaded three or more times is unranked", () => {
    expect(isRanked(makeRun({ loadCount: 2 }))).toBe(true);
    expect(isRanked(makeRun({ loadCount: 3 }))).toBe(false);
  });
});
