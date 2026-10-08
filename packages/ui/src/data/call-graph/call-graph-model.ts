// Pure mapping from a call graph to what GraphDiagram draws, and how a `+N` expansion merges into the
// held graph. It decides what is shown and leaves drawing a glyph to the DiagramGlyphs it is handed,
// so it renders nothing itself.
import type { ReactNode } from "react";
import type { BadgeTone } from "../Badge";
import { mergeAccess, type DataAccess } from "../data-access";
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
  if (!on && type !== "variable" && baseAccess(access).length === 1) throw new Error(`call graph: ${type} is the only access type on`);
  return ACCESS_ORDER.filter((entry) => (entry === type ? on : access.includes(entry)));
}

/** Every access type in the usual order: variables last, on top of the others. */
const ACCESS_ORDER: readonly CallGraphAccess[] = [...CALL_GRAPH_ACCESS, "variable"];

/** The access types of `access` that are not variables, at least one of which a graph follows. */
export function baseAccess(access: readonly CallGraphAccess[]): CallGraphAccess[] {
  return access.filter((type) => CALL_GRAPH_ACCESS.includes(type));
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
export type DiagramGroup = GraphDiagramGroup & { title: string; aside?: string };

export interface Diagram {
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups: DiagramGroup[];
  /** The graph as drawn, collapsed groups folded into their stand-ins: what a selection is looked up in. */
  drawn: DrawnGraph;
}

/** Draws the glyphs the model chooses. The component supplies icons; the tests supply strings. */
export interface DiagramGlyphs {
  /** `words` is the icon's name for a screen reader, such as `external function`. */
  node(glyph: string, words: string): ReactNode;
  /** The pill icon of an edge type; a plain call has none. */
  edge(type: CallGraphEdgeType): ReactNode | undefined;
  group(caption: string, glyph?: string): ReactNode;
  /** The mark of a node the reads and writes into it access; without it no node is marked. */
  access?(access: DataAccess): ReactNode;
}

export interface DiagramInput {
  graph: CallGraph;
  visible: VisibleGraph;
  direction: CallGraphDirection;
  options: DiagramOptions;
  glyphs: DiagramGlyphs;
  vocabulary: CallGraphVocabulary;
  edgeLabels: CallGraphEdgeLabels;
  /**
   * The groups drawn as their header alone, by id: each folds into one stand-in node, and its members'
   * edges merge onto it. The root's group never folds. Leave it out and no group can collapse.
   */
  collapsed?: readonly string[];
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

/** A node's edges on its outer side, as the response holds them. */
function outerEdges(graph: CallGraph, node: CallGraphNode): CallGraphEdge[] {
  const side = outerSide(node);
  return graph.edges.filter((edge) => (side === "out" ? edge.from : edge.to) === node.id);
}

/** The ids at the far end of a node's edges on its outer side, as the response holds them. */
function outerNeighbours(graph: CallGraph, node: CallGraphNode): string[] {
  const side = outerSide(node);
  return outerEdges(graph, node).map((edge) => (side === "out" ? edge.to : edge.from));
}

/** The neighbours on a node's outer side that the response holds and are not drawn. */
export function hiddenNeighbours(graph: CallGraph, visible: VisibleGraph, nodeId: string): string[] {
  const drawn = new Set(visible.nodes.map((node) => node.id));
  return outerNeighbours(graph, requireNode(graph, nodeId)).filter((id, index, all) => !drawn.has(id) && all.indexOf(id) === index);
}

/**
 * The `+N` on a node: how many more edges there are to load on its outer side. Only that side's count
 * is a total (`out` for the root and callees, `in` for callers); the other equals the edges in the
 * response. Excluded neighbours are in neither. From it come off the edges drawn, a merged edge counting
 * every edge it stands for. A node without a source cannot be expanded, nor can the side the direction hides.
 */
export function expandCount(
  graph: CallGraph,
  visible: VisibleGraph,
  nodeId: string,
  direction: CallGraphDirection,
  vocabulary: Pick<CallGraphVocabulary, "hasSource">,
  merged: ReadonlyMap<string, EdgeMerge> = new Map(),
): number {
  const node = requireNode(graph, nodeId);
  const side = outerSide(node);
  if (!vocabulary.hasSource(node) || direction === (side === "out" ? "callers" : "callees")) return 0;
  const drawn = new Set(visible.nodes.map((entry) => entry.id));
  const accounted = outerEdges(graph, node)
    .filter((edge) => drawn.has(side === "out" ? edge.to : edge.from))
    .reduce((sum, edge) => sum + (merged.get(edge.id)?.sources.length ?? 1), 0);
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

/** How the reads and writes among `edges` into the node access it, or undefined when none do. */
function accessInto(edges: readonly CallGraphEdge[], id: string): DataAccess | undefined {
  return edges.reduce<DataAccess | undefined>((held, edge) => (edge.to === id && (edge.type === "read" || edge.type === "write") ? mergeAccess(held, edge.type) : held), undefined);
}

function toDiagramNode(node: CallGraphNode, { direction, options, glyphs, vocabulary }: DiagramInput, drawn: DrawnGraph, records: ReadonlyMap<string, string>): DiagramNode {
  const { graph, visible } = drawn;
  const count = expandCount(graph, visible, node.id, direction, vocabulary, drawn.merged);
  const isRoot = graph.roots.includes(node.id);
  const tone = isRoot ? "info" : node.unresolved ? "warning" : undefined;
  // A table, column, entity or field is a name its group box already places: one short line will do.
  const compact = (node.group !== undefined && records.has(node.group)) || (!isRoot && vocabulary.isData(node) && !vocabulary.hasSource(node));
  const aside = dataMemberAside(node);
  const access = glyphs.access && accessInto(visible.edges, node.id);
  return {
    id: node.id,
    label: node.label,
    icon: glyphs.node(vocabulary.glyphOf(graph, node), vocabulary.kindOf(graph, node)),
    title: nodeTitle(graph, node, vocabulary),
    level: node.depth,
    ...(options.grouped && node.group !== undefined ? { group: node.group } : {}),
    ...(compact ? { size: "compact" as const } : {}),
    ...(aside !== undefined ? { aside } : {}),
    ...(access ? { mark: glyphs.access?.(access) } : {}),
    ...(tone !== undefined ? { tone } : {}),
    ...(vocabulary.muted(node) ? { muted: true } : {}),
    ...(count > 0 ? { expandCount: count } : {}),
  };
}

function toDiagramEdge(edge: CallGraphEdge, { options, glyphs, edgeLabels, vocabulary }: DiagramInput, drawn: DrawnGraph): DiagramEdge {
  const merge = drawn.merged.get(edge.id);
  const label = [edgeLabel(edge, options), merge && countWords(merge.members, drawn.graph, vocabulary)].filter(Boolean).join(" · ") || undefined;
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

/** A collapsed group's members, and the stand-in node drawn for them. */
export interface GroupFold {
  group: string;
  members: CallGraphNode[];
}

/** One edge drawn for the edges of several members: the edges it stands for and the members at their ends. */
export interface EdgeMerge {
  sources: CallGraphEdge[];
  members: CallGraphNode[];
}

export interface DrawnGraph {
  graph: CallGraph;
  visible: VisibleGraph;
  /** By stand-in id. */
  folds: ReadonlyMap<string, GroupFold>;
  /** By the id of the edge drawn for them. */
  merged: ReadonlyMap<string, EdgeMerge>;
}

const STAND_IN_PREFIX = "group:";

/** The id of the node a collapsed group is drawn as. */
export function standInId(group: string): string {
  return `${STAND_IN_PREFIX}${group}`;
}

function rootGroups(graph: CallGraph): Set<string | undefined> {
  return new Set(graph.roots.map((id) => requireNode(graph, id).group));
}

/** The groups that hold a drawn node and can collapse: every one but the root's, in first-drawn order. */
export function collapsibleGroups(graph: CallGraph, visible: VisibleGraph): string[] {
  const roots = rootGroups(graph);
  return [...new Set(visible.nodes.map((node) => node.group))].filter((group): group is string => group !== undefined && !roots.has(group));
}

/** "10 columns", "2 fields", "3 variables": how many members, in the words of their one kind, else "members". */
function countWords(members: readonly CallGraphNode[], graph: CallGraph, vocabulary: CallGraphVocabulary): string {
  const [first] = members;
  const kind = first && members.every((member) => member.kind === first.kind) ? vocabulary.kindOf(graph, first) : "member";
  return `${members.length} ${kind}${members.length === 1 ? "" : "s"}`;
}

/** A merged edge's properties: the names of the members it stands for, gathered as columns, fields or members. */
function memberProperties(members: readonly CallGraphNode[]): Record<string, string> {
  const keys: Record<string, string> = { column: "columns", field: "fields" };
  const names = new Map<string, string[]>();
  for (const member of members) {
    const key = keys[member.kind] ?? "members";
    names.set(key, [...(names.get(key) ?? []), member.label]);
  }
  return Object.fromEntries([...names].map(([key, list]) => [key, list.join(", ")]));
}

function mergeEdges(id: string, sources: readonly CallGraphEdge[], standInOf: ReadonlyMap<string, string>, nodes: ReadonlyMap<string, CallGraphNode>): [CallGraphEdge, EdgeMerge] {
  const [first] = sources;
  if (!first) throw new Error(`call graph: merged edge "${id}" stands for no edge`);
  const memberIds = [...new Set(sources.flatMap((edge) => [edge.from, edge.to]).filter((end) => standInOf.has(end)))];
  const members = memberIds.map((member) => {
    const node = nodes.get(member);
    if (!node) throw new Error(`call graph: no node "${member}"`);
    return node;
  });
  const kind = sources.every((edge) => edge.kind === first.kind) ? first.kind : undefined;
  const edge: CallGraphEdge = {
    id, from: standInOf.get(first.from) ?? first.from, to: standInOf.get(first.to) ?? first.to, type: first.type,
    ...(kind !== undefined ? { kind } : {}),
    sites: distinctSites(sources.flatMap((source) => source.sites)),
    properties: memberProperties(members),
  };
  return [edge, { sources: [...sources], members }];
}

/** Edges with an end in a collapsed group, re-ended on its stand-in and merged per stand-in, other end and type. */
function foldEdges(edges: readonly CallGraphEdge[], standInOf: ReadonlyMap<string, string>, nodes: ReadonlyMap<string, CallGraphNode>) {
  const kept: CallGraphEdge[] = [];
  const grouped = new Map<string, CallGraphEdge[]>();
  for (const edge of edges) {
    const from = standInOf.get(edge.from) ?? edge.from;
    const to = standInOf.get(edge.to) ?? edge.to;
    if (from === edge.from && to === edge.to) kept.push(edge);
    else grouped.set(`${from}|${to}|${edge.type}`, [...(grouped.get(`${from}|${to}|${edge.type}`) ?? []), edge]);
  }
  const merged = new Map([...grouped].map(([id, sources]) => mergeEdges(id, sources, standInOf, nodes)).map(([edge, merge]) => [edge.id, { edge, merge }]));
  return { edges: [...kept, ...[...merged.values()].map(({ edge }) => edge)], merged: new Map([...merged].map(([id, { merge }]) => [id, merge])) };
}

/** The node a collapsed group is drawn as: its owner's kind for a record, else its first member's, at the depth nearest the root. */
function standInNode(id: string, fold: GroupFold, graph: CallGraph, records: ReadonlyMap<string, string>, edges: readonly CallGraphEdge[]): CallGraphNode {
  const [first, ...rest] = fold.members;
  if (!first) throw new Error(`call graph: collapsed group "${fold.group}" holds no node`);
  const nearest = rest.reduce((best, member) => (Math.abs(member.depth) < Math.abs(best.depth) ? member : best), first);
  return {
    id, identifier: {}, kind: records.get(fold.group) ?? first.kind,
    label: graph.groups?.find((group) => group.id === fold.group)?.label ?? fold.group,
    group: fold.group, depth: nearest.depth,
    in: edges.filter((edge) => edge.to === id).length, out: edges.filter((edge) => edge.from === id).length,
  };
}

/** The graph with each collapsed group's drawn members folded into one stand-in. */
function foldGroups(graph: CallGraph, visible: VisibleGraph, collapsed: readonly string[], records: ReadonlyMap<string, string>): DrawnGraph {
  const roots = rootGroups(graph);
  const folds = new Map<string, GroupFold>();
  const standInOf = new Map<string, string>();
  for (const node of visible.nodes) {
    if (node.group === undefined || roots.has(node.group) || !collapsed.includes(node.group)) continue;
    const id = standInId(node.group);
    folds.set(id, { group: node.group, members: [...(folds.get(id)?.members ?? []), node] });
    standInOf.set(node.id, id);
  }
  if (folds.size === 0) return { graph, visible, folds, merged: new Map() };
  const { edges, merged } = foldEdges(graph.edges, standInOf, new Map(graph.nodes.map((node) => [node.id, node])));
  const standIns = [...folds].map(([id, fold]) => standInNode(id, fold, graph, records, edges));
  const nodes = [...visible.nodes.filter((node) => !standInOf.has(node.id)), ...standIns];
  const drawnIds = new Set(nodes.map((node) => node.id));
  return {
    graph: { ...graph, nodes: [...graph.nodes.filter((node) => !standInOf.has(node.id)), ...standIns], edges },
    visible: { nodes, edges: edges.filter((edge) => drawnIds.has(edge.from) && drawnIds.has(edge.to)) },
    folds,
    merged,
  };
}

function toDiagramGroup({ id, label }: CallGraphGroup, { glyphs, graph, vocabulary }: DiagramInput, drawn: DrawnGraph, records: ReadonlyMap<string, string>, collapsible: ReadonlySet<string> | undefined): DiagramGroup {
  const fold = drawn.folds.get(standInId(id));
  return {
    id, label: glyphs.group(groupCaption(label), records.get(id)), title: label,
    ...(records.has(id) ? { variant: "record" as const } : {}),
    ...(collapsible?.has(id) ? { collapsed: fold !== undefined } : {}),
    ...(fold ? { aside: countWords(fold.members, graph, vocabulary) } : {}),
  };
}

export function toDiagram(input: DiagramInput): Diagram {
  const { graph, visible, options, vocabulary, collapsed } = input;
  const records = options.grouped ? recordGroups(visible, vocabulary) : new Map<string, string>();
  const drawn = options.grouped && collapsed ? foldGroups(graph, visible, collapsed, records) : { graph, visible, folds: new Map(), merged: new Map() };
  const collapsible = options.grouped && collapsed ? new Set(collapsibleGroups(graph, visible)) : undefined;
  const rank = groupRank(drawn.graph, vocabulary);
  return {
    nodes: [...drawn.visible.nodes].sort((a, b) => rank(a) - rank(b)).map((node) => toDiagramNode(node, input, drawn, records)),
    edges: drawn.visible.edges.map((edge) => toDiagramEdge(edge, input, drawn)),
    groups: options.grouped ? (graph.groups ?? []).map((group) => toDiagramGroup(group, input, drawn, records, collapsible)) : [],
    drawn,
  };
}
