// SVG lane graph. Pure view over a `Layout`: selection lives in the parent, hover in this file.
// Colors come from the theme's role tokens so the world's palette applies unchanged.

import type { KeyboardEvent } from "react";
import { useState } from "react";
import type { TokenName } from "../../host/world";
import type { GraphEdge, GraphNode } from "../adapter";
import type { Layout, LayoutOptions, Placed } from "./layout";

/** The filter value that shows every group. */
export const ALL_GROUPS = "all";

export type GraphViewProps = {
  readonly layout: Layout;
  readonly edges: readonly GraphEdge[];
  readonly selectedId: string | null;
  readonly dirtyIds: ReadonlySet<string>;
  /** `ALL_GROUPS` or a `group` value; ungrouped nodes always show. */
  readonly filter: string;
  readonly onSelect: (id: string) => void;
};

export const LAYOUT_OPTIONS: LayoutOptions = {
  nodeWidth: 208,
  nodeHeight: 44,
  gapX: 16,
  gapY: 12,
  laneGap: 64,
};

const HEADER_HEIGHT = 32;
const LABEL_MAX = 14;
const MARKER_SIZE = 8;
const TERMINAL_BAR = 4;

const color = (token: TokenName): string => `var(--color-${token})`;

const truncate = (label: string): string => {
  const chars = [...label];
  return chars.length > LABEL_MAX ? `${chars.slice(0, LABEL_MAX - 1).join("")}…` : label;
};

const visible = (node: GraphNode, filter: string): boolean =>
  filter === ALL_GROUPS || node.group === undefined || node.group === filter;

const nodeStroke = (node: GraphNode, selected: boolean): string => {
  if (selected) return color("ember");
  return node.muted === true ? color("dusk") : color("ash");
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

const edgeKey = (edge: GraphEdge): string =>
  [edge.from, edge.to, edge.token, edge.style, edge.label].join("|");

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
  const stroke = nodeStroke(node, selected);
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
        fill={color("ink-deep")}
        stroke={stroke}
        strokeWidth={2}
      />
      {node.terminal === true && <rect width={TERMINAL_BAR} height={nodeHeight} fill={stroke} />}
      <text
        x={12}
        y={nodeHeight / 2}
        dominantBaseline="central"
        fontSize={12}
        fill={node.muted === true ? color("dusk") : color("parchment")}
      >
        {truncate(node.label)}
      </text>
      {dirty && (
        <rect
          x={nodeWidth - MARKER_SIZE - 6}
          y={6}
          width={MARKER_SIZE}
          height={MARKER_SIZE}
          fill={color("gold")}
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
  const tokens = [...new Set(edges.map((edge) => edge.token))];

  return (
    <svg
      width={layout.width}
      height={layout.height + HEADER_HEIGHT}
      className="block font-pixel"
      aria-label="콘텐츠 그래프"
    >
      <defs>
        {tokens.map((token) => (
          <marker
            key={token}
            id={`arrow-${token}`}
            viewBox="0 0 8 8"
            refX={8}
            refY={4}
            markerWidth={MARKER_SIZE}
            markerHeight={MARKER_SIZE}
            orient="auto"
          >
            <path d="M0 0L8 4L0 8z" fill={color(token)} />
          </marker>
        ))}
      </defs>
      {layout.lanes.map(({ lane, x }) => (
        <text key={lane.id} x={x} y={20} fontSize={12} fill={color("ash")}>
          {lane.label}
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
              stroke={color(edge.token)}
              strokeWidth={lit ? 4 : 2}
              strokeDasharray={edge.style === "dashed" ? "6 4" : undefined}
              opacity={highlight === null || lit ? 1 : 0.35}
              markerEnd={`url(#arrow-${edge.token})`}
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
