// 규칙 테스트용 최소 콘텐츠 픽스처 — 프로덕션이 import하지 않는다. 실제 콘텐츠를 흉내내지 않고
// 판별 가능한 짧은 문자열만 둔다: 거부·결과 문면이 id를 따라가므로 리듀서가 정확한 카드의
// 문면을 골랐는지 문자열 비교로 검증된다. Record 키는 리터럴이라 union total이 컴파일로 강제된다.

import type { ActionId, ChainStepId, CharacterId, EndingId, JobId } from "../ids";
import type {
  ActionText,
  ChainCard,
  CharacterCard,
  CharacterState,
  Content,
  EndingCard,
  JobCard,
  RunState,
  StageDocument,
} from "../types";
import { RECHANCE_LIMIT } from "./run";

const documentOf = (id: string): StageDocument => ({
  heading: `문서 ${id}`,
  meta: [`메타 ${id}`],
  items: [`항목 ${id}`],
  tail: `끝 ${id}`,
});

const jobCard = (id: JobId): JobCard => ({
  id,
  title: `제목 ${id}`,
  office: { prompt: `지문 ${id}`, news: `뉴스 ${id}`, printer: `프린터 ${id}`, chatter: [] },
  briefing: { prompt: `지문 ${id}`, document: documentOf(id), talk: [] },
  party: { prompt: `인원 ${id}`, notes: [] },
  cleanup: { prompt: `지침 ${id}` },
  site: { title: `현장 ${id}`, document: documentOf(id), prompt: `지시 ${id}`, partyLines: [] },
});

const chainCard = (id: ChainStepId): ChainCard => ({
  id,
  title: `제목 ${id}`,
  document: documentOf(id),
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
  jobs: {
    gwanak: jobCard("gwanak"),
    observatory: jobCard("observatory"),
    hq: jobCard("hq"),
    ruins: jobCard("ruins"),
  },
  chains: {
    xcheck: chainCard("xcheck"),
    gate: chainCard("gate"),
    night: chainCard("night"),
    venue: chainCard("venue"),
    gun: chainCard("gun"),
    submit: chainCard("submit"),
  },
  actions: {
    office_printer: actionText("office_printer"),
    briefing_ack: actionText("briefing_ack"),
    party_pick_dusik: actionText("party_pick_dusik"),
    party_pick_ru: actionText("party_pick_ru"),
    party_pick_banjang: actionText("party_pick_banjang"),
    party_pick_taesan: actionText("party_pick_taesan"),
    party_reset: actionText("party_reset"),
    party_go: actionText("party_go"),
    cleanup_pick_sign: actionText("cleanup_pick_sign"),
    cleanup_pick_power: actionText("cleanup_pick_power"),
    cleanup_pick_search: actionText("cleanup_pick_search"),
    cleanup_pick_photo: actionText("cleanup_pick_photo"),
    cleanup_finish: actionText("cleanup_finish"),
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
    general: endingCard("general"),
    routine: endingCard("routine"),
  },
  characters: {
    dusik: characterCard("dusik"),
    ru: characterCard("ru"),
    banjang: characterCard("banjang"),
    taesan: characterCard("taesan"),
  },
  cleanupTasks: {
    sign: "작업 sign",
    power: "작업 power",
    search: "작업 search",
    photo: "작업 photo",
  },
};

/** 4명 균일 초기 인물 상태(0/0/false) — startRun과 같은 기본값이다. */
export const zeroCharacters = (): Readonly<Record<CharacterId, CharacterState>> => ({
  dusik: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
  ru: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
  banjang: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
  taesan: { fatigue: 0, injured: false, suspicion: 0, trust: 0 },
});

/** startRun과 같은 기본값의 회차. 테스트는 원하는 지점만 overrides로 연다. */
export const makeRun = (overrides: Partial<RunState> = {}): RunState => ({
  placement: "ru_first",
  jobIndex: 0,
  jobStep: "office",
  party: [],
  cleanupPicks: [],
  characters: zeroCharacters(),
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
  ...overrides,
});
