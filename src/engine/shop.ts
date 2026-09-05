// Shop pricing and the buy / sell / leave actions of the shop phase.

import { addToInventory, effectiveStats, hasRoom, removeFromInventory } from "./character";
import { applyEffects } from "./effects";
import { EngineError } from "./errors";
import { enterResolution, requirePhase } from "./phase";
import type { ContentRegistry, Item, ItemId, RunState } from "./types";

const CHA_STEP = 10;
const DISCOUNT_PER_STEP = 0.1;
const SELL_RATIO = 0.5;

const chaSteps = (cha: number): number => Math.floor(cha / CHA_STEP);

/** `floor(basePrice * (1 - 0.1 * floor(cha/10)))`, never below 1. */
export const buyPrice = (item: Item, cha: number): number =>
  Math.max(1, Math.floor(item.price * (1 - DISCOUNT_PER_STEP * chaSteps(cha))));

/** `floor(basePrice * 0.5 * (1 + 0.1 * floor(cha/10)))`. */
export const sellPrice = (item: Item, cha: number): number =>
  Math.floor(item.price * SELL_RATIO * (1 + DISCOUNT_PER_STEP * chaSteps(cha)));

export const buyItem = (run: RunState, itemId: ItemId, content: ContentRegistry): RunState => {
  const { shop } = requirePhase(run, "shop");
  if (!shop.stock.includes(itemId)) {
    throw new EngineError("INVALID_ITEM", `${itemId} is not for sale here`);
  }
  const price = buyPrice(content.items[itemId], effectiveStats(run.character, content).cha);
  if (run.character.gold < price) {
    throw new EngineError("NOT_ENOUGH_GOLD", `${itemId} costs ${price}`);
  }
  if (!hasRoom(run.character, content)) {
    throw new EngineError("INVENTORY_FULL", "no room in the bag");
  }
  const character = addToInventory({ ...run.character, gold: run.character.gold - price }, itemId);
  return { ...run, character };
};

/** Unequips the item if worn, removes one copy, and pays the sell price. */
export const sellItem = (run: RunState, itemId: ItemId, content: ContentRegistry): RunState => {
  requirePhase(run, "shop");
  const price = sellPrice(content.items[itemId], effectiveStats(run.character, content).cha);
  const without = removeFromInventory(run.character, itemId, content);
  return { ...run, character: { ...without, gold: without.gold + price } };
};

export const leaveShop = (run: RunState, content: ContentRegistry): RunState => {
  const { shop } = requirePhase(run, "shop");
  const outcome = applyEffects(run, shop.onLeave.effects, content);
  return enterResolution(outcome.run, shop.onLeave.text, outcome.log);
};
