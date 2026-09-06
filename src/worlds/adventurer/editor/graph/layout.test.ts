// Layout contract against the real content: every node placed once, inside the canvas, with no
// overlap, and story chains flowing downward along their flag/next edges.

import { describe, expect, test } from "vitest";
import { CONTENT } from "../../content/index";
import { type LayoutOptions, layoutGraph } from "./layout";
import { buildGraph } from "./model";

const OPTIONS: LayoutOptions = {
  nodeWidth: 160,
  nodeHeight: 40,
  gapX: 16,
  gapY: 16,
  laneGap: 48,
  commonColumns: 3,
};

const GRAPH = buildGraph(CONTENT);
const LAYOUT = layoutGraph(GRAPH, OPTIONS);

const overlaps = (a: { x: number; y: number }, b: { x: number; y: number }): boolean =>
  a.x < b.x + OPTIONS.nodeWidth &&
  b.x < a.x + OPTIONS.nodeWidth &&
  a.y < b.y + OPTIONS.nodeHeight &&
  b.y < a.y + OPTIONS.nodeHeight;

describe("layoutGraph", () => {
  test("places every node exactly once", () => {
    const placedIds = LAYOUT.placed.map((p) => p.node.id).toSorted();
    expect(placedIds).toEqual(GRAPH.nodes.map((node) => node.id).toSorted());
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

  test("monk chain flag and next edges go downward", () => {
    const monkY = new Map(
      LAYOUT.placed
        .filter(
          (p) =>
            p.node.kind === "event" &&
            p.node.pool.kind === "origin" &&
            p.node.pool.origin === "origin_monk",
        )
        .map((p) => [p.node.id, p.y]),
    );
    expect(monkY.size).toBeGreaterThan(1);
    const internal = GRAPH.edges.filter(
      (edge) =>
        (edge.kind === "flag" || edge.kind === "next") &&
        monkY.has(edge.from) &&
        monkY.has(edge.to),
    );
    expect(internal.length).toBeGreaterThan(0);
    const upward = internal.filter(
      (edge) => (monkY.get(edge.to) ?? 0) <= (monkY.get(edge.from) ?? 0),
    );
    expect(upward).toEqual([]);
  });
});
