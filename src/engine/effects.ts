// Applies content effects to a run and produces Korean log lines.

import {
  addToInventory,
  clampResources,
  deriveStats,
  hasRoom,
  removeFromInventory,
} from "./character";
import { EngineError } from "./errors";
import {
  type Character,
  type ContentRegistry,
  type Effect,
  type ItemId,
  type RunState,
  STAT_NAMES,
  type Trait,
} from "./types";

export type EffectsResult = { readonly run: RunState; readonly log: readonly string[] };

type Step = { readonly run: RunState; readonly lines: readonly string[] };

const XP_MAX = 100;
const MAX_LEVEL_UPS = 9;
const HARD_MODE_GOLD_MULTIPLIER = 0.75;

const signed = (n: number): string => (n < 0 ? `${n}` : `+${n}`);

const withCharacter = (run: RunState, character: Character): RunState => ({ ...run, character });

const changeHp = (run: RunState, delta: number, content: ContentRegistry): Step => {
  const { maxHp } = deriveStats(run.character, content);
  const hp = Math.max(0, Math.min(maxHp, run.character.hp + delta));
  return { run: withCharacter(run, { ...run.character, hp }), lines: [`체력 ${signed(delta)}`] };
};

/** Loss modifiers apply only when the effect is a loss: `max(0, loss - reduction) + (hard ? 1 : 0)`. */
const changeSanity = (
  run: RunState,
  delta: number,
  trait: Trait,
  content: ContentRegistry,
): Step => {
  if (delta === 0) {
    return { run, lines: [] };
  }
  const { maxSanity } = deriveStats(run.character, content);
  const effective =
    delta > 0 ? delta : -(Math.max(0, -delta - trait.sanityLossReduction) + (run.hardMode ? 1 : 0));
  const sanity = Math.max(0, Math.min(maxSanity, run.character.sanity + effective));
  return {
    run: withCharacter(run, { ...run.character, sanity }),
    lines: [`정신력 ${signed(effective)}`],
  };
};

/** `levelUps` counts thresholds already granted, so a threshold is never granted twice. */
const changeXp = (run: RunState, delta: number, trait: Trait): Step => {
  const character = run.character;
  const xp = Math.max(0, Math.min(XP_MAX, character.xp + delta));
  const target = Math.min(MAX_LEVEL_UPS, Math.floor(xp / 10));
  const gained = Array.from(
    { length: Math.max(0, target - character.levelUps) },
    (_, offset) => character.levelUps + offset,
  );
  const points = gained.map((levelIndex) => trait.levelUpPoints(levelIndex));
  return {
    run: withCharacter(run, {
      ...character,
      xp,
      levelUps: character.levelUps + gained.length,
      pendingStatPoints: character.pendingStatPoints + points.reduce((a, b) => a + b, 0),
    }),
    lines: [`경험치 ${signed(delta)}`, ...points.map((p) => `레벨 업! 능력치 포인트 +${p}`)],
  };
};

/** Gains: trait multiplier, then hard mode 0.75, floored once. Losses apply as-is, floor 0. */
const changeGold = (run: RunState, delta: number, trait: Trait): Step => {
  const gain = Math.floor(
    delta * trait.goldMultiplier * (run.hardMode ? HARD_MODE_GOLD_MULTIPLIER : 1),
  );
  const effective = delta > 0 ? gain : delta;
  const gold = Math.max(0, run.character.gold + effective);
  return {
    run: withCharacter(run, { ...run.character, gold }),
    lines: [`골드 ${signed(effective)}`],
  };
};

const changeStat = (
  run: RunState,
  effect: Extract<Effect, { kind: "stat" }>,
  content: ContentRegistry,
): Step => {
  const stats = {
    ...run.character.stats,
    [effect.stat]: Math.max(1, run.character.stats[effect.stat] + effect.delta),
  };
  return {
    run: withCharacter(run, clampResources({ ...run.character, stats }, content)),
    lines: [`${STAT_NAMES[effect.stat]} ${signed(effect.delta)}`],
  };
};

const gainItem = (run: RunState, item: ItemId, content: ContentRegistry): Step => {
  const name = content.items[item].name;
  if (!hasRoom(run.character, content)) {
    return { run, lines: [`가방이 가득 차 아이템을 놓쳤다: ${name}`] };
  }
  return {
    run: withCharacter(run, addToInventory(run.character, item)),
    lines: [`아이템 획득: ${name}`],
  };
};

const loseItem = (run: RunState, item: ItemId, content: ContentRegistry): Step => {
  if (!run.character.inventory.includes(item)) {
    return { run, lines: [] };
  }
  return {
    run: withCharacter(run, removeFromInventory(run.character, item, content)),
    lines: [`아이템 잃음: ${content.items[item].name}`],
  };
};

const applyOne = (run: RunState, effect: Effect, content: ContentRegistry): Step => {
  const trait = content.traits[run.character.trait];
  switch (effect.kind) {
    case "hp":
      return changeHp(run, effect.delta, content);
    case "sanity":
      return changeSanity(run, effect.delta, trait, content);
    case "xp":
      return changeXp(run, effect.delta, trait);
    case "gold":
      return changeGold(run, effect.delta, trait);
    case "stat":
      return changeStat(run, effect, content);
    case "item":
      return gainItem(run, effect.item, content);
    case "removeItem":
      return loseItem(run, effect.item, content);
    case "flag":
      return {
        run: run.flags.includes(effect.flag) ? run : { ...run, flags: [...run.flags, effect.flag] },
        lines: [],
      };
    case "nextEvent":
      if (content.events[effect.event] === undefined) {
        throw new EngineError("UNKNOWN_ID", `event ${effect.event} is not defined in content`);
      }
      return { run: { ...run, queuedEvent: effect.event }, lines: [] };
    case "end":
      return { run: { ...run, pendingEnding: effect.ending }, lines: [] };
  }
};

export const applyEffects = (
  run: RunState,
  effects: readonly Effect[],
  content: ContentRegistry,
): EffectsResult =>
  effects.reduce<EffectsResult>(
    (acc, effect) => {
      const step = applyOne(acc.run, effect, content);
      return { run: step.run, log: [...acc.log, ...step.lines] };
    },
    { run, log: [] },
  );

/** Removes the consumable from the inventory, then applies its effects. */
export const useConsumable = (
  run: RunState,
  item: ItemId,
  content: ContentRegistry,
): EffectsResult => {
  const definition = content.items[item];
  if (!run.character.inventory.includes(item)) {
    throw new EngineError("ITEM_NOT_IN_INVENTORY", `${item} is not in the inventory`);
  }
  if (definition.kind !== "consumable") {
    throw new EngineError("INVALID_ITEM", `${item} is not a consumable`);
  }
  const without = withCharacter(run, removeFromInventory(run.character, item, content));
  const applied = applyEffects(without, definition.effects, content);
  return { run: applied.run, log: [`${definition.name} 사용`, ...applied.log] };
};
