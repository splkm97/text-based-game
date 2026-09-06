import { describe, expect, test } from "vitest";
import type { CrewId } from "../types";
import { determineEnding } from "./endings";
import { makeCrew, makeRun } from "./testContent";

const FIVE: readonly CrewId[] = ["cook", "medic", "engineer", "navigator", "comms"];

describe("determineEnding", () => {
  test("captain at 0 hp", () => {
    expect(determineEnding(makeRun({ captain: { hp: 0, authority: 3 } }))).toBe("captain_dead");
  });

  test("trust at 0", () => {
    expect(determineEnding(makeRun({ trust: 0 }))).toBe("mutiny");
  });

  test("dead plus sick reaching 5", () => {
    const lost = makeRun({
      crew: [
        makeCrew("cook", { alive: false }),
        makeCrew("medic", { alive: false }),
        makeCrew("engineer", { infection: "sick" }),
        makeCrew("navigator", { infection: "sick" }),
        makeCrew("comms", { infection: "sick" }),
      ],
    });
    expect(determineEnding(lost)).toBe("outbreak");
    const holding = makeRun({
      crew: [
        makeCrew("cook", { alive: false }),
        makeCrew("engineer", { infection: "sick" }),
        makeCrew("navigator", { infection: "sick" }),
        makeCrew("comms", { infection: "incubating", incubationLeft: 1 }),
      ],
    });
    expect(determineEnding(holding)).toBeNull();
  });

  test("day past 30 is arrival; day 30 is not", () => {
    expect(determineEnding(makeRun({ day: 31 }))).toBe("arrival");
    expect(determineEnding(makeRun({ day: 30 }))).toBeNull();
  });

  test("priority: captain death over mutiny over outbreak over arrival", () => {
    const everything = makeRun({
      day: 31,
      trust: 0,
      captain: { hp: 0, authority: 3 },
      crew: FIVE.map((id) => makeCrew(id, { alive: false })),
    });
    expect(determineEnding(everything)).toBe("captain_dead");
    expect(determineEnding({ ...everything, captain: { hp: 1, authority: 3 } })).toBe("mutiny");
    expect(determineEnding({ ...everything, captain: { hp: 1, authority: 3 }, trust: 1 })).toBe(
      "outbreak",
    );
  });
});
