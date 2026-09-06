// Pure content graph: nodes for origins, journeys, events, and endings; edges for how play
// moves between them. Dev-only editor code; never reachable from the production bundle.

import type {
  Condition,
  ContentRegistry,
  Effect,
  EndingId,
  EventId,
  EventPool,
  GameEvent,
  JourneyId,
  Origin,
  OriginId,
  Outcome,
  OutcomeText,
} from "../../engine/types";

export type Lane = "start" | "origin" | "common" | "journey" | "ending";

export type GraphNode =
  | {
      readonly kind: "origin";
      readonly id: OriginId;
      readonly label: string;
      readonly lane: "start";
    }
  | {
      readonly kind: "journey";
      readonly id: JourneyId;
      readonly label: string;
      readonly lane: "start";
    }
  | {
      readonly kind: "event";
      readonly id: EventId;
      readonly label: string;
      readonly lane: "origin" | "common" | "journey";
      readonly pool: EventPool;
      readonly weight: number;
      readonly once: boolean;
    }
  | {
      readonly kind: "ending";
      readonly id: EndingId;
      readonly label: string;
      readonly lane: "ending";
      readonly engineOwned: boolean;
    };

export type EdgeKind = "start" | "flag" | "next" | "end";

export type GraphEdge = {
  readonly from: string;
  readonly to: string;
  readonly kind: EdgeKind;
  readonly label: string;
};

export type ContentGraph = {
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
};

const ENGINE_OWNED_ENDINGS: ReadonlySet<EndingId> = new Set(["death", "madness", "retire"]);

const leavesOf = (outcome: Outcome): readonly OutcomeText[] => {
  switch (outcome.kind) {
    case "direct":
      return [outcome.result];
    case "check":
      return [outcome.success, outcome.failure];
    case "combat":
      return [outcome.win, outcome.flee];
    case "shop":
      return [outcome.leave];
  }
};

const flagsOf = (conditions: readonly Condition[]): readonly string[] =>
  conditions.flatMap((condition) => (condition.kind === "flag" ? [condition.flag] : []));

/** Flags required at the event level or by any choice. */
const requiredFlags = (event: GameEvent): readonly string[] => [
  ...flagsOf(event.requires),
  ...event.choices.flatMap((choice) => flagsOf(choice.requires)),
];

const leafEffects = (event: GameEvent): readonly Effect[] =>
  event.choices.flatMap((choice) => leavesOf(choice.outcome).flatMap((leaf) => leaf.effects));

const setFlags = (event: GameEvent): readonly string[] =>
  leafEffects(event).flatMap((effect) => (effect.kind === "flag" ? [effect.flag] : []));

const nodesOf = (content: ContentRegistry): readonly GraphNode[] => [
  ...Object.values(content.origins).map(
    (origin): GraphNode => ({ kind: "origin", id: origin.id, label: origin.name, lane: "start" }),
  ),
  ...Object.values(content.journeys).map(
    (journey): GraphNode => ({
      kind: "journey",
      id: journey.id,
      label: journey.name,
      lane: "start",
    }),
  ),
  ...Object.values(content.events).map(
    (event): GraphNode => ({
      kind: "event",
      id: event.id,
      label: event.title,
      lane: event.pool.kind,
      pool: event.pool,
      weight: event.weight,
      once: event.once,
    }),
  ),
  ...Object.values(content.endings).map(
    (ending): GraphNode => ({
      kind: "ending",
      id: ending.id,
      label: ending.title,
      lane: "ending",
      engineOwned: ENGINE_OWNED_ENDINGS.has(ending.id),
    }),
  ),
];

const originStartEdges = (origin: Origin, events: readonly GameEvent[]): readonly GraphEdge[] =>
  events.flatMap((event) =>
    requiredFlags(event)
      .filter((flag) => origin.startingFlags.includes(flag))
      .map((flag): GraphEdge => ({ from: origin.id, to: event.id, kind: "start", label: flag })),
  );

const journeyStartEdges = (
  journey: JourneyId,
  events: readonly GameEvent[],
): readonly GraphEdge[] =>
  events
    .filter((event) => event.pool.kind === "journey" && event.pool.journey === journey)
    .filter((event) => flagsOf(event.requires).length === 0)
    .map((event): GraphEdge => ({ from: journey, to: event.id, kind: "start", label: "" }));

const flagEdges = (source: GameEvent, events: readonly GameEvent[]): readonly GraphEdge[] =>
  setFlags(source).flatMap((flag) =>
    events
      .filter((target) => target.id !== source.id && requiredFlags(target).includes(flag))
      .map((target): GraphEdge => ({ from: source.id, to: target.id, kind: "flag", label: flag })),
  );

const choiceEdges = (event: GameEvent): readonly GraphEdge[] =>
  event.choices.flatMap((choice) =>
    leavesOf(choice.outcome).flatMap((leaf) =>
      leaf.effects.flatMap((effect): readonly GraphEdge[] => {
        switch (effect.kind) {
          case "nextEvent":
            return [{ from: event.id, to: effect.event, kind: "next", label: choice.text }];
          case "end":
            return [{ from: event.id, to: effect.ending, kind: "end", label: choice.text }];
          default:
            return [];
        }
      }),
    ),
  );

const edgeKey = (edge: GraphEdge): string => [edge.from, edge.to, edge.kind, edge.label].join("\0");

/** Keeps the first of each identical (from, to, kind, label) edge, preserving order. */
const dedupe = (edges: readonly GraphEdge[]): readonly GraphEdge[] => [
  ...new Map(edges.map((edge) => [edgeKey(edge), edge])).values(),
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
export const buildGraph = (content: ContentRegistry): ContentGraph => {
  const nodes = nodesOf(content);
  assertUniqueIds(nodes);
  return { nodes, edges: edgesOf(content) };
};
