// Hand-authored 16x16 origin portraits (bust view). Chars index PICO-8; "." is transparent.

import { type Sprite, sprite } from "../../../shared/art/sprite";
import type { OriginId } from "../content/ids";

export const ORIGIN_PORTRAITS: Readonly<Record<OriginId, Sprite>> = {
  // Helmet with nose guard, scar under the right eye, gray plate shoulders.
  origin_mercenary: sprite([
    "....00000000....",
    "...0666666660...",
    "..066666666660..",
    "..066666666660..",
    "..060000000060..",
    "..06fff6ffff60..",
    "..06f0f6f0ff60..",
    "..06fffff8ff60..",
    "...0ffff8fff0...",
    "...0ff0000ff0...",
    "....0ffffff0....",
    ".....0ffff0.....",
    "..00066ff66000..",
    ".06666666666660.",
    "0666666666666660",
    "0666666666666660",
  ]),
  // Tonsure (bald crown, ring of hair), hood dropped around the neck, brown robe.
  origin_monk: sprite([
    "................",
    "......0000......",
    ".....0ffff0.....",
    "....05ffff50....",
    "...055ffff550...",
    "...05ffffff50...",
    "...05f0ff0f50...",
    "...0ffffffff0...",
    "...0ff0000ff0...",
    "....0ffffff0....",
    "..0000ffff0000..",
    ".04440ffff04440.",
    "0444440ff0444440",
    "0444444444444440",
    "0444444444444440",
    "0444444444444440",
  ]),
  // Fair hair, half-lidded tired eyes with shadows, white ruff collar, faded coat.
  origin_heir: sprite([
    "................",
    ".....000000.....",
    "....0aaaaaa0....",
    "...0aaaaaaaa0...",
    "...0affffffa0...",
    "...0ffffffff0...",
    "...0f0ffff0f0...",
    "...0f5ffff5f0...",
    "...0ffffffff0...",
    "...0fff00fff0...",
    "....0ffffff0....",
    "..07770ff07770..",
    ".07777777777770.",
    "0dddd077770dddd0",
    "0dddddd22dddddd0",
    "0dddddd22dddddd0",
  ]),
};
