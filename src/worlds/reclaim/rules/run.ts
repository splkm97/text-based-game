// 회차 리듀서 — 일감 구조(2026-09-14)의 순서 기계. 순수 함수만 있다:
// React·zustand·DOM·Date·Math.random 금지. 가드 데이터는 actions.ts의 ACTION_SPECS
// (정본 actions.md 표), 문면은 콘텐츠가 정본이고 UI는 guard를 재구현하지 않고
// availableActions만 호출한다.
//
// 화면 해상도: chainStep이 null이 아니면 체인 절차가 진행 중이고 일감 화면은 모두 닫힌다
// (actions.ts의 atStep이 상호 배타를 강제한다). 일감 완료(completeJob)는 다음 일감
// 사무실을 그 아래 깔아 두므로, 대기 체인이 비는 순간 사무실이 열린다.

import type { ActionId, JobId } from "../ids";
import { ACTION_IDS, JOB_IDS } from "../ids";
import type { ActionOutcome, Content, LogPlace, Placement, RunState } from "../types";
import { ACTION_SPECS, cleanupGrade, RECHANCE_LIMIT, REVIEW_LIMIT } from "./actions";

export { cleanupGrade, RECHANCE_LIMIT, REVIEW_LIMIT };

const TERMINAL_GUIDE = "회차가 이미 종결되었다";

/** 새 회차 — 첫 일감(gwanak)의 사무실(표 「공통」 초기값). 아침 조회는 장면에서 열리고
 * (officeStage scene·오늘 한 면담 없음·면담 밖), 배치 기본값은 ru_first(계획 §3.2). */
export const startRun = (_content: Content, placement: Placement = "ru_first"): RunState => ({
  placement,
  jobIndex: 0,
  jobStep: "office",
  officeStage: "scene",
  talks: [],
  interview: null,
  cutLines: [],
  party: [],
  cleanupPicks: [],
  characters: {
    dusik: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
    ru: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
    banjang: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
    taesan: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
  },
  pendingChain: [],
  chainStep: null,
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

/** 로그 위치의 일감 — 성공한 액션의 when은 jobIndex를 0..3으로 묶으므로 여기서 벗어나면
 * 상태 기계의 불변식이 깨진 것이다(조용히 잘못된 위치를 기록하지 않는다). */
const jobAt = (index: number): JobId => {
  const job = JOB_IDS[index];
  if (job === undefined) throw new Error(`일감 목록 밖의 위치: ${index}`);
  return job;
};

/** 액션 하나를 적용한다. 거부 시 입력을 그대로 돌려주고 사유를 붙인다.
 * chances는 0 아래로, reviews는 REVIEW_LIMIT 위로 가지 않는다. 성공 시 로그에는
 * 액션이 일어난 위치(일감 단계면 그 일감, 체인 절차면 그 절차)와 결과 문면을 남긴다. */
export const applyAction = (run: RunState, id: ActionId, content: Content): ActionOutcome => {
  if (run.terminal !== null) {
    return { run, ok: false, reason: TERMINAL_GUIDE };
  }
  const spec = ACTION_SPECS[id];
  if (!spec.when(run) || (spec.require !== undefined && !spec.require(run))) {
    return { run, ok: false, reason: content.actions[id].deny };
  }
  const delta = spec.apply(run);
  const place: LogPlace =
    run.chainStep !== null
      ? { kind: "chain", chain: run.chainStep }
      : { kind: "job", job: jobAt(run.jobIndex) };
  return {
    run: {
      ...run,
      ...delta,
      chances: Math.max(0, delta.chances ?? run.chances),
      reviews: Math.min(REVIEW_LIMIT, delta.reviews ?? run.reviews),
      log: [...run.log, { place, text: content.actions[id].result }],
    },
    ok: true,
    reason: null,
  };
};
