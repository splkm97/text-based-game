// 액션 가드 표 — 데모 route-combined-demo.html ACTIONS(122-228)의 when/require/run을
// ActionId에 대해 total하게 옮긴 것이다. 배치 delta(계획 §3.2): ru_first는 xcheck → gate,
// dusik_first는 xcheck → venue이며 venue 단계에서 gate_* 액션과 venue_* 액션이 함께 열린다.
// gate_to_venue는 ru_first의 gate에서만 열린다. 순수 술어·데이터 — Date·Math.random 금지.

import type { ActionId, StageId } from "../ids";
import type { RunState } from "../types";

/** 협회 본부 방문 상한(계획 §3.6, game-mechanics 정본과 같은 커밋에서 갱신한다). */
export const REVIEW_LIMIT = 3;
/** 재등장 기회 — 회차 시작값이자 상한. */
export const RECHANCE_LIMIT = 2;

export type ActionSpec = {
  readonly when: (run: RunState) => boolean;
  readonly require?: (run: RunState) => boolean;
  readonly apply: (run: RunState) => Partial<RunState>;
};

/** 루 관문 단계: gate는 항상, dusik_first에서는 venue도 관문 액션을 함께 연다. */
const gateStage = (run: RunState): boolean =>
  run.stage === "gate" || (run.placement === "dusik_first" && run.stage === "venue");

/** 교차 대조 뒤의 목적지 — 두 배치가 갈라지는 유일한 간선. */
const afterXcheck = (run: RunState): StageId => (run.placement === "ru_first" ? "gate" : "venue");

const archiveOpen = (run: RunState): boolean =>
  run.stage === "archive" && run.reviews < REVIEW_LIMIT;

export const ACTION_SPECS: Readonly<Record<ActionId, ActionSpec>> = {
  call_respond: {
    when: (run) => run.stage === "field",
    apply: () => ({ stage: "office" }),
  },

  dispatch_send_taesan: {
    when: (run) => run.stage === "office",
    apply: () => ({ dispatchTaesan: true, stage: "obs" }),
  },
  dispatch_send_other: {
    when: (run) => run.stage === "office",
    apply: () => ({ dispatchTaesan: false, stage: "obs" }),
  },

  obs_send_ru_alone: {
    when: (run) => run.stage === "obs",
    apply: () => ({ clue: true, stage: "radio" }),
  },
  obs_boss_joins: {
    when: (run) => run.stage === "obs",
    apply: (run) => ({ stage: "radio", chances: run.chances - 1 }),
  },
  obs_send_other: {
    when: (run) => run.stage === "obs",
    apply: (run) => ({ stage: "radio", chances: run.chances - 1 }),
  },

  radio_morning_on: {
    when: (run) => run.stage === "radio",
    apply: (run) =>
      run.dispatchTaesan ? { broadcast: true, stage: "archive" } : { stage: "archive" },
  },
  radio_business_only: {
    when: (run) => run.stage === "radio",
    apply: () => ({ stage: "archive" }),
  },

  archive_with_dusik: {
    when: archiveOpen,
    apply: (run) => ({ documents: true, reviews: run.reviews + 1 }),
  },
  archive_with_ru: {
    when: archiveOpen,
    apply: (run) => ({ relic: true, reviews: run.reviews + 1 }),
  },
  archive_with_taesan: {
    when: archiveOpen,
    apply: (run) => ({ reviews: run.reviews + 1 }),
  },
  archive_alone: {
    when: archiveOpen,
    apply: (run) => ({ banjangSeed: true, reviews: run.reviews + 1 }),
  },
  archive_leave: {
    when: (run) => run.stage === "archive",
    require: (run) => run.reviews >= 1,
    apply: () => ({ stage: "xcheck" }),
  },

  xcheck_compare: {
    when: (run) => run.stage === "xcheck",
    require: (run) => run.broadcast && run.documents,
    apply: (run) => ({ coord: true, stage: afterXcheck(run) }),
  },
  xcheck_skip: {
    when: (run) => run.stage === "xcheck",
    apply: (run) => ({ stage: afterXcheck(run) }),
  },

  gate_dispatch: {
    when: gateStage,
    require: (run) => run.clue,
    apply: () => ({ stage: "site" }),
  },
  gate_hold: {
    when: gateStage,
    require: (run) => run.clue,
    apply: () => ({ terminal: "death" }),
  },
  gate_reopen: {
    when: gateStage,
    require: (run) => !run.clue && run.chances > 0,
    apply: () => ({ stage: "obs" }),
  },
  gate_to_venue: {
    when: (run) => run.stage === "gate" && run.placement === "ru_first",
    require: (run) => !run.clue,
    apply: () => ({ stage: "venue" }),
  },

  site_hold: {
    when: (run) => run.stage === "site",
    apply: () => ({ contact: true, stage: "night" }),
  },
  site_process: {
    when: (run) => run.stage === "site",
    apply: () => ({ terminal: "general" }),
  },
  site_with_taesan: {
    when: (run) => run.stage === "site",
    apply: () => ({ terminal: "general" }),
  },

  night_use: {
    when: (run) => run.stage === "night",
    require: (run) => run.relic,
    apply: () => ({ terminal: "true_ru" }),
  },
  night_not_use: {
    when: (run) => run.stage === "night",
    apply: () => ({ terminal: "general" }),
  },
  night_no_item: {
    when: (run) => run.stage === "night",
    require: (run) => !run.relic,
    apply: () => ({ terminal: "general" }),
  },

  venue_military: {
    when: (run) => run.stage === "venue",
    require: (run) => run.documents && run.broadcast && run.coord && !run.gunLocked,
    apply: () => ({ stage: "gun" }),
  },
  venue_association: {
    when: (run) => run.stage === "venue",
    require: (run) => run.documents,
    apply: () => ({ terminal: "death" }),
  },
  venue_government: {
    when: (run) => run.stage === "venue",
    require: (run) => run.documents,
    apply: () => ({ terminal: "gov" }),
  },
  venue_press: {
    when: (run) => run.stage === "venue",
    require: (run) => run.documents,
    apply: () => ({ terminal: "press" }),
  },
  venue_silence: {
    when: (run) => run.stage === "venue",
    apply: () => ({ terminal: "death" }),
  },
  venue_no_stage: {
    when: (run) => run.stage === "venue",
    require: (run) => !run.documents,
    apply: () => ({ terminal: "routine" }),
  },

  gun_with_taesan: {
    when: (run) => run.stage === "gun",
    apply: () => ({ stage: "submit" }),
  },
  gun_with_banjang: {
    when: (run) => run.stage === "gun",
    apply: () => ({ stage: "venue", gunLocked: true }),
  },

  submit_original: {
    when: (run) => run.stage === "submit",
    apply: () => ({ terminal: "true_dusik" }),
  },
  submit_copy: {
    when: (run) => run.stage === "submit",
    apply: () => ({ terminal: "true_dusik" }),
  },
};
