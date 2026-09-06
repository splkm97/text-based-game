import { describe, expect, test } from "vitest";
import { memoryStorage } from "../../../shared/storage";
import { constantRng, makeRun, TEST_CONTENT } from "../rules/testContent";
import { createPersistence } from "./persistence";
import { createRunStore } from "./runStore";

const NOW = Date.parse("2026-09-06T12:00:00.000Z");

/** Real persistence over an in-memory storage; `seeds` records every rng reseed. */
const setup = (storage = memoryStorage()) => {
  const persistence = createPersistence(storage);
  const seeds: number[] = [];
  const store = createRunStore({
    content: TEST_CONTENT,
    now: () => NOW,
    makeRng: (seed) => {
      seeds.push(seed);
      return constantRng(0.99);
    },
    persistence,
  });
  return { store, persistence, seeds, state: () => store.getState() };
};

describe("startRun", () => {
  test("lands on day 1 comms, seeds the rng from now, and autosaves", () => {
    const { state, persistence, seeds } = setup();
    state().startRun();
    expect(state().run).toMatchObject({ day: 1, ap: 2, phase: { kind: "comms", arrived: [] } });
    // One seed at construction, one fresh seed for the new run.
    expect(seeds).toEqual([NOW, NOW]);
    expect(persistence.load()).toEqual(state().run);
    expect(state().lastError).toBeNull();
  });
});

describe("one full day", () => {
  test("comms -> observe -> act (two actions) -> night -> day 2 comms, autosaving each step", () => {
    const { state, persistence } = setup();
    state().startRun();
    state().continueRun();
    expect(state().run?.phase).toEqual({ kind: "observe", event: "ev_test" });
    state().choose(0);
    expect(state().run).toMatchObject({ trust: 75, phase: { kind: "act" } });
    state().act({ kind: "talk", crew: "cook" });
    state().act({ kind: "talk", crew: "cook" });
    expect(state().run?.ap).toBe(0);
    expect(persistence.load()).toEqual(state().run);
    state().endDay();
    expect(state().run?.phase.kind).toBe("night");
    state().continueRun();
    expect(state().run).toMatchObject({
      day: 2,
      ap: 2,
      phase: { kind: "comms", arrived: ["m_fever"] },
      knownSymptoms: { confirmed: ["fever"], retracted: [] },
    });
    expect(persistence.load()).toEqual(state().run);
  });

  test("a rules error leaves the run and its save untouched, and the next success clears it", () => {
    const { state, persistence } = setup();
    state().startRun();
    state().continueRun();
    const before = state().run;
    state().choose(1); // gated on trust 90
    expect(state().lastError).toBe("INVALID_CHOICE");
    expect(state().run).toBe(before);
    expect(persistence.load()).toEqual(before);
    state().choose(0);
    expect(state().lastError).toBeNull();
    state().act({ kind: "talk", crew: "cook" });
    state().act({ kind: "talk", crew: "cook" });
    state().act({ kind: "talk", crew: "cook" });
    expect(state().lastError).toBe("NO_AP");
  });

  test("actions without a run report INVALID_PHASE instead of throwing", () => {
    const { state } = setup();
    expect(() => state().endDay()).not.toThrow();
    expect(state().lastError).toBe("INVALID_PHASE");
  });
});

describe("save round trip", () => {
  test("a fresh store over the same storage resumes the saved run and reseeds the rng", () => {
    const storage = memoryStorage();
    const first = setup(storage);
    first.state().startRun();
    first.state().continueRun();
    first.state().choose(0);
    const saved = first.state().run;

    const second = setup(storage);
    expect(second.state().run).toBeNull();
    expect(second.state().hasSave()).toBe(true);
    expect(second.state().resume()).toBe(true);
    expect(second.state().run).toEqual(saved);
    expect(second.seeds).toEqual([NOW, NOW]);
  });

  test("without a save, resume returns false and abandon clears run and save", () => {
    const { state, persistence } = setup();
    expect(state().hasSave()).toBe(false);
    expect(state().resume()).toBe(false);
    state().startRun();
    state().abandon();
    expect(state().run).toBeNull();
    expect(persistence.load()).toBeNull();
  });

  test("an ending clears the save but keeps the run in memory", () => {
    const { state, persistence } = setup();
    // Day 30's night pushes the day past arrival.
    persistence.save(makeRun({ day: 30 }));
    state().resume();
    state().endDay();
    state().continueRun();
    expect(state().run?.phase).toMatchObject({ kind: "ended", ending: "arrival" });
    expect(persistence.load()).toBeNull();
  });
});
