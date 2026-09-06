import { describe, expect, test } from "vitest";
import { PICO8 } from "./pico8";
import { SPRITE_SIZE, type Sprite, spriteRects, validateSprite } from "./sprite";

const BLANK_ROW = ".".repeat(SPRITE_SIZE);
const blankRows = (): readonly string[] => Array.from({ length: SPRITE_SIZE }, () => BLANK_ROW);
const withRow = (y: number, row: string): Sprite => ({
  size: SPRITE_SIZE,
  rows: blankRows().with(y, row),
});

describe("PICO8", () => {
  test("is the 16-entry PICO-8 palette in index order", () => {
    expect(PICO8).toEqual([
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
    ]);
  });
});

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
    expect(spriteRects(withRow(5, "..3333.........."), PICO8)).toEqual([
      { x: 2, y: 5, width: 4, fill: PICO8[3] },
    ]);
  });

  test("splits runs at color changes and skips transparent pixels", () => {
    expect(spriteRects(withRow(0, "12.2............"), PICO8)).toEqual([
      { x: 0, y: 0, width: 1, fill: PICO8[1] },
      { x: 1, y: 0, width: 1, fill: PICO8[2] },
      { x: 3, y: 0, width: 1, fill: PICO8[2] },
    ]);
  });

  test("monochrome paints every opaque pixel in one fill and merges across colors", () => {
    expect(spriteRects(withRow(0, "12.2............"), PICO8, "#abcdef")).toEqual([
      { x: 0, y: 0, width: 2, fill: "#abcdef" },
      { x: 3, y: 0, width: 1, fill: "#abcdef" },
    ]);
  });
});
