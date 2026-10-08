import { useId, useMemo, type CSSProperties } from "react";
import { cn } from "../lib/utils";
import { IconButton } from "../components/IconButton";
import { UiFullscreen, UiHome, UiZoomIn, UiZoomOut } from "../icons";
import { columnsLayout, type ColumnsLayoutResult } from "./graph-columns-layout";
import { ringLayout, routeEdges, type GraphLayoutPosition } from "./graph-layout";
import { GraphDiagramEdgeLabels, GraphDiagramEdgePaths } from "./GraphDiagramEdges";
import { GraphDiagramGroupBoxes } from "./GraphDiagramGroups";
import { GraphDiagramNodes } from "./GraphDiagramNodes";
import { useGroupWindows } from "./use-group-windows";
import {
  requireEntry,
  type GraphDiagramEdge,
  type GraphDiagramEdgeFocus,
  type GraphDiagramGroup,
  type GraphDiagramLayout,
  type GraphDiagramNode,
  type GraphPlacer,
} from "./graph-diagram-model";
import { useEdgeFocus } from "./use-edge-focus";
import { usePanZoom, type FitOptions, type PanZoom, type WheelMode } from "./use-pan-zoom";

export type {
  GraphDiagramEdge,
  GraphDiagramEdgeFocus,
  GraphDiagramGroup,
  GraphDiagramLayout,
  GraphDiagramNode,
} from "./graph-diagram-model";

// GraphDiagram renders a generic, type-agnostic node/edge diagram. It knows
// nothing about the domain: a producer maps its data into
// GraphDiagramNode/GraphDiagramEdge and gets layout, edge routing and
// selection behaviour.
//
// "ring" suits a small cycle of resources and processes — relationships with
// back edges or reciprocal pairs. "columns" suits a directed graph with a
// natural depth (a call graph, a dependency chain): nodes sit in the column of
// their `level`, grouped and boxed by `group`.
//
// The "columns" layout, and any zoomable diagram, is drawn at its natural
// pixel size so node boxes, edges and group boxes share one coordinate system
// at every container width and zoom level. A non-zoomable "ring" keeps scaling
// its node positions to the container width.

export interface GraphDiagramProps {
  nodes: GraphDiagramNode[];
  edges: GraphDiagramEdge[];
  /** Defaults to "ring". "columns" needs a `level` on every node. */
  layout?: GraphDiagramLayout;
  selectedId?: string;
  onNodeSelect?: (id: string) => void;
  /** Called by a node's `+N` control (see `expandCount`); does not select the node. */
  onNodeExpand?: (id: string) => void;
  selectedEdgeId?: string;
  /** Makes edges, and their label pills, selectable. */
  onEdgeSelect?: (id: string) => void;
  /**
   * Whether an edge shows its pill only while in focus, and fades while another is. Defaults to
   * "auto": a diagram with more than 32 edges is focused, a smaller one shows everything.
   */
  edgeFocus?: GraphDiagramEdgeFocus;
  /**
   * "columns" layout: captions for the group rectangles. A group without an entry shows its id. A group
   * with more than `GROUP_MEMBER_WINDOW` members in a column scrolls them in a window that many rows tall.
   */
  groups?: GraphDiagramGroup[];
  /** "columns" layout: the chevron of a group whose `collapsed` is set asks to collapse or expand it. */
  onGroupToggle?: (groupId: string) => void;
  nodeWidth?: number;
  nodeHeight?: number;
  /**
   * "columns" layout: the height of a node with `size: "compact"`, drawn on one line. A group of only
   * compact nodes stacks them closer and pads them tighter. Defaults to 24.
   */
  compactNodeHeight?: number;
  /** "columns" layout: height of a record group's header in px. Defaults to 24. */
  recordHeaderHeight?: number;
  /** "columns" layout: horizontal gap between columns in px. Leave room for edge label pills. */
  columnGap?: number;
  /** "columns" layout: vertical gap between stacked nodes in px. */
  rowGap?: number;
  /** Ctrl/meta + wheel (or pinch) zooms, dragging the background pans, and zoom controls appear. */
  zoomable?: boolean;
  /** Zoomable: "zoom" makes a plain mouse wheel zoom too, for a diagram that fills its pane. Defaults to "modifier". */
  wheelZoom?: WheelMode;
  /**
   * Zoomable: the smallest scale the diagram opens at, so its text stays readable. A diagram too
   * large for it opens overflowing, centred on `focusId`, and is panned to reach the rest. `Fit to
   * view` still shows everything, and `Reset view` returns here. Unset, the diagram opens whole.
   */
  fitMinScale?: number;
  /** Zoomable: the node an overflowing diagram opens centred on. Defaults to the diagram's centre. */
  focusId?: string;
  maxHeight?: number | string;
  ariaLabel: string;
  className?: string;
}

const DEFAULT_NODE_WIDTH = 168;
const DEFAULT_NODE_HEIGHT = 60;
const DEFAULT_COMPACT_NODE_HEIGHT = 24;

interface LayoutOptions {
  layout: GraphDiagramLayout;
  nodeWidth: number;
  nodeHeight: number;
  compactNodeHeight: number;
  records: readonly string[];
  collapsed: readonly string[];
  recordHeaderHeight: number;
  columnGap: number | undefined;
  rowGap: number | undefined;
}

/**
 * The heights of the nodes not drawn at the node height, in the "columns" layout: the compact ones, and
 * the stand-ins of collapsed groups, as tall as the header they are drawn as.
 */
function compactHeights(nodes: GraphDiagramNode[], layout: GraphDiagramLayout, compactNodeHeight: number, standIns: ReadonlySet<string>, headerHeight: number): Record<string, number> {
  if (layout !== "columns") return {};
  return Object.fromEntries(nodes.flatMap((node): [string, number][] => {
    if (standIns.has(node.id)) return [[node.id, headerHeight]];
    return node.size === "compact" ? [[node.id, compactNodeHeight]] : [];
  }));
}

/** The one node each collapsed group holds, by group id. */
function collapsedStandIns(nodes: GraphDiagramNode[], groups: GraphDiagramGroup[] | undefined): Map<string, string> {
  const collapsed = new Set(groups?.filter((group) => group.collapsed === true).map((group) => group.id));
  const standIns = new Map<string, string>();
  for (const node of nodes) {
    if (node.group === undefined || !collapsed.has(node.group)) continue;
    const held = standIns.get(node.group);
    if (held !== undefined) throw new Error(`GraphDiagram: collapsed group "${node.group}" holds "${held}" and "${node.id}"; it draws one stand-in`);
    standIns.set(node.group, node.id);
  }
  return standIns;
}

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

function requireLevel(node: GraphDiagramNode): number {
  if (node.level === undefined || !Number.isFinite(node.level)) {
    throw new Error(`GraphDiagram: node "${node.id}" needs a finite level for the "columns" layout`);
  }
  return node.level;
}

function layoutNodes(
  nodes: GraphDiagramNode[],
  edges: GraphDiagramEdge[],
  { layout, nodeWidth, nodeHeight, compactNodeHeight, records, collapsed, recordHeaderHeight, columnGap, rowGap }: LayoutOptions,
): ColumnsLayoutResult {
  switch (layout) {
    case "ring":
      return { ...ringLayout(nodes, { nodeWidth, nodeHeight }), groups: [] };
    case "columns":
      return columnsLayout(
        nodes.map((node) => ({
          id: node.id,
          level: requireLevel(node),
          ...(node.group !== undefined ? { group: node.group } : {}),
          ...(node.size === "compact" ? { compact: true } : {}),
        })),
        edges,
        {
          nodeWidth,
          nodeHeight,
          compactNodeHeight,
          records,
          collapsed,
          recordHeaderHeight,
          ...(columnGap !== undefined ? { columnGap } : {}),
          ...(rowGap !== undefined ? { rowGap } : {}),
        },
      );
    default:
      throw new Error(`GraphDiagram: unknown layout "${layout satisfies never}"`);
  }
}

function toPercent(value: number, extent: number): string {
  return `${(value / extent) * 100}%`;
}

function stageStyle(size: { width: number; height: number }, natural: boolean, panZoom: PanZoom | undefined): CSSProperties {
  if (!natural) return { aspectRatio: `${size.width} / ${size.height}` };
  if (!panZoom) return size;
  const { x, y, scale } = panZoom.transform;
  return { ...size, transform: `translate(${x}px, ${y}px) scale(${scale})`, transformOrigin: "0 0" };
}

/** `resettable`: the diagram opens at another view than the whole of it, so there is one to return to. */
function ZoomControls({ panZoom, resettable }: { panZoom: PanZoom; resettable: boolean }) {
  return (
    <div className="absolute right-2 top-2 flex cursor-default gap-0.5 rounded-md border border-border bg-background p-0.5 shadow-sm">
      <IconButton icon={UiZoomOut} label="Zoom out" className="size-6" onClick={panZoom.zoomOut} />
      <IconButton icon={UiZoomIn} label="Zoom in" className="size-6" onClick={panZoom.zoomIn} />
      <IconButton icon={UiFullscreen} label="Fit to view" className="size-6" onClick={panZoom.fit} />
      {resettable && <IconButton icon={UiHome} label="Reset view" className="size-6" onClick={panZoom.reset} />}
    </div>
  );
}

/** How a zoomable diagram opens: no smaller than `fitMinScale`, centred on the `focusId` node. */
function openingFit(
  positions: Record<string, GraphLayoutPosition>,
  fitMinScale: number | undefined,
  focusId: string | undefined,
): FitOptions {
  return {
    ...(fitMinScale !== undefined ? { minScale: fitMinScale } : {}),
    ...(focusId !== undefined ? { focus: requireEntry(positions, focusId, "layout position") } : {}),
  };
}

export function GraphDiagram({
  nodes,
  edges,
  layout = "ring",
  selectedId,
  onNodeSelect,
  onNodeExpand,
  selectedEdgeId,
  onEdgeSelect,
  edgeFocus = "auto",
  groups,
  onGroupToggle,
  nodeWidth = DEFAULT_NODE_WIDTH,
  nodeHeight = DEFAULT_NODE_HEIGHT,
  compactNodeHeight = DEFAULT_COMPACT_NODE_HEIGHT,
  recordHeaderHeight = 24,
  columnGap,
  rowGap,
  zoomable = false,
  wheelZoom = "modifier",
  fitMinScale,
  focusId,
  maxHeight,
  ariaLabel,
  className,
}: GraphDiagramProps) {
  assertEdgesReferenceKnownNodes(nodes, edges);
  const markerPrefix = `graph-diagram-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const records = useMemo(() => groups?.filter((group) => group.variant === "record").map((group) => group.id) ?? [], [groups]);
  const recordNodes = useMemo(() => new Set(layout === "columns" ? nodes.filter((node) => node.group !== undefined && records.includes(node.group)).map((node) => node.id) : []), [layout, nodes, records]);
  const standIns = useMemo(() => (layout === "columns" ? collapsedStandIns(nodes, groups) : new Map<string, string>()), [layout, nodes, groups]);
  const collapsed = useMemo(() => [...standIns.keys()], [standIns]);

  const { width, height, positions: laidOut, groups: groupBoxes } = useMemo(
    () => layoutNodes(nodes, edges, { layout, nodeWidth, nodeHeight, compactNodeHeight, records, collapsed, recordHeaderHeight, columnGap, rowGap }),
    [layout, nodes, edges, nodeWidth, nodeHeight, compactNodeHeight, records, collapsed, recordHeaderHeight, columnGap, rowGap],
  );
  const nodeHeights = useMemo(
    () => compactHeights(nodes, layout, compactNodeHeight, new Set(standIns.values()), recordHeaderHeight),
    [nodes, layout, compactNodeHeight, standIns, recordHeaderHeight],
  );

  const panZoom = usePanZoom({
    enabled: zoomable,
    wheel: wheelZoom,
    contentWidth: width,
    contentHeight: height,
    opening: openingFit(laidOut, fitMinScale, focusId),
  });
  const windows = useGroupWindows({ boxes: groupBoxes, positions: laidOut, reveal: selectedId ?? focusId, stageRef: panZoom.contentRef, scale: zoomable ? panZoom.transform.scale : 1 });
  const { positions } = windows;
  const routes = useMemo(
    () =>
      routeEdges(edges, positions, { nodeWidth, nodeHeight, nodeHeights }, { anchor: layout === "columns" ? "side" : "center" }),
    [edges, positions, nodeWidth, nodeHeight, nodeHeights, layout],
  );
  const drawnNodes = useMemo(() => {
    const standing = new Set(standIns.values());
    return nodes.filter((node) => !windows.hidden.has(node.id) && !standing.has(node.id));
  }, [nodes, windows.hidden, standIns]);
  const windowOf = useMemo(
    () => new Map(groupBoxes.flatMap((box) => (box.window ? box.window.members.map((id): [string, string] => [id, box.id]) : []))),
    [groupBoxes],
  );
  const natural = layout === "columns" || zoomable;
  const place: GraphPlacer = natural
    ? ({ x, y }) => ({ left: x, top: y })
    : ({ x, y }) => ({ left: toPercent(x, width), top: toPercent(y, height) });
  const focus = useEdgeFocus({ mode: edgeFocus, edges, selectedId, selectedEdgeId });
  const edgeSelection = { selectedEdgeId, onEdgeSelect, focus: focus.state };

  return (
    <div
      ref={panZoom.viewportRef}
      className={cn(
        "w-full",
        zoomable ? "relative touch-none overflow-hidden" : "overflow-auto",
        zoomable && (panZoom.panning ? "cursor-grabbing select-none" : "cursor-grab"),
        className,
      )}
      style={maxHeight != null ? { maxHeight } : undefined}
      {...panZoom.handlers}
    >
      <div
        ref={panZoom.contentRef}
        data-graph-stage=""
        className={cn("relative", natural ? !zoomable && "mx-auto" : "w-full")}
        style={stageStyle({ width, height }, natural, zoomable ? panZoom : undefined)}
      >
        <GraphDiagramGroupBoxes boxes={groupBoxes} groups={groups} starts={windows.starts} onScroll={windows.scroll} onGroupToggle={onGroupToggle}
          standIns={standIns} selectedId={selectedId} onNodeSelect={onNodeSelect} />
        <GraphDiagramEdgePaths
          edges={edges}
          nodes={nodes}
          routes={routes}
          width={width}
          height={height}
          ariaLabel={ariaLabel}
          markerPrefix={markerPrefix}
          onEdgeHover={focus.onEdgeHover}
          {...edgeSelection}
        />
        <div className="pointer-events-none absolute inset-0">
          <GraphDiagramEdgeLabels edges={edges} routes={routes} place={place} spread={natural} {...edgeSelection} />
          <GraphDiagramNodes
            nodes={drawnNodes}
            positions={positions}
            windowOf={windowOf}
            place={place}
            nodeWidth={nodeWidth}
            nodeHeight={nodeHeight}
            nodeHeights={nodeHeights}
            recordNodes={recordNodes}
            selectedId={selectedId}
            onNodeSelect={onNodeSelect}
            onNodeExpand={onNodeExpand}
            onNodeHover={focus.onNodeHover}
          />
        </div>
      </div>
      {zoomable && <ZoomControls panZoom={panZoom} resettable={fitMinScale !== undefined} />}
    </div>
  );
}
