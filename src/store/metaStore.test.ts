import { describe, expect, test } from "vitest";
import type { RankingEntry } from "../engine/types";
import { createMetaStore, EMPTY_META, RANKING_CAP } from "./metaStore";
import { createPersistence } from "./persistence";
import { memoryStorage } from "./testStorage";

const entry = (overrides: Partial<RankingEntry>): RankingEntry => ({
  id: "id",
  name: "테스트",
  origin: "origin_mercenary",
  ending: "retire",
  score: 0,
  day: 1,
  hardMode: false,
  ranked: true,
  finishedAt: "2026-09-06T00:00:00.000Z",
  ...overrides,
});

const setup = () => {
  const persistence = createPersistence(memoryStorage());
  return { persistence, store: createMetaStore(persistence) };
};

describe("createMetaStore", () => {
  test("starts from the persisted meta, or empty when none is saved", () => {
    const { persistence, store } = setup();
    expect(store.getState().meta).toEqual(EMPTY_META);
    store.getState().recordMonster("wild_boar");
    expect(createMetaStore(persistence).getState().meta.codex.monsters).toEqual(["wild_boar"]);
  });

  test("codex records are deduplicated and persisted", () => {
    const { persistence, store } = setup();
    const { recordEnding, recordItem, recordMonster } = store.getState();
    recordEnding("death");
    recordEnding("death");
    recordMonster("wild_boar");
    recordItem("rusty_sword");
    recordItem("healing_salve");
    recordItem("rusty_sword");
    const expected = {
      endings: ["death"],
      monsters: ["wild_boar"],
      items: ["rusty_sword", "healing_salve"],
    };
    expect(store.getState().meta.codex).toEqual(expected);
    expect(persistence.loadMeta()?.codex).toEqual(expected);
  });

  test("ranking sorts by score desc then finishedAt asc and keeps the top entries", () => {
    const { persistence, store } = setup();
    const { addRanking } = store.getState();
    addRanking(entry({ id: "low", score: 10 }));
    addRanking(entry({ id: "late", score: 50, finishedAt: "2026-09-06T02:00:00.000Z" }));
    addRanking(entry({ id: "early", score: 50, finishedAt: "2026-09-06T01:00:00.000Z" }));
    addRanking(entry({ id: "unranked", score: 999, ranked: false }));
    const ids = store.getState().meta.ranking.map((item) => item.id);
    expect(ids).toEqual(["unranked", "early", "late", "low"]);
    expect(persistence.loadMeta()?.ranking.map((item) => item.id)).toEqual(ids);
  });

  test("ranking is capped at RANKING_CAP entries, dropping the lowest", () => {
    const { store } = setup();
    for (let index = 0; index <= RANKING_CAP; index += 1) {
      store.getState().addRanking(entry({ id: `r${index}`, score: index }));
    }
    const ranking = store.getState().meta.ranking;
    expect(ranking).toHaveLength(RANKING_CAP);
    expect(ranking.at(-1)?.score).toBe(1);
  });

  test("reset clears the codex and ranking and persists the empty meta", () => {
    const { persistence, store } = setup();
    store.getState().recordEnding("death");
    store.getState().addRanking(entry({}));
    store.getState().reset();
    expect(store.getState().meta).toEqual(EMPTY_META);
    expect(persistence.loadMeta()).toEqual(EMPTY_META);
  });
});
