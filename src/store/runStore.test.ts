import { describe, expect, test } from "vitest";
import {
  constantRng,
  fixedRolls,
  makeHero,
  makeRun,
  TEST_ALLOCATION,
  TEST_CONTENT,
} from "../engine/testContent";
import type { Rng, RunState } from "../engine/types";
import { createMetaStore } from "./metaStore";
import { createPersistence } from "./persistence";
import { createRunStore, type NewRunInput } from "./runStore";
import { memoryStorage } from "./testStorage";

const NOW = Date.parse("2026-09-06T12:00:00.000Z");

const newRunInput: NewRunInput = {
  name: "테스트",
  origin: "origin_mercenary",
  trait: "strong_arms",
  allocation: TEST_ALLOCATION,
  hardMode: false,
  journeys: [],
};

type Setup = { readonly saved?: RunState; readonly rng?: Rng };

/** Real persistence over an in-memory storage; `seeds` records every rng reseed. */
const setup = ({ saved, rng = constantRng(0) }: Setup = {}) => {
  const persistence = createPersistence(memoryStorage());
  if (saved !== undefined) {
    persistence.saveRun(saved);
  }
  const seeds: number[] = [];
  const meta = createMetaStore(persistence);
  const store = createRunStore({
    content: TEST_CONTENT,
    now: () => NOW,
    makeRng: (seed) => {
      seeds.push(seed);
      return rng;
    },
    persistence,
    meta,
  });
  return { store, meta, persistence, seeds, state: () => store.getState() };
};

const resolution = (overrides: Partial<RunState> = {}): RunState =>
  makeRun({ phase: { kind: "resolution", text: "끝", effectsLog: [] }, ...overrides });

describe("startRun", () => {
  test("creates the character, seeds the rng from now, autosaves, and records starting items", () => {
    const { state, persistence, meta, seeds } = setup();
    state().startRun(newRunInput);
    const run = state().run;
    expect(run).toMatchObject({
      day: 1,
      loadCount: 0,
      phase: { kind: "event", event: "ev_crossroad" },
      character: {
        name: "테스트",
        stats: { ...TEST_ALLOCATION, str: 10 },
        inventory: ["rusty_sword"],
      },
    });
    // One seed at construction, one fresh seed for the new run.
    expect(seeds).toEqual([NOW, NOW]);
    expect(persistence.loadRun()).toEqual(run);
    expect(meta.getState().meta.codex.items).toEqual(["rusty_sword"]);
    expect(state().lastError).toBeNull();
  });

  test("an invalid allocation leaves no run and reports the error code", () => {
    const { state, persistence } = setup();
    state().startRun({ ...newRunInput, allocation: { ...TEST_ALLOCATION, str: 20 } });
    expect(state().run).toBeNull();
    expect(state().lastError).toBe("INVALID_ALLOCATION");
    expect(persistence.loadRun()).toBeNull();
  });
});

describe("start, choose, continue", () => {
  test("each step advances the run and autosaves it", () => {
    const { state, persistence } = setup();
    state().startRun(newRunInput);
    state().choose(0);
    expect(state().run?.phase).toMatchObject({ kind: "resolution", text: "잠시 쉬었다." });
    expect(state().run?.character).toMatchObject({ xp: 5, hp: 27 });
    expect(persistence.loadRun()).toEqual(state().run);
    state().continueRun();
    expect(state().run).toMatchObject({ day: 2, phase: { kind: "event" } });
    expect(persistence.loadRun()).toEqual(state().run);
  });
});

describe("ending", () => {
  test("flows into the codex and ranking and clears the save, keeping the run in memory", () => {
    const saved = resolution({
      character: makeHero({ hp: 0, xp: 40, gold: 12 }),
      day: 7,
      kills: 2,
    });
    const { state, persistence, meta } = setup({ saved });
    state().load();
    state().continueRun();
    expect(state().run?.phase).toEqual({
      kind: "ended",
      ending: "death",
      score: 456,
      ranked: true,
    });
    expect(persistence.loadRun()).toBeNull();
    const { codex, ranking } = meta.getState().meta;
    expect(codex.endings).toEqual(["death"]);
    expect(ranking).toHaveLength(1);
    expect(ranking[0]).toMatchObject({
      name: "테스트",
      origin: "origin_mercenary",
      ending: "death",
      score: 456,
      day: 7,
      hardMode: false,
      ranked: true,
      finishedAt: "2026-09-06T12:00:00.000Z",
    });
    expect(ranking[0]?.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(persistence.loadMeta()).toEqual(meta.getState().meta);
  });

  test("a run loaded three times is recorded unranked", () => {
    const { state, meta } = setup({ saved: resolution({ character: makeHero({ hp: 0 }) }) });
    state().load();
    state().load();
    state().load();
    state().continueRun();
    expect(state().run?.phase).toMatchObject({ kind: "ended", ranked: false });
    expect(meta.getState().meta.ranking[0]?.ranked).toBe(false);
  });
});

describe("load", () => {
  test("increments loadCount, persists it, and reseeds the rng", () => {
    const { state, persistence, seeds } = setup({ saved: makeRun() });
    expect(seeds).toHaveLength(1);
    expect(state().load()).toBe(true);
    expect(state().run?.loadCount).toBe(1);
    expect(persistence.loadRun()?.loadCount).toBe(1);
    expect(seeds).toEqual([NOW, NOW]);
  });

  test("hasSave reflects the persisted slot without touching it", () => {
    expect(setup({ saved: makeRun() }).state().hasSave()).toBe(true);
    expect(setup().state().hasSave()).toBe(false);
  });

  test("without a save it returns false and changes nothing", () => {
    const { state } = setup();
    expect(state().load()).toBe(false);
    expect(state().run).toBeNull();
    expect(state().lastError).toBeNull();
  });
});

describe("combat", () => {
  test("encountering a monster records it in the codex", () => {
    const { state, meta } = setup({ saved: makeRun() });
    state().load();
    state().choose(2);
    expect(state().run?.phase).toMatchObject({ kind: "combat", combat: { monster: "wild_boar" } });
    expect(meta.getState().meta.codex.monsters).toEqual(["wild_boar"]);
  });

  test("fight resolves the round and a drop is recorded as an obtained item", () => {
    const { state, meta } = setup({ saved: makeRun(), rng: fixedRolls(20) });
    state().load();
    state().choose(2);
    state().fight();
    expect(state().run).toMatchObject({ kills: 1, phase: { kind: "resolution" } });
    expect(state().run?.character.inventory).toContain("healing_salve");
    expect(meta.getState().meta.codex.items).toContain("healing_salve");
  });

  test("flee and use are dispatched to the combat engine", () => {
    const { state } = setup({ saved: makeRun(), rng: fixedRolls(20) });
    state().load();
    state().choose(2);
    state().use("rusty_sword");
    expect(state().lastError).toBe("INVALID_ITEM");
    state().flee();
    expect(state().run?.phase).toMatchObject({ kind: "resolution", text: "숲으로 달아났다." });
    expect(state().lastError).toBeNull();
  });
});

describe("shop and character actions", () => {
  test("buy, sell, and leaveShop", () => {
    const { state, meta } = setup({ saved: makeRun() });
    state().load();
    state().choose(3);
    state().buy("healing_salve");
    expect(state().run?.character).toMatchObject({
      gold: 20,
      inventory: ["rusty_sword", "healing_salve"],
    });
    expect(meta.getState().meta.codex.items).toContain("healing_salve");
    state().sell("rusty_sword");
    expect(state().run?.character).toMatchObject({ gold: 30, inventory: ["healing_salve"] });
    state().leaveShop();
    expect(state().run?.phase).toMatchObject({ kind: "resolution", text: "행상인과 헤어졌다." });
  });

  test("equip, unequip, use, and spendPoint", () => {
    const saved = makeRun({
      character: makeHero({
        hp: 20,
        pendingStatPoints: 1,
        inventory: ["rusty_sword", "healing_salve"],
      }),
    });
    const { state } = setup({ saved });
    state().load();
    state().equip("rusty_sword");
    expect(state().run?.character.equipment.mainHand).toBe("rusty_sword");
    state().unequip("mainHand");
    expect(state().run?.character.equipment.mainHand).toBeNull();
    state().use("healing_salve");
    expect(state().run?.character).toMatchObject({ hp: 25, inventory: ["rusty_sword"] });
    state().spendPoint("agi");
    expect(state().run?.character).toMatchObject({ pendingStatPoints: 0, stats: { agi: 7 } });
  });
});

describe("errors", () => {
  test("an engine error leaves the run untouched and is cleared by the next success", () => {
    const { state, persistence } = setup({ saved: makeRun() });
    state().load();
    const before = state().run;
    state().equip("kite_shield");
    expect(state().lastError).toBe("ITEM_NOT_IN_INVENTORY");
    expect(state().run).toBe(before);
    expect(persistence.loadRun()).toEqual(before);
    state().choose(0);
    expect(state().lastError).toBeNull();
  });

  test("actions without a run report INVALID_PHASE instead of throwing", () => {
    const { state } = setup();
    expect(() => state().choose(0)).not.toThrow();
    expect(state().lastError).toBe("INVALID_PHASE");
  });

  test("a non-EngineError from a dependency propagates and leaves run and lastError untouched", () => {
    const persistence = createPersistence(memoryStorage());
    persistence.saveRun(makeRun());
    const meta = createMetaStore(persistence);
    const store = createRunStore({
      content: TEST_CONTENT,
      now: () => NOW,
      makeRng: () => () => {
        throw new Error("boom");
      },
      persistence,
      meta,
    });
    store.getState().load();
    store.getState().choose(2); // deterministic: enters combat without touching the rng
    const before = store.getState().run;
    expect(() => store.getState().fight()).toThrow("boom");
    expect(store.getState().run).toBe(before);
    expect(store.getState().lastError).toBeNull();
  });
});

describe("save and abandon", () => {
  test("save rewrites the current run; abandon clears the run and the save without ranking", () => {
    const { state, persistence, meta } = setup({ saved: makeRun() });
    state().load();
    persistence.clearRun();
    state().save();
    expect(persistence.loadRun()).toEqual(state().run);
    state().abandon();
    expect(state().run).toBeNull();
    expect(persistence.loadRun()).toBeNull();
    expect(meta.getState().meta.ranking).toEqual([]);
  });

  test("save does not resurrect an ended run", () => {
    const { state, persistence } = setup({ saved: resolution({ character: makeHero({ hp: 0 }) }) });
    state().load();
    state().continueRun();
    state().save();
    expect(persistence.loadRun()).toBeNull();
  });
});
