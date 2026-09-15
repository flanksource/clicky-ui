import { useMemo, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../lib/utils";
import type { BadgeTone } from "./Badge";
import { ringLayout, routeEdges, type GraphLayoutPosition } from "./graph-layout";

// GraphDiagram renders a generic, type-agnostic node/edge diagram — a small
// cycle of resources and processes, a dependency graph, any relationship that
// doesn't read well as a left-to-right column layout because it has back
// edges or reciprocal pairs. It knows nothing about the domain: a producer
// maps its data into GraphDiagramNode/GraphDiagramEdge and gets the same
// ring layout, curved-edge routing, and selection behaviour.

export interface GraphDiagramNode {
  id: string;
  label: ReactNode;
  detail?: ReactNode;
  badge?: ReactNode;
  tone?: BadgeTone;
  shape?: "pill" | "rect";
  /** Accessible name for the node, when `label` alone isn't enough. */
  ariaLabel?: string;
}

export interface GraphDiagramEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  tone?: BadgeTone;
  dashed?: boolean;
}

export type GraphDiagramLayout = "ring";

export interface GraphDiagramProps {
  nodes: GraphDiagramNode[];
  edges: GraphDiagramEdge[];
  /** Only "ring" today; a "columns" layout is planned. */
  layout?: GraphDiagramLayout;
  selectedId?: string;
  onNodeSelect?: (id: string) => void;
  nodeWidth?: number;
  nodeHeight?: number;
  maxHeight?: number | string;
  ariaLabel: string;
  className?: string;
}

const DEFAULT_NODE_WIDTH = 168;
const DEFAULT_NODE_HEIGHT = 60;

const TONE_TEXT_CLASS: Record<BadgeTone, string> = {
  neutral: "text-muted-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  danger: "text-red-600 dark:text-red-400",
  warning: "text-amber-600 dark:text-amber-400",
  info: "text-sky-600 dark:text-sky-400",
};

const TONE_NODE_CLASS: Record<BadgeTone, string> = {
  neutral: "border-border bg-card text-foreground",
  success: "border-emerald-500/50 bg-emerald-500/10 text-foreground",
  danger: "border-red-500/50 bg-red-500/10 text-foreground",
  warning: "border-amber-500/50 bg-amber-500/10 text-foreground",
  info: "border-sky-500/50 bg-sky-500/10 text-foreground",
};

function assertEdgesReferenceKnownNodes(nodes: GraphDiagramNode[], edges: GraphDiagramEdge[]): void {
  const ids = new Set(nodes.map((node) => node.id));
  for (const edge of edges) {
    if (!ids.has(edge.from)) {
      throw new Error(`GraphDiagram: edge "${edge.id}" references unknown node "${edge.from}"`);
    }
    if (!ids.has(edge.to)) {
      throw new Error(`GraphDiagram: edge "${edge.id}" references unknown node "${edge.to}"`);
    }
  }
}

function layoutNodes(
  layout: GraphDiagramLayout,
  nodes: GraphDiagramNode[],
  nodeWidth: number,
  nodeHeight: number,
): { width: number; height: number; positions: Record<string, GraphLayoutPosition> } {
  switch (layout) {
    case "ring":
      return ringLayout(nodes, { nodeWidth, nodeHeight });
    default:
      throw new Error(`GraphDiagram: unknown layout "${layout satisfies never}"`);
  }
}

function toPercent(value: number, extent: number): string {
  return `${(value / extent) * 100}%`;
}

function requireRoute<T>(routes: Record<string, T>, edgeId: string): T {
  const route = routes[edgeId];
  if (!route) {
    throw new Error(`GraphDiagram: no route computed for edge "${edgeId}"`);
  }
  return route;
}

function requirePosition(
  positions: Record<string, GraphLayoutPosition>,
  nodeId: string,
): GraphLayoutPosition {
  const position = positions[nodeId];
  if (!position) {
    throw new Error(`GraphDiagram: no layout position computed for node "${nodeId}"`);
  }
  return position;
}

function handleNodeKeyDown(event: KeyboardEvent<HTMLDivElement>, select: () => void): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    select();
  }
}

export function GraphDiagram({
  nodes,
  edges,
  layout = "ring",
  selectedId,
  onNodeSelect,
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT,
  maxHeight,
  ariaLabel,
  className,
}: GraphDiagramProps) {
  assertEdgesReferenceKnownNodes(nodes, edges);

  const { width, height, positions } = useMemo(
    () => layoutNodes(layout, nodes, nodeWidth, nodeHeight),
    [layout, nodes, nodeWidth, nodeHeight],
  );

  const routes = useMemo(
    () => routeEdges(edges, positions, { nodeWidth, nodeHeight }),
    [edges, positions, nodeWidth, nodeHeight],
  );

  const tones = useMemo(
    () => Array.from(new Set(edges.map((edge) => edge.tone ?? "neutral"))),
    [edges],
  );

  return (
    <div
      className={cn("w-full overflow-auto", className)}
      style={maxHeight != null ? { maxHeight } : undefined}
    >
      <div className="relative w-full" style={{ aspectRatio: `${width} / ${height}` }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={ariaLabel}
          className="absolute inset-0 h-full w-full"
        >
          <defs>
            {tones.map((tone) => (
              <marker
                key={tone}
                id={`graph-diagram-arrow-${tone}`}
                viewBox="0 0 10 10"
                refX={8}
                refY={5}
                markerWidth={7}
                markerHeight={7}
                orient="auto-start-reverse"
              >
                <path d="M0,0 L10,5 L0,10 z" className={cn(TONE_TEXT_CLASS[tone], "fill-current")} />
              </marker>
            ))}
          </defs>
          {edges.map((edge) => {
            const tone = edge.tone ?? "neutral";
            return (
              <path
                key={edge.id}
                d={requireRoute(routes, edge.id).path}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray={edge.dashed ? "5 4" : undefined}
                markerEnd={`url(#graph-diagram-arrow-${tone})`}
                className={TONE_TEXT_CLASS[tone]}
              />
            );
          })}
        </svg>

        <div className="absolute inset-0">
          {edges.map((edge) => {
            if (!edge.label) return null;
            const route = requireRoute(routes, edge.id);
            const tone = edge.tone ?? "neutral";
            return (
              <span
                key={`label-${edge.id}`}
                className={cn(
                  "absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
                  TONE_TEXT_CLASS[tone],
                )}
                style={{ left: toPercent(route.labelX, width), top: toPercent(route.labelY, height) }}
              >
                {edge.label}
              </span>
            );
          })}

          {nodes.map((node) => {
            const position = requirePosition(positions, node.id);
            const selected = selectedId != null && node.id === selectedId;
            const tone = node.tone ?? "neutral";
            const shapeClass = node.shape === "pill" ? "rounded-full" : "rounded-lg";
            const interactive = onNodeSelect != null;

            return (
              <div
                key={node.id}
                className={cn(
                  "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-0.5 border px-3 py-1.5 text-center text-xs shadow-sm",
                  shapeClass,
                  TONE_NODE_CLASS[tone],
                  selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                  interactive && "cursor-pointer",
                )}
                style={{
                  left: toPercent(position.x, width),
                  top: toPercent(position.y, height),
                  width: nodeWidth,
                  height: nodeHeight,
                }}
                {...(interactive
                  ? {
                      role: "button" as const,
                      tabIndex: 0,
                      "aria-pressed": selected,
                      onClick: () => onNodeSelect(node.id),
                      onKeyDown: (event: KeyboardEvent<HTMLDivElement>) =>
                        handleNodeKeyDown(event, () => onNodeSelect(node.id)),
                    }
                  : {})}
                aria-label={node.ariaLabel}
              >
                <span className="line-clamp-2 font-medium leading-tight">{node.label}</span>
                {node.detail != null && (
                  <span className="line-clamp-1 text-[10px] leading-tight text-muted-foreground">
                    {node.detail}
                  </span>
                )}
                {node.badge != null && <span className="mt-0.5">{node.badge}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
