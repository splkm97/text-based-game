// Domain types. Every field is readonly; state changes produce new objects.
// The engine never hard-codes an id: content is injected through `ContentRegistry`.

import type {
  EndingId,
  EventId,
  ItemId,
  JourneyId,
  MonsterId,
  OriginId,
  TraitId,
} from "../content/ids";

export type {
  EndingId,
  EventId,
  ItemId,
  JourneyId,
  MonsterId,
  OriginId,
  TraitId,
} from "../content/ids";

// ---------------------------------------------------------------------------
// Stats and randomness
// ---------------------------------------------------------------------------

export const STAT_IDS = ["str", "agi", "int", "cha", "con", "wis"] as const;
export type StatId = (typeof STAT_IDS)[number];
export const STAT_NAMES: Readonly<Record<StatId, string>> = {
  str: "힘",
  agi: "민첩",
  int: "지능",
  cha: "카리스마",
  con: "건강",
  wis: "지혜",
};

export type Stats = Readonly<Record<StatId, number>>;

/** Uniform random number in [0, 1). */
export type Rng = () => number;

// ---------------------------------------------------------------------------
// Items
// ---------------------------------------------------------------------------

export type WeaponKind = "physical" | "magic" | "ranged";
export type EquipSlot = "mainHand" | "offHand" | "armor" | "relic";

type ItemBase = {
  readonly id: ItemId;
  readonly name: string;
  readonly description: string;
  readonly price: number;
};

export type Item = ItemBase &
  (
    | {
        readonly kind: "weapon";
        readonly weaponKind: WeaponKind;
        readonly twoHanded: boolean;
        readonly attack: number;
      }
    | { readonly kind: "shield"; readonly defense: number }
    | { readonly kind: "armor"; readonly defense: number }
    | { readonly kind: "relic"; readonly statBonus: Partial<Stats> }
    /** Used from inventory, then removed. */
    | { readonly kind: "consumable"; readonly effects: readonly Effect[] }
  );

// ---------------------------------------------------------------------------
// Monsters, traits, origins, journeys, endings
// ---------------------------------------------------------------------------

export type Monster = {
  readonly id: MonsterId;
  readonly name: string;
  readonly description: string;
  readonly hp: number;
  readonly attack: number;
  readonly defense: number;
  readonly fleeDc: number;
  readonly xpReward: number;
  readonly goldReward: number;
  readonly drop?: ItemId;
};

export type Trait = {
  readonly id: TraitId;
  readonly name: string;
  readonly description: string;
  readonly statBonus: Partial<Stats>;
  readonly goldMultiplier: number;
  readonly attackBonus: number;
  readonly defenseBonus: number;
  readonly sanityLossReduction: number;
  /** `levelIndex` is 0-based. Default `() => 3`. */
  readonly levelUpPoints: (levelIndex: number) => number;
};

export type Origin = {
  readonly id: OriginId;
  readonly name: string;
  readonly description: string;
  readonly startingItems: readonly ItemId[];
  readonly startingGold: number;
  readonly startingFlags: readonly string[];
};

export type Journey = {
  readonly id: JourneyId;
  readonly name: string;
  readonly description: string;
};

export type Ending = {
  readonly id: EndingId;
  readonly title: string;
  readonly text: string;
  readonly scoreBonus: number;
  readonly tone: "good" | "bad" | "neutral";
};

// ---------------------------------------------------------------------------
// Conditions and effects
// ---------------------------------------------------------------------------

export type Condition =
  | { readonly kind: "stat"; readonly stat: StatId; readonly min: number }
  | { readonly kind: "item"; readonly item: ItemId }
  | { readonly kind: "flag"; readonly flag: string }
  | { readonly kind: "notFlag"; readonly flag: string }
  | { readonly kind: "gold"; readonly min: number }
  | { readonly kind: "trait"; readonly trait: TraitId }
  | { readonly kind: "hardMode" };

export type Effect =
  | { readonly kind: "hp"; readonly delta: number }
  | { readonly kind: "sanity"; readonly delta: number }
  | { readonly kind: "xp"; readonly delta: number }
  | { readonly kind: "gold"; readonly delta: number }
  | { readonly kind: "stat"; readonly stat: StatId; readonly delta: number }
  /** Add an item. Lost if no room; the log says so. */
  | { readonly kind: "item"; readonly item: ItemId }
  /** No-op if absent. */
  | { readonly kind: "removeItem"; readonly item: ItemId }
  | { readonly kind: "flag"; readonly flag: string }
  /** Queue a follow-up event. */
  | { readonly kind: "nextEvent"; readonly event: EventId }
  | { readonly kind: "end"; readonly ending: EndingId };

// ---------------------------------------------------------------------------
// Events and choices
// ---------------------------------------------------------------------------

export type OutcomeText = { readonly text: string; readonly effects: readonly Effect[] };

export type Outcome =
  | { readonly kind: "direct"; readonly result: OutcomeText }
  | {
      readonly kind: "check";
      readonly stat: StatId;
      readonly dc: number;
      readonly success: OutcomeText;
      readonly failure: OutcomeText;
    }
  | {
      readonly kind: "combat";
      readonly monster: MonsterId;
      readonly win: OutcomeText;
      readonly flee: OutcomeText;
    }
  | { readonly kind: "shop"; readonly stock: readonly ItemId[]; readonly leave: OutcomeText };

export type Choice = {
  readonly text: string;
  readonly requires: readonly Condition[];
  readonly outcome: Outcome;
};

export type EventPool =
  | { readonly kind: "common" }
  | { readonly kind: "origin"; readonly origin: OriginId }
  | { readonly kind: "journey"; readonly journey: JourneyId };

export type GameEvent = {
  readonly id: EventId;
  readonly title: string;
  readonly text: string;
  readonly pool: EventPool;
  readonly weight: number;
  readonly once: boolean;
  readonly requires: readonly Condition[];
  readonly choices: readonly Choice[];
};

// ---------------------------------------------------------------------------
// Character and run state
// ---------------------------------------------------------------------------

export type Equipment = Readonly<Record<EquipSlot, ItemId | null>>;

export type Character = {
  readonly name: string;
  readonly origin: OriginId;
  readonly trait: TraitId;
  readonly stats: Stats;
  readonly hp: number;
  readonly sanity: number;
  readonly xp: number;
  readonly gold: number;
  readonly pendingStatPoints: number;
  readonly levelUps: number;
  readonly inventory: readonly ItemId[];
  readonly equipment: Equipment;
};

export type LogEntry = { readonly day: number; readonly text: string };

export type CombatState = {
  readonly monster: MonsterId;
  readonly monsterHp: number;
  readonly monsterMaxHp: number;
  readonly round: number;
  readonly log: readonly string[];
  readonly onWin: OutcomeText;
  readonly onFlee: OutcomeText;
};

export type ShopState = { readonly stock: readonly ItemId[]; readonly onLeave: OutcomeText };

export type RunPhase =
  | { readonly kind: "event"; readonly event: EventId }
  /** Shown after a choice; the player taps 계속. */
  | { readonly kind: "resolution"; readonly text: string; readonly effectsLog: readonly string[] }
  | { readonly kind: "combat"; readonly combat: CombatState }
  | { readonly kind: "shop"; readonly shop: ShopState }
  | {
      readonly kind: "ended";
      readonly ending: EndingId;
      readonly score: number;
      readonly ranked: boolean;
    };

export type RunState = {
  readonly character: Character;
  readonly day: number;
  readonly kills: number;
  readonly loadCount: number;
  readonly hardMode: boolean;
  readonly journeys: readonly JourneyId[];
  readonly flags: readonly string[];
  readonly seenEvents: readonly EventId[];
  readonly queuedEvent: EventId | null;
  /** Set by an `end` effect; `continueRun` finalizes it with the ending priority rule. */
  readonly pendingEnding: EndingId | null;
  readonly phase: RunPhase;
  readonly log: readonly LogEntry[];
};

// ---------------------------------------------------------------------------
// Content registry and meta state
// ---------------------------------------------------------------------------

export type ContentRegistry = {
  readonly items: Readonly<Record<ItemId, Item>>;
  readonly monsters: Readonly<Record<MonsterId, Monster>>;
  readonly traits: Readonly<Record<TraitId, Trait>>;
  readonly origins: Readonly<Record<OriginId, Origin>>;
  readonly journeys: Readonly<Record<JourneyId, Journey>>;
  readonly endings: Readonly<Record<EndingId, Ending>>;
  readonly events: Readonly<Record<EventId, GameEvent>>;
};

export type RankingEntry = {
  readonly id: string;
  readonly name: string;
  readonly origin: OriginId;
  readonly ending: EndingId;
  readonly score: number;
  readonly day: number;
  readonly hardMode: boolean;
  readonly ranked: boolean;
  readonly finishedAt: string;
};

export type Codex = {
  readonly endings: readonly EndingId[];
  readonly monsters: readonly MonsterId[];
  readonly items: readonly ItemId[];
};

export type MetaState = { readonly codex: Codex; readonly ranking: readonly RankingEntry[] };
