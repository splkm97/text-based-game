// Meta state that outlives a run: the codex and the ranking. Every change is persisted.

import { createStore, type StoreApi } from "zustand/vanilla";
import type { EndingId, ItemId, MetaState, MonsterId, RankingEntry } from "../engine/types";
import { type Persistence, persistence } from "./persistence";

export const RANKING_CAP = 50;

export const EMPTY_META: MetaState = {
  codex: { endings: [], monsters: [], items: [] },
  ranking: [],
};

export type MetaStore = {
  readonly meta: MetaState;
  readonly recordEnding: (ending: EndingId) => void;
  readonly recordMonster: (monster: MonsterId) => void;
  readonly recordItem: (item: ItemId) => void;
  readonly addRanking: (entry: RankingEntry) => void;
  readonly reset: () => void;
};

export type MetaStoreApi = StoreApi<MetaStore>;

const append = <T>(list: readonly T[], value: T): readonly T[] =>
  list.includes(value) ? list : [...list, value];

/** Score descending, earlier finish first among equals. `finishedAt` is ISO 8601, so plain
 * ordering compares chronologically without a locale-dependent collation. */
const byRank = (a: RankingEntry, b: RankingEntry): number =>
  b.score - a.score || (a.finishedAt < b.finishedAt ? -1 : a.finishedAt > b.finishedAt ? 1 : 0);

export const createMetaStore = (store: Persistence): MetaStoreApi =>
  createStore<MetaStore>((set, get) => {
    const update = (change: (meta: MetaState) => MetaState): void => {
      const meta = change(get().meta);
      store.saveMeta(meta);
      set({ meta });
    };
    const updateCodex = (change: (codex: MetaState["codex"]) => MetaState["codex"]): void =>
      update((meta) => ({ ...meta, codex: change(meta.codex) }));
    return {
      meta: store.loadMeta() ?? EMPTY_META,
      recordEnding: (ending) =>
        updateCodex((codex) => ({ ...codex, endings: append(codex.endings, ending) })),
      recordMonster: (monster) =>
        updateCodex((codex) => ({ ...codex, monsters: append(codex.monsters, monster) })),
      recordItem: (item) =>
        updateCodex((codex) => ({ ...codex, items: append(codex.items, item) })),
      addRanking: (entry) =>
        update((meta) => ({
          ...meta,
          ranking: [...meta.ranking, entry].toSorted(byRank).slice(0, RANKING_CAP),
        })),
      reset: () => update(() => EMPTY_META),
    };
  });

export const metaStore: MetaStoreApi = createMetaStore(persistence);
