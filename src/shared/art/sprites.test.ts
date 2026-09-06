import { describe, expect, test } from "vitest";
import { PICO8 } from "./pico8";
import { type Sprite, spriteRects, validateSprite } from "./sprite";

const SIZE = 16;
const blankRows = (size = SIZE): readonly string[] =>
  Array.from({ length: size }, () => ".".repeat(size));
const withRow = (y: number, row: string, size = SIZE): Sprite => ({
  size,
  rows: blankRows(size).with(y, row),
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
    expect(() => validateSprite({ size: SIZE, rows: blankRows() })).not.toThrow();
  });

  test("accepts a blank 32x32 sprite", () => {
    expect(() => validateSprite({ size: 32, rows: blankRows(32) })).not.toThrow();
  });

  test("throws on wrong row count", () => {
    expect(() => validateSprite({ size: SIZE, rows: blankRows().slice(1) })).toThrow(RangeError);
    expect(() => validateSprite({ size: 32, rows: blankRows(SIZE) })).toThrow(RangeError);
  });

  test("throws on wrong row length", () => {
    expect(() => validateSprite(withRow(3, ".".repeat(SIZE - 1)))).toThrow(RangeError);
    expect(() => validateSprite(withRow(3, ".".repeat(SIZE + 1)))).toThrow(RangeError);
    expect(() => validateSprite(withRow(20, ".".repeat(SIZE), 32))).toThrow(RangeError);
  });

  test("throws on a character outside 0-f and .", () => {
    expect(() => validateSprite(withRow(0, `x${".".repeat(SIZE - 1)}`))).toThrow(RangeError);
    expect(() => validateSprite(withRow(0, `A${".".repeat(SIZE - 1)}`))).toThrow(RangeError);
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

  test("a 32x32 sprite yields rects at coordinates beyond 15", () => {
    expect(spriteRects(withRow(31, `${".".repeat(28)}7777`, 32), PICO8)).toEqual([
      { x: 28, y: 31, width: 4, fill: PICO8[7] },
    ]);
  });
});
