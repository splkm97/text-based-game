// Pure lane layout for a `ContentGraph`: lanes left to right (start, origin, common, journey,
// ending), story chains grouped per origin/journey and ordered topologically, common events in
// a grid. Deterministic: identical input yields identical positions.

import { ENDING_IDS, FALLBACK_EVENT_ID, JOURNEY_IDS, ORIGIN_IDS } from "../../content/ids";
import type { EventPool } from "../../engine/types";
import type { ContentGraph, GraphEdge, GraphNode, Lane } from "./model";

export type Placed = { readonly node: GraphNode; readonly x: number; readonly y: number };

export type LayoutOptions = {
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly laneGap: number;
  readonly commonColumns: number;
};

export type Layout = {
  readonly placed: readonly Placed[];
  readonly width: number;
  readonly height: number;
  readonly laneX: Readonly<Record<Lane, number>>;
};

const ORDERING_EDGE_KINDS: ReadonlySet<GraphEdge["kind"]> = new Set(["start", "flag", "next"]);

const byId = (a: GraphNode, b: GraphNode): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/** Nodes in the order of `ids`; ids with no node are skipped. */
const inOrder = (nodes: readonly GraphNode[], ids: readonly string[]): readonly GraphNode[] =>
  ids.flatMap((id) => nodes.filter((node) => node.id === id));

/**
 * Kahn's algorithm over the group's internal edges, taking the smallest ready id each step.
 * When a cycle blocks every remaining node, the remainder follows id order.
 */
const topoOrder = (
  group: readonly GraphNode[],
  edges: readonly GraphEdge[],
): readonly GraphNode[] => {
  const members = new Set(group.map((node) => node.id));
  const internal = edges.filter(
    (edge) =>
      ORDERING_EDGE_KINDS.has(edge.kind) &&
      edge.from !== edge.to &&
      members.has(edge.from) &&
      members.has(edge.to),
  );
  const step = (
    remaining: readonly GraphNode[],
    done: readonly GraphNode[],
  ): readonly GraphNode[] => {
    const pending = new Set(remaining.map((node) => node.id));
    const next = remaining.find(
      (node) => !internal.some((edge) => edge.to === node.id && pending.has(edge.from)),
    );
    if (next === undefined) {
      return [...done, ...remaining];
    }
    return step(
      remaining.filter((node) => node !== next),
      [...done, next],
    );
  };
  return step(group.toSorted(byId), []);
};

const rowY = (row: number, options: LayoutOptions): number =>
  options.gapY + row * (options.nodeHeight + options.gapY);

const column = (
  nodes: readonly GraphNode[],
  x: number,
  top: number,
  options: LayoutOptions,
): readonly Placed[] =>
  nodes.map((node, row) => ({ node, x, y: top + row * (options.nodeHeight + options.gapY) }));

/** Stacks groups in one column, leaving one extra `gapY` between consecutive groups. */
const stackGroups = (
  groups: readonly (readonly GraphNode[])[],
  x: number,
  options: LayoutOptions,
): readonly Placed[] =>
  groups
    .filter((group) => group.length > 0)
    .reduce<{ readonly placed: readonly Placed[]; readonly top: number }>(
      (acc, group) => ({
        placed: [...acc.placed, ...column(group, x, acc.top, options)],
        top: acc.top + group.length * (options.nodeHeight + options.gapY) + options.gapY,
      }),
      { placed: [], top: rowY(0, options) },
    ).placed;

/** The origin or journey that owns a story pool; `null` for the common pool. */
const poolOwner = (pool: EventPool): string | null => {
  switch (pool.kind) {
    case "common":
      return null;
    case "origin":
      return pool.origin;
    case "journey":
      return pool.journey;
  }
};

const eventsOwnedBy = (nodes: readonly GraphNode[], owner: string): readonly GraphNode[] =>
  nodes.filter((node) => node.kind === "event" && poolOwner(node.pool) === owner);

/** One column of story chains, one topologically ordered group per owner in `owners` order. */
const storyLane = (
  graph: ContentGraph,
  owners: readonly string[],
  x: number,
  options: LayoutOptions,
): readonly Placed[] =>
  stackGroups(
    owners.map((owner) => topoOrder(eventsOwnedBy(graph.nodes, owner), graph.edges)),
    x,
    options,
  );

const commonLane = (
  nodes: readonly GraphNode[],
  x: number,
  options: LayoutOptions,
): readonly Placed[] => {
  const columns = Math.max(1, options.commonColumns);
  const sorted = nodes.filter((node) => node.lane === "common").toSorted(byId);
  const ordered = [
    ...sorted.filter((node) => node.id === FALLBACK_EVENT_ID),
    ...sorted.filter((node) => node.id !== FALLBACK_EVENT_ID),
  ];
  return ordered.map((node, index) => ({
    node,
    x: x + (index % columns) * (options.nodeWidth + options.gapX),
    y: rowY(Math.floor(index / columns), options),
  }));
};

const laneXOf = (options: LayoutOptions): Readonly<Record<Lane, number>> => {
  const columns = Math.max(1, options.commonColumns);
  const commonWidth = columns * options.nodeWidth + (columns - 1) * options.gapX;
  const start = options.laneGap;
  const origin = start + options.nodeWidth + options.laneGap;
  const common = origin + options.nodeWidth + options.laneGap;
  const journey = common + commonWidth + options.laneGap;
  const ending = journey + options.nodeWidth + options.laneGap;
  return { start, origin, common, journey, ending };
};

export const layoutGraph = (graph: ContentGraph, options: LayoutOptions): Layout => {
  const laneX = laneXOf(options);
  const startNodes = [
    ...inOrder(
      graph.nodes.filter((node) => node.kind === "origin"),
      ORIGIN_IDS,
    ),
    ...inOrder(
      graph.nodes.filter((node) => node.kind === "journey"),
      JOURNEY_IDS,
    ),
  ];
  const endingNodes = inOrder(
    graph.nodes.filter((node) => node.kind === "ending"),
    ENDING_IDS,
  );
  const placed = [
    ...column(startNodes, laneX.start, rowY(0, options), options),
    ...storyLane(graph, ORIGIN_IDS, laneX.origin, options),
    ...commonLane(graph.nodes, laneX.common, options),
    ...storyLane(graph, JOURNEY_IDS, laneX.journey, options),
    ...column(endingNodes, laneX.ending, rowY(0, options), options),
  ];
  const right = placed.reduce((max, p) => Math.max(max, p.x + options.nodeWidth), 0);
  const bottom = placed.reduce((max, p) => Math.max(max, p.y + options.nodeHeight), 0);
  return { placed, width: right + options.laneGap, height: bottom + options.gapY, laneX };
};
