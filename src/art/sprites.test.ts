import { describe, expect, test } from "vitest";
import { MONSTER_IDS } from "../content/ids";
import { PICO8, SPRITE_SIZE, type Sprite, spriteRects, validateSprite } from "./sprite";
import { ICONS } from "./sprites/icons";
import { MONSTER_SPRITES } from "./sprites/monsters";
import { ORIGIN_PORTRAITS } from "./sprites/portraits";

const BLANK_ROW = ".".repeat(SPRITE_SIZE);
const blankRows = (): readonly string[] => Array.from({ length: SPRITE_SIZE }, () => BLANK_ROW);
const withRow = (y: number, row: string): Sprite => ({
  size: SPRITE_SIZE,
  rows: blankRows().with(y, row),
});

const opaquePixels = (sprite: Sprite): number =>
  spriteRects(sprite).reduce((sum, rect) => sum + rect.width, 0);

describe("validateSprite", () => {
  test("accepts a blank 16x16 sprite", () => {
    expect(() => validateSprite({ size: SPRITE_SIZE, rows: blankRows() })).not.toThrow();
  });

  test("throws on wrong row count", () => {
    expect(() => validateSprite({ size: SPRITE_SIZE, rows: blankRows().slice(1) })).toThrow(
      RangeError,
    );
  });

  test("throws on wrong row length", () => {
    expect(() => validateSprite(withRow(3, ".".repeat(SPRITE_SIZE - 1)))).toThrow(RangeError);
    expect(() => validateSprite(withRow(3, ".".repeat(SPRITE_SIZE + 1)))).toThrow(RangeError);
  });

  test("throws on a character outside 0-f and .", () => {
    expect(() => validateSprite(withRow(0, `x${".".repeat(SPRITE_SIZE - 1)}`))).toThrow(RangeError);
    expect(() => validateSprite(withRow(0, `A${".".repeat(SPRITE_SIZE - 1)}`))).toThrow(RangeError);
  });
});

describe("spriteRects", () => {
  test("merges a horizontal run of one color into one rect", () => {
    expect(spriteRects(withRow(5, "..3333.........."))).toEqual([
      { x: 2, y: 5, width: 4, fill: PICO8[3] },
    ]);
  });

  test("splits runs at color changes and skips transparent pixels", () => {
    expect(spriteRects(withRow(0, "12.2............"))).toEqual([
      { x: 0, y: 0, width: 1, fill: PICO8[1] },
      { x: 1, y: 0, width: 1, fill: PICO8[2] },
      { x: 3, y: 0, width: 1, fill: PICO8[2] },
    ]);
  });

  test("monochrome paints every opaque pixel in one fill and merges across colors", () => {
    expect(spriteRects(withRow(0, "12.2............"), "#abcdef")).toEqual([
      { x: 0, y: 0, width: 2, fill: "#abcdef" },
      { x: 3, y: 0, width: 1, fill: "#abcdef" },
    ]);
  });
});

describe("sprite sets", () => {
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
});
