import { describe, expect, test } from "vitest";
import { createRng } from "../../../shared/rng";
import { CONTENT } from "../content";
import { ENDING_IDS } from "../ids";
import type { Action, RunState } from "../types";
import { RulesError } from "./errors";
import { chooseOption, continueRun, endDay, performAction, startRun } from "./run";
import { constantRng, TEST_CONTENT } from "./testContent";

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

describe("phase cycle", () => {
  test("start: day 1 comms, exactly one crew member incubating with 3 nights left", () => {
    const run = startRun(TEST_CONTENT, constantRng(0.5));
    expect(run).toMatchObject({
      day: 1,
      captain: { hp: 10, authority: 3 },
      trust: 70,
      kits: 3,
      meds: 4,
      ap: 2,
      phase: { kind: "comms", arrived: [] },
    });
    const incubating = run.crew.filter((crew) => crew.infection === "incubating");
    expect(incubating).toHaveLength(1);
    expect(incubating[0]?.incubationLeft).toBe(3);
    expect(run.crew.filter((crew) => crew.infection === "healthy")).toHaveLength(7);
  });

  test("comms -> observe -> act -> night -> comms, with messages and reveals on arrival", () => {
    const rng = constantRng(0.99);
    const day1 = startRun(TEST_CONTENT, rng);
    const observe = continueRun(day1, TEST_CONTENT, rng);
    expect(observe.phase).toEqual({ kind: "observe", event: "ev_test" });
    expect(observe.seenEvents).toEqual(["ev_test"]);

    const act = chooseOption(observe, 0, TEST_CONTENT);
    expect(act.phase).toEqual({ kind: "act" });
    expect(act.trust).toBe(75);

    const one = performAction(act, { kind: "talk", crew: "cook" }, TEST_CONTENT, rng);
    const two = performAction(one, { kind: "talk", crew: "cook" }, TEST_CONTENT, rng);
    expect(two.ap).toBe(0);
    expect(
      codeOf(() => performAction(two, { kind: "talk", crew: "cook" }, TEST_CONTENT, rng)),
    ).toBe("NO_AP");

    const night = endDay(two, TEST_CONTENT, rng);
    expect(night.phase.kind).toBe("night");
    expect(night.day).toBe(1);

    const day2 = continueRun(night, TEST_CONTENT, rng);
    expect(day2).toMatchObject({
      day: 2,
      ap: 2,
      phase: { kind: "comms", arrived: ["m_fever"] },
      inbox: ["m_fever"],
      knownSymptoms: { confirmed: ["fever"], retracted: [] },
    });
  });

  test("a gated choice and a wrong phase are rejected", () => {
    const rng = constantRng(0.99);
    const observe = continueRun(startRun(TEST_CONTENT, rng), TEST_CONTENT, rng);
    expect(codeOf(() => chooseOption(observe, 1, TEST_CONTENT))).toBe("INVALID_CHOICE");
    expect(codeOf(() => chooseOption(observe, 9, TEST_CONTENT))).toBe("INVALID_CHOICE");
    expect(codeOf(() => endDay(observe, TEST_CONTENT, rng))).toBe("INVALID_PHASE");
    expect(
      codeOf(() => continueRun(chooseOption(observe, 0, TEST_CONTENT), TEST_CONTENT, rng)),
    ).toBe("INVALID_PHASE");
  });

  test("the night that pushes day past 30 ends the run with a scored arrival", () => {
    const rng = constantRng(0.99);
    const late: RunState = { ...startRun(TEST_CONTENT, rng), day: 30, phase: { kind: "act" } };
    const ended = continueRun(endDay(late, TEST_CONTENT, rng), TEST_CONTENT, rng);
    expect(ended.day).toBe(31);
    expect(ended.phase).toMatchObject({ kind: "ended", ending: "arrival" });
    expect(ended.log.at(-1)?.text).toBe("도착");
  });
});

/** Quarantine anyone showing two Earth-confirmed symptoms; otherwise talk to the most stressed. */
const policy = (run: RunState): Action => {
  const confirmed = run.knownSymptoms.confirmed;
  const suspect = run.crew.find(
    (crew) =>
      crew.alive &&
      !crew.quarantined &&
      crew.symptoms.filter((symptom) => confirmed.includes(symptom)).length >= 2,
  );
  if (suspect !== undefined) {
    return { kind: "quarantine", crew: suspect.id };
  }
  const stressed = [...run.crew]
    .filter((crew) => crew.alive)
    .sort((a, b) => b.stress - a.stress || (a.id < b.id ? -1 : 1))[0];
  if (stressed === undefined) {
    throw new Error("no living crew to talk to");
  }
  return { kind: "talk", crew: stressed.id };
};

const firstOpenChoice = (run: RunState): number => {
  if (run.phase.kind !== "observe") {
    throw new Error("not observing");
  }
  const event = CONTENT.events[run.phase.event];
  const index = event?.choices.findIndex((choice) => choice.requires.length === 0) ?? -1;
  if (index < 0) {
    throw new Error(`event ${run.phase.event} has no ungated choice`);
  }
  return index;
};

const step = (run: RunState, rng: () => number): RunState => {
  switch (run.phase.kind) {
    case "comms":
    case "night":
      return continueRun(run, CONTENT, rng);
    case "observe":
      return chooseOption(run, firstOpenChoice(run), CONTENT);
    case "act":
      return run.ap > 0 ? performAction(run, policy(run), CONTENT, rng) : endDay(run, CONTENT, rng);
    case "ended":
      return run;
  }
};

const play = (seed: number): RunState => {
  const rng = createRng(seed);
  const MAX_STEPS = 1000;
  let run = startRun(CONTENT, rng);
  for (let i = 0; i < MAX_STEPS && run.phase.kind !== "ended"; i += 1) {
    run = step(run, rng);
  }
  return run;
};

describe("replay determinism over real content", () => {
  test.each([1, 7, 42, 2026])("seed %i reaches an ending and replays identically", (seed) => {
    const first = play(seed);
    const second = play(seed);
    expect(first.phase.kind).toBe("ended");
    if (first.phase.kind === "ended") {
      expect(ENDING_IDS).toContain(first.phase.ending);
    }
    expect(first.day).toBeLessThanOrEqual(31);
    expect(second).toEqual(first);
  });

  test("the scripted policy reaches arrival for some seed, so the numbers stay winnable", () => {
    const seeds = Array.from({ length: 40 }, (_, index) => index + 1);
    const arrived = seeds.some((seed) => {
      const run = play(seed);
      return run.phase.kind === "ended" && run.phase.ending === "arrival";
    });
    expect(arrived).toBe(true);
  });
});
