// Domain types of 복구 기록. Every field is readonly; state changes produce new objects.
// Content files may import only this file and ./ids.

import type { ActionId, ChainStepId, CharacterId, EndingId, JobId, JobStepId } from "./ids";

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

/** Which character the story foregrounds first; changes guards, not the id sets. */
export type Placement = "ru_first" | "dusik_first";

/** 로그 한 줄의 위치 — 일감(장소)이거나 일감 사이에 끼어든 체인 절차다. */
export type LogPlace =
  | { readonly kind: "job"; readonly job: JobId }
  | { readonly kind: "chain"; readonly chain: ChainStepId };

export type LogEntry = {
  readonly place: LogPlace;
  readonly text: string;
};

/** 일감 구조의 회차 상태 — 일감 목록 위치와 처리 순서, 이번 일감의 동행, 인물 상태, 대기 체인. */
export type RunState = {
  readonly placement: Placement;
  /** JOB_IDS에서의 위치(0..JOB_IDS.length-1) — 목록 순서가 곧 회차의 순서다. */
  readonly jobIndex: number;
  /** 이번 일감에서 진행 중인 순서 — 모든 일감이 office → briefing → party → site를 탄다. */
  readonly jobStep: JobStepId;
  /** 이번 일감의 동행. 인원 선택 전엔 빈 배열이고 최대 2명이다(설계 §5). */
  readonly party: readonly CharacterId[];
  readonly characters: Readonly<Record<CharacterId, CharacterState>>;
  /** 조건이 서서 대기 중인 체인 절차(선입선출) — 일감 사이에 끼어든다. */
  readonly pendingChain: readonly ChainStepId[];
  /** 지금 진행 중인 체인 절차. null이면 일감 단계 위에 있다. */
  readonly chainStep: ChainStepId | null;
  readonly terminal: EndingId | null;
  readonly dispatchTaesan: boolean;
  readonly broadcast: boolean;
  readonly documents: boolean;
  readonly coord: boolean;
  readonly gunLocked: boolean;
  readonly clue: boolean;
  readonly relic: boolean;
  readonly banjangSeed: boolean;
  readonly reviews: number;
  readonly chances: number;
  readonly contact: boolean;
  readonly log: readonly LogEntry[];
};

/** 인물 상태 — 화면에는 숫자로 나오지 않는다(설계 §4.1). 규칙 내부 값이며 문면·사유로만 드러난다. */
export type CharacterState = {
  /** 일감에 동행하면 오르고, 동행하지 않은 일감에서 내린다. 한계에 닿으면 현장 선택지 일부가 닫힌다. */
  readonly fatigue: number;
  /** 위험 선택의 결과. 다음 일감 인원 선택에서 제외되고, 1디스패치 뒤 복귀한다(사망 아님). */
  readonly injured: boolean;
  /** 자기가 모르는 것을 목격한 정도. 문턱을 넘으면 체인 절차에서 이탈 행동이 열린다. */
  readonly suspicion: number;
  /** 함께 일감을 마친 누적. 체인 절차의 협조 조건이 된다. */
  readonly trust: number;
};

// ---------------------------------------------------------------------------
// Content cards
// ---------------------------------------------------------------------------

/**
 * A안 문서 얼굴(prototype-briefing-format.html): heading은 발신명의·문서명, meta는
 * 부서·문서번호·수신·제목 같은 작은 머리 줄, items는 번호 항목(`<ol>` 본문), tail은
 * 직인생략·붙임·끝 같은 문서 끝 줄. 모든 문자열은 플레인 리터럴이다.
 */
export type StageDocument = {
  readonly heading: string;
  readonly meta: readonly string[];
  readonly items: readonly string[];
  readonly tail: string;
};

/** 인물 한 줄 대사 — 사무실 잡담·공문 첫마디·인원 메모·현장·체인 문면의 공통 형태. */
export type TalkLine = {
  readonly character: CharacterId;
  readonly text: string;
};

/** 사무실 단계 카드 — 장면 지문, 뉴스 한 줄, 프린터 한 줄, 잡담 목록. */
export type OfficeCard = {
  /** 사무실 장면의 1인칭 아침 지문. */
  readonly prompt: string;
  readonly news: string;
  readonly printer: string;
  readonly chatter: readonly TalkLine[];
};

/** 전체화면 공문 단계 카드 — 공문 위에 놓는 1인칭 지문과 문서 얼굴, 사장의 첫마디. */
export type BriefingCard = {
  /** 어느 아침인지 알리는 장면 묘사 — 화면의 첫 블록이다. */
  readonly prompt: string;
  readonly document: StageDocument;
  readonly talk: readonly TalkLine[];
};

/** 인원 선택 단계 카드 — 선택 지시와 인물별 참고 메모. */
export type PartyCard = {
  readonly prompt: string;
  readonly notes: readonly TalkLine[];
};

/** 현장 단계 카드 — 사건 제목, 현장 문서, 지시, 동행 대사. */
export type SiteCard = {
  readonly title: string;
  /** 현장에서 보는 문서·단말기 문면(회사 미처리 목록, 지침서, 회신 문면 등). */
  readonly document: StageDocument;
  readonly prompt: string;
  /** **동행 대사** — 화면은 `run.party`에 든 인물의 줄만 렌더한다(데려가지 않은 사람은 말하지 않는다). */
  readonly partyLines: readonly TalkLine[];
};

/** 일감 하나의 카드 — 네 단계(office → briefing → party → site)의 콘텐츠 한 묶음. */
export type JobCard = {
  readonly id: JobId;
  readonly title: string;
  readonly office: OfficeCard;
  readonly briefing: BriefingCard;
  readonly party: PartyCard;
  readonly site: SiteCard;
};

/** 체인 절차 하나의 카드 — 일감 사이에 끼어드는 절차의 문서와 지시, 회사 사람들의 목소리. */
export type ChainCard = {
  readonly id: ChainStepId;
  readonly title: string;
  readonly document: StageDocument;
  readonly prompt: string;
  /** 회사 사람들의 목소리 — 체인 절차는 동행과 무관하게 회사가 움직이는 자리라 거르지 않는다. */
  readonly partyLines: readonly TalkLine[];
};

export type ActionText = {
  readonly id: ActionId;
  readonly label: string;
  readonly deny: string;
  readonly result: string;
};

export type EndingCard = {
  readonly id: EndingId;
  readonly title: string;
  readonly text: string;
  readonly epilogue: readonly string[];
};

export type CharacterCard = {
  readonly id: CharacterId;
  readonly name: string;
  readonly role: string;
  readonly voice: string;
  readonly card: string;
};

/** Every record is total over its id union; the editor finds cards by literal `id`. */
export type Content = {
  readonly jobs: Readonly<Record<JobId, JobCard>>;
  readonly chains: Readonly<Record<ChainStepId, ChainCard>>;
  readonly actions: Readonly<Record<ActionId, ActionText>>;
  readonly endings: Readonly<Record<EndingId, EndingCard>>;
  readonly characters: Readonly<Record<CharacterId, CharacterCard>>;
};

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

export type ActionOutcome = {
  readonly run: RunState;
  readonly ok: boolean;
  readonly reason: string | null;
};
