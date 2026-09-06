// Tailwind utilities read `var(--color-<token>)`, so setting the twelve variables inline on a
// wrapper element re-themes everything rendered inside it.

import type { CSSProperties } from "react";
import { TOKEN_NAMES, type WorldTheme } from "./world";

export const themeStyle = (theme: WorldTheme): CSSProperties =>
  Object.fromEntries(
    TOKEN_NAMES.map((name) => [`--color-${name}`, theme.tokens[name]]),
  ) as CSSProperties;
