// Character creation, derived stats, equipment, and inventory. All functions return new objects.

import { EngineError } from "./errors";
import {
  type Character,
  type ContentRegistry,
  type Equipment,
  type EquipSlot,
  type Item,
  type ItemId,
  type OriginId,
  STAT_IDS,
  type StatId,
  type Stats,
  type TraitId,
} from "./types";

export type DerivedStats = {
  readonly maxHp: number;
  readonly maxSanity: number;
  readonly inventorySlots: number;
  readonly attack: number;
  readonly defense: number;
};

export type CreateCharacterInput = {
  readonly name: string;
  readonly origin: OriginId;
  readonly trait: TraitId;
  /** The 18 distributed points with the base 4 included: each stat 4..10, total 42. */
  readonly allocation: Stats;
};

const CREATION_MIN = 4;
const CREATION_MAX = 10;
const CREATION_TOTAL = 42;
const UNARMED_ATTACK = 1;

export const mapStats = (f: (stat: StatId) => number): Stats => ({
  str: f("str"),
  agi: f("agi"),
  int: f("int"),
  cha: f("cha"),
  con: f("con"),
  wis: f("wis"),
});

export const addStats = (base: Stats, bonus: Partial<Stats>): Stats =>
  mapStats((stat) => base[stat] + (bonus[stat] ?? 0));

const validateAllocation = (allocation: Stats): void => {
  const inRange = STAT_IDS.every((stat) => {
    const value = allocation[stat];
    return Number.isInteger(value) && value >= CREATION_MIN && value <= CREATION_MAX;
  });
  const total = STAT_IDS.reduce((sum, stat) => sum + allocation[stat], 0);
  if (!inRange || total !== CREATION_TOTAL) {
    throw new EngineError(
      "INVALID_ALLOCATION",
      `each stat must be ${CREATION_MIN}..${CREATION_MAX} and total ${CREATION_TOTAL}`,
    );
  }
};

export const createCharacter = (
  input: CreateCharacterInput,
  content: ContentRegistry,
): Character => {
  validateAllocation(input.allocation);
  const trait = content.traits[input.trait];
  const origin = content.origins[input.origin];
  const stats = addStats(input.allocation, trait.statBonus);
  const base: Character = {
    name: input.name,
    origin: input.origin,
    trait: input.trait,
    stats,
    hp: 0,
    sanity: 0,
    xp: 0,
    gold: origin.startingGold,
    pendingStatPoints: 0,
    levelUps: 0,
    inventory: origin.startingItems,
    equipment: { mainHand: null, offHand: null, armor: null, relic: null },
  };
  const { maxHp, maxSanity } = deriveStats(base, content);
  return { ...base, hp: maxHp, sanity: maxSanity };
};

/** Base stats plus the equipped relic's bonus. Trait bonuses are already baked into `stats`. */
export const effectiveStats = (character: Character, content: ContentRegistry): Stats => {
  const relicId = character.equipment.relic;
  const relic = relicId === null ? null : content.items[relicId];
  return relic?.kind === "relic" ? addStats(character.stats, relic.statBonus) : character.stats;
};

const scalingStat = (weapon: Item | null): StatId => {
  if (weapon?.kind !== "weapon") {
    return "str";
  }
  switch (weapon.weaponKind) {
    case "physical":
      return "str";
    case "magic":
      return "int";
    case "ranged":
      return "agi";
  }
};

const itemOrNull = (id: ItemId | null, content: ContentRegistry): Item | null =>
  id === null ? null : content.items[id];

const defenseOf = (item: Item | null): number =>
  item?.kind === "shield" || item?.kind === "armor" ? item.defense : 0;

export const deriveStats = (character: Character, content: ContentRegistry): DerivedStats => {
  const stats = effectiveStats(character, content);
  const trait = content.traits[character.trait];
  const weapon = itemOrNull(character.equipment.mainHand, content);
  const weaponAttack = weapon?.kind === "weapon" ? weapon.attack : UNARMED_ATTACK;
  const shield = itemOrNull(character.equipment.offHand, content);
  const armor = itemOrNull(character.equipment.armor, content);
  return {
    maxHp: 10 + stats.con * 2,
    maxSanity: 10 + stats.wis * 2,
    inventorySlots: 4 + Math.floor(stats.str / 3),
    attack: weaponAttack + Math.floor(stats[scalingStat(weapon)] / 2) + trait.attackBonus,
    defense: defenseOf(armor) + defenseOf(shield) + Math.floor(stats.agi / 3) + trait.defenseBonus,
  };
};

/** Keeps hp and sanity within the (possibly lowered) maxima. */
export const clampResources = (character: Character, content: ContentRegistry): Character => {
  const { maxHp, maxSanity } = deriveStats(character, content);
  return {
    ...character,
    hp: Math.min(character.hp, maxHp),
    sanity: Math.min(character.sanity, maxSanity),
  };
};

export const allocateStatPoint = (character: Character, stat: StatId): Character => {
  if (character.pendingStatPoints <= 0) {
    throw new EngineError("NO_STAT_POINTS", "no pending stat points");
  }
  return {
    ...character,
    stats: { ...character.stats, [stat]: character.stats[stat] + 1 },
    pendingStatPoints: character.pendingStatPoints - 1,
  };
};

const slotFor = (item: Item): EquipSlot => {
  switch (item.kind) {
    case "weapon":
      return "mainHand";
    case "shield":
      return "offHand";
    case "armor":
      return "armor";
    case "relic":
      return "relic";
    case "consumable":
      throw new EngineError("INVALID_ITEM", `${item.id} cannot be equipped`);
  }
};

const withSlot = (equipment: Equipment, slot: EquipSlot, item: ItemId | null): Equipment => ({
  ...equipment,
  [slot]: item,
});

const holdsTwoHanded = (character: Character, content: ContentRegistry): boolean => {
  const weapon = itemOrNull(character.equipment.mainHand, content);
  return weapon?.kind === "weapon" && weapon.twoHanded;
};

export const equip = (
  character: Character,
  itemId: ItemId,
  content: ContentRegistry,
): Character => {
  if (!character.inventory.includes(itemId)) {
    throw new EngineError("ITEM_NOT_IN_INVENTORY", `${itemId} is not in the inventory`);
  }
  const item = content.items[itemId];
  const slot = slotFor(item);
  if (slot === "offHand" && holdsTwoHanded(character, content)) {
    throw new EngineError("SLOT_BLOCKED", "a two-handed weapon blocks the off hand");
  }
  const twoHanded = item.kind === "weapon" && item.twoHanded;
  const cleared = twoHanded ? withSlot(character.equipment, "offHand", null) : character.equipment;
  return clampResources({ ...character, equipment: withSlot(cleared, slot, itemId) }, content);
};

export const unequip = (
  character: Character,
  slot: EquipSlot,
  content: ContentRegistry,
): Character =>
  clampResources({ ...character, equipment: withSlot(character.equipment, slot, null) }, content);

export const hasRoom = (character: Character, content: ContentRegistry): boolean =>
  character.inventory.length < deriveStats(character, content).inventorySlots;

export const addToInventory = (character: Character, itemId: ItemId): Character => ({
  ...character,
  inventory: [...character.inventory, itemId],
});

/** Removes one copy. When no copy remains, any slot holding the item is cleared. */
export const removeFromInventory = (
  character: Character,
  itemId: ItemId,
  content: ContentRegistry,
): Character => {
  const index = character.inventory.indexOf(itemId);
  if (index < 0) {
    throw new EngineError("ITEM_NOT_IN_INVENTORY", `${itemId} is not in the inventory`);
  }
  const inventory = character.inventory.toSpliced(index, 1);
  const stillOwned = inventory.includes(itemId);
  const equipment = stillOwned
    ? character.equipment
    : mapEquipment(character.equipment, (held) => (held === itemId ? null : held));
  return clampResources({ ...character, inventory, equipment }, content);
};

const mapEquipment = (
  equipment: Equipment,
  f: (item: ItemId | null) => ItemId | null,
): Equipment => ({
  mainHand: f(equipment.mainHand),
  offHand: f(equipment.offHand),
  armor: f(equipment.armor),
  relic: f(equipment.relic),
});
