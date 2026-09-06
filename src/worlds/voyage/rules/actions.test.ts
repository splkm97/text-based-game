import { describe, expect, test } from "vitest";
import type { CrewState, RunState } from "../types";
import { applyAction } from "./actions";
import { RulesError } from "./errors";
import { constantRng, makeCrew, makeRun, sequenceRng, TEST_CONTENT } from "./testContent";

const crewOf = (run: RunState, id: CrewState["id"]): CrewState => {
  const member = run.crew.find((crew) => crew.id === id);
  if (member === undefined) {
    throw new Error(`no crew ${id}`);
  }
  return member;
};

const codeOf = (fn: () => void): string => {
  try {
    fn();
  } catch (error) {
    if (error instanceof RulesError) {
      return error.code;
    }
    throw error;
  }
  return "no error";
};

/** rng 0 would flip a test result and cure a treated patient; 0.9 does neither. */
const WOULD_FLIP = 0;
const NO_FLIP = 0.9;

describe("test", () => {
  const incubatingEngineer = makeCrew("engineer", { infection: "incubating", incubationLeft: 2 });

  test("reports the truth and never consults the rng while the medic is available", () => {
    const run = makeRun({ crew: [incubatingEngineer] });
    const exhausted = sequenceRng([]);
    const positive = applyAction(run, { kind: "test", crew: "engineer" }, TEST_CONTENT, exhausted);
    const negative = applyAction(run, { kind: "test", crew: "cook" }, TEST_CONTENT, exhausted);
    expect(positive.run.tests).toEqual([{ day: 1, crew: "engineer", positive: true }]);
    expect(negative.run.tests).toEqual([{ day: 1, crew: "cook", positive: false }]);
    expect(positive.run.kits).toBe(2);
    expect(positive.log).toEqual(["다온 검사 결과: 양성"]);
  });

  test.each([
    ["sick", makeCrew("medic", { infection: "sick" })],
    ["dead", makeCrew("medic", { alive: false })],
  ])("flips with p 0.2 while the medic is %s", (_state, medic) => {
    const run = makeRun({ crew: [incubatingEngineer, medic] });
    const flipped = applyAction(
      run,
      { kind: "test", crew: "engineer" },
      TEST_CONTENT,
      constantRng(WOULD_FLIP),
    );
    const honest = applyAction(
      run,
      { kind: "test", crew: "engineer" },
      TEST_CONTENT,
      constantRng(NO_FLIP),
    );
    expect(flipped.run.tests[0]?.positive).toBe(false);
    expect(honest.run.tests[0]?.positive).toBe(true);
  });

  test("needs a kit and a living target", () => {
    const noKits = makeRun({ kits: 0 });
    expect(
      codeOf(() =>
        applyAction(noKits, { kind: "test", crew: "cook" }, TEST_CONTENT, constantRng(NO_FLIP)),
      ),
    ).toBe("NO_RESOURCE");
    const dead = makeRun({ crew: [makeCrew("cook", { alive: false })] });
    expect(
      codeOf(() =>
        applyAction(dead, { kind: "test", crew: "cook" }, TEST_CONTENT, constantRng(NO_FLIP)),
      ),
    ).toBe("INVALID_TARGET");
  });
});

describe("quarantine and release", () => {
  test("quarantine sets the flag; release clears it; each rejects a redundant target", () => {
    const run = makeRun();
    const rng = sequenceRng([]);
    const held = applyAction(run, { kind: "quarantine", crew: "cook" }, TEST_CONTENT, rng).run;
    expect(crewOf(held, "cook").quarantined).toBe(true);
    expect(
      codeOf(() => applyAction(held, { kind: "quarantine", crew: "cook" }, TEST_CONTENT, rng)),
    ).toBe("INVALID_TARGET");
    const freed = applyAction(held, { kind: "release", crew: "cook" }, TEST_CONTENT, rng).run;
    expect(crewOf(freed, "cook").quarantined).toBe(false);
    expect(
      codeOf(() => applyAction(freed, { kind: "release", crew: "cook" }, TEST_CONTENT, rng)),
    ).toBe("INVALID_TARGET");
  });
});

describe("talk", () => {
  test("relieves 20 stress, floored at 0", () => {
    const run = makeRun({
      crew: [makeCrew("cook", { stress: 30 }), makeCrew("medic", { stress: 5 })],
    });
    const rng = sequenceRng([]);
    const cook = applyAction(run, { kind: "talk", crew: "cook" }, TEST_CONTENT, rng).run;
    const medic = applyAction(run, { kind: "talk", crew: "medic" }, TEST_CONTENT, rng).run;
    expect(crewOf(cook, "cook").stress).toBe(10);
    expect(crewOf(medic, "medic").stress).toBe(0);
  });
});

describe("treat", () => {
  const sickCook = makeCrew("cook", { infection: "sick", sickDays: 3 });

  test("cures a sick crew member with p 0.7, else resets the sick clock; always spends a med", () => {
    const run = makeRun({ crew: [sickCook] });
    const cured = applyAction(
      run,
      { kind: "treat", crew: "cook" },
      TEST_CONTENT,
      constantRng(0.69),
    ).run;
    const held = applyAction(
      run,
      { kind: "treat", crew: "cook" },
      TEST_CONTENT,
      constantRng(0.7),
    ).run;
    expect(crewOf(cured, "cook")).toMatchObject({ infection: "healthy", sickDays: 0 });
    expect(crewOf(held, "cook")).toMatchObject({ infection: "sick", sickDays: 0 });
    expect(cured.meds).toBe(3);
    expect(held.meds).toBe(3);
  });

  test("does nothing to an incubating or healthy crew member beyond spending the med", () => {
    const run = makeRun({
      crew: [makeCrew("cook", { infection: "incubating", incubationLeft: 1 })],
    });
    const after = applyAction(run, { kind: "treat", crew: "cook" }, TEST_CONTENT, sequenceRng([]));
    expect(crewOf(after.run, "cook")).toMatchObject({ infection: "incubating", incubationLeft: 1 });
    expect(after.run.meds).toBe(3);
  });

  test("needs a med", () => {
    const run = makeRun({ meds: 0, crew: [sickCook] });
    expect(
      codeOf(() => applyAction(run, { kind: "treat", crew: "cook" }, TEST_CONTENT, constantRng(0))),
    ).toBe("NO_RESOURCE");
  });
});
