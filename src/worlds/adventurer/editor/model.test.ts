// Model contract against the real content: every event is a node, every edge lands on a node,
// story endings are reachable through end edges, the monk chain opens and links as authored, and
// every field reads back what applyText wrote without touching anything else.

import { describe, expect, test } from "vitest";
import type { TextPath } from "../../../editor/adapter";
import { ENDING_IDS } from "../content/ids";
import { CONTENT } from "../content/index";
import { MODEL } from "./model";

const GRAPH = MODEL.graph(CONTENT);
const NODE_IDS: ReadonlySet<string> = new Set(GRAPH.nodes.map((node) => node.id));
const ENGINE_OWNED: readonly string[] = ["death", "madness", "retire"];
const EVENT = "origin_monk_1_abbey_messenger";
const EVENT_LANES: ReadonlySet<string> = new Set(["origin", "common", "journey"]);

describe("graph nodes", () => {
  test("every event appears exactly once as a node", () => {
    const eventNodeIds = GRAPH.nodes
      .filter((node) => EVENT_LANES.has(node.lane))
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

describe("graph endings", () => {
  const incomingEnd = (ending: string): number =>
    GRAPH.edges.filter((edge) => edge.token === "ember" && edge.to === ending).length;

  test("each story ending has at least one incoming end edge", () => {
    const storyEndings = ENDING_IDS.filter((id) => !ENGINE_OWNED.includes(id));
    expect(storyEndings).toHaveLength(9);
    for (const id of storyEndings) {
      expect(incomingEnd(id), id).toBeGreaterThan(0);
    }
  });

  test("engine-owned endings are muted terminals with no incoming end edge", () => {
    const muted = GRAPH.nodes.filter((node) => node.lane === "ending" && node.muted === true);
    expect(muted.map((node) => node.id).toSorted()).toEqual(ENGINE_OWNED);
    for (const node of muted) {
      expect(node.terminal, node.id).toBe(true);
      expect(incomingEnd(node.id), node.id).toBe(0);
    }
  });
});

describe("graph monk chain", () => {
  test("origin_monk opens the chain with a start edge", () => {
    expect(GRAPH.edges).toContainEqual({
      from: "origin_monk",
      to: EVENT,
      label: "monk.start",
      style: "solid",
      token: "sky",
    });
  });

  test("a dashed flag edge links the first event to the one requiring monk.step1", () => {
    const step1 = Object.values(CONTENT.events).filter((event) =>
      event.requires.some(
        (condition) => condition.kind === "flag" && condition.flag === "monk.step1",
      ),
    );
    expect(step1).toHaveLength(1);
    expect(GRAPH.edges).toContainEqual({
      from: EVENT,
      to: step1[0]?.id,
      label: "monk.step1",
      style: "dashed",
      token: "dusk",
    });
  });
});

describe("fields and text paths", () => {
  test("an event lists its title, text, and every choice text and leaf in order", () => {
    expect(MODEL.fields(CONTENT, EVENT).map((field) => field.label)).toEqual([
      "제목",
      "본문",
      "선택지 1 텍스트",
      "1번 결과",
      "선택지 2 텍스트",
      "2번 성공",
      "2번 실패",
      "선택지 3 텍스트",
      "3번 성공",
      "3번 실패",
    ]);
    expect(MODEL.fields(CONTENT, "death").map((field) => field.label)).toEqual(["제목", "본문"]);
    expect(MODEL.fields(CONTENT, "origin_monk")).toEqual([]);
  });

  test("applyText overlays every field and leaves the original untouched", () => {
    const targets = ["death", EVENT].flatMap((id) =>
      MODEL.fields(CONTENT, id).map((field) => [id, field.path] as const),
    );
    const before = targets.map(([id, path]) => MODEL.readText(CONTENT, id, path));
    const overlaid = targets.reduce(
      (content, [id, path]) => MODEL.applyText(content, id, path, path.join(".")),
      CONTENT,
    );

    for (const [id, path] of targets) {
      expect(MODEL.readText(overlaid, id, path)).toBe(path.join("."));
    }
    expect(targets.map(([id, path]) => MODEL.readText(CONTENT, id, path))).toEqual(before);
    expect(overlaid.events[EVENT]?.choices[0]?.outcome.kind).toBe("direct");
    expect(overlaid.events[EVENT]?.choices[1]?.requires).toBe(
      CONTENT.events[EVENT]?.choices[1]?.requires,
    );
  });

  test("paths that do not resolve to a string are skipped, never invented", () => {
    const targets: readonly (readonly [string, TextPath])[] = [
      ["no_such_node", ["title"]],
      [EVENT, ["choices", 0, "outcome", "success", "text"]],
      [EVENT, ["choices", 99, "text"]],
      [EVENT, ["weight"]],
      [EVENT, ["choices"]],
      ["death", ["tone", "x"]],
    ];
    for (const [id, path] of targets) {
      expect(MODEL.applyText(CONTENT, id, path, "x"), `${id} ${path.join(".")}`).toBe(CONTENT);
      expect(MODEL.readText(CONTENT, id, path), `${id} ${path.join(".")}`).toBeUndefined();
    }
  });
});
