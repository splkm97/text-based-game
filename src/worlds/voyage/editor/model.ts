// The voyage world's editor model: a pure `EditorModel` over its content registry. The graph has
// nodes for messages, events, confrontations, and endings; the fields cover every authored string
// the inspector may edit, read and replaced by walking a path from the object that carries the
// id. Dev-only; never reachable from the production bundle.
//
// Edges exist only where content data links two nodes. Messages chain in `earthDay` order as a
// timeline. No `Condition` reads a symptom and no `Effect` ends a run, so events carry no edges; a
// confrontation whose failure costs captain hp links to 빈 함교, the ending that hp reaching zero
// fires.

import type {
  ContentGraph,
  EditableField,
  EditorModel,
  GraphEdge,
  GraphLane,
  GraphNode,
  TextPath,
} from "../../../editor/adapter";
import { CONTENT } from "../content";
import { DEFAULT_FAILURE_HP } from "../rules/night";
import type {
  Confrontation,
  Content,
  Effect,
  Ending,
  EndingId,
  Message,
  ObserveEvent,
} from "../types";

const LANES: readonly GraphLane[] = [
  { id: "message", label: "통신" },
  { id: "event", label: "사건", columns: 2 },
  { id: "confrontation", label: "대치" },
  { id: "ending", label: "엔딩" },
];

const CAPTAIN_DEAD: EndingId = "captain_dead";

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

const byEarthDay = (a: Message, b: Message): number => a.earthDay - b.earthDay;

/** Zero-weight events are reachable only as the fallback, so they read muted. */
const eventNode = (event: ObserveEvent): GraphNode => ({
  id: event.id,
  label: event.title,
  lane: "event",
  ...(event.weight === 0 ? { muted: true } : {}),
});

const timeline = (content: Content): readonly Message[] => content.messages.toSorted(byEarthDay);

const nodesOf = (content: Content): readonly GraphNode[] => [
  ...timeline(content).map(
    (message): GraphNode => ({ id: message.id, label: message.title, lane: "message" }),
  ),
  ...Object.values(content.events).map(eventNode),
  ...content.confrontations.map(
    (confrontation): GraphNode => ({
      id: confrontation.id,
      label: confrontation.title,
      lane: "confrontation",
    }),
  ),
  ...Object.values(content.endings).map(
    (ending): GraphNode => ({ id: ending.id, label: ending.title, lane: "ending", terminal: true }),
  ),
];

/** Each message points at the one Earth sends next. */
const timelineEdges = (content: Content): readonly GraphEdge[] => {
  const messages = timeline(content);
  return messages.flatMap((message, index): readonly GraphEdge[] => {
    const next = messages[index + 1];
    return next === undefined
      ? []
      : [{ from: message.id, to: next.id, label: "다음 통신", style: "dashed", token: "dusk" }];
  });
};

/** Content may omit failure effects for the rules' default captain hp loss. */
const failureEffects = (confrontation: Confrontation): readonly Effect[] =>
  confrontation.failure.effects ?? [{ kind: "hp", delta: DEFAULT_FAILURE_HP }];

const deathEdges = (confrontation: Confrontation): readonly GraphEdge[] =>
  failureEffects(confrontation).flatMap((effect): readonly GraphEdge[] =>
    effect.kind === "hp" && effect.delta < 0
      ? [
          {
            from: confrontation.id,
            to: CAPTAIN_DEAD,
            label: `실패 ${effect.delta}`,
            style: "solid",
            token: "blood",
          },
        ]
      : [],
  );

const assertUniqueIds = (nodes: readonly GraphNode[]): void => {
  const ids = nodes.map((node) => node.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(`duplicate graph node id: ${[...new Set(duplicates)].join(", ")}`);
  }
};

/** Throws when two content entries share an id: node ids must be unique across all kinds. */
const graph = (content: Content): ContentGraph => {
  const nodes = nodesOf(content);
  assertUniqueIds(nodes);
  return {
    lanes: LANES,
    nodes,
    edges: [...timelineEdges(content), ...content.confrontations.flatMap(deathEdges)],
  };
};

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

const findMessage = (content: Content, id: string): Message | undefined =>
  content.messages.find((message) => message.id === id);

const findConfrontation = (content: Content, id: string): Confrontation | undefined =>
  content.confrontations.find((confrontation) => confrontation.id === id);

/** Endings are keyed by the closed `EndingId` union, so a free-form id needs a scan. */
const findEnding = (content: Content, id: string): Ending | undefined =>
  Object.values(content.endings).find((ending) => ending.id === id);

const MESSAGE_FIELDS: readonly EditableField[] = [{ label: "본문", path: ["text"] }];

/** Choice texts carry 선택지 and outcomes do not: the inspector keys its single-line rule on it. */
const eventFields = (event: ObserveEvent): readonly EditableField[] => [
  { label: "제목", path: ["title"] },
  { label: "본문", path: ["text"] },
  ...event.choices.flatMap((_choice, index): readonly EditableField[] => [
    { label: `선택지 ${index + 1}`, path: ["choices", index, "text"] },
    { label: `결과 ${index + 1}`, path: ["choices", index, "outcome", "text"] },
  ]),
];

const CONFRONTATION_FIELDS: readonly EditableField[] = [
  { label: "본문", path: ["text"] },
  { label: "성공", path: ["success", "text"] },
  { label: "실패", path: ["failure", "text"] },
];

const ENDING_FIELDS: readonly EditableField[] = [
  { label: "제목", path: ["title"] },
  { label: "본문", path: ["text"] },
];

const fields = (content: Content, nodeId: string): readonly EditableField[] => {
  if (findMessage(content, nodeId) !== undefined) return MESSAGE_FIELDS;
  const event = content.events[nodeId];
  if (event !== undefined) return eventFields(event);
  if (findConfrontation(content, nodeId) !== undefined) return CONFRONTATION_FIELDS;
  return findEnding(content, nodeId) === undefined ? [] : ENDING_FIELDS;
};

// ---------------------------------------------------------------------------
// Text paths
// ---------------------------------------------------------------------------

/** The JSON-shaped values a content object is made of; a path walks through these. */
type Tree =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly Tree[]
  | { readonly [key: string]: Tree };

const isList = (tree: Tree): tree is readonly Tree[] => Array.isArray(tree);

const isRecord = (tree: Tree): tree is { readonly [key: string]: Tree } =>
  typeof tree === "object" && tree !== null && !Array.isArray(tree);

const childOf = (tree: Tree, key: string | number): Tree => {
  if (typeof key === "number") return isList(tree) ? tree[key] : undefined;
  return isRecord(tree) && Object.hasOwn(tree, key) ? tree[key] : undefined;
};

/** `tree` with the string at `path` replaced, or undefined when the path does not end on one. */
const writeAt = (tree: Tree, path: TextPath, value: string): Tree | undefined => {
  const [key, ...rest] = path;
  if (key === undefined) return typeof tree === "string" ? value : undefined;
  const next = writeAt(childOf(tree, key), rest, value);
  if (next === undefined) return undefined;
  if (typeof key === "number") {
    return isList(tree) ? tree.map((item, index) => (index === key ? next : item)) : undefined;
  }
  return isRecord(tree) ? { ...tree, [key]: next } : undefined;
};

/** Only a string leaf changes, so the object keeps its shape and therefore its type. */
const withText = <T extends Tree>(object: T, path: TextPath, value: string): T | undefined =>
  writeAt(object, path, value) as T | undefined;

const replaceById = <T extends { readonly id: string }>(
  items: readonly T[],
  next: T,
): readonly T[] => items.map((item) => (item.id === next.id ? next : item));

const readText = (content: Content, nodeId: string, path: TextPath): string | undefined => {
  const owner =
    findMessage(content, nodeId) ??
    content.events[nodeId] ??
    findConfrontation(content, nodeId) ??
    findEnding(content, nodeId);
  const text = path.reduce<Tree>(childOf, owner);
  return typeof text === "string" ? text : undefined;
};

/** Returns `content` itself when the path does not resolve: nothing is invented. */
const applyText = (content: Content, nodeId: string, path: TextPath, value: string): Content => {
  const message = findMessage(content, nodeId);
  if (message !== undefined) {
    const next = withText(message, path, value);
    return next === undefined
      ? content
      : { ...content, messages: replaceById(content.messages, next) };
  }
  const event = content.events[nodeId];
  if (event !== undefined) {
    const next = withText(event, path, value);
    return next === undefined
      ? content
      : { ...content, events: { ...content.events, [nodeId]: next } };
  }
  const confrontation = findConfrontation(content, nodeId);
  if (confrontation !== undefined) {
    const next = withText(confrontation, path, value);
    return next === undefined
      ? content
      : { ...content, confrontations: replaceById(content.confrontations, next) };
  }
  const ending = findEnding(content, nodeId);
  const next = ending === undefined ? undefined : withText(ending, path, value);
  return next === undefined
    ? content
    : { ...content, endings: { ...content.endings, [next.id]: next } };
};

export const MODEL: EditorModel<Content> = {
  worldId: "voyage",
  registry: CONTENT,
  graph,
  fields,
  readText,
  applyText,
};
