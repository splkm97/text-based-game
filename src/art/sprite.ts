// 16x16 pixel sprite model. Each row is 16 chars: a hex digit 0-f indexes PICO8, "." is transparent.

export const SPRITE_SIZE = 16;

export type Sprite = {
  readonly size: typeof SPRITE_SIZE;
  readonly rows: readonly string[];
};

/** PICO-8 palette in index order 0-f. The only color source for sprites. */
export const PICO8: readonly string[] = [
  "#000000",
  "#1D2B53",
  "#7E2553",
  "#008751",
  "#AB5236",
  "#5F574F",
  "#C2C3C7",
  "#FFF1E8",
  "#FF004D",
  "#FFA300",
  "#FFEC27",
  "#00E436",
  "#29ADFF",
  "#83769C",
  "#FF77A8",
  "#FFCCAA",
];

/** One horizontal run of same-colored pixels; height is always 1. */
export type SpriteRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly fill: string;
};

const TRANSPARENT = ".";
const DIGITS = "0123456789abcdef";

const fillOf = (char: string): string | undefined => {
  const index = DIGITS.indexOf(char);
  return index < 0 ? undefined : PICO8[index];
};

/** Throws RangeError on a wrong row count, a wrong row length, or a char outside 0-f and ".". */
export function validateSprite(sprite: Sprite): void {
  if (sprite.rows.length !== SPRITE_SIZE) {
    throw new RangeError(`sprite needs ${SPRITE_SIZE} rows, got ${sprite.rows.length}`);
  }
  for (const [y, row] of sprite.rows.entries()) {
    if (row.length !== SPRITE_SIZE) {
      throw new RangeError(`row ${y} needs ${SPRITE_SIZE} chars, got ${row.length}`);
    }
    for (const char of row) {
      if (char !== TRANSPARENT && fillOf(char) === undefined) {
        throw new RangeError(`row ${y} has invalid char "${char}"`);
      }
    }
  }
}

/** Builds and validates a sprite so an authoring typo fails at module load. */
export function sprite(rows: readonly string[]): Sprite {
  const built: Sprite = { size: SPRITE_SIZE, rows };
  validateSprite(built);
  return built;
}

function rowRects(row: string, y: number, monochrome: string | undefined): readonly SpriteRect[] {
  const rects: SpriteRect[] = [];
  for (const [x, char] of [...row].entries()) {
    if (char === TRANSPARENT) continue;
    const fill = monochrome ?? fillOf(char);
    if (fill === undefined) throw new RangeError(`row ${y} has invalid char "${char}"`);
    const last = rects.at(-1);
    if (last !== undefined && last.fill === fill && last.x + last.width === x) {
      rects[rects.length - 1] = { ...last, width: last.width + 1 };
    } else {
      rects.push({ x, y, width: 1, fill });
    }
  }
  return rects;
}

/**
 * Rects to draw, one per horizontal run of identical color, transparent pixels skipped.
 * With `monochrome`, every opaque pixel takes that fill (used for undiscovered silhouettes).
 */
export function spriteRects(sprite: Sprite, monochrome?: string): readonly SpriteRect[] {
  return sprite.rows.flatMap((row, y) => rowRects(row, y, monochrome));
}
