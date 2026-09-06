// Graph contract against the real content: every event is a node, every edge lands on a node,
// story endings are reachable through `end` edges, and the monk chain opens and links as authored.

import { describe, expect, test } from "vitest";
import { ENDING_IDS } from "../../content/ids";
import { CONTENT } from "../../content/index";
import { buildGraph } from "./model";

const GRAPH = buildGraph(CONTENT);
const NODE_IDS: ReadonlySet<string> = new Set(GRAPH.nodes.map((node) => node.id));
const ENGINE_OWNED: readonly string[] = ["death", "madness", "retire"];

describe("buildGraph nodes", () => {
  test("every event appears exactly once as a node", () => {
    const eventNodeIds = GRAPH.nodes
      .filter((node) => node.kind === "event")
      .map((node) => node.id)
      .toSorted();
    expect(eventNodeIds).toEqual(Object.keys(CONTENT.events).toSorted());
  });

  test("every edge endpoint is a node", () => {
    const dangling = GRAPH.edges.filter(
      (edge) => !NODE_IDS.has(edge.from) || !NODE_IDS.has(edge.to),
    );
    expect(dangling).toEqual([]);
  });
});

describe("buildGraph endings", () => {
  const incomingEnd = (ending: string): number =>
    GRAPH.edges.filter((edge) => edge.kind === "end" && edge.to === ending).length;

  test("each story ending has at least one incoming end edge", () => {
    const storyEndings = ENDING_IDS.filter((id) => !ENGINE_OWNED.includes(id));
    expect(storyEndings).toHaveLength(9);
    for (const id of storyEndings) {
      expect(incomingEnd(id), id).toBeGreaterThan(0);
    }
  });

  test("engine-owned endings have no incoming end edge", () => {
    const engineOwned = GRAPH.nodes.filter((node) => node.kind === "ending" && node.engineOwned);
    expect(engineOwned.map((node) => node.id).toSorted()).toEqual(ENGINE_OWNED);
    for (const node of engineOwned) {
      expect(incomingEnd(node.id), node.id).toBe(0);
    }
  });
});

describe("buildGraph monk chain", () => {
  test("origin_monk opens the chain with a start edge", () => {
    expect(GRAPH.edges).toContainEqual({
      from: "origin_monk",
      to: "origin_monk_1_abbey_messenger",
      kind: "start",
      label: "monk.start",
    });
  });

  test("a flag edge links the first event to the one requiring monk.step1", () => {
    const step1 = Object.values(CONTENT.events).filter((event) =>
      event.requires.some(
        (condition) => condition.kind === "flag" && condition.flag === "monk.step1",
      ),
    );
    expect(step1).toHaveLength(1);
    expect(GRAPH.edges).toContainEqual({
      from: "origin_monk_1_abbey_messenger",
      to: step1[0]?.id,
      kind: "flag",
      label: "monk.step1",
    });
  });
});
