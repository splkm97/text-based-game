// The run store: every action wraps one rules call and autosaves the result. Rules errors never
// reach React; they land in `lastError` for the UI to display.

import { createStore, type StoreApi } from "zustand/vanilla";
import { createRng } from "../../../shared/rng";
import { CONTENT } from "../content";
import { RulesError, type RulesErrorCode } from "../rules/errors";
import * as rules from "../rules/run";
import type { Action, Content, EventId, Rng, RunState } from "../types";
import { type Persistence, persistence } from "./persistence";

export type RunStoreDeps = {
  readonly content: Content;
  readonly now: () => number;
  readonly makeRng: (seed: number) => Rng;
  readonly persistence: Persistence;
};

export type RunStore = {
  readonly run: RunState | null;
  readonly rng: Rng;
  readonly lastError: RulesErrorCode | null;
  /** Replaces any run in progress; `firstEvent` forces day 1's observe draw (editor test play). */
  readonly startRun: (firstEvent?: EventId) => void;
  /** comms -> observe; night -> the next day. */
  readonly continueRun: () => void;
  readonly choose: (index: number) => void;
  readonly act: (action: Action) => void;
  readonly endDay: () => void;
  /** Whether a saved run exists; the title screen shows 이어하기 on it. */
  readonly hasSave: () => boolean;
  /** Restores the save and reseeds the rng. False when nothing is saved. */
  readonly resume: () => boolean;
  /** Drops the run and its save. */
  readonly abandon: () => void;
};

export const createRunStore = (deps: RunStoreDeps): StoreApi<RunStore> =>
  createStore<RunStore>((set, get) => {
    const { content } = deps;

    const commit = (run: RunState): void => {
      if (run.phase.kind === "ended") {
        deps.persistence.clear();
      } else {
        deps.persistence.save(run);
      }
      set({ run, lastError: null });
    };

    const guarded = (action: () => void): void => {
      try {
        action();
      } catch (error) {
        if (!(error instanceof RulesError)) {
          throw error;
        }
        set({ lastError: error.code });
      }
    };

    const transition = (step: (run: RunState, rng: Rng) => RunState): void =>
      guarded(() => {
        const { run, rng } = get();
        if (run === null) {
          throw new RulesError("INVALID_PHASE", "no run in progress");
        }
        commit(step(run, rng));
      });

    return {
      run: null,
      rng: deps.makeRng(deps.now()),
      lastError: null,
      startRun: (firstEvent) =>
        guarded(() => {
          const rng = deps.makeRng(deps.now());
          set({ rng });
          commit(rules.startRun(content, rng, firstEvent));
        }),
      continueRun: () => transition((run, rng) => rules.continueRun(run, content, rng)),
      choose: (index) => transition((run) => rules.chooseOption(run, index, content)),
      act: (action) => transition((run, rng) => rules.performAction(run, action, content, rng)),
      endDay: () => transition((run, rng) => rules.endDay(run, content, rng)),
      hasSave: () => deps.persistence.load() !== null,
      resume: () => {
        const saved = deps.persistence.load();
        if (saved === null) {
          return false;
        }
        set({ run: saved, rng: deps.makeRng(deps.now()), lastError: null });
        return true;
      },
      abandon: () => {
        deps.persistence.clear();
        set({ run: null, lastError: null });
      },
    };
  });

export const runStore: StoreApi<RunStore> = createRunStore({
  content: CONTENT,
  now: Date.now,
  makeRng: createRng,
  persistence,
});
