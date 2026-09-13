import { expect, test } from "vitest";
import { type Sprite, spriteRects, validateSprite } from "../../../shared/art/sprite";
import { THEME } from "../theme";
import { COVER } from "./cover";

const opaquePixels = (sprite: Sprite): number =>
  spriteRects(sprite, THEME.palette).reduce((sum, rect) => sum + rect.width, 0);

const sized = (
  set: Readonly<Record<string, Sprite>>,
  size: number,
  minOpaque: number,
): readonly (readonly [string, Sprite, number, number])[] =>
  Object.entries(set).map(([name, sprite]) => [name, sprite, size, minOpaque]);

// The floor sits well under the measured minimum of the set (983 at 32x32).
// It catches a sprite authored near-empty, not a sparse one.
const all = sized({ cover: COVER }, 32, 900);

test.each(all)(
  "%s validates at its set's size and is not near-empty",
  (_name, sprite, size, minOpaque) => {
    expect(sprite.size).toBe(size);
    expect(() => validateSprite(sprite)).not.toThrow();
    expect(opaquePixels(sprite)).toBeGreaterThanOrEqual(minOpaque);
  },
);
