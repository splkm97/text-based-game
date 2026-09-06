import { describe, expect, test } from "vitest";
import { determineEnding, finishRun } from "./endings";
import { makeHero, makeRun, TEST_CONTENT } from "./testContent";

describe("determineEnding", () => {
  test("returns null while nothing has ended the run", () => {
    expect(determineEnding(makeRun(), null)).toBeNull();
  });

  test("explicit ending beats death, death beats madness, madness beats retire", () => {
    const dying = makeRun({ character: makeHero({ hp: 0, sanity: 0, xp: 100 }) });
    expect(determineEnding(dying, "mercenary_banner")).toBe("mercenary_banner");
    expect(determineEnding(dying, null)).toBe("death");
    const mad = makeRun({ character: makeHero({ sanity: 0, xp: 100 }) });
    expect(determineEnding(mad, null)).toBe("madness");
    const done = makeRun({ character: makeHero({ xp: 100 }) });
    expect(determineEnding(done, null)).toBe("retire");
  });
});

describe("finishRun", () => {
  test("moves to the ended phase with score and ranked flag, clearing pendingEnding", () => {
    const run = makeRun({ pendingEnding: "retire", loadCount: 3 });
    const ended = finishRun(run, "retire", TEST_CONTENT);
    expect(ended.pendingEnding).toBeNull();
    expect(ended.phase).toEqual({ kind: "ended", ending: "retire", score: 82, ranked: false });
  });
});
