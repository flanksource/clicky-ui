// Edge routing and label placement for GraphDiagram: pure math, no React.
// Split from graph-layout.ts, which owns the position types and `ringLayout`
// and re-exports this file's API.

import type { GraphLayoutPosition } from "./graph-layout";

export interface GraphLayoutEdge {
  id: string;
  from: string;
  to: string;
}

/** Start, two control points and end of a cubic Bézier. */
export type CubicCurve = readonly [GraphLayoutPosition, GraphLayoutPosition, GraphLayoutPosition, GraphLayoutPosition];

export interface EdgeRoute {
  /** SVG path `d` attribute, clipped to the node rectangle boundaries. */
  path: string;
  /** Midpoint of the rendered path, for placing an edge label. */
  labelX: number;
  labelY: number;
  /**
   * Set on a loop, whose midpoint is its outermost point: "start" when a label
   * should begin at the point and run right of it, "end" when it should end
   * there and run left. A centred label would reach back over the node.
   */
  labelAnchor?: "start" | "end";
  /** A side-anchored edge between two columns: its curve, for placing a label elsewhere than its midpoint. */
  curve?: CubicCurve;
}

export interface RouteEdgesDimensions {
  nodeWidth: number;
  nodeHeight: number;
  /** Heights of the nodes not drawn at `nodeHeight`, by id. */
  nodeHeights?: Readonly<Record<string, number>>;
}

function heightOf(dimensions: RouteEdgesDimensions, id: string): number {
  return dimensions.nodeHeights?.[id] ?? dimensions.nodeHeight;
}

export interface RouteEdgesOptions {
  /** Where edges attach: clipped toward the node centre, or at the left/right side middles. Defaults to "center". */
  anchor?: "center" | "side";
}

const CURVE_OFFSET = 22;
const MIN_SIDE_REACH = 36;
/** A loop reaches this far plus a share of the height it spans, so a longer loop arcs outside a shorter one. */
const LOOP_BASE_REACH = 24;
const LOOP_SPAN_RATE = 0.18;
const MAX_LOOP_REACH = 240;
/** The share of the gap to the next column a loop may bulge into. */
const LOOP_GAP_SHARE = 0.6;
/** A cubic whose two control points share an x peaks at 3/4 of their offset. */
const CUBIC_PEAK = 0.75;
/** Vertical margin kept between fanned side anchors and the node's corners. */
const PORT_INSET = 12;

function unorderedPairKey(a: string, b: string): string {
  return a < b ? `${a}\0${b}` : `${b}\0${a}`;
}

function requirePosition(positions: Record<string, GraphLayoutPosition>, id: string): GraphLayoutPosition {
  const position = positions[id];
  if (!position) {
    throw new Error(`routeEdges: no layout position for node "${id}"`);
  }
  return position;
}

function requireEdge(group: readonly GraphLayoutEdge[], index: number): GraphLayoutEdge {
  const edge = group[index];
  if (!edge) {
    throw new Error(`routeEdges: expected an edge at index ${index}`);
  }
  return edge;
}

/** Point on the rectangle (centred at `center`, half-extents `halfW`/`halfH`) where the ray toward `towards` exits. */
function clipToRect(
  center: GraphLayoutPosition,
  towards: GraphLayoutPosition,
  halfW: number,
  halfH: number,
): GraphLayoutPosition {
  const dx = towards.x - center.x;
  const dy = towards.y - center.y;
  if (dx === 0 && dy === 0) return { x: center.x, y: center.y };

  const scaleX = dx !== 0 ? halfW / Math.abs(dx) : Number.POSITIVE_INFINITY;
  const scaleY = dy !== 0 ? halfH / Math.abs(dy) : Number.POSITIVE_INFINITY;
  const scale = Math.min(scaleX, scaleY);

  return { x: center.x + dx * scale, y: center.y + dy * scale };
}

/** Point at t=0.5 on the quadratic Bézier defined by p0 (start), p1 (control), p2 (end). */
function quadraticMidpoint(
  p0: GraphLayoutPosition,
  p1: GraphLayoutPosition,
  p2: GraphLayoutPosition,
): GraphLayoutPosition {
  return {
    x: 0.25 * p0.x + 0.5 * p1.x + 0.25 * p2.x,
    y: 0.25 * p0.y + 0.5 * p1.y + 0.25 * p2.y,
  };
}

/** Edges sharing an unordered node pair, in input order; throws on an edge whose node has no position. */
function groupEdgesByPair(
  edges: readonly GraphLayoutEdge[],
  positions: Record<string, GraphLayoutPosition>,
): GraphLayoutEdge[][] {
  const groups = new Map<string, GraphLayoutEdge[]>();
  for (const edge of edges) {
    if (!(edge.from in positions)) {
      throw new Error(`routeEdges: edge "${edge.id}" references unknown node "${edge.from}"`);
    }
    if (!(edge.to in positions)) {
      throw new Error(`routeEdges: edge "${edge.id}" references unknown node "${edge.to}"`);
    }
    const key = unorderedPairKey(edge.from, edge.to);
    const group = groups.get(key);
    if (group) {
      group.push(edge);
    } else {
      groups.set(key, [edge]);
    }
  }
  return [...groups.values()];
}

function routeCenterGroup(
  group: readonly GraphLayoutEdge[],
  positions: Record<string, GraphLayoutPosition>,
  dimensions: RouteEdgesDimensions,
  routes: Record<string, EdgeRoute>,
): void {
  const halfW = dimensions.nodeWidth / 2;
  const halfH = dimensions.nodeHeight / 2;
  const first = requireEdge(group, 0);
  const posA = requirePosition(positions, first.from);
  const posB = requirePosition(positions, first.to);
  const dx = posB.x - posA.x;
  const dy = posB.y - posA.y;
  const len = Math.hypot(dx, dy) || 1;
  const perpX = -dy / len;
  const perpY = dx / len;
  const midX = (posA.x + posB.x) / 2;
  const midY = (posA.y + posB.y) / 2;

  group.forEach((edge, index) => {
    const isCurved = group.length > 1;
    const sign = index % 2 === 0 ? 1 : -1;
    const magnitude = Math.floor(index / 2) + 1;
    const offset = isCurved ? sign * magnitude * CURVE_OFFSET : 0;

    const control = { x: midX + perpX * offset, y: midY + perpY * offset };
    const fromCenter = requirePosition(positions, edge.from);
    const toCenter = requirePosition(positions, edge.to);
    const start = clipToRect(fromCenter, control, halfW, halfH);
    const end = clipToRect(toCenter, control, halfW, halfH);

    const path = isCurved
      ? `M ${start.x} ${start.y} Q ${control.x} ${control.y} ${end.x} ${end.y}`
      : `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

    const label = isCurved
      ? quadraticMidpoint(start, control, end)
      : { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

    routes[edge.id] = { path, labelX: label.x, labelY: label.y };
  });
}

/** The point at `t` (0 at the start, 1 at the end) along a cubic Bézier. */
export function pointOnCurve([p0, c1, c2, p3]: CubicCurve, t: number): GraphLayoutPosition {
  const u = 1 - t;
  const weights = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t] as const;
  return {
    x: weights[0] * p0.x + weights[1] * c1.x + weights[2] * c2.x + weights[3] * p3.x,
    y: weights[0] * p0.y + weights[1] * c1.y + weights[2] * c2.y + weights[3] * p3.y,
  };
}

function cubicRoute(curve: CubicCurve): EdgeRoute {
  const [p0, c1, c2, p3] = curve;
  const label = pointOnCurve(curve, 0.5);
  return {
    path: `M ${p0.x} ${p0.y} C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${p3.x} ${p3.y}`,
    labelX: label.x,
    labelY: label.y,
  };
}

interface LoopPlan {
  /** 1 when the column's loops bulge right of it, -1 when left. */
  side: 1 | -1;
  /** The furthest a loop's control points may sit from the column, so it stays clear of the next one. */
  maxReach: number;
}

function isLoop(from: GraphLayoutPosition, to: GraphLayoutPosition, nodeWidth: number): boolean {
  return Math.abs(to.x - from.x) < nodeWidth;
}

/**
 * For each column (each distinct node x), where its loops go: the side with
 * fewer edges to other columns attached, the right on a tie, and no further
 * than a share of the gap to the next column on that side.
 */
function planLoops(
  edges: readonly GraphLayoutEdge[],
  positions: Record<string, GraphLayoutPosition>,
  nodeWidth: number,
): Map<number, LoopPlan> {
  const attached = new Map<number, { left: number; right: number }>();
  for (const { x } of Object.values(positions)) attached.set(x, { left: 0, right: 0 });
  const attach = (x: number, side: "left" | "right") => {
    const tally = attached.get(x);
    if (tally) tally[side] += 1;
  };
  for (const edge of edges) {
    const from = requirePosition(positions, edge.from);
    const to = requirePosition(positions, edge.to);
    if (isLoop(from, to, nodeWidth)) continue;
    const forward = to.x > from.x;
    attach(from.x, forward ? "right" : "left");
    attach(to.x, forward ? "left" : "right");
  }
  const columns = [...attached.keys()];
  return new Map(
    columns.map((x) => {
      const tally = attached.get(x) ?? { left: 0, right: 0 };
      const side = tally.left < tally.right ? -1 : 1;
      const gaps = columns.filter((other) => (other - x) * side > 0).map((other) => Math.abs(other - x) - nodeWidth);
      const room = gaps.length === 0 ? Number.POSITIVE_INFINITY : (LOOP_GAP_SHARE * Math.min(...gaps)) / CUBIC_PEAK;
      return [x, { side, maxReach: Math.min(MAX_LOOP_REACH, Math.max(0, room)) }];
    }),
  );
}

/** Out of one side of a column and back into it: an edge inside one column, or a self-edge. */
function loopRoute(
  from: GraphLayoutPosition,
  to: GraphLayoutPosition,
  options: { self: boolean; index: number; dimensions: RouteEdgesDimensions; plan: LoopPlan; loopHeight: number },
): EdgeRoute {
  const { side, maxReach } = options.plan;
  const halfW = options.dimensions.nodeWidth / 2;
  const spread = options.self ? options.loopHeight / 4 : 0;
  const startY = from.y - spread;
  const endY = to.y + spread;
  const reach =
    Math.min(maxReach, Math.max(MIN_SIDE_REACH, LOOP_BASE_REACH + LOOP_SPAN_RATE * Math.abs(endY - startY))) +
    options.index * CURVE_OFFSET;
  const outer = side > 0 ? Math.max(from.x, to.x) : Math.min(from.x, to.x);
  const bulge = outer + side * (halfW + reach);
  return {
    ...cubicRoute([
      { x: from.x + side * halfW, y: startY },
      { x: bulge, y: startY },
      { x: bulge, y: endY },
      { x: to.x + side * halfW, y: endY },
    ]),
    labelAnchor: side > 0 ? "start" : "end",
  };
}

function routeSideGroup(
  group: readonly GraphLayoutEdge[],
  positions: Record<string, GraphLayoutPosition>,
  dimensions: RouteEdgesDimensions,
  loops: ReadonlyMap<number, LoopPlan>,
  routes: Record<string, EdgeRoute>,
): void {
  const halfW = dimensions.nodeWidth / 2;
  const first = requireEdge(group, 0);
  const shorter = Math.min(heightOf(dimensions, first.from), heightOf(dimensions, first.to));
  const step = group.length > 1 ? Math.min(CURVE_OFFSET, Math.max(0, shorter - PORT_INSET) / (group.length - 1)) : 0;

  group.forEach((edge, index) => {
    const from = requirePosition(positions, edge.from);
    const to = requirePosition(positions, edge.to);
    if (isLoop(from, to, dimensions.nodeWidth)) {
      const plan = loops.get(from.x);
      if (!plan) throw new Error(`routeEdges: no loop plan for the column of "${edge.from}"`);
      routes[edge.id] = loopRoute(from, to, { self: edge.from === edge.to, index, dimensions, plan, loopHeight: heightOf(dimensions, edge.from) });
      return;
    }
    const direction = to.x > from.x ? 1 : -1;
    const shift = (index - (group.length - 1) / 2) * step;
    const start = { x: from.x + direction * halfW, y: from.y + shift };
    const end = { x: to.x - direction * halfW, y: to.y + shift };
    const reach = Math.max(MIN_SIDE_REACH, Math.abs(end.x - start.x) / 2);
    const curve: CubicCurve = [
      start,
      { x: start.x + direction * reach, y: start.y },
      { x: end.x - direction * reach, y: end.y },
      end,
    ];
    routes[edge.id] = { ...cubicRoute(curve), curve };
  });
}

/**
 * Routes each edge as an SVG path. Edges sharing an unordered node pair — a
 * reciprocal A→B + B→A, or literal duplicates — are always fanned apart so
 * they never overlap.
 *
 * `anchor: "center"` (the default) clips each edge to the source/target node
 * rectangles: a lone edge is a straight line, a fanned one a quadratic curve
 * offset from the line between the two node centres.
 *
 * `anchor: "side"` is for column layouts: an edge leaves the side of its
 * source facing the target and enters the facing side of the target as a
 * cubic curve. An edge between two nodes of one column, and a self-edge, is a
 * loop: it arcs out of the column and back on the side with fewer edges to
 * other columns, the further the more height it spans, so loops nest.
 *
 * Throws when an edge references a node id absent from `positions`, naming
 * the edge id, rather than silently dropping or mis-routing it.
 */
export function routeEdges(
  edges: readonly GraphLayoutEdge[],
  positions: Record<string, GraphLayoutPosition>,
  dimensions: RouteEdgesDimensions,
  options: RouteEdgesOptions = {},
): Record<string, EdgeRoute> {
  const routes: Record<string, EdgeRoute> = {};
  const groups = groupEdgesByPair(edges, positions);
  if (options.anchor !== "side") {
    for (const group of groups) routeCenterGroup(group, positions, dimensions, routes);
    return routes;
  }
  const loops = planLoops(edges, positions, dimensions.nodeWidth);
  for (const group of groups) routeSideGroup(group, positions, dimensions, loops, routes);
  return routes;
}

/** How far the side-anchored loops of `edges` reach past the outermost columns, on each side. */
export function loopOverhang(
  edges: readonly GraphLayoutEdge[],
  positions: Record<string, GraphLayoutPosition>,
  dimensions: RouteEdgesDimensions,
): { left: number; right: number } {
  const xs = Object.values(positions).map((position) => position.x);
  const loops = Object.values(routeEdges(edges, positions, dimensions, { anchor: "side" })).filter(
    (route) => route.labelAnchor !== undefined,
  );
  if (loops.length === 0) return { left: 0, right: 0 };
  const peaks = loops.map((route) => route.labelX);
  const halfW = dimensions.nodeWidth / 2;
  return {
    left: Math.max(0, Math.min(...xs) - halfW - Math.min(...peaks)),
    right: Math.max(0, Math.max(...peaks) - (Math.max(...xs) + halfW)),
  };
}

export interface EdgeLabelBox {
  id: string;
  /** The label's anchor: its centre, its left edge when `anchor` is "start", its right edge when "end". */
  x: number;
  y: number;
  width: number;
  height: number;
  anchor?: "start" | "end";
}

function labelLeft(box: EdgeLabelBox): number {
  if (box.anchor === "start") return box.x;
  return box.anchor === "end" ? box.x - box.width : box.x - box.width / 2;
}

/**
 * Resolves the y of each edge label so no two labels cover each other: taken
 * top to bottom, a label that would overlap one already placed drops just
 * below it. Labels keep their x, and a label that overlaps nothing keeps its y.
 */
export function spreadLabels(boxes: readonly EdgeLabelBox[], gap = 2): Record<string, number> {
  const placed: { left: number; right: number; y: number; height: number }[] = [];
  const ys: Record<string, number> = {};
  for (const box of [...boxes].sort((a, b) => a.y - b.y)) {
    const left = labelLeft(box);
    const right = left + box.width;
    let y = box.y;
    for (let moved = true; moved; ) {
      moved = false;
      for (const other of placed) {
        const clearance = (box.height + other.height) / 2 + gap;
        if (left < other.right && other.left < right && Math.abs(y - other.y) < clearance) {
          y = other.y + clearance;
          moved = true;
        }
      }
    }
    placed.push({ left, right, y, height: box.height });
    ys[box.id] = y;
  }
  return ys;
}
