// The in-progress character sheet and the pure rules the creation screen shows live.

import { JOURNEY_IDS, ORIGIN_IDS, TRAIT_IDS } from "../../../content/ids";
import {
  addStats,
  CREATION_MAX,
  CREATION_MIN,
  CREATION_TOTAL,
  type DerivedStats,
  deriveStats,
  mapStats,
} from "../../../engine/character";
import {
  type ContentRegistry,
  type JourneyId,
  type OriginId,
  STAT_IDS,
  type StatId,
  type Stats,
  type TraitId,
} from "../../../engine/types";
import type { NewRunInput } from "../../../store/runStore";

export type Draft = {
  readonly name: string;
  readonly origin: OriginId;
  readonly trait: TraitId;
  readonly journeys: readonly JourneyId[];
  readonly hardMode: boolean;
  readonly allocation: Stats;
};

export const NAME_MAX = 12;
const DEFAULT_NAME = "이름 없는 모험가";
export const FREE_POINTS = CREATION_TOTAL - CREATION_MIN * STAT_IDS.length;

export const INITIAL_DRAFT: Draft = {
  name: DEFAULT_NAME,
  origin: ORIGIN_IDS[0],
  trait: TRAIT_IDS[0],
  journeys: [],
  hardMode: false,
  allocation: mapStats(() => CREATION_MIN),
};

export const remainingPoints = (allocation: Stats): number =>
  CREATION_TOTAL - STAT_IDS.reduce((sum, stat) => sum + allocation[stat], 0);

export const canRaise = (allocation: Stats, stat: StatId): boolean =>
  allocation[stat] < CREATION_MAX && remainingPoints(allocation) > 0;

export const canLower = (allocation: Stats, stat: StatId): boolean =>
  allocation[stat] > CREATION_MIN;

const isNameValid = (name: string): boolean => {
  const length = name.trim().length;
  return length >= 1 && length <= NAME_MAX;
};

export const canStart = (draft: Draft): boolean =>
  isNameValid(draft.name) && remainingPoints(draft.allocation) === 0;

/** Keeps the enabled journeys in catalog order. */
export const toggleJourney = (
  journeys: readonly JourneyId[],
  id: JourneyId,
): readonly JourneyId[] =>
  journeys.includes(id)
    ? journeys.filter((journey) => journey !== id)
    : JOURNEY_IDS.filter((journey) => journey === id || journeys.includes(journey));

/** Stats after the trait bonus, as the engine bakes them at creation. */
export const finalStats = (draft: Draft, content: ContentRegistry): Stats =>
  addStats(draft.allocation, content.traits[draft.trait].statBonus);

/**
 * Derived stats for the sheet as it stands, points spent or not. `createCharacter` rejects an
 * incomplete allocation, so this feeds `deriveStats` an unequipped character directly.
 */
export const previewDerived = (draft: Draft, content: ContentRegistry): DerivedStats =>
  deriveStats(
    {
      name: draft.name,
      origin: draft.origin,
      trait: draft.trait,
      stats: finalStats(draft, content),
      hp: 0,
      sanity: 0,
      xp: 0,
      gold: 0,
      pendingStatPoints: 0,
      levelUps: 0,
      inventory: [],
      equipment: { mainHand: null, offHand: null, armor: null, relic: null },
    },
    content,
  );

export const toRunInput = (draft: Draft): NewRunInput => ({
  name: draft.name.trim(),
  origin: draft.origin,
  trait: draft.trait,
  allocation: draft.allocation,
  hardMode: draft.hardMode,
  journeys: draft.journeys,
});
