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
): readonly (readonly [string, Sprite, number])[] =>
  Object.entries(set).map(([name, sprite]) => [name, sprite, size]);

const all = [...sized(MONSTER_SPRITES, 32), ...sized(ORIGIN_PORTRAITS, 32), ...sized(ICONS, 16)];

test.each(all)(
  "%s validates at its set's size and has at least 40 opaque pixels",
  (_name, sprite, size) => {
    expect(sprite.size).toBe(size);
    expect(() => validateSprite(sprite)).not.toThrow();
    expect(opaquePixels(sprite)).toBeGreaterThanOrEqual(40);
  },
);

test("every monster sprite differs from every other", () => {
  const distinct = new Set(MONSTER_IDS.map((id) => MONSTER_SPRITES[id].rows.join("\n")));
  expect(distinct.size).toBe(MONSTER_IDS.length);
});
