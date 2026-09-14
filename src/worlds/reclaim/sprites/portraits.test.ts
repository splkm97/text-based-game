// The people screen hangs all four portraits in one 2x2 grid, so the framing they share has to
// hold here rather than in the screen.

import { expect, test } from "vitest";
import { type Sprite, spriteRects, validateSprite } from "../../../shared/art/sprite";
import { CHARACTER_IDS } from "../ids";
import { THEME } from "../theme";
import { PORTRAITS } from "./portraits";

const SIZE = 32;
const IDS = ["dusik", "ru", "banjang", "taesan"] as const;
// The floor sits well under the measured minimum of the set (495 at 32x32).
// It catches a portrait authored near-empty, not a sparse one.
const MIN_OPAQUE = 400;

const opaquePixels = (sprite: Sprite): number =>
  spriteRects(sprite, THEME.palette).reduce((sum, rect) => sum + rect.width, 0);

/** Same shape as the drawing, every opaque pixel replaced by "#". */
const mask = (sprite: Sprite): readonly string[] =>
  sprite.rows.map((row) => row.replace(/[^.]/g, "#"));

test("the set holds exactly one portrait per character", () => {
  expect(Object.keys(PORTRAITS).sort()).toEqual([...CHARACTER_IDS].sort());
  expect(Object.keys(PORTRAITS).sort()).toEqual([...IDS].sort());
});

test.each(IDS)("%s is a 32x32 portrait with 32-char rows", (id) => {
  const portrait = PORTRAITS[id];
  expect(portrait.size).toBe(SIZE);
  expect(portrait.rows).toHaveLength(SIZE);
  for (const [y, row] of portrait.rows.entries()) {
    expect(row, `row ${y}`).toHaveLength(SIZE);
  }
  expect(() => validateSprite(portrait)).not.toThrow();
  expect(opaquePixels(portrait)).toBeGreaterThanOrEqual(MIN_OPAQUE);
});

test("no two portraits are the same drawing", () => {
  const drawings = IDS.map((id) => PORTRAITS[id].rows.join("\n"));
  expect(new Set(drawings).size).toBe(IDS.length);
});

// Hanging them edge to edge makes the framing a contract, not a preference: nothing may sit
// above the hair, the neck and the bust have to land on the same rows in all four, and the
// eyes have to sit in one band. Face width and hair width stay each character's own.
test("every portrait keeps the shared framing", () => {
  const neck = mask(PORTRAITS.dusik).slice(20, 23);
  const bust = mask(PORTRAITS.dusik).slice(23);
  for (const id of IDS) {
    const { rows } = PORTRAITS[id];
    const shape = mask(PORTRAITS[id]);
    expect(shape[0], `${id}: row 0`).toBe(".".repeat(SIZE));
    expect(shape[1]?.includes("#"), `${id}: head top at row 1`).toBe(true);
    expect(shape.slice(20, 23), `${id}: neck rows 21-23`).toEqual(neck);
    expect(shape.slice(23), `${id}: bust rows 24-32`).toEqual(bust);
    expect(rows.slice(9, 13).join("").includes("0"), `${id}: eyes in rows 10-13`).toBe(true);
    expect(rows.slice(1, 9).join("").includes("0"), `${id}: hair above the eyes is not black`).toBe(
      false,
    );
  }
});
