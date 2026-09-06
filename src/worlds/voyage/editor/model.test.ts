// Model contract against the real content: every content entry is a node once, every edge lands
// on a node, every confrontation failure that costs captain hp links to 빈 함교, and every field of
// every node reads back what applyText wrote without touching anything else.

import { describe, expect, test } from "vitest";
import type { TextPath } from "../../../editor/adapter";
import { CONTENT } from "../content";
import { MODEL } from "./model";

const GRAPH = MODEL.graph(CONTENT);
const NODE_IDS: ReadonlySet<string> = new Set(GRAPH.nodes.map((node) => node.id));
const MESSAGE = "msg_01_first_case";
const EVENT = "ev_general_rumor";
const CONFRONTATION = "cf_take_the_keys";
const ENDING = "arrival";
const ONE_OF_EACH = [MESSAGE, EVENT, CONFRONTATION, ENDING];

describe("graph", () => {
  test("the four lanes read in play order", () => {
    expect(GRAPH.lanes.map((lane) => lane.label)).toEqual(["통신", "사건", "대치", "엔딩"]);
  });

  test("every message, event, confrontation, and ending is a node exactly once", () => {
    const ids = GRAPH.nodes.map((node) => node.id);
    expect(NODE_IDS.size).toBe(ids.length);
    expect(ids.toSorted()).toEqual(
      [
        ...CONTENT.messages.map((message) => message.id),
        ...Object.keys(CONTENT.events),
        ...CONTENT.confrontations.map((confrontation) => confrontation.id),
        ...Object.keys(CONTENT.endings),
      ].toSorted(),
    );
  });

  test("messages stack by earthDay", () => {
    const days = GRAPH.nodes
      .filter((node) => node.lane === "message")
      .map((node) => CONTENT.messages.find((message) => message.id === node.id)?.earthDay);
    expect(days).toEqual(days.toSorted((a, b) => (a ?? 0) - (b ?? 0)));
  });

  test("every edge endpoint is a node", () => {
    const dangling = GRAPH.edges.filter(
      (edge) => !NODE_IDS.has(edge.from) || !NODE_IDS.has(edge.to),
    );
    expect(dangling).toEqual([]);
  });

  test("messages chain in earthDay order and nothing else enters the 통신 lane", () => {
    const ordered = CONTENT.messages.toSorted((a, b) => a.earthDay - b.earthDay);
    const chain = GRAPH.edges.filter((edge) => edge.label === "다음 통신");
    expect(chain).toHaveLength(ordered.length - 1);
    expect(chain).toContainEqual({
      from: ordered[0]?.id,
      to: ordered[1]?.id,
      label: "다음 통신",
      style: "dashed",
      token: "dusk",
    });
    expect(chain.map((edge) => [edge.from, edge.to])).toEqual(
      ordered.slice(1).map((next, index) => [ordered[index]?.id, next.id]),
    );
  });

  test("every confrontation links to 빈 함교 through its failure hp loss", () => {
    const deaths = GRAPH.edges.filter((edge) => edge.to === "captain_dead");
    expect(deaths.map((edge) => edge.from).toSorted()).toEqual(
      CONTENT.confrontations.map((confrontation) => confrontation.id).toSorted(),
    );
    expect(GRAPH.edges).toContainEqual({
      from: CONFRONTATION,
      to: "captain_dead",
      label: "실패 -2",
      style: "solid",
      token: "blood",
    });
    expect(GRAPH.edges).toContainEqual({
      from: "cf_open_the_hatch",
      to: "captain_dead",
      label: "실패 -3",
      style: "solid",
      token: "blood",
    });
  });

  test("the rule-owned endings are terminals with no incoming edge", () => {
    const endings = GRAPH.nodes.filter((node) => node.lane === "ending");
    expect(endings.every((node) => node.terminal === true)).toBe(true);
    const entered = new Set(GRAPH.edges.map((edge) => edge.to));
    expect(endings.filter((node) => !entered.has(node.id)).map((node) => node.id)).toEqual([
      "mutiny",
      "outbreak",
      "arrival",
    ]);
  });
});

describe("fields and text paths", () => {
  test("each kind lists its fields in order", () => {
    const labels = (id: string) => MODEL.fields(CONTENT, id).map((field) => field.label);
    expect(labels(MESSAGE)).toEqual(["본문"]);
    expect(labels(EVENT)).toEqual([
      "제목",
      "본문",
      "선택지 1",
      "결과 1",
      "선택지 2",
      "결과 2",
      "선택지 3",
      "결과 3",
    ]);
    expect(labels(CONFRONTATION)).toEqual(["본문", "성공", "실패"]);
    expect(labels(ENDING)).toEqual(["제목", "본문"]);
    expect(labels("no_such_node")).toEqual([]);
  });

  test("every field of every node reads back a string", () => {
    const unreadable = GRAPH.nodes.flatMap((node) =>
      MODEL.fields(CONTENT, node.id)
        .filter((field) => typeof MODEL.readText(CONTENT, node.id, field.path) !== "string")
        .map((field) => `${node.id} ${field.path.join(".")}`),
    );
    expect(unreadable).toEqual([]);
  });

  test("applyText overlays every field and leaves the original untouched", () => {
    const targets = ONE_OF_EACH.flatMap((id) =>
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
    expect(overlaid.events[EVENT]?.choices[0]?.outcome.effects).toBe(
      CONTENT.events[EVENT]?.choices[0]?.outcome.effects,
    );
    expect(overlaid.confrontations.find((c) => c.id === CONFRONTATION)?.dc).toBe(13);
    expect(overlaid.messages.map((message) => message.id)).toEqual(
      CONTENT.messages.map((message) => message.id),
    );
  });

  test("paths that do not resolve to a string are skipped, never invented", () => {
    const targets: readonly (readonly [string, TextPath])[] = [
      ["no_such_node", ["title"]],
      [MESSAGE, ["earthDay"]],
      [EVENT, ["choices", 99, "text"]],
      [EVENT, ["choices"]],
      [CONFRONTATION, ["failure", "effects"]],
      [ENDING, ["tone", "x"]],
    ];
    for (const [id, path] of targets) {
      expect(MODEL.applyText(CONTENT, id, path, "x"), `${id} ${path.join(".")}`).toBe(CONTENT);
      expect(MODEL.readText(CONTENT, id, path), `${id} ${path.join(".")}`).toBeUndefined();
    }
  });
});
