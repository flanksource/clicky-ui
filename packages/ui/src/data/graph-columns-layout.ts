// Level-column layout for GraphDiagram: pure math, no React. Split from
// graph-layout.ts, which owns the shared types and `ringLayout`.

import { loopOverhang } from "./graph-edge-routing";
import type { GraphLayoutEdge, GraphLayoutNode, GraphLayoutPosition, GraphLayoutResult } from "./graph-layout";

export interface ColumnsLayoutNode extends GraphLayoutNode {
  /** Column of the node. May be negative: the lowest level is the first column. */
  level: number;
  /** Nodes sharing a group stay contiguous within their column and are boxed together. */
  group?: string;
}

export interface ColumnsLayoutOptions {
  /** Node bounding-box width in px. Defaults to 168. */
  nodeWidth?: number;
  /** Node bounding-box height in px. Defaults to 60. */
  nodeHeight?: number;
  /** Horizontal gap between the node boxes of adjacent columns in px. Defaults to 96. */
  columnGap?: number;
  /** Vertical gap between stacked nodes, and between group rectangles, in px. Defaults to 20. */
  rowGap?: number;
  /** Space between a group's nodes and its rectangle in px. Defaults to 12. */
  groupPadding?: number;
  /** Space reserved around the columns before the viewport edge. Defaults to 24. */
  padding?: number;
  /**
   * Re-ordering passes over all columns after the first placement, alternating direction; a pass
   * is kept only if it leaves fewer crossings. Defaults to 4. 0 keeps the first placement.
   */
  sweeps?: number;
}

export interface GraphLayoutGroupBox {
  /** `${level}:${group}` — a group spanning several columns gets one rectangle per column. */
  id: string;
  group: string;
  level: number;
  /** Top-left corner, in the same coordinate space as the layout's `width`/`height`. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ColumnsLayoutResult extends GraphLayoutResult {
  groups: GraphLayoutGroupBox[];
}

type ColumnMetrics = Required<ColumnsLayoutOptions>;

interface GroupRun {
  group: string | undefined;
  nodes: ColumnsLayoutNode[];
}

/** One ordering of every column, stacked: the node centres and group rectangles it gives. */
interface Arrangement {
  order: Map<number, ColumnsLayoutNode[]>;
  placed: Map<string, GraphLayoutPosition>;
  boxes: Map<number, GraphLayoutGroupBox[]>;
}

/** What stays fixed while columns are re-ordered. */
interface ColumnsContext {
  m: ColumnMetrics;
  levels: number[];
  levelOf: Map<string, number>;
  groupRank: Map<string | undefined, number>;
  neighbours: Map<string, string[]>;
  edges: readonly GraphLayoutEdge[];
  /** Centre x and top y of a level's column. */
  origin: (level: number) => { x: number; top: number; level: number };
}

const DEFAULT_NODE_WIDTH = 168;
const DEFAULT_NODE_HEIGHT = 60;
const DEFAULT_COLUMN_GAP = 96;
const DEFAULT_ROW_GAP = 20;
const DEFAULT_GROUP_PADDING = 12;
const DEFAULT_PADDING = 24;
const DEFAULT_SWEEPS = 4;

function mustGet<K, V>(map: ReadonlyMap<K, V>, key: K, what: string): V {
  const value = map.get(key);
  if (value === undefined) {
    throw new Error(`columnsLayout: no ${what} for "${String(key)}"`);
  }
  return value;
}

function columnMetrics(options: ColumnsLayoutOptions): ColumnMetrics {
  return {
    nodeWidth: options.nodeWidth ?? DEFAULT_NODE_WIDTH,
    nodeHeight: options.nodeHeight ?? DEFAULT_NODE_HEIGHT,
    columnGap: options.columnGap ?? DEFAULT_COLUMN_GAP,
    rowGap: options.rowGap ?? DEFAULT_ROW_GAP,
    groupPadding: options.groupPadding ?? DEFAULT_GROUP_PADDING,
    padding: options.padding ?? DEFAULT_PADDING,
    sweeps: options.sweeps ?? DEFAULT_SWEEPS,
  };
}

function indexColumns(nodes: readonly ColumnsLayoutNode[]) {
  const columns = new Map<number, ColumnsLayoutNode[]>();
  const groupRank = new Map<string | undefined, number>();
  for (const node of nodes) {
    if (!Number.isFinite(node.level)) {
      throw new Error(`columnsLayout: node "${node.id}" has no finite level (got ${node.level})`);
    }
    if (!groupRank.has(node.group)) groupRank.set(node.group, groupRank.size);
    const column = columns.get(node.level);
    if (column) {
      column.push(node);
    } else {
      columns.set(node.level, [node]);
    }
  }
  return { columns, groupRank };
}

function indexNeighbours(
  nodes: readonly ColumnsLayoutNode[],
  edges: readonly GraphLayoutEdge[],
): Map<string, string[]> {
  const neighbours = new Map<string, string[]>(nodes.map((node) => [node.id, []]));
  for (const edge of edges) {
    const from = neighbours.get(edge.from);
    const to = neighbours.get(edge.to);
    if (!from || !to) {
      const missing = from ? edge.to : edge.from;
      throw new Error(`columnsLayout: edge "${edge.id}" references unknown node "${missing}"`);
    }
    from.push(edge.to);
    to.push(edge.from);
  }
  return neighbours;
}

function columnHeight(column: readonly ColumnsLayoutNode[], m: ColumnMetrics): number {
  const groups = new Set(column.map((node) => node.group));
  groups.delete(undefined);
  return column.length * m.nodeHeight + (column.length - 1) * m.rowGap + 2 * m.groupPadding * groups.size;
}

/** Groups in order of first appearance; within a group by ascending weight, the column's order on ties. */
function orderColumn(
  column: readonly ColumnsLayoutNode[],
  groupRank: ReadonlyMap<string | undefined, number>,
  weight: (node: ColumnsLayoutNode) => number,
): GroupRun[] {
  const runs = new Map<number, { node: ColumnsLayoutNode; index: number; weight: number }[]>();
  column.forEach((node, index) => {
    const rank = mustGet(groupRank, node.group, "group rank");
    const entry = { node, index, weight: weight(node) };
    const run = runs.get(rank);
    if (run) {
      run.push(entry);
    } else {
      runs.set(rank, [entry]);
    }
  });
  return [...runs.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, run]) => {
      // Infinity - Infinity is NaN, which falls through to the column-order tiebreak.
      const nodes = run.sort((a, b) => a.weight - b.weight || a.index - b.index).map((entry) => entry.node);
      return { group: nodes[0]?.group, nodes };
    });
}

function stackColumn(
  runs: readonly GroupRun[],
  origin: { x: number; top: number; level: number },
  m: ColumnMetrics,
  placed: Map<string, GraphLayoutPosition>,
): GraphLayoutGroupBox[] {
  const boxes: GraphLayoutGroupBox[] = [];
  let cursor = origin.top;
  for (const { group, nodes } of runs) {
    const pad = group === undefined ? 0 : m.groupPadding;
    const height = nodes.length * m.nodeHeight + (nodes.length - 1) * m.rowGap + 2 * pad;
    nodes.forEach((node, index) => {
      const top = cursor + pad + index * (m.nodeHeight + m.rowGap);
      placed.set(node.id, { x: origin.x, y: top + m.nodeHeight / 2 });
    });
    if (group !== undefined) {
      boxes.push({
        id: `${origin.level}:${group}`,
        group,
        level: origin.level,
        x: origin.x - m.nodeWidth / 2 - pad,
        y: cursor,
        width: m.nodeWidth + 2 * pad,
        height,
      });
    }
    cursor += height + m.rowGap;
  }
  return boxes;
}

function meanY(ids: readonly string[], placed: ReadonlyMap<string, GraphLayoutPosition>): number {
  if (ids.length === 0) return Number.POSITIVE_INFINITY;
  return ids.reduce((sum, id) => sum + mustGet(placed, id, "position").y, 0) / ids.length;
}

/**
 * Levels in the order they are first laid out — the one nearest 0, then
 * outward on each side — each paired with the already-placed adjacent level
 * its nodes are ordered against.
 */
function placementOrder(levels: readonly number[]): [level: number, reference: number | undefined][] {
  const anchor = levels.reduce((best, level) => (Math.abs(level) < Math.abs(best) ? level : best));
  const outward = (side: readonly number[]) =>
    side.map((level, index): [number, number] => [level, side[index - 1] ?? anchor]);
  return [
    [anchor, undefined],
    ...outward(levels.filter((level) => level > anchor)),
    ...outward(levels.filter((level) => level < anchor).reverse()),
  ];
}

/** Orders one column by the mean y of its nodes' neighbours in the `references` levels, and stacks it. */
function placeColumn(level: number, references: readonly number[], ctx: ColumnsContext, into: Arrangement): void {
  const runs = orderColumn(mustGet(into.order, level, "column"), ctx.groupRank, (node) =>
    meanY(
      mustGet(ctx.neighbours, node.id, "neighbours").filter((id) =>
        references.includes(mustGet(ctx.levelOf, id, "level")),
      ),
      into.placed,
    ),
  );
  into.order.set(
    level,
    runs.flatMap((run) => run.nodes),
  );
  into.boxes.set(level, stackColumn(runs, ctx.origin(level), ctx.m, into.placed));
}

/** Pairs of edges between adjacent columns that cross, taking each edge as a straight line. */
function countCrossings(ctx: ColumnsContext, placed: ReadonlyMap<string, GraphLayoutPosition>): number {
  const spans = new Map<number, [lower: number, upper: number][]>();
  for (const edge of ctx.edges) {
    const levels = [mustGet(ctx.levelOf, edge.from, "level"), mustGet(ctx.levelOf, edge.to, "level")] as const;
    const [lower, upper] = levels[0] < levels[1] ? [edge.from, edge.to] : [edge.to, edge.from];
    const index = ctx.levels.indexOf(Math.min(...levels));
    if (levels[0] === levels[1] || ctx.levels[index + 1] !== Math.max(...levels)) continue;
    const span: [number, number] = [mustGet(placed, lower, "position").y, mustGet(placed, upper, "position").y];
    spans.set(index, [...(spans.get(index) ?? []), span]);
  }
  let crossings = 0;
  for (const gap of spans.values()) {
    gap.forEach((a, index) => {
      crossings += gap.slice(index + 1).filter((b) => (a[0] - b[0]) * (a[1] - b[1]) < 0).length;
    });
  }
  return crossings;
}

/** A copy of `from` with every column re-ordered against both its neighbours, in the order given. */
function sweep(from: Arrangement, sequence: readonly number[], ctx: ColumnsContext): Arrangement {
  const next: Arrangement = { order: new Map(from.order), placed: new Map(from.placed), boxes: new Map(from.boxes) };
  for (const level of sequence) {
    const index = ctx.levels.indexOf(level);
    const adjacent = [ctx.levels[index - 1], ctx.levels[index + 1]].filter((other): other is number => other !== undefined);
    placeColumn(level, adjacent, ctx, next);
  }
  return next;
}

/**
 * Orders the columns. The first pass places the level nearest 0 and works
 * outward, ordering each column against the one just placed. Then up to
 * `sweeps` passes re-order every column against both its neighbours, inward
 * then outward, and the arrangement with the fewest crossings is kept: the
 * first pass's unless a later one strictly beats it.
 */
function arrange(columns: ReadonlyMap<number, ColumnsLayoutNode[]>, ctx: ColumnsContext): Arrangement {
  let current: Arrangement = { order: new Map(columns), placed: new Map(), boxes: new Map() };
  for (const [level, reference] of placementOrder(ctx.levels)) {
    placeColumn(level, reference === undefined ? [] : [reference], ctx, current);
  }
  let best = current;
  let fewest = countCrossings(ctx, best.placed);
  for (let pass = 0; pass < ctx.m.sweeps && fewest > 0; pass++) {
    current = sweep(current, pass % 2 === 0 ? [...ctx.levels].reverse() : ctx.levels, ctx);
    const crossings = countCrossings(ctx, current.placed);
    if (crossings < fewest) {
      best = current;
      fewest = crossings;
    }
  }
  return best;
}

/**
 * Places nodes in left-to-right columns by `level` (the lowest level first),
 * stacking each column top to bottom and centring it against the tallest one.
 *
 * Within a column, nodes of one group are contiguous, groups appearing in the
 * order they first occur in `nodes`. Inside a group nodes are ordered by the
 * mean y of their neighbours in the adjacent columns, so edges between columns
 * cross less (see `arrange`); nodes with no neighbour there go last, and ties
 * keep input order.
 *
 * Returns node centres plus one rectangle per (column, group). Extra width is
 * reserved on each side for the loops `routeEdges` draws outside the first and
 * last columns.
 */
export function columnsLayout(
  nodes: readonly ColumnsLayoutNode[],
  edges: readonly GraphLayoutEdge[],
  options: ColumnsLayoutOptions = {},
): ColumnsLayoutResult {
  const m = columnMetrics(options);
  const { columns, groupRank } = indexColumns(nodes);
  const neighbours = indexNeighbours(nodes, edges);
  const levels = [...columns.keys()].sort((a, b) => a - b);
  if (levels.length === 0) {
    return { width: 2 * m.padding, height: 2 * m.padding, positions: {}, groups: [] };
  }

  const minLevel = Math.min(...levels);
  const tallest = Math.max(...[...columns.values()].map((column) => columnHeight(column, m)));
  const inset = m.padding + (nodes.some((node) => node.group !== undefined) ? m.groupPadding : 0);
  const { placed, boxes } = arrange(columns, {
    m,
    levels,
    levelOf: new Map(nodes.map((node) => [node.id, node.level])),
    groupRank,
    neighbours,
    edges,
    origin: (level) => ({
      x: inset + m.nodeWidth / 2 + (level - minLevel) * (m.nodeWidth + m.columnGap),
      top: m.padding + (tallest - columnHeight(mustGet(columns, level, "column"), m)) / 2,
      level,
    }),
  });

  const room = loopOverhang(edges, Object.fromEntries(placed), m);
  const span = (Math.max(...levels) - minLevel) * (m.nodeWidth + m.columnGap) + m.nodeWidth;
  return {
    width: room.left + 2 * inset + span + room.right,
    height: tallest + 2 * m.padding,
    positions: Object.fromEntries([...placed].map(([id, { x, y }]) => [id, { x: x + room.left, y }])),
    groups: [...boxes.values()]
      .flat()
      .map((box) => ({ ...box, x: box.x + room.left }))
      .sort((a, b) => a.level - b.level || a.y - b.y),
  };
}
