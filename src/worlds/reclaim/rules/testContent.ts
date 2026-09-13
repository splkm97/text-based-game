// 규칙 테스트용 최소 콘텐츠 픽스처 — 프로덕션이 import하지 않는다. 실제 콘텐츠를 흉내내지 않고
// 판별 가능한 짧은 문자열만 둔다: 거부·결과 문면이 id를 따라가므로 리듀서가 정확한 카드의
// 문면을 골랐는지 문자열 비교로 검증된다. Record 키는 리터럴이라 union total이 컴파일로 강제된다.

import type { ActionId, CharacterId, EndingId, StageId } from "../ids";
import type { ActionText, CharacterCard, Content, EndingCard, RunState, StageCard } from "../types";
import { RECHANCE_LIMIT } from "./run";

const stageCard = (id: StageId): StageCard => ({
  id,
  title: `제목 ${id}`,
  document: {
    heading: `문서 ${id}`,
    meta: [`메타 ${id}`],
    items: [`항목 ${id}`],
    tail: `끝 ${id}`,
  },
  prompt: `지시 ${id}`,
  partyLines: [],
});

const actionText = (id: ActionId): ActionText => ({
  id,
  label: `선택 ${id}`,
  deny: `거부 ${id}`,
  result: `결과 ${id}`,
});

const endingCard = (id: EndingId): EndingCard => ({
  id,
  title: `종결 ${id}`,
  text: `본문 ${id}`,
  epilogue: [],
});

const characterCard = (id: CharacterId): CharacterCard => ({
  id,
  name: `이름 ${id}`,
  role: `역할 ${id}`,
  voice: `목소리 ${id}`,
  card: `카드 ${id}`,
});

export const TEST_CONTENT: Content = {
  stages: {
    field: stageCard("field"),
    office: stageCard("office"),
    obs: stageCard("obs"),
    radio: stageCard("radio"),
    archive: stageCard("archive"),
    xcheck: stageCard("xcheck"),
    gate: stageCard("gate"),
    site: stageCard("site"),
    night: stageCard("night"),
    venue: stageCard("venue"),
    gun: stageCard("gun"),
    submit: stageCard("submit"),
  },
  actions: {
    call_respond: actionText("call_respond"),
    dispatch_send_taesan: actionText("dispatch_send_taesan"),
    dispatch_send_other: actionText("dispatch_send_other"),
    obs_send_ru_alone: actionText("obs_send_ru_alone"),
    obs_boss_joins: actionText("obs_boss_joins"),
    obs_send_other: actionText("obs_send_other"),
    radio_morning_on: actionText("radio_morning_on"),
    radio_business_only: actionText("radio_business_only"),
    archive_with_dusik: actionText("archive_with_dusik"),
    archive_with_ru: actionText("archive_with_ru"),
    archive_with_taesan: actionText("archive_with_taesan"),
    archive_alone: actionText("archive_alone"),
    archive_leave: actionText("archive_leave"),
    xcheck_compare: actionText("xcheck_compare"),
    xcheck_skip: actionText("xcheck_skip"),
    gate_dispatch: actionText("gate_dispatch"),
    gate_hold: actionText("gate_hold"),
    gate_reopen: actionText("gate_reopen"),
    gate_to_venue: actionText("gate_to_venue"),
    site_hold: actionText("site_hold"),
    site_process: actionText("site_process"),
    site_with_taesan: actionText("site_with_taesan"),
    night_use: actionText("night_use"),
    night_not_use: actionText("night_not_use"),
    night_no_item: actionText("night_no_item"),
    venue_military: actionText("venue_military"),
    venue_association: actionText("venue_association"),
    venue_government: actionText("venue_government"),
    venue_press: actionText("venue_press"),
    venue_silence: actionText("venue_silence"),
    venue_no_stage: actionText("venue_no_stage"),
    gun_with_taesan: actionText("gun_with_taesan"),
    gun_with_banjang: actionText("gun_with_banjang"),
    submit_original: actionText("submit_original"),
    submit_copy: actionText("submit_copy"),
  },
  endings: {
    true_ru: endingCard("true_ru"),
    true_dusik: endingCard("true_dusik"),
    death: endingCard("death"),
    gov: endingCard("gov"),
    press: endingCard("press"),
    taesan: endingCard("taesan"),
    general: endingCard("general"),
    routine: endingCard("routine"),
  },
  characters: {
    dusik: characterCard("dusik"),
    ru: characterCard("ru"),
    banjang: characterCard("banjang"),
    taesan: characterCard("taesan"),
  },
};

/** startRun과 같은 기본값의 회차. 테스트는 원하는 지점만 overrides로 연다. */
export const makeRun = (overrides: Partial<RunState> = {}): RunState => ({
  placement: "ru_first",
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
  ...overrides,
});
