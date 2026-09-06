// Pure lane layout for a `ContentGraph`: lanes left to right in `graph.lanes` order. A one-column
// lane stacks its nodes grouped by `group` in first-seen order, each group ordered topologically
// over its own edges with id as the tiebreak, one extra gap between groups; a wider lane fills
// row-major in node order. Deterministic: identical input yields identical positions.

import type { ContentGraph, GraphEdge, GraphLane, GraphNode } from "../adapter";

export type Placed = { readonly node: GraphNode; readonly x: number; readonly y: number };
export type PlacedLane = { readonly lane: GraphLane; readonly x: number };

export type LayoutOptions = {
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  readonly gapX: number;
  readonly gapY: number;
  readonly laneGap: number;
};

export type Layout = {
  readonly placed: readonly Placed[];
  readonly lanes: readonly PlacedLane[];
  readonly width: number;
  readonly height: number;
};

const byId = (a: GraphNode, b: GraphNode): number => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

const columnsOf = (lane: GraphLane): number => Math.max(1, lane.columns ?? 1);

const laneWidth = (lane: GraphLane, options: LayoutOptions): number => {
  const columns = columnsOf(lane);
  return columns * options.nodeWidth + (columns - 1) * options.gapX;
};

const rowPitch = (options: LayoutOptions): number => options.nodeHeight + options.gapY;

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
    (edge) => edge.from !== edge.to && members.has(edge.from) && members.has(edge.to),
  );
  const step = (
    remaining: readonly GraphNode[],
    done: readonly GraphNode[],
  ): readonly GraphNode[] => {
    const pending = new Set(remaining.map((node) => node.id));
    const next = remaining.find(
      (node) => !internal.some((edge) => edge.to === node.id && pending.has(edge.from)),
    );
    if (next === undefined) return [...done, ...remaining];
    return step(
      remaining.filter((node) => node !== next),
      [...done, next],
    );
  };
  return step(group.toSorted(byId), []);
};

/** Nodes grouped by `group` in first-seen order; ungrouped nodes form one group of their own. */
const groupsOf = (nodes: readonly GraphNode[]): readonly (readonly GraphNode[])[] =>
  [...new Set(nodes.map((node) => node.group))].map((key) =>
    nodes.filter((node) => node.group === key),
  );

/** Stacks groups in one column, leaving one extra `gapY` between consecutive groups. */
const stack = (
  groups: readonly (readonly GraphNode[])[],
  x: number,
  options: LayoutOptions,
): readonly Placed[] =>
  groups.reduce<{ readonly placed: readonly Placed[]; readonly top: number }>(
    (acc, group) => ({
      placed: [
        ...acc.placed,
        ...group.map((node, row) => ({ node, x, y: acc.top + row * rowPitch(options) })),
      ],
      top: acc.top + group.length * rowPitch(options) + options.gapY,
    }),
    { placed: [], top: options.gapY },
  ).placed;

const grid = (
  nodes: readonly GraphNode[],
  x: number,
  columns: number,
  options: LayoutOptions,
): readonly Placed[] =>
  nodes.map((node, index) => ({
    node,
    x: x + (index % columns) * (options.nodeWidth + options.gapX),
    y: options.gapY + Math.floor(index / columns) * rowPitch(options),
  }));

const placeLane = (
  graph: ContentGraph,
  { lane, x }: PlacedLane,
  options: LayoutOptions,
): readonly Placed[] => {
  const nodes = graph.nodes.filter((node) => node.lane === lane.id);
  const columns = columnsOf(lane);
  if (columns > 1) return grid(nodes, x, columns, options);
  return stack(
    groupsOf(nodes).map((group) => topoOrder(group, graph.edges)),
    x,
    options,
  );
};

const placeLanes = (lanes: readonly GraphLane[], options: LayoutOptions): readonly PlacedLane[] =>
  lanes.reduce<{ readonly lanes: readonly PlacedLane[]; readonly x: number }>(
    (acc, lane) => ({
      lanes: [...acc.lanes, { lane, x: acc.x }],
      x: acc.x + laneWidth(lane, options) + options.laneGap,
    }),
    { lanes: [], x: options.laneGap },
  ).lanes;

export const layoutGraph = (graph: ContentGraph, options: LayoutOptions): Layout => {
  const lanes = placeLanes(graph.lanes, options);
  const placed = lanes.flatMap((lane) => placeLane(graph, lane, options));
  const right = placed.reduce((max, p) => Math.max(max, p.x + options.nodeWidth), 0);
  const bottom = placed.reduce((max, p) => Math.max(max, p.y + options.nodeHeight), 0);
  return { placed, lanes, width: right + options.laneGap, height: bottom + options.gapY };
};
