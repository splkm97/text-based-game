// Square pixel sprite model. `rows` holds `size` strings of `size` chars: a hex digit 0-f
// indexes a 16-entry palette, "." is transparent.

export type Sprite = {
  readonly size: number;
  readonly rows: readonly string[];
};

/** One horizontal run of same-colored pixels; height is always 1. */
export type SpriteRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly fill: string;
};

const TRANSPARENT = ".";
const DIGITS = "0123456789abcdef";

const fillOf = (palette: readonly string[], char: string): string | undefined => {
  const index = DIGITS.indexOf(char);
  return index < 0 ? undefined : palette[index];
};

/** Throws RangeError on a wrong row count, a wrong row length, or a char outside 0-f and ".". */
export function validateSprite(sprite: Sprite): void {
  const { size } = sprite;
  if (sprite.rows.length !== size) {
    throw new RangeError(`sprite needs ${size} rows, got ${sprite.rows.length}`);
  }
  for (const [y, row] of sprite.rows.entries()) {
    if (row.length !== size) {
      throw new RangeError(`row ${y} needs ${size} chars, got ${row.length}`);
    }
    for (const char of row) {
      if (char !== TRANSPARENT && DIGITS.indexOf(char) < 0) {
        throw new RangeError(`row ${y} has invalid char "${char}"`);
      }
    }
  }
}

/** Builds and validates a square sprite from its rows so an authoring typo fails at module load. */
export function sprite(rows: readonly string[]): Sprite {
  const built: Sprite = { size: rows.length, rows };
  validateSprite(built);
  return built;
}

function rowRects(
  row: string,
  y: number,
  palette: readonly string[],
  monochrome: string | undefined,
): readonly SpriteRect[] {
  const rects: SpriteRect[] = [];
  for (const [x, char] of [...row].entries()) {
    if (char === TRANSPARENT) continue;
    const fill = monochrome ?? fillOf(palette, char);
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
 * Rects to draw, one per horizontal run of identical color, transparent pixels skipped. Each
 * hex digit indexes `palette`. With `monochrome`, every opaque pixel takes that fill (used for
 * undiscovered silhouettes).
 */
export function spriteRects(
  sprite: Sprite,
  palette: readonly string[],
  monochrome?: string,
): readonly SpriteRect[] {
  return sprite.rows.flatMap((row, y) => rowRects(row, y, palette, monochrome));
}
