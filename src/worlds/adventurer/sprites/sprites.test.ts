import { expect, test } from "vitest";
import { PICO8 } from "../../../shared/art/pico8";
import { type Sprite, spriteRects, validateSprite } from "../../../shared/art/sprite";
import { MONSTER_IDS } from "../content/ids";
import { ICONS } from "./icons";
import { MONSTER_SPRITES } from "./monsters";
import { ORIGIN_PORTRAITS } from "./portraits";

const opaquePixels = (sprite: Sprite): number =>
  spriteRects(sprite, PICO8).reduce((sum, rect) => sum + rect.width, 0);

const all: readonly (readonly [string, Sprite])[] = [
  ...Object.entries(MONSTER_SPRITES),
  ...Object.entries(ORIGIN_PORTRAITS),
  ...Object.entries(ICONS),
];

test.each(all)("%s validates and has at least 40 opaque pixels", (_name, sprite) => {
  expect(() => validateSprite(sprite)).not.toThrow();
  expect(opaquePixels(sprite)).toBeGreaterThanOrEqual(40);
});

test("every monster sprite differs from every other", () => {
  const distinct = new Set(MONSTER_IDS.map((id) => MONSTER_SPRITES[id].rows.join("\n")));
  expect(distinct.size).toBe(MONSTER_IDS.length);
});
