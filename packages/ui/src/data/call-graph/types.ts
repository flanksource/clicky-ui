// The call graph as uir's `graph.Graph` serialises it (github.com/flanksource/uir/graph, model.go). The
// field names are its JSON tags, so a host hands a response straight in. Nothing here is specific to a
// language: what a node kind means and how it is drawn comes from a CallGraphVocabulary.

/** Which side of the root a graph walks. */
export type CallGraphDirection = "callees" | "callers" | "both";

/** A call site behind an edge. `guards` are the conditions that must hold to reach it, outermost first. */
export interface CallGraphSite {
  path?: string;
  line?: number;
  column?: number;
  /** The call as written. */
  text?: string;
  guards?: string[];
}

/** uir.Identifier: where a node sits in a module, package, type and method. */
export interface CallGraphIdentifier {
  id?: string;
  module?: string;
  package?: string;
  type?: string;
  method?: string;
  field?: string;
  signature?: string;
  node_type?: string;
}

/** Where a node is declared, in the terms an index addresses it by. */
export interface CallGraphLocation {
  root_key?: string;
  checkout_path?: string;
  snapshot_id?: string;
  source_id?: string;
  path?: string;
  identity_key?: string;
  line?: number;
  column?: number;
}

export interface CallGraphNode {
  id: string;
  identifier: CallGraphIdentifier;
  kind: string;
  label: string;
  /** A `CallGraphGroup` id. */
  group?: string;
  /** 0 for a root, negative for its callers and positive for its callees. */
  depth: number;
  /** Incoming edges: a total on the side the walk asked about, else the edges drawn. */
  in: number;
  /** Outgoing edges: a total on the side the walk asked about, else the edges drawn. */
  out: number;
  /** A target the source could not place; drawn as a leaf. */
  unresolved?: boolean;
  location?: CallGraphLocation;
  tone?: string;
  icon?: string;
  properties?: Record<string, string>;
}

/** A call, a call one of several targets is chosen for at run time, or a read or write of data. */
export type CallGraphEdgeType = "call" | "dispatch" | "read" | "write";

/** What `fetchGraph` asks the graph to follow: `call` covers dispatch too. */
export type CallGraphAccess = "call" | "read" | "write";

export const CALL_GRAPH_ACCESS: readonly CallGraphAccess[] = ["call", "read", "write"];

export interface CallGraphEdge {
  /** `from|to|type`. */
  id: string;
  from: string;
  to: string;
  type: CallGraphEdgeType;
  /** The construct behind the edge, such as `copybook`, `attached`, `sql` or `copyto`. */
  kind?: string;
  sites: CallGraphSite[];
  /**
   * Facts about the edge, such as the plans that select a dispatch target, or `columns`/`fields`: the
   * members a read or write of a collapsed table or entity touches, comma separated.
   */
  properties?: Record<string, string>;
}

export interface CallGraphGroup {
  id: string;
  label: string;
  parent?: string;
}

/** What the graph leaves out. */
export interface CallGraphOmitted {
  node_limit?: boolean;
  beyond_depth?: number;
  unresolved?: number;
  unreadable_source?: string[];
  /** Distinct nodes the exclusions left out, per group. */
  excluded?: Record<string, number>;
}

export interface CallGraph {
  roots: string[];
  nodes: CallGraphNode[];
  edges: CallGraphEdge[];
  groups?: CallGraphGroup[];
  omitted: CallGraphOmitted;
}

/** What `fetchGraph` is asked for. `exclude` undefined takes the host's defaults; `[]` excludes nothing. */
export interface CallGraphFetchParams {
  root: string;
  direction: CallGraphDirection;
  depth: number;
  exclude: string[] | undefined;
  /** The edge types to follow, never empty. Filtered by the host, so the `+N` counts agree. */
  access: CallGraphAccess[];
  /** Columns and fields as nodes of their own, rather than collapsed into their table or entity. */
  columns: boolean;
  /** `load` draws the graph around `root`; `expand` loads one more hop around a drawn node, to merge in. */
  purpose: "load" | "expand";
  signal: AbortSignal;
}

/** A group the graph reached, drawn or excluded; `nodes` counts both. */
export interface CallGraphGroupFact {
  name: string;
  /** Shown instead of `name`. */
  label?: string;
  /** Outside the indexed scope: "Hide all external" covers it. */
  external?: boolean;
  nodes: number;
  excluded: boolean;
}

export interface CallGraphSelection {
  kind: "node" | "edge";
  id: string;
}

/** The guards fetched for a selected edge whose response came without them. */
export type SiteGuardsState = { status: "loading" } | { status: "loaded"; sites: CallGraphSite[] } | { status: "failed"; error: string };

/** The words an edge's type is drawn with: its pill's accessible name, its tooltip and its legend entry. */
export type CallGraphEdgeLabels = Record<CallGraphEdgeType, string>;
