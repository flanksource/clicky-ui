// A call graph around one root: fetched through the host, with `+N` expansions merged in, the call
// sites of a selected edge (guards fetched on selection when the host's graph leaves them out) and the
// details of a selected node. It knows no language: the host's vocabulary names and draws node kinds,
// and the host's callbacks open nodes and sites.
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "../../components/button";
import { cn } from "../../lib/utils";
import { AccessMark } from "../AccessMark";
import { GraphDiagram } from "../GraphDiagram";
import { matchesExclude, type ExcludeMatcher } from "./call-graph-exclude";
import type { GuardLabel } from "./call-graph-labels";
import {
  baseAccess,
  CALL_GRAPH_DEFAULT_DEPTH,
  CALL_GRAPH_MAX_DEPTH,
  collapsibleGroups,
  columnGap,
  DEFAULT_EDGE_LABELS,
  expansionDirection,
  mergeGraph,
  requireNode,
  toDiagram,
  visibleGraph,
  type DiagramGlyphs,
  type DiagramOptions,
} from "./call-graph-model";
import { requireGlyph, UIR_CALL_GRAPH_VOCABULARY, type CallGraphVocabulary } from "./call-graph-vocabulary";
import { EdgeTypeGlyph, GroupCaption, NodeGlyphIcon } from "./CallGraphGlyphs";
import { EdgeSites, Legend, NodeDetails, type CallGraphAction } from "./CallGraphParts";
import { CallGraphToolbar } from "./CallGraphToolbar";
import {
  CALL_GRAPH_ACCESS,
  type CallGraph as Graph,
  type CallGraphAccess,
  type CallGraphDirection,
  type CallGraphEdge,
  type CallGraphEdgeLabels,
  type CallGraphFetchParams,
  type CallGraphGroupFact,
  type CallGraphNode,
  type CallGraphSelection,
  type CallGraphSite,
} from "./types";
import { errorMessage, useGraphLoad, useHeld, useSiteGuards, type GraphRequest } from "./use-call-graph";

export interface CallGraphProps<G extends Graph = Graph> {
  /** What the graph is drawn around, in the host's terms. Undefined shows `emptyMessage`. */
  root: string | undefined;
  /** Loads the graph around `params.root`, and one hop around a node for its `+N`. */
  fetchGraph: (params: CallGraphFetchParams) => Promise<G>;
  /** What else `fetchGraph` reads, such as the host's scope: part of the request's key, so a change refetches. */
  fetchKey?: string;
  /** Pass `onDirectionChange` to control it; without one the component holds it, starting here. */
  direction?: CallGraphDirection;
  onDirectionChange?: (direction: CallGraphDirection) => void;
  depth?: number;
  onDepthChange?: (depth: number) => void;
  /** The exclusion patterns; undefined takes the host's defaults. Controlled with `onExcludeChange`. */
  exclude?: string[] | undefined;
  onExcludeChange?: (exclude: string[] | undefined) => void;
  selected?: CallGraphSelection | undefined;
  onSelectedChange?: (selected: CallGraphSelection | undefined) => void;
  /** The source reports reads and writes of data: shows the Access toggles and the Columns switch. */
  dataAccess?: boolean;
  /** The source can follow the variables a body reads and writes: shows a Variables toggle beside the Access ones. Needs `dataAccess`. */
  variableAccess?: boolean;
  /** The edge types the host follows, at least one of call, read and write; all three by default. Controlled with `onAccessChange`. */
  access?: CallGraphAccess[];
  onAccessChange?: (access: CallGraphAccess[]) => void;
  /** Columns and fields as nodes of their own; collapsed into tables and entities by default. */
  columns?: boolean;
  onColumnsChange?: (columns: boolean) => void;
  /**
   * The groups drawn as their header alone, by `graph.groups` id: each folds into one node, and its
   * members' edges merge onto it, counting the members. The root's group never folds. Controlled with
   * `onCollapsedGroupsChange`; without one the component holds it, starting here, none by default.
   */
  collapsedGroups?: string[];
  onCollapsedGroupsChange?: (ids: string[]) => void;
  /** The groups the graph reached, drawn or excluded. Without it the graph offers no exclusions. */
  groupFacts?: (graph: G) => CallGraphGroupFact[];
  /** The patterns in force when `exclude` is undefined: the host's defaults, as its response reports them. */
  defaultExclude?: (graph: G) => string[];
  /** How a pattern matches a group, for a host with keywords of its own. */
  excludeMatcher?: ExcludeMatcher;
  /**
   * Where a node opens. A node the vocabulary gives no source is never opened, and Open is disabled on
   * a node with no href that `onOpenNode` does not accept.
   */
  nodeHref?: (node: CallGraphNode, graph: G) => string | undefined;
  /** Opens a node; with `nodeHref` it handles a plain click on the link. */
  onOpenNode?: (node: CallGraphNode, graph: G) => void;
  /** Whether `onOpenNode` opens a node; every node by default. */
  canOpenNode?: (node: CallGraphNode, graph: G) => boolean;
  openLabel?: string;
  /** Re-roots the graph on a node, by id: a drawn node the vocabulary can root, or the column behind a field. */
  onFocusNode?: (nodeId: string, graph: G) => void;
  /** Where a call site opens; a site opens only when its caller has a source. */
  siteHref?: (site: CallGraphSite, edge: CallGraphEdge, graph: G) => string | undefined;
  onRevealSite?: (site: CallGraphSite, edge: CallGraphEdge, graph: G) => void;
  /** Fetches the guards of a selected edge's sites, for a host whose graph leaves them out. */
  loadSiteGuards?: (edge: CallGraphEdge, graph: G, signal: AbortSignal) => Promise<CallGraphSite[]>;
  edgeLabels?: Partial<CallGraphEdgeLabels>;
  /** What a conditional edge's pill says of its guards; "innermost" by default. The edge's tooltip always lists them. */
  guardLabel?: GuardLabel;
  vocabulary?: CallGraphVocabulary;
  /** Shows a Pin root toggle; the host keeps `root` while pinned. */
  pinned?: boolean;
  onPinnedChange?: (pinned: boolean, rootId: string | undefined) => void;
  /** Host facts above the diagram, such as how the root was resolved. */
  renderHeader?: (graph: G) => ReactNode;
  toolbarEnd?: ReactNode;
  emptyMessage?: ReactNode;
  maxDepth?: number;
  className?: string;
}

type Held<G> = { key: string; graph: G; revealed: string[] };
type PendingExpansion = { key: string; nodeId: string; label: string; controller: AbortController };

const NODE_WIDTH = 188;
const NODE_HEIGHT = 32;
const COMPACT_NODE_HEIGHT = 22;
const ROW_GAP = 14;
/** Node labels are 12px: at this scale they are 7.2px, the smallest that still reads. */
const READABLE_SCALE = 0.6;
const OPTIONS: Omit<DiagramOptions, "guardLabel"> = { truncateAt: 32, grouped: true };

function Notice({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  );
}

function Alert({ message }: { message: string | undefined }) {
  if (!message) return null;
  return <div role="alert" className="whitespace-pre-wrap rounded-md border border-destructive p-3 text-sm text-destructive">{message}</div>;
}

const ACCESS_WORDS: Record<CallGraphAccess, string> = { call: "Calls", read: "Reads", write: "Writes", variable: "Variables" };

function accessWords(access: readonly CallGraphAccess[]): string {
  return access.map((type) => ACCESS_WORDS[type]).join(" and ");
}

function action(href: string | undefined, onSelect: (() => void) | undefined): CallGraphAction | undefined {
  if (href === undefined && onSelect === undefined) return undefined;
  return { ...(href !== undefined ? { href } : {}), ...(onSelect ? { onSelect } : {}) };
}

export function CallGraph<G extends Graph = Graph>(props: CallGraphProps<G>) {
  const { root, fetchGraph, vocabulary = UIR_CALL_GRAPH_VOCABULARY, maxDepth = CALL_GRAPH_MAX_DEPTH } = props;
  const labels: CallGraphEdgeLabels = { ...DEFAULT_EDGE_LABELS, ...props.edgeLabels };
  const [direction, setDirection] = useHeld(props.direction ?? "both", props.onDirectionChange);
  const [depth, setDepth] = useHeld(props.depth ?? CALL_GRAPH_DEFAULT_DEPTH, props.onDepthChange);
  const [exclude, setExclude] = useHeld(props.exclude, props.onExcludeChange);
  const [access, setAccess] = useHeld(props.access ?? [...CALL_GRAPH_ACCESS], props.onAccessChange);
  const [columns, setColumns] = useHeld(props.columns ?? false, props.onColumnsChange);
  const [collapsedGroups, setCollapsedGroups] = useHeld(props.collapsedGroups ?? [], props.onCollapsedGroupsChange);
  if (baseAccess(access).length === 0) throw new Error("call graph: access must name at least one of call, read and write");
  if (access.includes("variable") && !(props.dataAccess && props.variableAccess)) {
    throw new Error("call graph: access names variable, but the host does not offer variableAccess");
  }
  const [ownSelection, setOwnSelection] = useState<{ key: string; selected: CallGraphSelection }>();

  const request: GraphRequest | undefined = root === undefined ? undefined : { root, direction, depth, exclude, access, columns, purpose: "load" };
  const key = `call-graph:${JSON.stringify([request ?? null, props.fetchKey ?? null])}`;
  const load = useGraphLoad(fetchGraph, request, key);

  const [expanded, setExpanded] = useState<Held<G>>();
  const [expanding, setExpanding] = useState<{ request: PendingExpansion; error?: string }>();
  const pendingExpansion = useRef<PendingExpansion | undefined>(undefined);
  const activeKey = useRef(key);
  activeKey.current = key;
  useEffect(() => {
    setExpanding((current) => current?.request.key === key && !current.request.controller.signal.aborted ? current : undefined);
    return () => {
      if (pendingExpansion.current?.key === key) {
        pendingExpansion.current.controller.abort();
        pendingExpansion.current = undefined;
      }
    };
  }, [key]);
  const [opening, setOpening] = useState({ nonce: 0, fit: false });
  const fresh = useMemo<Held<G> | undefined>(
    () => load.fresh && (expanded?.key === key ? expanded : { key, graph: load.fresh, revealed: [] }),
    [load.fresh, expanded, key],
  );
  const [last, setLast] = useState<Held<G>>();
  if (fresh && fresh !== last) setLast(fresh);
  const shown = root === undefined ? undefined : (fresh ?? last);
  const graph = shown?.graph;

  const visible = useMemo(() => shown && visibleGraph(shown.graph, { direction, depth, revealed: shown.revealed }), [shown, direction, depth]);
  const glyphs = useMemo<DiagramGlyphs>(() => ({
    node: (glyph, words) => <NodeGlyphIcon vocabulary={vocabulary} glyph={glyph} title={words} />,
    edge: (type) => (type === "call" ? undefined : <EdgeTypeGlyph type={type} title={labels[type]} />),
    group: (caption, glyph) => <GroupCaption icon={glyph === undefined ? vocabulary.group.icon : requireGlyph(vocabulary, glyph).icon} caption={caption} />,
    access: (access) => <AccessMark access={access} />,
  }), [vocabulary, labels.dispatch, labels.read, labels.write]);
  const guardLabel = props.guardLabel ?? "innermost";
  const diagram = useMemo(
    () => graph && visible && toDiagram({ graph, visible, direction, options: { ...OPTIONS, guardLabel }, glyphs, vocabulary, edgeLabels: labels, collapsed: collapsedGroups }),
    [graph, visible, direction, guardLabel, glyphs, vocabulary, labels.call, labels.dispatch, labels.read, labels.write, collapsedGroups],
  );
  // What a selection is looked up in: the graph as drawn, collapsed groups folded into their stand-ins.
  const drawn = diagram?.drawn;
  const collapsible = useMemo(() => (graph && visible ? collapsibleGroups(graph, visible) : []), [graph, visible]);
  const toggleGroup = (id: string) => setCollapsedGroups(collapsedGroups.includes(id) ? collapsedGroups.filter((entry) => entry !== id) : [...collapsedGroups, id]);

  const rootId = graph?.roots[0];
  const selection = props.onSelectedChange ? props.selected : ownSelection?.key === shown?.key ? ownSelection?.selected : undefined;
  const select = (next: CallGraphSelection | undefined) => {
    if (props.onSelectedChange) props.onSelectedChange(next);
    else setOwnSelection(next && shown ? { key: shown.key, selected: next } : undefined);
  };
  const openAction = (node: CallGraphNode, drawn: G) => {
    const { onOpenNode, canOpenNode } = props;
    const accepted = onOpenNode && (canOpenNode?.(node, drawn) ?? true) ? () => onOpenNode(node, drawn) : undefined;
    return action(props.nodeHref?.(node, drawn), accepted);
  };
  const selectedNode = selection?.kind === "node" ? drawn?.visible.nodes.find((node) => node.id === selection.id) : undefined;
  const selectedEdge = selection?.kind === "edge" ? drawn?.visible.edges.find((edge) => edge.id === selection.id) : undefined;
  // A merged edge stands for several the host knows: it has no guards of its own to load.
  const mergedEdge = selectedEdge !== undefined && drawn?.merged.has(selectedEdge.id) === true;
  const standIn = selectedNode !== undefined && drawn?.folds.has(selectedNode.id) === true;
  const guards = useSiteGuards(props.loadSiteGuards, shown?.key, mergedEdge ? undefined : selectedEdge, graph);
  const expansion = expanding?.request.key === key ? expanding : undefined;

  // A `+N` loads one more hop on the node's outer side and merges it into the graph this request drew.
  const expand = async (drawn: Held<G>, id: string) => {
    if (drawn.key !== activeKey.current) return;
    if (pendingExpansion.current?.key === drawn.key && pendingExpansion.current.nodeId === id) return;
    pendingExpansion.current?.controller.abort();
    const node = requireNode(drawn.graph, id);
    const request: PendingExpansion = { key: drawn.key, nodeId: id, label: node.label, controller: new AbortController() };
    pendingExpansion.current = request;
    setExpanding({ request });
    try {
      const data = await fetchGraph({
        root: id, direction: expansionDirection(node), depth: 1, exclude, access, columns, purpose: "expand", signal: request.controller.signal,
      });
      if (request.controller.signal.aborted || activeKey.current !== drawn.key || pendingExpansion.current !== request) return;
      setExpanded((held) => {
        if (request.controller.signal.aborted || activeKey.current !== drawn.key) return held;
        const base = held?.key === drawn.key ? held : drawn;
        return { key: drawn.key, graph: mergeGraph(base.graph, data), revealed: [...base.revealed, ...data.nodes.map((entry) => entry.id)] };
      });
      setExpanding((current) => current?.request === request ? undefined : current);
    } catch (error) {
      if (request.controller.signal.aborted || activeKey.current !== drawn.key || pendingExpansion.current !== request) return;
      setExpanding((current) => current?.request === request
        ? { request, error: `Cannot expand ${node.label}: ${errorMessage(error)}` } : current);
    } finally {
      if (pendingExpansion.current === request) pendingExpansion.current = undefined;
    }
  };

  const groups = graph && props.groupFacts?.(graph);
  const effectiveExclude = exclude ?? (graph && props.defaultExclude ? props.defaultExclude(graph) : []);
  const { onPinnedChange } = props;
  const toolbar = (
    <CallGraphToolbar direction={direction} depth={depth} maxDepth={maxDepth} omitted={graph?.omitted} end={props.toolbarEnd} vocabulary={vocabulary}
      {...(onPinnedChange ? { pin: { pinned: props.pinned ?? false, canPin: rootId !== undefined, onPin: (pinned: boolean) => onPinnedChange(pinned, rootId) } } : {})}
      {...(groups ? { exclusions: { exclude: effectiveExclude, groups, matches: props.excludeMatcher ?? matchesExclude, busy: load.loading, vocabulary,
        onExclude: (patterns: string[]) => setExclude(patterns), onDefaults: () => setExclude(undefined) } } : {})}
      {...(props.dataAccess ? { data: { access, onAccess: setAccess, columns, onColumns: setColumns, variables: props.variableAccess ?? false } } : {})}
      {...(collapsible.length > 0 ? { groupCollapse: {
        anyCollapsed: collapsedGroups.some((id) => collapsible.includes(id)),
        anyExpanded: collapsible.some((id) => !collapsedGroups.includes(id)),
        onExpandAll: () => setCollapsedGroups([]),
        onCollapseAll: () => setCollapsedGroups(collapsible),
      } } : {})}
      onDirection={setDirection} onDepth={setDepth}
      onFit={() => setOpening({ nonce: opening.nonce + 1, fit: true })} onReset={() => setOpening({ nonce: opening.nonce + 1, fit: false })} />
  );

  const frame = cn("flex h-full min-h-0 flex-col gap-2 p-2", props.className);
  if (root === undefined) {
    return <div className={frame}>{toolbar}<Notice>{props.emptyMessage ?? "Select a node to draw its call graph."}</Notice></div>;
  }
  const loadError = load.error && `Cannot draw the call graph: ${load.error}`;
  return (
    <div className={frame} aria-busy={load.loading}>
      {toolbar}
      <Alert message={loadError} />
      {graph && props.renderHeader?.(graph)}
      {!shown && load.loading && <Notice>Loading call graph…</Notice>}
      {graph && !rootId && <Notice>The root resolved to no node in this scope.</Notice>}
      {graph && rootId && graph.edges.length === 0 && baseAccess(access).length < CALL_GRAPH_ACCESS.length && (
        <Notice>{`Nothing is reachable with ${accessWords(baseAccess(access))} only.`}</Notice>
      )}
      {graph && rootId && graph.edges.length > 0 && !selectedEdge && !selectedNode && (
        <p className="text-xs text-muted-foreground">Select an edge to list its sites, or a node to see its details.</p>
      )}
      {shown && graph && rootId && diagram && (
        <div className="flex min-h-0 flex-1 gap-3">
          <div className={cn("relative min-h-64 min-w-0 flex-1 rounded-lg border border-border bg-background", load.loading && "opacity-60")}>
            <GraphDiagram key={`${shown.key}:${opening.nonce}`} nodes={diagram.nodes} edges={diagram.edges} groups={diagram.groups} layout="columns" zoomable wheelZoom="zoom" edgeFocus="auto"
              focusId={rootId} {...(opening.fit ? {} : { fitMinScale: READABLE_SCALE })} nodeWidth={NODE_WIDTH} nodeHeight={NODE_HEIGHT} compactNodeHeight={COMPACT_NODE_HEIGHT} recordHeaderHeight={24} columnGap={columnGap(diagram)} rowGap={ROW_GAP}
              className="h-full" ariaLabel={`Call graph of ${requireNode(graph, rootId).label}`} onGroupToggle={toggleGroup}
              onNodeSelect={(id: string) => select({ kind: "node", id })} onEdgeSelect={(id: string) => select({ kind: "edge", id })}
              {...(fresh ? { onNodeExpand: (id: string) => void expand(fresh, id) } : {})}
              {...(selectedNode ? { selectedId: selectedNode.id } : {})} {...(selectedEdge ? { selectedEdgeId: selectedEdge.id } : {})} />
          </div>
          {(selectedEdge || selectedNode || expansion) && (
            <aside className="w-80 max-w-[45%] shrink-0 overflow-y-auto rounded-lg border border-border bg-card p-3" aria-label="Selection">
              {expansion && <p role="status" className="mb-2 text-xs text-muted-foreground">{expansion.error ?? `Loading more around ${expansion.request.label}…`}</p>}
              {(selectedEdge || selectedNode) && (
                <div className="mb-1 flex justify-end">
                  <Button type="button" size="sm" variant="ghost" aria-label="Close selection" onClick={() => select(undefined)}>×</Button>
                </div>
              )}
              {selectedEdge && drawn ? (
                <EdgeSites edge={selectedEdge} graph={drawn.graph} labels={labels} guards={guards} lazyGuards={props.loadSiteGuards !== undefined}
                  siteAction={(props.siteHref || props.onRevealSite) && !drawn.folds.has(selectedEdge.from) && vocabulary.hasSource(requireNode(graph, selectedEdge.from))
                    ? (site) => action(props.siteHref?.(site, selectedEdge, graph), props.onRevealSite && (() => props.onRevealSite?.(site, selectedEdge, graph))) ?? {}
                    : undefined} />
              ) : selectedNode && drawn && (
                <NodeDetails node={selectedNode} graph={drawn.graph} vocabulary={vocabulary} isRoot={selectedNode.id === rootId} openLabel={props.openLabel ?? "Open"}
                  opens={!standIn && (props.nodeHref !== undefined || props.onOpenNode !== undefined)} open={standIn ? undefined : openAction(selectedNode, graph)}
                  onFocus={standIn ? undefined : props.onFocusNode && ((id: string) => props.onFocusNode?.(id, graph))} />
              )}
            </aside>
          )}
        </div>
      )}
      {graph && rootId && <div className="shrink-0"><Legend graph={graph} vocabulary={vocabulary} labels={labels} /></div>}
    </div>
  );
}
