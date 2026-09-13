// 회차 간 기록 스토어 — 종결별 도달 수와 시작한 회차 수. 회차 저장(run slot)과 달리
// 지우지 않는 한 계속 쌓인다. 시간은 `now` 주입으로만 얻는다(테스트 결정성, 순수 규칙 원칙
// 은 스토어에도 적용한다). 생성 시 저장된 기록을 내려받는다: 기록 화면은 resume 동작 없이
// 바로 읽는다.

import { createStore, type StoreApi } from "zustand/vanilla";
import type { EndingId } from "../ids";
import { type MetaPersistence, metaPersistence } from "./persistence";
import type { MetaState } from "./schemas";

const ZERO_SEEN: Readonly<Record<EndingId, number>> = {
  true_ru: 0,
  true_dusik: 0,
  death: 0,
  gov: 0,
  press: 0,
  general: 0,
  routine: 0,
};

const zeroMeta = (now: string): MetaState => ({
  endingsSeen: { ...ZERO_SEEN },
  runs: 0,
  updatedAt: now,
});

export type MetaStoreDeps = {
  readonly now: () => string;
  readonly persistence: MetaPersistence;
};

export type MetaStore = MetaState & {
  readonly recordRun: () => void;
  readonly recordEnding: (ending: EndingId) => void;
  /** 기록 전체를 0으로 돌리고 슬롯을 비운다. */
  readonly reset: () => void;
};

export const createMetaStore = (deps: MetaStoreDeps): StoreApi<MetaStore> =>
  createStore<MetaStore>((set, get) => {
    const initial = deps.persistence.load() ?? zeroMeta(deps.now());

    const commit = (meta: MetaState): void => {
      deps.persistence.save(meta);
      set(meta);
    };

    return {
      ...initial,
      recordRun: () => {
        const { runs, endingsSeen } = get();
        commit({ runs: runs + 1, endingsSeen, updatedAt: deps.now() });
      },
      recordEnding: (ending) => {
        const { runs, endingsSeen } = get();
        commit({
          runs,
          endingsSeen: { ...endingsSeen, [ending]: endingsSeen[ending] + 1 },
          updatedAt: deps.now(),
        });
      },
      reset: () => {
        deps.persistence.clear();
        set(zeroMeta(deps.now()));
      },
    };
  });

export const metaStore: StoreApi<MetaStore> = createMetaStore({
  now: () => new Date().toISOString(),
  persistence: metaPersistence,
});
