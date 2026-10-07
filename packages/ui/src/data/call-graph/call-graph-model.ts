// Pure mapping from a call graph to what GraphDiagram draws, and how a `+N` expansion merges into the
// held graph. It decides what is shown and leaves drawing a glyph to the DiagramGlyphs it is handed,
// so it renders nothing itself.
import type { ReactNode } from "react";
import type { BadgeTone } from "../Badge";
import type { GraphDiagramEdge, GraphDiagramGroup, GraphDiagramNode } from "../graph-diagram-model";
import { edgeLabel, edgeTitle, groupCaption, isConditional, type PillOptions } from "./call-graph-labels";
import { DATA_MEMBER_OWNER, dataMemberAside, isDataMember, nodeTitle, siteKey, type CallGraphVocabulary } from "./call-graph-vocabulary";
import {
  CALL_GRAPH_ACCESS,
  type CallGraph,
  type CallGraphAccess,
  type CallGraphDirection,
  type CallGraphEdge,
  type CallGraphEdgeLabels,
  type CallGraphEdgeType,
  type CallGraphGroup,
  type CallGraphNode,
  type CallGraphSite,
} from "./types";

/** The deepest graph uir builds (graph.MaxDepth). */
export const CALL_GRAPH_MAX_DEPTH = 8;
/** The depth uir builds when none is asked for (graph.DefaultDepth). */
export const CALL_GRAPH_DEFAULT_DEPTH = 2;

export const DEFAULT_EDGE_LABELS: CallGraphEdgeLabels = { call: "call", dispatch: "dispatch", read: "read", write: "write" };

/** The tone each edge type but a plain call is drawn in: dispatch blue, a read green, a write amber. */
const EDGE_TONE: Record<Exclude<CallGraphEdgeType, "call">, BadgeTone> = { dispatch: "info", read: "success", write: "warning" };

/** Turns one access type on or off, in the usual order. Turning the last one off fails: a graph follows something. */
export function toggleAccess(access: readonly CallGraphAccess[], type: CallGraphAccess): CallGraphAccess[] {
  const on = !access.includes(type);
  if (!on && access.length === 1) throw new Error(`call graph: ${type} is the only access type on`);
  return CALL_GRAPH_ACCESS.filter((entry) => (entry === type ? on : access.includes(entry)));
}

export interface GraphView {
  direction: CallGraphDirection;
  /** Nodes further than this many hops from the root are hidden. */
  depth: number;
  /** Node ids shown regardless of `depth`, because a `+N` expansion revealed them. */
  revealed: readonly string[];
}

export interface VisibleGraph {
  nodes: CallGraphNode[];
  edges: CallGraphEdge[];
}

export interface DiagramOptions extends PillOptions {
  /** Box nodes by their `group`. */
  grouped: boolean;
}

export type DiagramNode = GraphDiagramNode & { label: string; level: number; title: string };
export type DiagramEdge = GraphDiagramEdge & { dashed: boolean };
export type DiagramGroup = GraphDiagramGroup & { title: string };

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: DiagramGroup[];
}

/** Draws the glyphs the model chooses. The component supplies icons; the tests supply strings. */
export interface DiagramGlyphs {
  /** `words` is the icon's name for a screen reader, such as `external function`. */
  node(glyph: string, words: string): ReactNode;
  /** The pill icon of an edge type; a plain call has none. */
  edge(type: CallGraphEdgeType): ReactNode | undefined;
  group(caption: string, glyph?: string): ReactNode;
}

export interface DiagramInput {
  graph: CallGraph;
  visible: VisibleGraph;
  direction: CallGraphDirection;
  options: DiagramOptions;
  glyphs: DiagramGlyphs;
  vocabulary: CallGraphVocabulary;
  edgeLabels: CallGraphEdgeLabels;
}

export function requireNode(graph: CallGraph, id: string): CallGraphNode {
  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`call graph: no node "${id}"`);
  return node;
}

function inDirection(depth: number, direction: CallGraphDirection): boolean {
  if (direction === "both" || depth === 0) return true;
  return direction === "callees" ? depth > 0 : depth < 0;
}

/** The nodes on the requested side within `depth`, plus revealed ones, and the edges between them. */
export function visibleGraph(graph: CallGraph, view: GraphView): VisibleGraph {
  const revealed = new Set(view.revealed);
  const nodes = graph.nodes.filter(
    (node) => inDirection(node.depth, view.direction) && (Math.abs(node.depth) <= view.depth || revealed.has(node.id)),
  );
  const ids = new Set(nodes.map((node) => node.id));
  return { nodes, edges: graph.edges.filter((edge) => ids.has(edge.from) && ids.has(edge.to)) };
}

/** A caller grows toward its own callers; the root and callees grow toward their callees. */
function outerSide(node: CallGraphNode): "in" | "out" {
  return node.depth < 0 ? "in" : "out";
}

/** The direction a `+N` expansion of the node walks: its outer side, the side `+N` counts. */
export function expansionDirection(node: CallGraphNode): Exclude<CallGraphDirection, "both"> {
  return outerSide(node) === "in" ? "callers" : "callees";
}

/** The ids at the far end of a node's edges on its outer side, as the response holds them. */
function outerNeighbours(graph: CallGraph, node: CallGraphNode): string[] {
  const side = outerSide(node);
  return graph.edges.filter((edge) => (side === "out" ? edge.from : edge.to) === node.id).map((edge) => (side === "out" ? edge.to : edge.from));
}

/** The neighbours on a node's outer side that the response holds and are not drawn. */
export function hiddenNeighbours(graph: CallGraph, visible: VisibleGraph, nodeId: string): string[] {
  const drawn = new Set(visible.nodes.map((node) => node.id));
  return outerNeighbours(graph, requireNode(graph, nodeId)).filter((id, index, all) => !drawn.has(id) && all.indexOf(id) === index);
}

/**
 * The `+N` on a node: how many more edges there are to load on its outer side. Only that side's count
 * is a total (`out` for the root and callees, `in` for callers); the other equals the edges in the
 * response. Excluded neighbours are in neither. From it come off the edges drawn. A node without a
 * source cannot be expanded, nor can the side the direction hides.
 */
export function expandCount(
  graph: CallGraph,
  visible: VisibleGraph,
  nodeId: string,
  direction: CallGraphDirection,
  vocabulary: Pick<CallGraphVocabulary, "hasSource">,
): number {
  const node = requireNode(graph, nodeId);
  const side = outerSide(node);
  if (!vocabulary.hasSource(node) || direction === (side === "out" ? "callers" : "callees")) return 0;
  const drawn = new Set(visible.nodes.map((entry) => entry.id));
  const accounted = outerNeighbours(graph, node).filter((id) => drawn.has(id)).length;
  return Math.max(0, (side === "out" ? node.out : node.in) - accounted);
}

export interface NodeTotals {
  callers?: number;
  callees?: number;
  readers?: number;
  writers?: number;
}

/**
 * A data node's readers, writers and callers: the edges into it the graph holds, by type, each left
 * out when there are none.
 */
function accessTotals(graph: CallGraph, node: CallGraphNode): NodeTotals {
  const into = (types: readonly CallGraphEdgeType[]) => graph.edges.filter((edge) => edge.to === node.id && types.includes(edge.type)).length;
  const totals: [keyof NodeTotals, number][] = [["readers", into(["read"])], ["writers", into(["write"])], ["callers", into(["call", "dispatch"])]];
  return Object.fromEntries(totals.filter(([, count]) => count > 0));
}

/**
 * A node's call totals on the sides the response walked: callees at depth >= 0, callers at depth <= 0.
 * A data node counts who reads, writes and calls it instead.
 */
export function walkedTotals(graph: CallGraph, node: CallGraphNode, vocabulary: Pick<CallGraphVocabulary, "isData">): NodeTotals {
  if (vocabulary.isData(node)) return accessTotals(graph, node);
  const walked = (sign: number) => graph.nodes.some((other) => Math.sign(other.depth) === sign);
  return {
    ...(node.depth <= 0 && walked(-1) ? { callers: node.in } : {}),
    ...(node.depth >= 0 && walked(1) ? { callees: node.out } : {}),
  };
}

function distinctSites(sites: CallGraphSite[]): CallGraphSite[] {
  return sites.filter((site, index) => sites.findIndex((other) => siteKey(other) === siteKey(site)) === index);
}

const edgeKey = (edge: CallGraphEdge) => `${edge.from}|${edge.to}|${edge.type}`;

/**
 * Merges a one-hop expansion into the held graph. The expansion is rooted at a held node, so its
 * depths are re-signed from that node's depth. Held nodes keep their place; edges are keyed by
 * `from|to|type`, gain the call sites they did not hold and keep their first non-empty properties;
 * the held response's other fields stay.
 */
export function mergeGraph<T extends CallGraph>(held: T, expansion: CallGraph): T {
  const [rootId] = expansion.roots;
  const base = held.nodes.find((node) => node.id === rootId);
  if (rootId === undefined || !base) throw new Error(`call graph: expansion root "${rootId}" is not in the held graph`);
  const heldIds = new Set(held.nodes.map((node) => node.id));
  const added = expansion.nodes.filter((node) => !heldIds.has(node.id)).map((node) => ({ ...node, depth: base.depth + node.depth }));
  const incoming = new Map(expansion.edges.map((edge) => [edgeKey(edge), edge]));
  const edges = held.edges.map((edge) => {
    const more = incoming.get(edgeKey(edge));
    incoming.delete(edgeKey(edge));
    if (!more) return edge;
    const properties = edge.properties && Object.keys(edge.properties).length > 0 ? edge.properties : more.properties;
    return { ...edge, sites: distinctSites([...edge.sites, ...more.sites]), ...(properties ? { properties } : {}) };
  });
  const groupIds = new Set((held.groups ?? []).map((group) => group.id));
  const groups: CallGraphGroup[] = [...(held.groups ?? []), ...(expansion.groups ?? []).filter((group) => !groupIds.has(group.id))];
  return { ...held, nodes: [...held.nodes, ...added], edges: [...edges, ...incoming.values()], groups };
}

/**
 * The order nodes are handed to the diagram, which stacks groups in the order they first appear: the
 * root's group, then the other groups holding nodes with a source, then the others, then nodes in no group.
 */
function groupRank(graph: CallGraph, vocabulary: CallGraphVocabulary): (node: CallGraphNode) => number {
  const rootGroups = new Set(graph.roots.map((id) => requireNode(graph, id).group));
  const sourced = new Set(graph.nodes.filter((node) => vocabulary.hasSource(node)).map((node) => node.group));
  return (node) => {
    if (node.group === undefined) return 3;
    if (rootGroups.has(node.group)) return 0;
    return sourced.has(node.group) ? 1 : 2;
  };
}

function toDiagramNode(node: CallGraphNode, { graph, visible, direction, options, glyphs, vocabulary }: DiagramInput, records: ReadonlyMap<string, string>): DiagramNode {
  const count = expandCount(graph, visible, node.id, direction, vocabulary);
  const isRoot = graph.roots.includes(node.id);
  const tone = isRoot ? "info" : node.unresolved ? "warning" : undefined;
  // A table, column, entity or field is a name its group box already places: one short line will do.
  const compact = (node.group !== undefined && records.has(node.group)) || (!isRoot && vocabulary.isData(node) && !vocabulary.hasSource(node));
  const aside = dataMemberAside(node);
  return {
    id: node.id,
    label: node.label,
    icon: glyphs.node(vocabulary.glyphOf(graph, node), vocabulary.kindOf(graph, node)),
    title: nodeTitle(graph, node, vocabulary),
    level: node.depth,
    ...(options.grouped && node.group !== undefined ? { group: node.group } : {}),
    ...(compact ? { size: "compact" as const } : {}),
    ...(aside !== undefined ? { aside } : {}),
    ...(tone !== undefined ? { tone } : {}),
    ...(vocabulary.muted(node) ? { muted: true } : {}),
    ...(count > 0 ? { expandCount: count } : {}),
  };
}

function toDiagramEdge(edge: CallGraphEdge, { options, glyphs, edgeLabels }: DiagramInput): DiagramEdge {
  const label = edgeLabel(edge, options);
  const title = edgeTitle(edge);
  return {
    id: edge.id,
    from: edge.from,
    to: edge.to,
    dashed: isConditional(edge),
    ...(edge.type === "call" ? {} : { tone: EDGE_TONE[edge.type], icon: glyphs.edge(edge.type), iconLabel: edgeLabels[edge.type] }),
    ...(label !== undefined ? { label } : {}),
    ...(title !== undefined ? { title } : {}),
  };
}

/** Mean glyph advance of the 10px pill text, and the pill's padding plus a little air. */
const PILL_CHAR_WIDTH = 5.2;
const PILL_CHROME = 22;
/** The room a pill's icon and its gap take, in characters. */
const PILL_ICON_CHARS = 3;
const MIN_COLUMN_GAP = 96;

/**
 * The gap between columns: as wide as the longest pill on an edge between two columns, so no pill
 * covers a node. Wider gaps than the pills need make the diagram wider, and so smaller once fitted.
 */
export function columnGap({
  nodes,
  edges,
}: {
  nodes: readonly Pick<DiagramNode, "id" | "level">[];
  edges: readonly Pick<DiagramEdge, "id" | "from" | "to" | "label" | "icon">[];
}): number {
  const level = new Map(nodes.map((node) => [node.id, node.level]));
  const chars = edges
    .filter((edge) => level.get(edge.from) !== level.get(edge.to))
    .map((edge) => (edge.label?.length ?? 0) + (edge.icon != null ? PILL_ICON_CHARS : 0));
  return Math.max(MIN_COLUMN_GAP, Math.round(Math.max(0, ...chars) * PILL_CHAR_WIDTH) + PILL_CHROME);
}

export function recordGroups(visible: VisibleGraph, vocabulary: CallGraphVocabulary): Map<string, string> {
  const grouped = new Map<string, CallGraphNode[]>();
  for (const node of visible.nodes) {
    if (node.group !== undefined) grouped.set(node.group, [...(grouped.get(node.group) ?? []), node]);
  }
  const records = new Map<string, string>();
  for (const [group, nodes] of grouped) {
    const kind = nodes[0]?.kind;
    if (kind !== undefined && nodes.every((node) => vocabulary.isData(node) && isDataMember(node) && node.kind === kind)) {
      const owner = DATA_MEMBER_OWNER[kind];
      if (owner === undefined) throw new Error(`call graph: no owner kind for data member "${kind}"`);
      records.set(group, owner);
    }
  }
  return records;
}

export function toDiagram(input: DiagramInput): Diagram {
  const { graph, visible, options, glyphs, vocabulary } = input;
  const rank = groupRank(graph, vocabulary);
  const records = options.grouped ? recordGroups(visible, vocabulary) : new Map<string, string>();
  return {
    nodes: [...visible.nodes].sort((a, b) => rank(a) - rank(b)).map((node) => toDiagramNode(node, input, records)),
    edges: visible.edges.map((edge) => toDiagramEdge(edge, input)),
    groups: options.grouped ? (graph.groups ?? []).map(({ id, label }) => ({ id, label: glyphs.group(groupCaption(label), records.get(id)), title: label, ...(records.has(id) ? { variant: "record" as const } : {}) })) : [],
  };
}
