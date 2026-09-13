// 회차 리듀서 — 데모 route-combined-demo.html reduce()의 타입드 직역. 순수 함수만 있다:
// React·zustand·DOM·Date·Math.random 금지. 가드 데이터는 actions.ts, 문면은 콘텐츠가 정본이고
// UI는 guard를 재구현하지 않고 availableActions만 호출한다.

import type { ActionId } from "../ids";
import { ACTION_IDS } from "../ids";
import type { ActionOutcome, Content, LogEntry, Placement, RunState } from "../types";
import { ACTION_SPECS, RECHANCE_LIMIT, REVIEW_LIMIT } from "./actions";

export { RECHANCE_LIMIT, REVIEW_LIMIT };

const TERMINAL_GUIDE = "회차가 이미 종결되었다";

/** 새 회차: 첫 출동 대기 상태. 배치 기본값은 ru_first(계획 §3.2, 캐논 확정 시 이 한 줄만 바꾼다). */
export const startRun = (_content: Content, placement: Placement = "ru_first"): RunState => ({
  placement,
  stage: "field",
  terminal: null,
  dispatchTaesan: false,
  broadcast: false,
  documents: false,
  coord: false,
  gunLocked: false,
  clue: false,
  relic: false,
  banjangSeed: false,
  reviews: 0,
  chances: RECHANCE_LIMIT,
  contact: false,
  log: [],
});

/** 지금 목록에 올라가는 액션. require는 클릭 뒤 거부 사유로 판명되므로 when만 본다(데모와 같다). */
export const availableActions = (run: RunState): readonly ActionId[] =>
  run.terminal === null ? ACTION_IDS.filter((id) => ACTION_SPECS[id].when(run)) : [];

/** 액션 하나를 적용한다. 거부 시 입력을 그대로 돌려주고 사유를 붙인다.
 * chances는 0 아래로, reviews는 REVIEW_LIMIT 위로 가지 않는다(계획 §3.3). */
export const applyAction = (run: RunState, id: ActionId, content: Content): ActionOutcome => {
  if (run.terminal !== null) {
    return { run, ok: false, reason: TERMINAL_GUIDE };
  }
  const spec = ACTION_SPECS[id];
  if (!spec.when(run) || (spec.require !== undefined && !spec.require(run))) {
    return { run, ok: false, reason: content.actions[id].deny };
  }
  const delta = spec.apply(run);
  const entry: LogEntry = {
    step: run.log.length + 1,
    stage: delta.stage ?? run.stage,
    text: content.actions[id].result,
  };
  return {
    run: {
      ...run,
      ...delta,
      chances: Math.max(0, delta.chances ?? run.chances),
      reviews: Math.min(REVIEW_LIMIT, delta.reviews ?? run.reviews),
      log: [...run.log, entry],
    },
    ok: true,
    reason: null,
  };
};
