import { cn } from "../lib/utils";
import { pointOnCurve, spreadLabels, type EdgeRoute } from "./graph-edge-routing";
import type { GraphLayoutPosition } from "./graph-layout";
import type { EdgeFocusState } from "./use-edge-focus";
import {
  activateOnKey,
  edgeLabelWidth,
  edgeName,
  hoverHandlers,
  nodeName,
  requireEntry,
  TONE_TEXT_CLASS,
  type GraphDiagramEdge,
  type GraphDiagramNode,
  type GraphPlacer,
} from "./graph-diagram-model";

// Arrowhead size in layout px. Fixed (userSpaceOnUse) so a thicker, selected
// edge does not also grow its arrowhead.
const ARROW_SIZE = 10.5;
const EDGE_STROKE = 1.5;
const SELECTED_EDGE_STROKE = 2.75;
const HIT_STROKE = 14;

interface EdgeSelection {
  selectedEdgeId: string | undefined;
  onEdgeSelect: ((id: string) => void) | undefined;
  /** Set when the diagram is focused: see `GraphDiagramEdgeFocus`. */
  focus: EdgeFocusState | undefined;
}

export interface GraphDiagramEdgePathsProps extends EdgeSelection {
  edges: GraphDiagramEdge[];
  nodes: GraphDiagramNode[];
  routes: Record<string, EdgeRoute>;
  width: number;
  height: number;
  ariaLabel: string;
  /** Unique per diagram instance, so two diagrams on a page never share marker ids. */
  markerPrefix: string;
  onEdgeHover: ((id: string | undefined) => void) | undefined;
}

function EdgePath({
  edge,
  d,
  markerId,
  name,
  selected,
  dimmed,
  onSelect,
  onHover,
}: {
  edge: GraphDiagramEdge;
  d: string;
  markerId: string;
  name: string;
  selected: boolean;
  /** Out of focus while another edge is in it. */
  dimmed: boolean;
  onSelect: (() => void) | undefined;
  onHover: ((id: string | undefined) => void) | undefined;
}) {
  return (
    <g
      data-graph-edge={edge.id}
      className={cn("transition-opacity", dimmed && "opacity-20")}
      {...(dimmed ? { "data-graph-edge-dimmed": "" } : {})}
      {...(onHover ? hoverHandlers(edge.id, onHover) : {})}
    >
      {edge.title !== undefined && <title>{edge.title}</title>}
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={selected ? SELECTED_EDGE_STROKE : EDGE_STROKE}
        strokeDasharray={edge.dashed ? "5 4" : undefined}
        pointerEvents="visibleStroke"
        markerEnd={`url(#${markerId})`}
        className={TONE_TEXT_CLASS[edge.tone ?? "neutral"]}
      />
      {onSelect && (
        <path
          d={d}
          fill="none"
          stroke="transparent"
          strokeWidth={HIT_STROKE}
          strokeLinecap="round"
          pointerEvents="stroke"
          role="button"
          tabIndex={0}
          aria-label={name}
          aria-pressed={selected}
          className={cn(
            "cursor-pointer outline-none hover:stroke-primary/15 focus-visible:stroke-primary/30",
            selected && "stroke-primary/15",
          )}
          onClick={onSelect}
          onKeyDown={(event) => activateOnKey(event, onSelect)}
        />
      )}
    </g>
  );
}

export function GraphDiagramEdgePaths({
  edges,
  nodes,
  routes,
  width,
  height,
  ariaLabel,
  markerPrefix,
  selectedEdgeId,
  onEdgeSelect,
  focus,
  onEdgeHover,
}: GraphDiagramEdgePathsProps) {
  const tones = Array.from(new Set(edges.map((edge) => edge.tone ?? "neutral")));
  const names = Object.fromEntries(nodes.map((node) => [node.id, nodeName(node)]));

  // The layer covers the whole stage, so it lets the pointer through: only an edge's own stroke
  // takes it, and the group captions under the layer keep their tooltips.
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role={onEdgeSelect ? "group" : "img"}
      aria-label={ariaLabel}
      className="pointer-events-none absolute inset-0 h-full w-full"
    >
      <defs>
        {tones.map((tone) => (
          <marker
            key={tone}
            id={`${markerPrefix}-arrow-${tone}`}
            viewBox="0 0 10 10"
            refX={8}
            refY={5}
            markerUnits="userSpaceOnUse"
            markerWidth={ARROW_SIZE}
            markerHeight={ARROW_SIZE}
            orient="auto-start-reverse"
          >
            <path d="M0,0 L10,5 L0,10 z" className={cn(TONE_TEXT_CLASS[tone], "fill-current")} />
          </marker>
        ))}
      </defs>
      {edges.map((edge) => (
        <EdgePath
          key={edge.id}
          edge={edge}
          d={requireEntry(routes, edge.id, "route").path}
          markerId={`${markerPrefix}-arrow-${edge.tone ?? "neutral"}`}
          name={edgeName(edge, names)}
          selected={edge.id === selectedEdgeId}
          dimmed={focus !== undefined && focus.focused.size > 0 && !focus.focused.has(edge.id)}
          onSelect={onEdgeSelect ? () => onEdgeSelect(edge.id) : undefined}
          onHover={onEdgeHover}
        />
      ))}
    </svg>
  );
}

export interface GraphDiagramEdgeLabelsProps extends EdgeSelection {
  edges: GraphDiagramEdge[];
  routes: Record<string, EdgeRoute>;
  place: GraphPlacer;
  /**
   * Move pills that would cover one another apart. Only meaningful when the
   * stage is drawn at its natural size, where a pill's px size and the layout
   * share one coordinate system.
   */
  spread: boolean;
}

const LABEL_HEIGHT = 19;
/** A loop's pill sits this far outside its point (the `translate-x` classes below). */
const LABEL_LOOP_GAP = 6;
/** How far along its edge, from the node in focus, a pill sits: past the middle, where a fan has spread out. */
const FOCUS_LABEL_T = 0.65;
/** Air kept between a slid pill and the nodes at either end of its edge. */
const LABEL_NODE_GAP = 4;

const ANCHOR_CLASS = {
  start: "translate-x-1.5",
  end: "-translate-x-[calc(100%+0.375rem)]",
  center: "-translate-x-1/2",
} as const;

function hasPill(edge: GraphDiagramEdge): boolean {
  return Boolean(edge.label) || edge.icon != null;
}

/**
 * Where an edge's pill is centred: the route's midpoint, unless exactly one
 * end of the edge is a node in focus. Then every pill of that node would sit
 * in one stack beside it, so each moves toward its own far end, kept between
 * the two nodes.
 */
function labelPoint(edge: GraphDiagramEdge, route: EdgeRoute, focus: EdgeFocusState | undefined): GraphLayoutPosition {
  const middle = { x: route.labelX, y: route.labelY };
  if (!route.curve || !focus || focus.nodes.has(edge.from) === focus.nodes.has(edge.to)) return middle;
  const point = pointOnCurve(route.curve, focus.nodes.has(edge.from) ? FOCUS_LABEL_T : 1 - FOCUS_LABEL_T);
  const reserved = edgeLabelWidth(edge) / 2 + LABEL_NODE_GAP;
  const left = Math.min(route.curve[0].x, route.curve[3].x) + reserved;
  const right = Math.max(route.curve[0].x, route.curve[3].x) - reserved;
  return left > right ? { x: middle.x, y: point.y } : { x: Math.min(right, Math.max(left, point.x)), y: point.y };
}

function labelYs(
  edges: GraphDiagramEdge[],
  routes: Record<string, EdgeRoute>,
  points: Record<string, GraphLayoutPosition>,
): Record<string, number> {
  return spreadLabels(
    edges.map((edge) => {
      const { labelAnchor } = requireEntry(routes, edge.id, "route");
      const point = requireEntry(points, edge.id, "label point");
      const outside = labelAnchor === undefined ? 0 : labelAnchor === "start" ? LABEL_LOOP_GAP : -LABEL_LOOP_GAP;
      return {
        id: edge.id,
        x: point.x + outside,
        y: point.y,
        width: edgeLabelWidth(edge),
        height: LABEL_HEIGHT,
        ...(labelAnchor ? { anchor: labelAnchor } : {}),
      };
    }),
  );
}

/**
 * The label pills, drawn as HTML over the edges. With `onEdgeSelect` a pill is
 * a pointer shortcut for its edge; the edge's own path stays the one
 * keyboard and screen-reader target, so the pill is hidden from both.
 */
export function GraphDiagramEdgeLabels({
  edges,
  routes,
  place,
  spread,
  selectedEdgeId,
  onEdgeSelect,
  focus,
}: GraphDiagramEdgeLabelsProps) {
  const labelled = edges.filter((edge) => hasPill(edge) && (!focus || focus.focused.has(edge.id)));
  const points = Object.fromEntries(
    labelled.map((edge) => [edge.id, labelPoint(edge, requireEntry(routes, edge.id, "route"), focus)]),
  );
  const ys = spread ? labelYs(labelled, routes, points) : undefined;
  return (
    <>
      {labelled.map((edge) => {
        const route = requireEntry(routes, edge.id, "route");
        const point = requireEntry(points, edge.id, "label point");
        return (
          <span
            key={`label-${edge.id}`}
            data-graph-edge-label={edge.id}
            title={edge.title}
            className={cn(
              "absolute -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium shadow-sm",
              // A pill that only hover put there would take the pointer off what is hovered, and flicker.
              focus && !focus.pinned.has(edge.id) ? "pointer-events-none" : "pointer-events-auto",
              edge.icon != null && "flex items-center gap-1",
              ANCHOR_CLASS[route.labelAnchor ?? "center"],
              TONE_TEXT_CLASS[edge.tone ?? "neutral"],
              onEdgeSelect && "cursor-pointer hover:bg-accent",
              edge.id === selectedEdgeId && "border-primary ring-2 ring-primary/40",
            )}
            style={place({ x: point.x, y: ys ? requireEntry(ys, edge.id, "label position") : point.y })}
            {...(onEdgeSelect
              ? { "aria-hidden": true, onClick: () => onEdgeSelect(edge.id) }
              : {})}
          >
            {edge.icon != null && <span className="flex shrink-0 text-sm leading-none">{edge.icon}</span>}
            {edge.label}
          </span>
        );
      })}
    </>
  );
}
