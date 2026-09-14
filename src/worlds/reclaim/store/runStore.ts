// 회차 스토어 — 모든 액션은 규칙 호출 한 번을 감싸고 성공 때마다 저장한다. 거부는
// 예외가 아니라 결과다: lastReason에 사유를 남기고 상태(과 세이브)는 그대로 둔다.
// 종결에 도달하면 회차 슬롯을 비우고 onEnding 콜백으로 metaStore에 기록을 남긴다 —
// 스토어끼리 직접 import하지 않고 콜백 주입으로만 잇는다(순환 import 금지).

import { createStore, type StoreApi } from "zustand/vanilla";
import { CONTENT } from "../content";
import type { ActionId, EndingId } from "../ids";
import { applyAction, availableActions, startRun } from "../rules/run";
import type { Content, Placement, RunState } from "../types";
import { metaStore } from "./metaStore";
import { persistence, type RunPersistence } from "./persistence";

export type RunStoreDeps = {
  readonly content: Content;
  readonly persistence: RunPersistence;
  /** 회차를 시작할 때 한 번 — metaStore의 runs 카운트가 센다. */
  readonly onStart: () => void;
  /** 종결에 도달할 때 한 번 — metaStore에 엔딩을 기록한다. */
  readonly onEnding: (ending: EndingId) => void;
};

export type RunStore = {
  readonly run: RunState | null;
  /** 마지막 거부 사유 — content의 deny 문면이거나 규칙의 안내 문면이다. */
  readonly lastReason: string | null;
  /** 지금 목록에 올라가는 액션(규칙의 availableActions 파생값). */
  readonly availableActions: readonly ActionId[];
  /** 진행 중인 회차를 갈아치운다. */
  readonly start: (placement?: Placement) => void;
  readonly act: (id: ActionId) => void;

  /** 루의 말을 끊는다 — 그때까지 보인 단어 수를 적고, 뒷말은 회차에 남겨 두지 않는다. */
  readonly cutLine: (key: string, words: number) => void;
  /** 저장된 회차가 있는지 — 타이틀 화면의 이어하기 조건. */
  readonly hasSave: () => boolean;
  /** 세이브를 복원한다. 저장된 것이 없으면 false. */
  readonly resume: () => boolean;
  /** 회차와 그 세이브를 버린다. 회차 간 기록(meta)은 건드리지 않는다. */
  readonly reset: () => void;
};

export const createRunStore = (deps: RunStoreDeps): StoreApi<RunStore> =>
  createStore<RunStore>((set, get) => {
    const { content } = deps;

    const commit = (run: RunState): void => {
      if (run.terminal !== null) {
        deps.persistence.clear();
        deps.onEnding(run.terminal);
      } else {
        deps.persistence.save(run);
      }
      set({ run, lastReason: null, availableActions: availableActions(run) });
    };

    return {
      run: null,
      lastReason: null,
      availableActions: [],

      start: (placement) => {
        deps.onStart();
        commit(startRun(content, placement));
      },

      act: (id) => {
        const { run } = get();
        if (run === null) {
          return;
        }
        const outcome = applyAction(run, id, content);
        if (!outcome.ok) {
          set({ lastReason: outcome.reason });
          return;
        }
        commit(outcome.run);
      },

      cutLine: (key, words) => {
        const { run } = get();
        if (run === null || run.cutLines.some((line) => line.key === key)) {
          return;
        }
        commit({ ...run, cutLines: [...run.cutLines, { key, words }] });
      },

      hasSave: () => deps.persistence.load() !== null,

      resume: () => {
        const saved = deps.persistence.load();
        if (saved === null) {
          return false;
        }
        set({ run: saved, lastReason: null, availableActions: availableActions(saved) });
        return true;
      },

      reset: () => {
        deps.persistence.clear();
        set({ run: null, lastReason: null, availableActions: [] });
      },
    };
  });

export const runStore: StoreApi<RunStore> = createRunStore({
  content: CONTENT,
  persistence,
  onStart: () => metaStore.getState().recordRun(),
  onEnding: (ending) => metaStore.getState().recordEnding(ending),
});
