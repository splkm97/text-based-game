import { expect, test } from "vitest";
import { type Sprite, spriteRects, validateSprite } from "../../../shared/art/sprite";
import { THEME } from "../theme";
import { COVER } from "./cover";
import { ICONS } from "./icons";

const opaquePixels = (sprite: Sprite): number =>
  spriteRects(sprite, THEME.palette).reduce((sum, rect) => sum + rect.width, 0);

const sized = (
  set: Readonly<Record<string, Sprite>>,
  size: number,
  minOpaque: number,
): readonly (readonly [string, Sprite, number, number])[] =>
  Object.entries(set).map(([name, sprite]) => [name, sprite, size, minOpaque]);

// The floors sit well under the measured minimum of each set (983 at 32x32, 52 at 16x16).
// They catch a sprite authored near-empty, not a sparse one.
const all = [...sized({ cover: COVER }, 32, 900), ...sized(ICONS, 16, 40)];

test.each(all)(
  "%s validates at its set's size and is not near-empty",
  (_name, sprite, size, minOpaque) => {
    expect(sprite.size).toBe(size);
    expect(() => validateSprite(sprite)).not.toThrow();
    expect(opaquePixels(sprite)).toBeGreaterThanOrEqual(minOpaque);
  },
);

test("every evidence icon differs from every other", () => {
  const distinct = new Set(Object.values(ICONS).map((icon) => icon.rows.join("\n")));
  expect(distinct.size).toBe(Object.keys(ICONS).length);
});
