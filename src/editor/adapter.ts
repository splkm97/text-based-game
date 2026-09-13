// The adapter a world's `editor/` exposes to the dev-only editor frame. Types only; a world fills
// in the behavior.

import type { ComponentType } from "react";
import type { TokenName } from "../host/world";
import type { SaveRequest } from "./textPathSchema";

/** Property names and array indices from the object that carries `id`. */
export type TextPath = readonly (string | number)[];
export type EditableField = { readonly label: string; readonly path: TextPath };
export type GraphLane = { readonly id: string; readonly label: string; readonly columns?: number };
export type GraphNode = {
  readonly id: string;
  readonly label: string;
  readonly lane: string;
  readonly group?: string;
  readonly muted?: boolean;
  readonly terminal?: boolean;
};
export type GraphEdge = {
  readonly from: string;
  readonly to: string;
  readonly label: string;
  readonly style: "solid" | "dashed";
  readonly token: TokenName;
};
export type ContentGraph = {
  readonly lanes: readonly GraphLane[];
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
};
export type EditorModel<R> = {
  /** The save endpoint's own world key: only worlds with an editor model appear here, so this is
   * deliberately narrower than `WorldId` — a playable world without an editor must not typecheck
   * as an editable one. */
  readonly worldId: SaveRequest["world"];
  readonly registry: R;
  readonly graph: (registry: R) => ContentGraph;
  /** `[]` for nodes with no editable text. */
  readonly fields: (registry: R, nodeId: string) => readonly EditableField[];
  readonly readText: (registry: R, nodeId: string, path: TextPath) => string | undefined;
  readonly applyText: (registry: R, nodeId: string, path: TextPath, value: string) => R;
};
export type EditorAdapter<R> = EditorModel<R> & {
  readonly TestPlay: ComponentType<{ readonly registry: R; readonly selectedId: string | null }>;
};
/** Hides a world's registry type from the frame: `open` lends the adapter to a generic consumer. */
export type EditorAdapterHandle = {
  readonly open: <T>(use: <R>(adapter: EditorAdapter<R>) => T) => T;
};
