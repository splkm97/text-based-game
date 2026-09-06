import { expect, test } from "vitest";
import { PICO8 } from "../../../shared/art/pico8";
import { type Sprite, spriteRects, validateSprite } from "../../../shared/art/sprite";
import { MONSTER_IDS } from "../content/ids";
import { ICONS } from "./icons";
import { MONSTER_SPRITES } from "./monsters";
import { ORIGIN_PORTRAITS } from "./portraits";

const opaquePixels = (sprite: Sprite): number =>
  spriteRects(sprite, PICO8).reduce((sum, rect) => sum + rect.width, 0);

const sized = (
  set: Readonly<Record<string, Sprite>>,
  size: number,
  minOpaque: number,
): readonly (readonly [string, Sprite, number, number])[] =>
  Object.entries(set).map(([name, sprite]) => [name, sprite, size, minOpaque]);

// The floors sit well under the measured minimum of each set (362 at 32x32, 79 at 16x16). They
// catch a sprite authored near-empty, not a sparse one.
const all = [
  ...sized(MONSTER_SPRITES, 32, 150),
  ...sized(ORIGIN_PORTRAITS, 32, 150),
  ...sized(ICONS, 16, 40),
];

test.each(all)(
  "%s validates at its set's size and is not near-empty",
  (_name, sprite, size, minOpaque) => {
    expect(sprite.size).toBe(size);
    expect(() => validateSprite(sprite)).not.toThrow();
    expect(opaquePixels(sprite)).toBeGreaterThanOrEqual(minOpaque);
  },
);

test("every monster sprite differs from every other", () => {
  const distinct = new Set(MONSTER_IDS.map((id) => MONSTER_SPRITES[id].rows.join("\n")));
  expect(distinct.size).toBe(MONSTER_IDS.length);
});
