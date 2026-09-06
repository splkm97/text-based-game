import { describe, expect, test } from "vitest";
import type { Content, CrewState, RunState } from "../types";
import { resolveNight } from "./night";
import { constantRng, makeCrew, makeRun, TEST_CONTENT } from "./testContent";

const crewOf = (run: RunState, id: CrewState["id"]): CrewState => {
  const member = run.crew.find((crew) => crew.id === id);
  if (member === undefined) {
    throw new Error(`no crew ${id}`);
  }
  return member;
};

/** rng 0.99: never spreads, never coughs, and a d20 roll of 20 wins every check. */
const QUIET = 0.99;
/** rng 0: always spreads, always coughs, and a d20 roll of 1 loses every check. */
const LOUD = 0;

describe("incubation", () => {
  test("an incubating crew member falls sick on the third night, not before", () => {
    const start = makeRun({
      crew: [makeCrew("medic", { infection: "incubating", incubationLeft: 3 })],
    });
    const night1 = resolveNight(start, TEST_CONTENT, constantRng(QUIET)).run;
    const night2 = resolveNight(night1, TEST_CONTENT, constantRng(QUIET)).run;
    const night3 = resolveNight(night2, TEST_CONTENT, constantRng(QUIET));
    expect(crewOf(night1, "medic")).toMatchObject({ infection: "incubating", incubationLeft: 2 });
    expect(crewOf(night2, "medic")).toMatchObject({ infection: "incubating", incubationLeft: 1 });
    expect(crewOf(night3.run, "medic")).toMatchObject({ infection: "sick", sickDays: 0 });
    expect(night3.report).toContain("나온이 앓아눕는다.");
  });
});

describe("spread", () => {
  test("a sick unquarantined crew member infects every exposed healthy crew member, never a quarantined one", () => {
    const start = makeRun({
      crew: [makeCrew("medic", { infection: "sick" }), makeCrew("engineer", { quarantined: true })],
    });
    const after = resolveNight(start, TEST_CONTENT, constantRng(LOUD)).run;
    for (const crew of after.crew) {
      if (crew.id === "medic") {
        expect(crew.infection).toBe("sick");
      } else if (crew.id === "engineer") {
        expect(crew.infection).toBe("healthy");
      } else {
        expect(crew).toMatchObject({ infection: "incubating", incubationLeft: 3 });
      }
    }
  });

  test("a quarantined sick crew member and an incubating one infect nobody", () => {
    const start = makeRun({
      crew: [
        makeCrew("medic", { infection: "sick", quarantined: true }),
        makeCrew("cook", { infection: "incubating", incubationLeft: 3 }),
      ],
    });
    const after = resolveNight(start, TEST_CONTENT, constantRng(LOUD)).run;
    const healthy = after.crew.filter((crew) => crew.infection === "healthy").map((c) => c.id);
    expect(healthy).toHaveLength(6);
    expect(crewOf(after, "cook")).toMatchObject({ infection: "incubating", incubationLeft: 2 });
  });
});

describe("death, stress, trust", () => {
  test("a crew member dies on the fourth sick night and costs 15 trust", () => {
    const start = makeRun({ crew: [makeCrew("cook", { infection: "sick", sickDays: 3 })] });
    const after = resolveNight(start, TEST_CONTENT, constantRng(QUIET));
    expect(crewOf(after.run, "cook")).toMatchObject({ alive: false, symptoms: [] });
    expect(after.run.trust).toBe(55);
    expect(after.report).toContain("아온이 숨을 거둔다.");
  });

  test("night stress is +8, +15 when quarantined; a healthy quarantine costs 5 trust", () => {
    const start = makeRun({ crew: [makeCrew("navigator", { quarantined: true, stress: 10 })] });
    const after = resolveNight(start, TEST_CONTENT, constantRng(QUIET)).run;
    expect(crewOf(after, "navigator").stress).toBe(25);
    expect(crewOf(after, "cook").stress).toBe(8);
    expect(after.trust).toBe(65);
  });

  test("a quarantined sick crew member costs no trust", () => {
    const start = makeRun({
      crew: [makeCrew("navigator", { quarantined: true, infection: "sick" })],
    });
    expect(resolveNight(start, TEST_CONTENT, constantRng(QUIET)).run.trust).toBe(70);
  });
});

describe("symptoms", () => {
  test("sick crew show viral symptoms, stressed crew a stress symptom, incubating crew nothing", () => {
    const start = makeRun({
      crew: [
        makeCrew("medic", { infection: "sick" }),
        makeCrew("cook", { stress: 50 }),
        makeCrew("engineer", { infection: "incubating", incubationLeft: 2 }),
      ],
    });
    const after = resolveNight(start, TEST_CONTENT, constantRng(QUIET)).run;
    expect(crewOf(after, "medic").symptoms).toEqual(["rash", "nosebleed"]);
    expect(crewOf(after, "cook").symptoms).toEqual(["insomnia"]);
    expect(crewOf(after, "engineer").symptoms).toEqual([]);
  });

  test("a cough can appear on anyone", () => {
    const after = resolveNight(makeRun(), TEST_CONTENT, constantRng(LOUD)).run;
    expect(after.crew.every((crew) => crew.symptoms.includes("cough"))).toBe(true);
  });
});

describe("confrontation", () => {
  test("the most stressed exposed crew member confronts; ties break by id; success resets stress to 40", () => {
    const start = makeRun({
      crew: [
        makeCrew("cook", { stress: 90 }),
        makeCrew("biologist", { stress: 90 }),
        makeCrew("medic", { stress: 100, quarantined: true, infection: "sick" }),
      ],
    });
    const after = resolveNight(start, TEST_CONTENT, constantRng(QUIET));
    expect(crewOf(after.run, "biologist").stress).toBe(40);
    expect(crewOf(after.run, "cook").stress).toBe(98);
    expect(after.run.trust).toBe(73);
    expect(after.report.at(-3)).toBe("바온이 막아선다: 대치 (권위 판정 d20 20)");
  });

  test("success applies the event effects first, so 40 is the crew member's final stress", () => {
    const relieving: Content = {
      ...TEST_CONTENT,
      confrontations: [
        {
          id: "cf_test",
          title: "대치",
          text: "막아선다.",
          dc: 11,
          success: {
            text: "물러난다.",
            effects: [{ kind: "stress", target: "all", delta: -10 }],
          },
          failure: { text: "맞는다." },
        },
      ],
    };
    const start = makeRun({
      crew: [makeCrew("cook", { stress: 90 }), makeCrew("navigator", { stress: 30 })],
    });
    const after = resolveNight(start, relieving, constantRng(QUIET)).run;
    expect(crewOf(after, "cook").stress).toBe(40);
    expect(crewOf(after, "navigator").stress).toBe(28);
  });

  test("failure costs captain hp 3 by default and 10 trust", () => {
    const start = makeRun({ crew: [makeCrew("cook", { stress: 80 })] });
    const after = resolveNight(start, TEST_CONTENT, constantRng(LOUD)).run;
    expect(after.captain.hp).toBe(7);
    expect(after.trust).toBe(60);
    expect(crewOf(after, "cook").stress).toBe(88);
  });

  test("nobody at 80 stress means no confrontation", () => {
    const start = makeRun({ crew: [makeCrew("cook", { stress: 71 })] });
    const after = resolveNight(start, TEST_CONTENT, constantRng(LOUD)).run;
    expect(after.captain.hp).toBe(10);
    expect(after.trust).toBe(70);
  });
});
