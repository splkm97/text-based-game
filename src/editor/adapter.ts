// The adapter a world's `editor/` exposes to the dev-only editor frame. Types only; a world fills
// in the behavior.

import type { ComponentType } from "react";
import type { TokenName, WorldId } from "../host/world";

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
  readonly worldId: WorldId;
  readonly registry: R;
  readonly graph: (registry: R) => ContentGraph;
  /** `[]` for nodes with no editable text. */
  readonly fields: (registry: R, nodeId: string) => readonly EditableField[];
  readonly readText: (registry: R, nodeId: string, path: TextPath) => string | undefined;
  readonly applyText: (registry: R, nodeId: string, path: TextPath, value: string) => R;
};
export type EditorAdapter<R = never> = EditorModel<R> & {
  readonly TestPlay: ComponentType<{ readonly registry: R; readonly selectedId: string | null }>;
};
