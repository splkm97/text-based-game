// Domain types of 복구 기록. Every field is readonly; state changes produce new objects.
// Content files may import only this file and ./ids.

import type { ActionId, ChainStepId, CharacterId, EndingId, JobStepId, StageId } from "./ids";

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

/** Which character the story foregrounds first; changes guards, not the id sets. */
export type Placement = "ru_first" | "dusik_first";

export type LogEntry = {
  readonly stage: StageId;
  readonly text: string;
};

export type RunState = {
  readonly placement: Placement;
  readonly stage: StageId;
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

/** 일감 구조의 회차 상태 — 일감 목록 위치와 처리 순서, 이번 일감의 동행, 인물 상태. */
export type JobRun = {
  readonly jobIndex: number;
  readonly jobStep: JobStepId;
  readonly party: readonly CharacterId[];
  readonly characters: Readonly<Record<CharacterId, CharacterState>>;
  readonly pendingChain: readonly ChainStepId[];
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

export type StageCard = {
  readonly id: StageId;
  readonly title: string;
  readonly document: StageDocument;
  readonly prompt: string;
  readonly partyLines: readonly {
    readonly character: CharacterId;
    readonly text: string;
  }[];
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
  readonly stages: Readonly<Record<StageId, StageCard>>;
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
