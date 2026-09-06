// This world's palette and role tokens. The only place a hex color appears in this world.

import type { WorldTheme } from "../../host/world";
import { PICO8 } from "../../shared/art/pico8";

export const THEME: WorldTheme = {
  palette: PICO8,
  tokens: {
    ink: "#1d2b53",
    "ink-deep": "#000000",
    slate: "#5f574f",
    ash: "#c2c3c7",
    parchment: "#fff1e8",
    ember: "#ffa300",
    blood: "#ff004d",
    moss: "#008751",
    sky: "#29adff",
    gold: "#ffec27",
    sand: "#ffccaa",
    dusk: "#83769c",
  },
};
