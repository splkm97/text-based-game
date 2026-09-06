// Worlds whose content sources the save endpoint may rewrite. A world joins once it ships an
// `editor/model.ts`; the editable coverage test runs over every entry.

import type { SaveRequest } from "../../src/editor/textPathSchema.ts";

export type WorldId = SaveRequest["world"];

export const EDITABLE_WORLDS: readonly WorldId[] = ["adventurer"];
