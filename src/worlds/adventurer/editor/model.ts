// The adventurer world's editor model: a pure `EditorModel` over its content registry. The graph
// has nodes for origins, journeys, events, and endings and edges for how play moves between
// them; the fields cover every authored string of an event or ending, read and replaced by
// walking a path from the object that carries the id. Dev-only; never reachable from the
// production bundle.

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
import { FALLBACK_EVENT_ID } from "../content/ids";
import type {
  Condition,
  ContentRegistry,
  Effect,
  Ending,
  EndingId,
  EventPool,
  GameEvent,
  JourneyId,
  Origin,
  Outcome,
  OutcomeText,
} from "../engine/types";

const LANES: readonly GraphLane[] = [
  { id: "start", label: "시작" },
  { id: "origin", label: "출신" },
  { id: "common", label: "공통", columns: 3 },
  { id: "journey", label: "여정" },
  { id: "ending", label: "엔딩" },
];

const ENGINE_OWNED_ENDINGS: ReadonlySet<EndingId> = new Set(["death", "madness", "retire"]);

type LeafKey = "result" | "success" | "failure" | "win" | "flee" | "leave";

const LEAF_LABEL: Readonly<Record<LeafKey, string>> = {
  result: "결과",
  success: "성공",
  failure: "실패",
  win: "승리",
  flee: "도주",
  leave: "나가기",
};

/** Each outcome kind's text leaves, keyed by the property that holds them. */
const leavesOf = (outcome: Outcome): readonly (readonly [LeafKey, OutcomeText])[] => {
  switch (outcome.kind) {
    case "direct":
      return [["result", outcome.result]];
    case "check":
      return [
        ["success", outcome.success],
        ["failure", outcome.failure],
      ];
    case "combat":
      return [
        ["win", outcome.win],
        ["flee", outcome.flee],
      ];
    case "shop":
      return [["leave", outcome.leave]];
  }
};

// ---------------------------------------------------------------------------
// Graph
// ---------------------------------------------------------------------------

const flagsOf = (conditions: readonly Condition[]): readonly string[] =>
  conditions.flatMap((condition) => (condition.kind === "flag" ? [condition.flag] : []));

/** Flags required at the event level or by any choice. */
const requiredFlags = (event: GameEvent): readonly string[] => [
  ...flagsOf(event.requires),
  ...event.choices.flatMap((choice) => flagsOf(choice.requires)),
];

const leafEffects = (event: GameEvent): readonly Effect[] =>
  event.choices.flatMap((choice) => leavesOf(choice.outcome).flatMap(([, leaf]) => leaf.effects));

const setFlags = (event: GameEvent): readonly string[] =>
  leafEffects(event).flatMap((effect) => (effect.kind === "flag" ? [effect.flag] : []));

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

/** The fallback event first, then id order: the common grid reads the same run to run. */
const fallbackFirst = (a: GameEvent, b: GameEvent): number => {
  if (a.id === FALLBACK_EVENT_ID) return -1;
  if (b.id === FALLBACK_EVENT_ID) return 1;
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
};

/** Zero-weight events are reachable only by rule, so they read muted. */
const eventNode = (event: GameEvent): GraphNode => {
  const owner = poolOwner(event.pool);
  return {
    id: event.id,
    label: event.title,
    lane: event.pool.kind,
    ...(owner === null ? {} : { group: owner }),
    ...(event.weight === 0 ? { muted: true } : {}),
  };
};

/** Engine-owned endings have no authored way in, so they read muted. */
const endingNode = (ending: Ending): GraphNode => ({
  id: ending.id,
  label: ending.title,
  lane: "ending",
  terminal: true,
  ...(ENGINE_OWNED_ENDINGS.has(ending.id) ? { muted: true } : {}),
});

/** Start nodes carry their own id as group: the filter lists them and story lanes follow. */
const nodesOf = (content: ContentRegistry): readonly GraphNode[] => [
  ...Object.values(content.origins).map(
    (origin): GraphNode => ({ id: origin.id, label: origin.name, lane: "start", group: origin.id }),
  ),
  ...Object.values(content.journeys).map(
    (journey): GraphNode => ({
      id: journey.id,
      label: journey.name,
      lane: "start",
      group: journey.id,
    }),
  ),
  ...Object.values(content.events).toSorted(fallbackFirst).map(eventNode),
  ...Object.values(content.endings).map(endingNode),
];

const STYLE = {
  start: { style: "solid", token: "sky" },
  flag: { style: "dashed", token: "dusk" },
  next: { style: "solid", token: "parchment" },
  end: { style: "solid", token: "ember" },
} as const satisfies Readonly<Record<string, Pick<GraphEdge, "style" | "token">>>;

const edge = (kind: keyof typeof STYLE, from: string, to: string, label: string): GraphEdge => ({
  from,
  to,
  label,
  ...STYLE[kind],
});

const originStartEdges = (origin: Origin, events: readonly GameEvent[]): readonly GraphEdge[] =>
  events.flatMap((event) =>
    requiredFlags(event)
      .filter((flag) => origin.startingFlags.includes(flag))
      .map((flag) => edge("start", origin.id, event.id, flag)),
  );

const journeyStartEdges = (
  journey: JourneyId,
  events: readonly GameEvent[],
): readonly GraphEdge[] =>
  events
    .filter((event) => event.pool.kind === "journey" && event.pool.journey === journey)
    .filter((event) => flagsOf(event.requires).length === 0)
    .map((event) => edge("start", journey, event.id, ""));

const flagEdges = (source: GameEvent, events: readonly GameEvent[]): readonly GraphEdge[] =>
  setFlags(source).flatMap((flag) =>
    events
      .filter((target) => target.id !== source.id && requiredFlags(target).includes(flag))
      .map((target) => edge("flag", source.id, target.id, flag)),
  );

const choiceEdges = (event: GameEvent): readonly GraphEdge[] =>
  event.choices.flatMap((choice) =>
    leavesOf(choice.outcome).flatMap(([, leaf]) =>
      leaf.effects.flatMap((effect): readonly GraphEdge[] => {
        switch (effect.kind) {
          case "nextEvent":
            return [edge("next", event.id, effect.event, choice.text)];
          case "end":
            return [edge("end", event.id, effect.ending, choice.text)];
          default:
            return [];
        }
      }),
    ),
  );

const edgeKey = (e: GraphEdge): string => [e.from, e.to, e.token, e.style, e.label].join("\0");

/** Keeps the first of each identical edge, preserving order. */
const dedupe = (edges: readonly GraphEdge[]): readonly GraphEdge[] => [
  ...new Map(edges.map((e) => [edgeKey(e), e])).values(),
];

const edgesOf = (content: ContentRegistry): readonly GraphEdge[] => {
  const events = Object.values(content.events);
  return dedupe([
    ...Object.values(content.origins).flatMap((origin) => originStartEdges(origin, events)),
    ...Object.values(content.journeys).flatMap((journey) => journeyStartEdges(journey.id, events)),
    ...events.flatMap((event) => flagEdges(event, events)),
    ...events.flatMap(choiceEdges),
  ]);
};

const assertUniqueIds = (nodes: readonly GraphNode[]): void => {
  const ids = nodes.map((node) => node.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    throw new Error(`duplicate graph node id: ${[...new Set(duplicates)].join(", ")}`);
  }
};

/** Throws when two content entries share an id: node ids must be unique across all kinds. */
const graph = (content: ContentRegistry): ContentGraph => {
  const nodes = nodesOf(content);
  assertUniqueIds(nodes);
  return { lanes: LANES, nodes, edges: edgesOf(content) };
};

// ---------------------------------------------------------------------------
// Fields
// ---------------------------------------------------------------------------

/** Endings are keyed by the closed `EndingId` union, so a free-form id needs a scan. */
const findEnding = (content: ContentRegistry, id: string): Ending | undefined =>
  Object.values(content.endings).find((ending) => ending.id === id);

/** Choice texts carry 선택지 and leaves do not: the inspector keys its single-line rule on it. */
const eventFields = (event: GameEvent): readonly EditableField[] => [
  { label: "제목", path: ["title"] },
  { label: "본문", path: ["text"] },
  ...event.choices.flatMap((choice, index): readonly EditableField[] => [
    { label: `선택지 ${index + 1} 텍스트`, path: ["choices", index, "text"] },
    ...leavesOf(choice.outcome).map(
      ([key]): EditableField => ({
        label: `${index + 1}번 ${LEAF_LABEL[key]}`,
        path: ["choices", index, "outcome", key, "text"],
      }),
    ),
  ]),
];

const ENDING_FIELDS: readonly EditableField[] = [
  { label: "제목", path: ["title"] },
  { label: "본문", path: ["text"] },
];

const fields = (content: ContentRegistry, nodeId: string): readonly EditableField[] => {
  const event = content.events[nodeId];
  if (event !== undefined) return eventFields(event);
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

const readText = (content: ContentRegistry, nodeId: string, path: TextPath): string | undefined => {
  const owner = content.events[nodeId] ?? findEnding(content, nodeId);
  const text = path.reduce<Tree>(childOf, owner);
  return typeof text === "string" ? text : undefined;
};

/** Returns `content` itself when the path does not resolve: nothing is invented. */
const applyText = (
  content: ContentRegistry,
  nodeId: string,
  path: TextPath,
  value: string,
): ContentRegistry => {
  const event = content.events[nodeId];
  if (event !== undefined) {
    const next = withText(event, path, value);
    return next === undefined
      ? content
      : { ...content, events: { ...content.events, [nodeId]: next } };
  }
  const ending = findEnding(content, nodeId);
  const next = ending === undefined ? undefined : withText(ending, path, value);
  return next === undefined
    ? content
    : { ...content, endings: { ...content.endings, [next.id]: next } };
};

export const MODEL: EditorModel<ContentRegistry> = {
  worldId: "adventurer",
  registry: CONTENT,
  graph,
  fields,
  readText,
  applyText,
};
