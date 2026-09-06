// The contract between the host and a world. A world imports only the types from this file; the
// host imports a world's `meta.ts` statically and its `world.ts` through a dynamic `import()`.

import type { ComponentType } from "react";
import type { EditorAdapterHandle } from "../editor/adapter";
import type { Sprite } from "../shared/art/sprite";

export type WorldId = "adventurer" | "voyage";

export const TOKEN_NAMES = [
  "ink",
  "ink-deep",
  "slate",
  "ash",
  "parchment",
  "ember",
  "blood",
  "moss",
  "sky",
  "gold",
  "sand",
  "dusk",
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];

/** `palette` has exactly 16 hex entries, indexed by sprite digits 0-f. */
export type WorldTheme = {
  readonly palette: readonly string[];
  readonly tokens: Readonly<Record<TokenName, string>>;
};

export type WorldMeta = {
  readonly id: WorldId;
  readonly title: string;
  readonly tagline: string;
  readonly cover: Sprite;
  readonly theme: WorldTheme;
};

export type WorldRootProps = { readonly onExit: () => void };

export type WorldModule = {
  readonly meta: WorldMeta;
  readonly Root: ComponentType<WorldRootProps>;
  readonly loadEditor: () => Promise<EditorAdapterHandle>;
};
