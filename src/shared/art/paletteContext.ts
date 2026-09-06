// The palette a `PixelSprite` indexes into. A world provides its own; the default is PICO-8.

import { createContext } from "react";
import { PICO8 } from "./pico8";

export const PaletteContext = createContext<readonly string[]>(PICO8);
