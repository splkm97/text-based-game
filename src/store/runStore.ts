// The run store: every action wraps one engine call, autosaves the result, and feeds the meta
// store. Engine errors never reach React; they land in `lastError` for the UI to display.

import { createStore, type StoreApi } from "zustand/vanilla";
import { CONTENT } from "../content";
import { type CreateCharacterInput, createCharacter } from "../engine/character";
import { attemptFlee, combatRound } from "../engine/combat";
import { EngineError, type EngineErrorCode } from "../engine/errors";
import { createRng } from "../engine/rng";
import * as engine from "../engine/run";
import type {
  ContentRegistry,
  EquipSlot,
  ItemId,
  JourneyId,
  RankingEntry,
  Rng,
  RunPhase,
  RunState,
  StatId,
} from "../engine/types";
import { type MetaStoreApi, metaStore } from "./metaStore";
import { type Persistence, persistence } from "./persistence";
import { uuid } from "./uuid";

export type NewRunInput = CreateCharacterInput & {
  readonly hardMode: boolean;
  readonly journeys: readonly JourneyId[];
};

export type RunStoreDeps = {
  readonly content: ContentRegistry;
  readonly now: () => number;
  readonly makeRng: (seed: number) => Rng;
  readonly persistence: Persistence;
  readonly meta: MetaStoreApi;
};

export type RunStore = {
  readonly run: RunState | null;
  readonly rng: Rng;
  readonly lastError: EngineErrorCode | null;
  readonly startRun: (input: NewRunInput) => void;
  readonly choose: (index: number) => void;
  readonly continueRun: () => void;
  readonly fight: () => void;
  readonly flee: () => void;
  readonly buy: (item: ItemId) => void;
  readonly sell: (item: ItemId) => void;
  readonly leaveShop: () => void;
  readonly equip: (item: ItemId) => void;
  readonly unequip: (slot: EquipSlot) => void;
  readonly use: (item: ItemId) => void;
  readonly spendPoint: (stat: StatId) => void;
  /** Same as the autosave; exists for the explicit 저장 button. */
  readonly save: () => void;
  /** Whether a saved run exists; the title screen shows 이어하기 on it. */
  readonly hasSave: () => boolean;
  /** Manual 불러오기: increments `loadCount` and reseeds the rng. False when nothing is saved. */
  readonly load: () => boolean;
  /** 이어하기 after a reload: restores the save and reseeds the rng without counting a load. */
  readonly resume: () => boolean;
  /** Drops the run and its save. No ranking entry is written. */
  readonly abandon: () => void;
};

type Ended = Extract<RunPhase, { kind: "ended" }>;

const rankingEntry = (run: RunState, phase: Ended, now: number): RankingEntry => ({
  id: uuid(),
  name: run.character.name,
  origin: run.character.origin,
  ending: phase.ending,
  score: phase.score,
  day: run.day,
  hardMode: run.hardMode,
  ranked: phase.ranked,
  finishedAt: new Date(now).toISOString(),
});

const gainedItems = (before: RunState | null, after: RunState): readonly ItemId[] => {
  const had = before?.character.inventory ?? [];
  return after.character.inventory.filter((item) => !had.includes(item));
};

export const createRunStore = (deps: RunStoreDeps): StoreApi<RunStore> =>
  createStore<RunStore>((set, get) => {
    const { content } = deps;

    /** Meta hooks and autosave for one accepted transition. */
    const record = (before: RunState | null, after: RunState): void => {
      const meta = deps.meta.getState();
      for (const item of gainedItems(before, after)) {
        meta.recordItem(item);
      }
      if (after.phase.kind === "combat" && before?.phase.kind !== "combat") {
        meta.recordMonster(after.phase.combat.monster);
      }
      if (after.phase.kind === "ended") {
        meta.recordEnding(after.phase.ending);
        meta.addRanking(rankingEntry(after, after.phase, deps.now()));
        deps.persistence.clearRun();
        return;
      }
      deps.persistence.saveRun(after);
    };

    const commit = (before: RunState | null, after: RunState): void => {
      record(before, after);
      set({ run: after, lastError: null });
    };

    const guarded = (action: () => void): void => {
      try {
        action();
      } catch (error) {
        if (!(error instanceof EngineError)) {
          throw error;
        }
        set({ lastError: error.code });
      }
    };

    const transition = (step: (run: RunState, rng: Rng) => RunState): void =>
      guarded(() => {
        const { run, rng } = get();
        if (run === null) {
          throw new EngineError("INVALID_PHASE", "no run in progress");
        }
        commit(run, step(run, rng));
      });

    return {
      run: null,
      rng: deps.makeRng(deps.now()),
      lastError: null,
      startRun: (input) =>
        guarded(() => {
          const rng = deps.makeRng(deps.now());
          const character = createCharacter(input, content);
          const run = engine.startRun(
            { character, hardMode: input.hardMode, journeys: input.journeys },
            content,
            rng,
          );
          set({ rng });
          commit(null, run);
        }),
      choose: (index) => transition((run, rng) => engine.chooseOption(run, index, content, rng)),
      continueRun: () => transition((run, rng) => engine.continueRun(run, content, rng)),
      fight: () => transition((run, rng) => combatRound(run, content, rng)),
      flee: () => transition((run, rng) => attemptFlee(run, content, rng)),
      buy: (item) => transition((run) => engine.buyItem(run, item, content)),
      sell: (item) => transition((run) => engine.sellItem(run, item, content)),
      leaveShop: () => transition((run) => engine.leaveShop(run, content)),
      equip: (item) => transition((run) => engine.equipItem(run, item, content)),
      unequip: (slot) => transition((run) => engine.unequipItem(run, slot, content)),
      use: (item) => transition((run) => engine.consumeItem(run, item, content)),
      spendPoint: (stat) => transition((run) => engine.spendStatPoint(run, stat)),
      save: () => {
        const { run } = get();
        if (run !== null && run.phase.kind !== "ended") {
          deps.persistence.saveRun(run);
        }
      },
      hasSave: () => deps.persistence.loadRun() !== null,
      load: () => {
        const saved = deps.persistence.loadRun();
        if (saved === null) {
          return false;
        }
        const run = { ...saved, loadCount: saved.loadCount + 1 };
        deps.persistence.saveRun(run);
        set({ run, rng: deps.makeRng(deps.now()), lastError: null });
        return true;
      },
      resume: () => {
        const saved = deps.persistence.loadRun();
        if (saved === null) {
          return false;
        }
        set({ run: saved, rng: deps.makeRng(deps.now()), lastError: null });
        return true;
      },
      abandon: () => {
        deps.persistence.clearRun();
        set({ run: null, lastError: null });
      },
    };
  });

export const runStore: StoreApi<RunStore> = createRunStore({
  content: CONTENT,
  now: Date.now,
  makeRng: createRng,
  persistence,
  meta: metaStore,
});
