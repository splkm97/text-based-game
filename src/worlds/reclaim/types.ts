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

export type StageCard = {
  readonly id: StageId;
  readonly title: string;
  readonly screen: string;
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
