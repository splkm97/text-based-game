// SVG lane graph. Pure view over a `Layout`: selection lives in the parent, hover in this file.
// Colors come from the theme's CSS variables so the palette stays in one place.

import type { KeyboardEvent } from "react";
import { useState } from "react";
import type { JourneyId, OriginId } from "../../content/ids";
import type { EventPool } from "../../engine/types";
import type { Layout, LayoutOptions, Placed } from "./layout";
import type { EdgeKind, GraphEdge, GraphNode, Lane } from "./model";

export type PoolFilter = "all" | OriginId | JourneyId;

export type GraphViewProps = {
  readonly layout: Layout;
  readonly edges: readonly GraphEdge[];
  readonly selectedId: string | null;
  readonly dirtyIds: ReadonlySet<string>;
  readonly filter: PoolFilter;
  readonly onSelect: (id: string) => void;
};

export const LAYOUT_OPTIONS: LayoutOptions = {
  nodeWidth: 208,
  nodeHeight: 44,
  gapX: 16,
  gapY: 12,
  laneGap: 64,
  commonColumns: 3,
};

const HEADER_HEIGHT = 32;
const LABEL_MAX = 14;
const MARKER_SIZE = 8;

const LANE_TITLE: Readonly<Record<Lane, string>> = {
  start: "시작",
  origin: "출신",
  common: "공통",
  journey: "여정",
  ending: "엔딩",
};

const EDGE_COLOR: Readonly<Record<EdgeKind, string>> = {
  next: "var(--color-parchment)",
  flag: "var(--color-dusk)",
  start: "var(--color-sky)",
  end: "var(--color-ember)",
};

const truncate = (label: string): string => {
  const chars = [...label];
  return chars.length > LABEL_MAX ? `${chars.slice(0, LABEL_MAX - 1).join("")}…` : label;
};

const poolVisible = (pool: EventPool, filter: PoolFilter): boolean => {
  switch (pool.kind) {
    case "common":
      return true;
    case "origin":
      return pool.origin === filter;
    case "journey":
      return pool.journey === filter;
  }
};

/** Common and ending lanes always show; start and story lanes show only the chosen pool. */
const visible = (node: GraphNode, filter: PoolFilter): boolean => {
  if (filter === "all") return true;
  switch (node.kind) {
    case "origin":
    case "journey":
      return node.id === filter;
    case "event":
      return poolVisible(node.pool, filter);
    case "ending":
      return true;
  }
};

/** Engine-owned endings and zero-weight events are reachable only by rule, so they read muted. */
const muted = (node: GraphNode): boolean =>
  (node.kind === "ending" && node.engineOwned) || (node.kind === "event" && node.weight === 0);

const nodeStroke = (node: GraphNode, selected: boolean): string => {
  if (selected) return "var(--color-ember)";
  return muted(node) ? "var(--color-dusk)" : "var(--color-ash)";
};

const edgePath = (from: Placed, to: Placed): string => {
  const { nodeWidth, nodeHeight } = LAYOUT_OPTIONS;
  const x1 = from.x + nodeWidth;
  const y1 = from.y + nodeHeight / 2;
  const x2 = to.x;
  const y2 = to.y + nodeHeight / 2;
  const bend = Math.max(48, Math.abs(x2 - x1) / 2);
  return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
};

const edgeKey = (edge: GraphEdge): string => [edge.from, edge.to, edge.kind, edge.label].join("|");

type NodeProps = {
  readonly placed: Placed;
  readonly selected: boolean;
  readonly dirty: boolean;
  readonly onSelect: (id: string) => void;
  readonly onActive: (id: string | null) => void;
};

function Node({ placed, selected, dirty, onSelect, onActive }: NodeProps) {
  const { node, x, y } = placed;
  const { nodeWidth, nodeHeight } = LAYOUT_OPTIONS;
  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(node.id);
    }
  };
  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG has no <button>; a focusable <g> is the node.
    <g
      role="button"
      tabIndex={0}
      aria-label={node.label}
      aria-pressed={selected}
      data-node-id={node.id}
      transform={`translate(${x} ${y})`}
      className="cursor-pointer"
      onClick={() => onSelect(node.id)}
      onKeyDown={onKeyDown}
      onPointerEnter={() => onActive(node.id)}
      onPointerLeave={() => onActive(null)}
      onFocus={() => onActive(node.id)}
      onBlur={() => onActive(null)}
    >
      <rect
        width={nodeWidth}
        height={nodeHeight}
        fill="var(--color-ink-deep)"
        stroke={nodeStroke(node, selected)}
        strokeWidth={2}
      />
      <text
        x={12}
        y={nodeHeight / 2}
        dominantBaseline="central"
        fontSize={12}
        fill={muted(node) ? "var(--color-dusk)" : "var(--color-parchment)"}
      >
        {truncate(node.label)}
      </text>
      {dirty && (
        <rect
          x={nodeWidth - MARKER_SIZE - 6}
          y={6}
          width={MARKER_SIZE}
          height={MARKER_SIZE}
          fill="var(--color-gold)"
        />
      )}
    </g>
  );
}

export function GraphView({
  layout,
  edges,
  selectedId,
  dirtyIds,
  filter,
  onSelect,
}: GraphViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const shown = layout.placed.filter((placed) => visible(placed.node, filter));
  const byId = new Map(shown.map((placed) => [placed.node.id, placed]));
  const highlight = activeId ?? selectedId;

  return (
    <svg
      width={layout.width}
      height={layout.height + HEADER_HEIGHT}
      className="block font-pixel"
      aria-label="콘텐츠 그래프"
    >
      <defs>
        {(Object.keys(EDGE_COLOR) as readonly EdgeKind[]).map((kind) => (
          <marker
            key={kind}
            id={`arrow-${kind}`}
            viewBox="0 0 8 8"
            refX={8}
            refY={4}
            markerWidth={MARKER_SIZE}
            markerHeight={MARKER_SIZE}
            orient="auto"
          >
            <path d="M0 0L8 4L0 8z" fill={EDGE_COLOR[kind]} />
          </marker>
        ))}
      </defs>
      {(Object.keys(LANE_TITLE) as readonly Lane[]).map((lane) => (
        <text key={lane} x={layout.laneX[lane]} y={20} fontSize={12} fill="var(--color-ash)">
          {LANE_TITLE[lane]}
        </text>
      ))}
      <g transform={`translate(0 ${HEADER_HEIGHT})`}>
        {edges.flatMap((edge) => {
          const from = byId.get(edge.from);
          const to = byId.get(edge.to);
          if (from === undefined || to === undefined || edge.from === edge.to) return [];
          const lit = highlight === edge.from || highlight === edge.to;
          return [
            <path
              key={edgeKey(edge)}
              d={edgePath(from, to)}
              fill="none"
              stroke={EDGE_COLOR[edge.kind]}
              strokeWidth={lit ? 4 : 2}
              strokeDasharray={edge.kind === "flag" ? "6 4" : undefined}
              opacity={highlight === null || lit ? 1 : 0.35}
              markerEnd={`url(#arrow-${edge.kind})`}
            >
              <title>{edge.label}</title>
            </path>,
          ];
        })}
        {shown.map((placed) => (
          <Node
            key={placed.node.id}
            placed={placed}
            selected={placed.node.id === selectedId}
            dirty={dirtyIds.has(placed.node.id)}
            onSelect={onSelect}
            onActive={setActiveId}
          />
        ))}
      </g>
    </svg>
  );
}
