// Domain types of 정적의 항로. Every field is readonly; state changes produce new objects.
// Rules read content only through `Content`, injected by the caller.

import type {
  ConfrontationId,
  CrewId,
  CrewRole,
  EndingId,
  EventId,
  MessageId,
  SymptomId,
} from "./ids";

export type { Rng } from "../../shared/rng";
export type {
  ConfrontationId,
  CrewId,
  CrewRole,
  EndingId,
  EventId,
  MessageId,
  SymptomId,
} from "./ids";

// ---------------------------------------------------------------------------
// Crew
// ---------------------------------------------------------------------------

export type CrewTemplate = {
  readonly id: CrewId;
  readonly name: string;
  readonly role: CrewRole;
};

export type Infection = "healthy" | "incubating" | "sick";

export type CrewState = {
  readonly id: CrewId;
  readonly alive: boolean;
  readonly quarantined: boolean;
  /** 0..100 */
  readonly stress: number;
  readonly infection: Infection;
  /** Nights left before an incubating crew member falls sick. */
  readonly incubationLeft: number;
  /** Nights spent sick; death when it reaches 4. */
  readonly sickDays: number;
  readonly symptoms: readonly SymptomId[];
};

/** What a condition may ask about one crew member. */
export type CrewStatus = "alive" | "dead" | "sick" | "healthy" | "quarantined";

export type Symptom = { readonly id: SymptomId; readonly name: string };

// ---------------------------------------------------------------------------
// Messages from Earth
// ---------------------------------------------------------------------------

export type Reveals = {
  readonly confirms?: readonly SymptomId[];
  readonly retracts?: readonly SymptomId[];
};

export type Message = {
  readonly id: MessageId;
  /** Day the message left Earth; it arrives on ship day `earthDay + lag(earthDay)`. */
  readonly earthDay: number;
  readonly title: string;
  readonly text: string;
  readonly reveals: Reveals;
};

/** Earth's current claims, as of the latest received message. */
export type KnownSymptoms = {
  readonly confirmed: readonly SymptomId[];
  readonly retracted: readonly SymptomId[];
};

// ---------------------------------------------------------------------------
// Conditions and effects
// ---------------------------------------------------------------------------

export type CountKind = "sick" | "quarantined" | "dead";

export type Condition =
  | { readonly kind: "trust"; readonly min: number }
  | { readonly kind: "day"; readonly from: number; readonly to: number }
  | { readonly kind: "count"; readonly of: CountKind; readonly min: number }
  | { readonly kind: "crew"; readonly crew: CrewId; readonly status: CrewStatus };

export type Effect =
  | { readonly kind: "trust"; readonly delta: number }
  | { readonly kind: "hp"; readonly delta: number }
  | { readonly kind: "authority"; readonly delta: number }
  | { readonly kind: "kits"; readonly delta: number }
  | { readonly kind: "meds"; readonly delta: number }
  /** Changes today's remaining action points. */
  | { readonly kind: "ap"; readonly delta: number }
  /** `target: "all"` reaches every living crew member. */
  | { readonly kind: "stress"; readonly target: CrewId | "all"; readonly delta: number };

export type Outcome = { readonly text: string; readonly effects: readonly Effect[] };

// ---------------------------------------------------------------------------
// Events, confrontations, endings
// ---------------------------------------------------------------------------

export type Choice = {
  readonly text: string;
  readonly requires: readonly Condition[];
  readonly outcome: Outcome;
};

export type ObserveEvent = {
  readonly id: EventId;
  readonly title: string;
  readonly text: string;
  readonly weight: number;
  readonly once: boolean;
  readonly requires: readonly Condition[];
  readonly choices: readonly Choice[];
};

export type Confrontation = {
  readonly id: ConfrontationId;
  readonly title: string;
  readonly text: string;
  readonly dc: number;
  readonly success: Outcome;
  /** Effects default to captain hp -3 when omitted. */
  readonly failure: { readonly text: string; readonly effects?: readonly Effect[] };
};

export type Ending = {
  readonly id: EndingId;
  readonly title: string;
  readonly text: string;
  readonly tone: "good" | "bad";
};

// ---------------------------------------------------------------------------
// Run state
// ---------------------------------------------------------------------------

export type Captain = { readonly hp: number; readonly authority: number };

export type Action =
  | { readonly kind: "quarantine"; readonly crew: CrewId }
  | { readonly kind: "release"; readonly crew: CrewId }
  | { readonly kind: "test"; readonly crew: CrewId }
  | { readonly kind: "talk"; readonly crew: CrewId }
  | { readonly kind: "treat"; readonly crew: CrewId };

export type TestRecord = {
  readonly day: number;
  readonly crew: CrewId;
  readonly positive: boolean;
};

export type LogEntry = { readonly day: number; readonly text: string };

export type Phase =
  | { readonly kind: "comms"; readonly arrived: readonly MessageId[] }
  | { readonly kind: "observe"; readonly event: EventId }
  | { readonly kind: "act" }
  | { readonly kind: "night"; readonly report: readonly string[] }
  | { readonly kind: "ended"; readonly ending: EndingId; readonly score: number };

export type RunState = {
  readonly day: number;
  readonly phase: Phase;
  readonly captain: Captain;
  /** 0..100 */
  readonly trust: number;
  readonly kits: number;
  readonly meds: number;
  readonly ap: number;
  readonly crew: readonly CrewState[];
  /** Every message received so far, in arrival order. */
  readonly inbox: readonly MessageId[];
  readonly knownSymptoms: KnownSymptoms;
  readonly seenEvents: readonly EventId[];
  readonly tests: readonly TestRecord[];
  readonly log: readonly LogEntry[];
};

// ---------------------------------------------------------------------------
// Content registry
// ---------------------------------------------------------------------------

export type Content = {
  readonly crew: readonly CrewTemplate[];
  readonly symptoms: Readonly<Record<SymptomId, Symptom>>;
  readonly messages: readonly Message[];
  readonly events: Readonly<Record<EventId, ObserveEvent>>;
  readonly confrontations: readonly Confrontation[];
  readonly endings: Readonly<Record<EndingId, Ending>>;
};
