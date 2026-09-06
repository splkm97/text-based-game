// The layout contract twice over: a small graph pins the rules (lane x order, group stacking with
// an extra gap, topological order with id tiebreak, row-major grids), and the adventurer content
// checks the invariants that matter at scale: every node placed once, inside the canvas, with no
// overlap, and story chains flowing downward along their edges.

import { describe, expect, test } from "vitest";
import { MODEL } from "../../worlds/adventurer/editor/model";
import type { ContentGraph, GraphEdge, GraphNode } from "../adapter";
import { type LayoutOptions, layoutGraph } from "./layout";

const OPTIONS: LayoutOptions = { nodeWidth: 100, nodeHeight: 20, gapX: 10, gapY: 10, laneGap: 40 };

const node = (id: string, lane: string, group?: string): GraphNode =>
  group === undefined ? { id, label: id, lane } : { id, label: id, lane, group };

const edge = (from: string, to: string): GraphEdge => ({
  from,
  to,
  label: "",
  style: "solid",
  token: "parchment",
});

const SMALL: ContentGraph = {
  lanes: [
    { id: "a", label: "A" },
    { id: "b", label: "B", columns: 2 },
  ],
  nodes: [
    node("n3", "a", "g1"),
    node("n1", "a", "g1"),
    node("n2", "a", "g1"),
    node("m1", "a", "g2"),
    node("b1", "b"),
    node("b2", "b"),
    node("b3", "b"),
  ],
  edges: [edge("n2", "n1")],
};

describe("layoutGraph rules", () => {
  const layout = layoutGraph(SMALL, OPTIONS);
  const at = (id: string) => {
    const placed = layout.placed.find((p) => p.node.id === id);
    if (placed === undefined) throw new Error(`${id} not placed`);
    return [placed.x, placed.y] as const;
  };

  test("lanes sit left to right at laneGap plus each lane's width", () => {
    expect(layout.lanes.map(({ lane, x }) => [lane.id, x])).toEqual([
      ["a", 40],
      ["b", 180],
    ]);
    expect(layout.width).toBe(180 + 2 * 100 + 10 + 40);
    expect(layout.height).toBe(110 + 20 + 10);
  });

  test("a one-column lane orders each group topologically with id tiebreak and gaps groups", () => {
    expect(at("n2")).toEqual([40, 10]);
    expect(at("n1")).toEqual([40, 40]);
    expect(at("n3")).toEqual([40, 70]);
    expect(at("m1")).toEqual([40, 110]);
  });

  test("a wider lane fills row-major in node order", () => {
    expect(at("b1")).toEqual([180, 10]);
    expect(at("b2")).toEqual([290, 10]);
    expect(at("b3")).toEqual([180, 40]);
  });
});

describe("layoutGraph over adventurer content", () => {
  const GRAPH = MODEL.graph(MODEL.registry);
  const LAYOUT = layoutGraph(GRAPH, OPTIONS);

  const overlaps = (a: { x: number; y: number }, b: { x: number; y: number }): boolean =>
    a.x < b.x + OPTIONS.nodeWidth &&
    b.x < a.x + OPTIONS.nodeWidth &&
    a.y < b.y + OPTIONS.nodeHeight &&
    b.y < a.y + OPTIONS.nodeHeight;

  test("places every node exactly once", () => {
    const placedIds = LAYOUT.placed.map((p) => p.node.id).toSorted();
    expect(placedIds).toEqual(GRAPH.nodes.map((n) => n.id).toSorted());
  });

  test("keeps every node inside width and height", () => {
    const outside = LAYOUT.placed.filter(
      (p) =>
        p.x < 0 ||
        p.y < 0 ||
        p.x + OPTIONS.nodeWidth > LAYOUT.width ||
        p.y + OPTIONS.nodeHeight > LAYOUT.height,
    );
    expect(outside.map((p) => p.node.id)).toEqual([]);
  });

  test("places no two nodes overlapping", () => {
    const collisions = LAYOUT.placed.flatMap((a, i) =>
      LAYOUT.placed
        .slice(i + 1)
        .filter((b) => overlaps(a, b))
        .map((b) => [a.node.id, b.node.id]),
    );
    expect(collisions).toEqual([]);
  });

  test("monk chain edges go downward", () => {
    const monkY = new Map(
      LAYOUT.placed
        .filter((p) => p.node.lane === "origin" && p.node.group === "origin_monk")
        .map((p) => [p.node.id, p.y]),
    );
    expect(monkY.size).toBeGreaterThan(1);
    const internal = GRAPH.edges.filter((e) => monkY.has(e.from) && monkY.has(e.to));
    expect(internal.length).toBeGreaterThan(0);
    const upward = internal.filter((e) => (monkY.get(e.to) ?? 0) <= (monkY.get(e.from) ?? 0));
    expect(upward).toEqual([]);
  });
});
