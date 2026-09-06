import { describe, expect, test } from "vitest";
import { computeScore } from "./score";
import { makeCrew, makeRun } from "./testContent";

describe("computeScore", () => {
  const run = makeRun({
    trust: 50,
    crew: [
      makeCrew("cook", { alive: false }),
      makeCrew("medic", { alive: false }),
      makeCrew("engineer", { infection: "sick" }),
      makeCrew("navigator", { infection: "incubating", incubationLeft: 1 }),
    ],
  });

  test("arrival: 10 per survivor, 5 per healthy survivor, plus trust", () => {
    expect(computeScore(run, "arrival")).toBe(6 * 10 + 4 * 5 + 50);
  });

  test("every other ending scores 0", () => {
    expect(computeScore(run, "outbreak")).toBe(0);
    expect(computeScore(run, "mutiny")).toBe(0);
    expect(computeScore(run, "captain_dead")).toBe(0);
  });
});
