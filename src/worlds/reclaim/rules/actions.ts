// 액션 가드 표 — actions.md(동결)의 when/require/apply를 ActionId에 대해 total하게 옮긴 것이다.
// 라벨·거부·결과 문면은 콘텐츠 소유고 이 표는 의미만 고정한다(상태 축은 화면에 숫자로 나오지
// 않는다). 순수 술어·데이터 — Date·Math.random 금지. 체인 대기 조건(표 마지막 절)은
// completeJob이 일감 완료 시점에 평가한다.
//
// 라디오 두 행(radio_morning_on·radio_business_only)은 hq의 사무실 아침이다 — jobIndex 2에서는
// office_printer가 열리지 않고 라디오 두 갈래가 그 자리를 대신한다("듣지 않음"이 명시된 선택).
// 사무실의 모든 출구는 아침 조회의 사람들 화면에서만 열린다(위 「아침 조회」 절).
// 배태산이 파견 중일 때만 좌표를 받아 적을 손이 있다(broadcast = dispatchTaesan). gate_to_venue는
// A(ru_first)의 관문에서 단서 없이 수신자 무대로 넘어가는 안전 밸브다.

import type {
  ActionId,
  ChainStepId,
  CharacterId,
  CleanupGrade,
  JobStepId,
  TalkChoice,
} from "../ids";
import { CHARACTER_IDS, CLEANUP_TASK_IDS, JOB_IDS } from "../ids";
import type { CharacterState, RunState } from "../types";
import { CLEANUP_FORBIDDEN, CLEANUP_KINDS, CLEANUP_REQUIRED } from "./cleanupKinds";

/** 협회 본부 방문 상한. */
export const REVIEW_LIMIT = 3;
/** 재등장 기회 — 회차 시작값이자 상한. */
export const RECHANCE_LIMIT = 2;

export type ActionSpec = {
  readonly when: (run: RunState) => boolean;
  readonly require?: (run: RunState) => boolean;
  readonly apply: (run: RunState) => Partial<RunState>;
};

// ---------------------------------------------------------------------------
// 공용 헬퍼 — 표 「공통」 절의 기계. apply는 자기 플래그를 먼저 깐 중간 상태를
// completeJob에 넘겨 완료 시점 평가(체인 대기 포함)를 그대로 태운다.
// ---------------------------------------------------------------------------

/** 일감 단계 판별 — 체인 절차 진행 중에는 일감 화면이 열리지 않는다(상호 배타). */
const atStep = (run: RunState, step: JobStepId): boolean =>
  run.chainStep === null && run.jobStep === step;

/** 인원 선택 자격: 결장 아님 + 미선택 + 정원 2(표 인원 선택 절). */
const canPick = (run: RunState, id: CharacterId): boolean =>
  !run.characters[id].injured && !run.party.includes(id) && run.party.length < 2;

/** 루 관문 단계 — 데모 gateStage: gate는 항상, dusik_first는 venue 단계에서도 함께 연다. */
const gateStage = (run: RunState): boolean =>
  run.chainStep === "gate" || (run.placement === "dusik_first" && run.chainStep === "venue");

/** 중복 금지 FIFO — 대기열에 없을 때만 맨 뒤에 넣는다. */
export const enqueueChain = (
  pending: readonly ChainStepId[],
  chain: ChainStepId,
): readonly ChainStepId[] => (pending.includes(chain) ? pending : [...pending, chain]);

/** 다음 대기 절차를 chainStep으로 올린다 — 비었으면 체인 흐름을 닫는다(null). */
export const popChain = (run: RunState): Partial<RunState> => {
  const [head, ...rest] = run.pendingChain;
  return head === undefined
    ? { pendingChain: [], chainStep: null }
    : { pendingChain: rest, chainStep: head };
};

/** 일감 완료의 인물 증감: 동행 fatigue+1·trust+1, 비동행 fatigue−1(0 하한). */
const settleCharacters = (run: RunState): Record<CharacterId, CharacterState> => {
  const next = { ...run.characters };
  for (const id of CHARACTER_IDS) {
    const c = run.characters[id];
    next[id] = run.party.includes(id)
      ? { ...c, fatigue: c.fatigue + 1, trust: c.trust + 1 }
      : // 결장한 사람은 한 일감을 쉬고 돌아온다: 부상은 그 일감을 마치는 것으로 낫지 않는다.
        { ...c, fatigue: Math.max(0, c.fatigue - 1), injured: false };
  }
  return next;
};

/** 위험 선택의 부상 — 동행의 첫 사람이 다친다(대상을 고정해 결정적으로; 다음 일감을 결장한다). */
const injureFirstOfParty = (run: RunState): Record<CharacterId, CharacterState> => {
  const next = partySuspecting(run);
  const first = run.party[0];
  if (first === undefined) return next;
  return { ...next, [first]: { ...next[first], injured: true } };
};

/** 상실 신호의 인물 쪽 — 동행자 전원 suspicion+1, trust−1(0 하한). 대상을 고르지 않는
 * 결정적 규칙이라 규칙과 테스트가 이 문장 위에 선다. */
const partySuspecting = (run: RunState): Record<CharacterId, CharacterState> => {
  const next = { ...run.characters };
  for (const id of run.party) {
    const c = next[id];
    next[id] = { ...c, suspicion: c.suspicion + 1, trust: Math.max(0, c.trust - 1) };
  }
  return next;
};

/**
 * 뒷정리 등급 — 일감마다 규칙 종류가 다르다(`CLEANUP_KINDS`).
 * - order(관악): 네 작업 전부를 지침 순서 그대로 — 첫 둘이 어긋나면 poor, 전부 맞으면 perfect,
 *   그 사이는 partial.
 * - subset·count(관측소·폐허): 필수 집합(`CLEANUP_REQUIRED`)이 다 갖춰지지 않으면 아직 등급이
 *   없다(null). 다 갖추면 그 집합 그대로일 때 perfect, 더 얹었으면(순서 무관) partial —
 *   벌점은 없다.
 * - exclude(문서고): 필수 집합이 다 갖춰지지 않으면 null. 갖췄는데 금지 작업(`CLEANUP_FORBIDDEN`)도
 *   손댔으면 poor, 아니면 perfect — partial은 없다(금지는 이분법이다).
 */
export const cleanupGrade = (run: RunState): CleanupGrade | null => {
  const picks = run.cleanupPicks;
  const job = JOB_IDS[run.jobIndex];
  if (job === undefined) return null;
  const kind = CLEANUP_KINDS[job];

  if (kind === "order") {
    if (picks.length !== CLEANUP_TASK_IDS.length) return null;
    const [first, second] = CLEANUP_TASK_IDS;
    if (picks[0] !== first || picks[1] !== second) return "poor";
    return CLEANUP_TASK_IDS.every((task, index) => picks[index] === task) ? "perfect" : "partial";
  }

  const required = CLEANUP_REQUIRED[job];
  if (required === undefined) return null;
  const pickedSet = new Set(picks);
  if (!required.every((task) => pickedSet.has(task))) return null;

  if (kind === "exclude") {
    const forbidden = CLEANUP_FORBIDDEN[job];
    return forbidden !== undefined && pickedSet.has(forbidden) ? "poor" : "perfect";
  }
  return pickedSet.size === required.length ? "perfect" : "partial";
};

/** 위험 선택의 인물 쪽 — 안전 조치를 먼저 세운 현장(perfect 뒷정리)에서는 다치지 않는다.
 * 상실 신호(동행자 전원 suspicion+1·trust−1)는 등급과 무관하게 그대로 남는다. */
const riskCharacters = (run: RunState): Record<CharacterId, CharacterState> =>
  cleanupGrade(run) === "perfect" ? partySuspecting(run) : injureFirstOfParty(run);

/**
 * 일감 완료(표 「공통」·마지막 절). 동행 증감 → 체인 대기 조건 평가 → 대기가 있으면 그
 * 머리를 chainStep으로 올리고 다음 일감 사무실은 그 아래 깔아 둔다(체인이 비면 사무실이
 * 열린다). 마지막 일감이면 일감 흐름을 닫는다: 위치는 마지막 site에 두고 pendingChain
 * 소진만 남는다 — 폐허 완료는 항상 night을 남기고 night은 반드시 종결하므로 빈 대기로
 * 되돌아오지 않는다.
 */
export const completeJob = (run: RunState): Partial<RunState> => {
  const isLast = run.jobIndex === JOB_IDS.length - 1;
  let pending = run.pendingChain;
  if (run.jobIndex === 2) {
    // 본부(hq) 완료 — 배치별 대기 조건(표 마지막 절):
    // A(ru_first)는 관문이 수신자보다 먼저 서고, B(dusik_first)는 수신자가 먼저 서서
    // 그 단계에서 gate_*가 함께 열린다(단서를 쥔 B도 venue에 오른다).
    if (run.broadcast && run.documents) pending = enqueueChain(pending, "xcheck");
    if (run.placement === "ru_first") {
      if (run.clue) pending = enqueueChain(pending, "gate");
      // 문서를 못 챙긴 회차도 수신자 허브에 선다 — 무대 미개방은 venue_no_stage가 일상 엔딩으로 닫는다
      // (원장 종결 라우팅 3항). 단서 보유 회차가 venue에 서지 못하는 구조적 배타는 clue 조건이 지킨다.
      else pending = enqueueChain(pending, "venue");
    } else {
      pending = enqueueChain(pending, "venue"); // B는 clue·documents 무관 — 그 단계에서 gate_*가 함께 열린다
    }
  }
  if (run.jobIndex === JOB_IDS.length - 1 && run.contact) {
    pending = enqueueChain(pending, "night"); // 폐허 완료 && contact — 심야 재통합
  }
  const characters = settleCharacters(run);
  const head = pending[0];
  if (head !== undefined) {
    const drained: Partial<RunState> = {
      characters,
      party: [],
      pendingChain: pending.slice(1),
      chainStep: head,
    };
    return isLast ? drained : { ...drained, jobIndex: run.jobIndex + 1, jobStep: "office" };
  }
  return isLast
    ? { characters, party: [] }
    : { characters, party: [], jobIndex: run.jobIndex + 1, jobStep: "office" };
};

// ---------------------------------------------------------------------------
// 아침 조회(면회실) — 사무실 단계의 하위 기계. 산문 화면(장면)을 덮고 사람들 쪽으로 건너간 뒤,
// 그 자리에서 말을 걸어 면담(응답 셋)을 열고 프린터로 나간다. 세 축(officeStage·talks·
// interview)은 office 단계 밖에서 뜻이 없다 — 사무실을 떠나는 apply는 셋을 초기값으로
// 되돌리고, 하루가 바뀌면 talks는 빈 목록에서 다시 시작한다(일감이 곧 하루다).
// ---------------------------------------------------------------------------

/** 사무실을 떠날 때의 되돌림 — office 밖에서는 장면·오늘 한 면담 없음·면담 없음으로 고정된다. */
const OFFICE_RESET: Partial<RunState> = { officeStage: "scene", talks: [], interview: null };

/** 사람들 화면 — 아침 조회의 둘째 화면. 면담이 열려 있으면 그 화면이 이 위에 덮인다. */
const atPeopleStage = (run: RunState): boolean =>
  atStep(run, "office") && run.officeStage === "people";

/** 사무실 밖으로 나가는 문 — 면담 중에는 닫힌다: 대화를 끊지 않고 프린터로 걸어갈 수 없다. */
const canLeaveOffice = (run: RunState): boolean => atPeopleStage(run) && run.interview === null;

/** 말 걸기 — 오늘 아직 이야기하지 않은 사람에게만 성사된다(하루 한 번). 버튼은 사람들 화면에
 * 남아 있고, 이미 이야기한 사람을 두드리면 그 카드의 거부 문면이 사유를 답한다. */
const talk = (id: CharacterId): ActionSpec => ({
  // 면담 중에는 다른 사람의 문도 닫는다 — 열려 있으면 면담 상대를 갈아 끼워 앞 대화를
  // 응답 없이 버릴 수 있다(화면이 덮여 보이지 않을 뿐, 상태 기계는 그 길을 열어 두면 안 된다).
  when: (run) => atPeopleStage(run) && run.interview === null,
  require: (run) => !run.talks.includes(id),
  apply: () => ({ interview: { character: id, choice: null } }),
});

/** 면담 응답 — 고른 응답은 그 상대에게만 남는다(0 하한). 가드는 만들지 않는다:
 * 이 세 축(fatigue·suspicion·trust)을 읽는 가드는 어디에도 없고, 여기서는 델타뿐이다. */
const reply = (choice: TalkChoice): ActionSpec => ({
  when: (run) => atStep(run, "office") && run.interview !== null && run.interview.choice === null,
  apply: (run) => {
    const interview = run.interview;
    if (interview === null) return {}; // when이 이미 막는다 — apply는 총체로 남긴다
    const c = run.characters[interview.character];
    const next: CharacterState =
      choice === "work"
        ? { ...c, suspicion: Math.max(0, c.suspicion - 1) }
        : choice === "comfort"
          ? { ...c, trust: c.trust + 1 }
          : { ...c, fatigue: Math.max(0, c.fatigue - 1) };
    return {
      interview: { character: interview.character, choice },
      characters: { ...run.characters, [interview.character]: next },
    };
  },
});

// ---------------------------------------------------------------------------
// ACTION_SPECS — actions.md 표 그대로. when은 목록에 올릴지, require는 클릭 뒤
// 성사 여부를 가른다.
// ---------------------------------------------------------------------------

const hqArchiveOpen = (run: RunState): boolean =>
  atStep(run, "site") && run.jobIndex === 2 && run.reviews < REVIEW_LIMIT;

const ruinsSite = (run: RunState): boolean => atStep(run, "site") && run.jobIndex === 3;

export const ACTION_SPECS: Readonly<Record<ActionId, ActionSpec>> = {
  // 사무실 office — 아침 조회: 장면(산문) → 사람들 → 면담 → 프린터.
  office_next: {
    when: (run) => atStep(run, "office") && run.officeStage === "scene",
    apply: () => ({ officeStage: "people" }),
  },
  office_printer: {
    when: (run) => canLeaveOffice(run) && run.jobIndex !== 2,
    apply: () => ({ jobStep: "briefing", ...OFFICE_RESET }),
  },
  talk_dusik: talk("dusik"),
  talk_ru: talk("ru"),
  talk_banjang: talk("banjang"),
  talk_taesan: talk("taesan"),
  interview_reply_work: reply("work"),
  interview_reply_comfort: reply("comfort"),
  interview_reply_joke: reply("joke"),
  interview_close: {
    when: (run) => atStep(run, "office") && run.interview !== null && run.interview.choice !== null,
    apply: (run) => {
      const interview = run.interview;
      if (interview === null) return {}; // when이 이미 막는다 — apply는 총체로 남긴다
      return { interview: null, talks: [...run.talks, interview.character] };
    },
  },

  // 파견 결정 — 관측소 일감의 사무실은 프린터 대신 사람을 지방으로 보내는 두 갈래다.
  dispatch_send_taesan: {
    when: (run) => canLeaveOffice(run) && run.jobIndex === 1,
    apply: () => ({ dispatchTaesan: true, jobStep: "briefing", ...OFFICE_RESET }),
  },
  dispatch_send_other: {
    when: (run) => canLeaveOffice(run) && run.jobIndex === 1,
    apply: () => ({ dispatchTaesan: false, jobStep: "briefing", ...OFFICE_RESET }),
  },

  // hq의 사무실 아침 — 프린터 대신 라디오 두 갈래가 공문을 당긴다(표 사무실 절).
  radio_morning_on: {
    when: (run) => canLeaveOffice(run) && run.jobIndex === 2,
    apply: (run) => ({ broadcast: run.dispatchTaesan, jobStep: "briefing", ...OFFICE_RESET }),
  },
  radio_business_only: {
    when: (run) => canLeaveOffice(run) && run.jobIndex === 2,
    apply: () => ({ jobStep: "briefing", ...OFFICE_RESET }),
  },

  // 공문 briefing
  briefing_ack: {
    when: (run) => atStep(run, "briefing"),
    apply: () => ({ jobStep: "party" }),
  },

  // 인원 선택 party
  party_pick_dusik: {
    when: (run) => atStep(run, "party"),
    require: (run) => canPick(run, "dusik"),
    apply: (run) => ({ party: [...run.party, "dusik"] }),
  },
  party_pick_ru: {
    when: (run) => atStep(run, "party"),
    require: (run) => canPick(run, "ru"),
    apply: (run) => ({ party: [...run.party, "ru"] }),
  },
  party_pick_banjang: {
    when: (run) => atStep(run, "party"),
    require: (run) => canPick(run, "banjang"),
    apply: (run) => ({ party: [...run.party, "banjang"] }),
  },
  party_pick_taesan: {
    when: (run) => atStep(run, "party"),
    require: (run) => canPick(run, "taesan"),
    apply: (run) => ({ party: [...run.party, "taesan"] }),
  },
  party_reset: {
    when: (run) => atStep(run, "party"),
    apply: () => ({ party: [] }),
  },
  party_go: {
    when: (run) => atStep(run, "party"),
    require: (run) => run.party.length >= 1,
    // 현장 앞에는 뒷정리(지침서 순서 맞추기)가 있다 — 새 일감의 순서는 빈 목록에서 시작한다.
    apply: () => ({ jobStep: "cleanup", cleanupPicks: [] }),
  },

  // 뒷정리 cleanup — 작업 넷 중 아직 고르지 않은 것만 목록에 선다(지침서에서 한 줄씩 지워
  // 나간다). 고른 차례가 그대로 등급이 되고, 완료 버튼은 넷을 다 고르기 전에도 남아 있어
  // 클릭이 카드의 거부 문면으로 답한다(닫힌 선택지에 사유를 붙이는 표의 방식).
  cleanup_pick_sign: {
    when: (run) => atStep(run, "cleanup") && !run.cleanupPicks.includes("sign"),
    apply: (run) => ({ cleanupPicks: [...run.cleanupPicks, "sign"] }),
  },
  cleanup_pick_power: {
    when: (run) => atStep(run, "cleanup") && !run.cleanupPicks.includes("power"),
    apply: (run) => ({ cleanupPicks: [...run.cleanupPicks, "power"] }),
  },
  cleanup_pick_search: {
    when: (run) => atStep(run, "cleanup") && !run.cleanupPicks.includes("search"),
    apply: (run) => ({ cleanupPicks: [...run.cleanupPicks, "search"] }),
  },
  cleanup_pick_photo: {
    when: (run) => atStep(run, "cleanup") && !run.cleanupPicks.includes("photo"),
    apply: (run) => ({ cleanupPicks: [...run.cleanupPicks, "photo"] }),
  },
  cleanup_finish: {
    when: (run) => atStep(run, "cleanup"),
    require: (run) => cleanupGrade(run) !== null,
    apply: () => ({ jobStep: "site" }),
  },

  // 현장 gwanak
  call_respond: {
    when: (run) => atStep(run, "site") && run.jobIndex === 0,
    apply: (run) => completeJob(run),
  },

  // 현장 observatory
  obs_send_ru_alone: {
    when: (run) => atStep(run, "site") && run.jobIndex === 1,
    require: (run) => run.party.includes("ru"),
    apply: (run) => ({ clue: true, ...completeJob(run) }),
  },
  obs_boss_joins: {
    when: (run) => atStep(run, "site") && run.jobIndex === 1,
    // 루가 동행이면 파편의 첫 기록은 루의 몫이다 — 사장이 먼저 기록하는 분기는 루 없이 간 현장에만 있다.
    require: (run) => !run.party.includes("ru"),
    apply: (run) => completeJob(run),
  },
  obs_send_other: {
    when: (run) => atStep(run, "site") && run.jobIndex === 1,
    require: (run) => !run.party.includes("ru"),
    // 상실 신호(chances −1·동행자 전원 suspicion+1·trust−1)를 깐 뒤 완료 처리(표의 화살표 순서).
    // 부상은 지침서 순서를 지킨 현장(perfect 뒷정리)에서만 면제된다 — 안전 조치가 먼저 서 있다.
    apply: (run) => {
      const after = { ...run, chances: run.chances - 1, characters: riskCharacters(run) };
      return { chances: run.chances - 1, ...completeJob(after) };
    },
  },

  // 현장 hq
  archive_with_dusik: {
    when: hqArchiveOpen,
    require: (run) => run.party.includes("dusik"),
    apply: (run) => ({ documents: true, reviews: run.reviews + 1 }),
  },
  archive_with_ru: {
    when: hqArchiveOpen,
    require: (run) => run.party.includes("ru"),
    apply: (run) => ({ relic: true, reviews: run.reviews + 1 }),
  },
  archive_with_taesan: {
    when: hqArchiveOpen,
    require: (run) => run.party.includes("taesan"),
    // 본부 일감이라 이 자리의 등급은 **이 일감의** 뒷정리 결과다(party_go가 일감마다 순서를 비운다).
    apply: (run) => ({
      chances: run.chances - 1,
      reviews: run.reviews + 1,
      characters: riskCharacters(run),
    }),
  },
  archive_alone: {
    when: hqArchiveOpen,
    require: (run) => run.party.includes("banjang"),
    apply: (run) => ({ banjangSeed: true, reviews: run.reviews + 1 }),
  },
  archive_leave: {
    when: (run) => atStep(run, "site") && run.jobIndex === 2,
    require: (run) => run.reviews >= 1,
    apply: (run) => completeJob(run),
  },

  // 현장 ruins — 마지막 일감
  site_hold: {
    when: ruinsSite,
    // 관찰 유보는 루가 먼저 손을 든 회차에만 성립한다 — 데모에서도 이 자리는 gate_dispatch(require clue)
    // 뒤에만 있었다. 폐허가 정규 일감이 된 지금 그 조건을 명시한다.
    require: (run) => run.clue,
    apply: (run) => {
      const after = { ...run, contact: true };
      return { contact: true, ...completeJob(after) };
    },
  },
  site_process: {
    when: ruinsSite,
    apply: () => ({ terminal: "general" }),
  },
  site_with_taesan: {
    when: ruinsSite,
    require: (run) => run.party.includes("taesan"),
    apply: () => ({ terminal: "general" }),
  },

  // 체인 xcheck
  xcheck_compare: {
    when: (run) => run.chainStep === "xcheck",
    require: (run) => run.broadcast && run.documents,
    apply: (run) => ({ coord: true, ...popChain(run) }),
  },
  xcheck_skip: {
    when: (run) => run.chainStep === "xcheck",
    apply: (run) => popChain(run),
  },

  // 체인 gate — when은 배치를 따른다(gateStage)
  gate_dispatch: {
    when: gateStage,
    require: (run) => run.clue,
    // 파견은 관문을 닫고 폐허 일감으로 넘긴다 — 심야는 그 현장을 마친 뒤의 일이다(표 「체인 대기 조건」 공통 줄).
    apply: (run) => popChain(run),
  },
  gate_hold: {
    when: gateStage,
    require: (run) => run.clue,
    apply: () => ({ terminal: "death" }),
  },
  gate_reopen: {
    when: gateStage,
    require: (run) => !run.clue && run.chances > 0,
    // 재등장은 **조합을 다시 고를 수 있는 자리**로 되돌린다: 기회는 요구 조합을 실제로 고를 수 있는
    // 디스패치에서만 소모된다(game-mechanics 「재등장」). 일감 1의 인원 선택으로 복귀한다.
    apply: (run) => ({
      chances: run.chances - 1,
      pendingChain: enqueueChain(run.pendingChain, "xcheck"),
      chainStep: null,
      jobIndex: 1,
      jobStep: "party",
    }),
  },
  gate_to_venue: {
    when: (run) => run.placement === "ru_first" && run.chainStep === "gate",
    require: (run) => !run.clue,
    apply: (run) => popChain({ ...run, pendingChain: enqueueChain(run.pendingChain, "venue") }),
  },

  // 체인 night
  night_use: {
    when: (run) => run.chainStep === "night",
    require: (run) => run.relic,
    apply: () => ({ terminal: "true_ru" }),
  },
  night_not_use: {
    when: (run) => run.chainStep === "night",
    apply: () => ({ terminal: "general" }),
  },
  night_no_item: {
    when: (run) => run.chainStep === "night",
    require: (run) => !run.relic,
    apply: () => ({ terminal: "general" }),
  },

  // 체인 venue
  venue_military: {
    when: (run) => run.chainStep === "venue",
    require: (run) => run.documents && run.broadcast && run.coord && !run.gunLocked,
    apply: (run) => popChain({ ...run, pendingChain: enqueueChain(run.pendingChain, "gun") }),
  },
  venue_association: {
    when: (run) => run.chainStep === "venue",
    require: (run) => run.documents,
    apply: () => ({ terminal: "death" }),
  },
  venue_government: {
    when: (run) => run.chainStep === "venue",
    require: (run) => run.documents,
    apply: () => ({ terminal: "gov" }),
  },
  venue_press: {
    when: (run) => run.chainStep === "venue",
    require: (run) => run.documents,
    apply: () => ({ terminal: "press" }),
  },
  venue_silence: {
    when: (run) => run.chainStep === "venue",
    apply: () => ({ terminal: "death" }),
  },
  venue_no_stage: {
    when: (run) => run.chainStep === "venue",
    require: (run) => !run.documents,
    apply: () => ({ terminal: "routine" }),
  },

  // 체인 gun
  gun_with_taesan: {
    when: (run) => run.chainStep === "gun",
    apply: (run) => popChain({ ...run, pendingChain: enqueueChain(run.pendingChain, "submit") }),
  },
  gun_with_banjang: {
    when: (run) => run.chainStep === "gun",
    apply: () => ({ gunLocked: true, chainStep: "venue" }), // 잠금 신호 — 수신자 무대로 되돌아간다
  },

  // 체인 submit
  submit_original: {
    when: (run) => run.chainStep === "submit",
    apply: () => ({ terminal: "true_dusik" }),
  },
  submit_copy: {
    when: (run) => run.chainStep === "submit",
    apply: () => ({ terminal: "true_dusik" }),
  },
};
