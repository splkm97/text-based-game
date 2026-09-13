// This world's palette and role tokens. The only place a hex color appears in this world.
// A ruined-city civil-service palette: concrete grays over rebar rust, caution amber and
// sign red, form paper, and a dust-hazed dusk. Warmer and grittier than the other worlds.

import type { WorldTheme } from "../../host/world";

const PALETTE: readonly string[] = [
  "#101318", // 0 bitumen black
  "#1e242c", // 1 charcoal
  "#313844", // 2 concrete dark
  "#4a545f", // 3 concrete
  "#67727d", // 4 weathered concrete
  "#929ca6", // 5 dust gray
  "#c5ccd2", // 6 chalk
  "#ece4d0", // 7 form paper
  "#f2b63c", // 8 caution amber
  "#c47a3f", // 9 rebar rust
  "#b13a2e", // a sign red
  "#6f2b21", // b scorched brick
  "#5e7142", // c weed olive
  "#3d5a7a", // d dusk blue
  "#92acc2", // e pale dusk
  "#55496a", // f smoke violet
];

export const THEME: WorldTheme = {
  palette: PALETTE,
  tokens: {
    ink: "#1e242c",
    "ink-deep": "#101318",
    slate: "#4a545f",
    ash: "#929ca6",
    parchment: "#ece4d0",
    ember: "#c47a3f",
    blood: "#b13a2e",
    moss: "#5e7142",
    sky: "#92acc2",
    gold: "#f2b63c",
    sand: "#c5ccd2",
    dusk: "#55496a",
  },
};
