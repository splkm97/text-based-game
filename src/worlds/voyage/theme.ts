// This world's palette and role tokens. The only place a hex color appears in this world.
// A cold palette: navy and teal darks, cyan and pale mint accents, one warm alert color (d).

import type { WorldTheme } from "../../host/world";

const PALETTE: readonly string[] = [
  "#070b16", // 0 abyss
  "#101c33", // 1 navy
  "#17304d", // 2 navy mid
  "#1d4a5c", // 3 teal dark
  "#246b6e", // 4 teal
  "#3a5568", // 5 slate blue
  "#5d7d8f", // 6 steel
  "#9fb9c4", // 7 pale steel
  "#e4f2f1", // 8 mint white
  "#3fd0c9", // 9 cyan
  "#a8f0dc", // a pale mint
  "#63c7a3", // b sea green
  "#d9e88a", // c pale lime
  "#ff7a45", // d coral alert
  "#c94a6d", // e cold crimson
  "#6f6a9e", // f violet
];

export const THEME: WorldTheme = {
  palette: PALETTE,
  tokens: {
    ink: "#101c33",
    "ink-deep": "#070b16",
    slate: "#3a5568",
    ash: "#9fb9c4",
    parchment: "#e4f2f1",
    ember: "#ff7a45",
    blood: "#c94a6d",
    moss: "#63c7a3",
    sky: "#3fd0c9",
    gold: "#d9e88a",
    sand: "#a8f0dc",
    dusk: "#6f6a9e",
  },
};
