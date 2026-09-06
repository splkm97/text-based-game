// Every playable world. `meta` is static so the hub can draw a card; the module itself loads on
// demand so a world's code is fetched only when it is chosen.

import { META as ADVENTURER } from "../worlds/adventurer/meta";
import { META as VOYAGE } from "../worlds/voyage/meta";
import type { WorldMeta, WorldModule } from "./world";

export type WorldEntry = { readonly meta: WorldMeta; readonly load: () => Promise<WorldModule> };

export const WORLDS: readonly WorldEntry[] = [
  {
    meta: ADVENTURER,
    load: () => import("../worlds/adventurer/world").then((module) => module.default),
  },
  {
    meta: VOYAGE,
    load: () => import("../worlds/voyage/world").then((module) => module.default),
  },
];
