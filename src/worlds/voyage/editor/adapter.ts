// The editor adapter for this world: the pure model plus the embedded test play.

import type { EditorAdapter } from "../../../editor/adapter";
import type { Content } from "../types";
import { MODEL } from "./model";
import { TestPlay } from "./TestPlay";

export const ADAPTER: EditorAdapter<Content> = { ...MODEL, TestPlay };
