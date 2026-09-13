// Domain types of 복구 기록. Every field is readonly; state changes produce new objects.
// Content files may import only this file and ./ids.

import type { ActionId, CharacterId, EndingId, EvidenceId, StageId } from "./ids";

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
  readonly evidence: Readonly<Record<EvidenceId, string>>;
};

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

export type ActionOutcome = {
  readonly run: RunState;
  readonly ok: boolean;
  readonly reason: string | null;
};
