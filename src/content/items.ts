// Item catalog. One entry per id in `ITEM_IDS`; the kind files under `./items/` hold the data.

import type { Item } from "../engine/types";
import type { ItemId } from "./ids";
import { CONSUMABLES } from "./items/consumables";
import { ARMOR, SHIELDS } from "./items/defense";
import { RELICS } from "./items/relics";
import { WEAPONS } from "./items/weapons";

export const ITEMS: Readonly<Record<ItemId, Item>> = {
  ...WEAPONS,
  ...SHIELDS,
  ...ARMOR,
  ...RELICS,
  ...CONSUMABLES,
};
