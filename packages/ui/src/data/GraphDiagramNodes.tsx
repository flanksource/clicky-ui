import type { KeyboardEvent } from "react";
import { cn } from "../lib/utils";
import type { GraphLayoutPosition } from "./graph-layout";
import {
  activateOnKey,
  hoverHandlers,
  nodeName,
  requireEntry,
  TONE_NODE_CLASS,
  type GraphDiagramNode,
  type GraphPlacer,
} from "./graph-diagram-model";

export interface GraphDiagramNodesProps {
  /** The nodes to draw: members scrolled out of their window and collapsed groups' stand-ins are left out. */
  nodes: GraphDiagramNode[];
  positions: Record<string, GraphLayoutPosition>;
  /** The windowed group box each scrolling member belongs to, by node id: a wheel over the member scrolls it. */
  windowOf: ReadonlyMap<string, string>;
  place: GraphPlacer;
  nodeWidth: number;
  nodeHeight: number;
  /** Heights of the nodes not drawn at `nodeHeight`, by id: the compact ones. */
  nodeHeights: Readonly<Record<string, number>>;
  recordNodes: ReadonlySet<string>;
  selectedId: string | undefined;
  onNodeSelect: ((id: string) => void) | undefined;
  onNodeExpand: ((id: string) => void) | undefined;
  onNodeHover: ((id: string | undefined) => void) | undefined;
}

const EXPAND_CLASS =
  "absolute bottom-0 translate-y-1/2 rounded-full border border-border bg-background px-1.5 text-[10px] font-semibold leading-4 text-muted-foreground shadow-sm";

/**
 * The `+N` control. It hangs off the node's bottom edge at its outer end —
 * the left for a node left of level 0, the right otherwise — which keeps it
 * clear of the side middles where edges attach. It is a sibling of the node,
 * not a child, so activating it never also selects the node.
 */
function ExpandControl({ node, onExpand }: { node: GraphDiagramNode; onExpand: (() => void) | undefined }) {
  const side = (node.level ?? 0) < 0 ? "left-2" : "right-2";
  const text = `+${node.expandCount}`;
  if (!onExpand) {
    return <span className={cn(EXPAND_CLASS, side)}>{text}</span>;
  }
  return (
    <button
      type="button"
      aria-label={`Expand ${node.expandCount} more from ${nodeName(node)}`}
      className={cn(
        EXPAND_CLASS,
        side,
        "cursor-pointer hover:border-primary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
      onClick={onExpand}
    >
      {text}
    </button>
  );
}

// Two 15px label lines, the body's vertical padding and its border.
const TWO_LINE_HEIGHT = 44;

/** The label, behind the node's icon when it has one. `oneLine` cuts it with an ellipsis instead of wrapping. */
function NodeLabel({ node, oneLine }: { node: GraphDiagramNode; oneLine: boolean }) {
  const label = (
    <span
      className={cn(
        oneLine ? "max-w-full truncate" : "line-clamp-2",
        "font-medium leading-tight",
        node.icon != null && "min-w-0",
      )}
    >
      {node.label}
    </span>
  );
  if (node.icon == null) return label;
  return (
    <span className="flex min-w-0 max-w-full items-center gap-1.5">
      <span data-graph-node-icon="" className="flex shrink-0 text-base leading-none">
        {node.icon}
      </span>
      {label}
    </span>
  );
}

function NodeBody({
  node,
  oneLine,
  compact,
  row,
  selected,
  onSelect,
}: {
  node: GraphDiagramNode;
  /** The node is too short for two label lines. */
  oneLine: boolean;
  /** Its icon and label on one short line, left-aligned, without its detail or badge. */
  compact: boolean;
  row: boolean;
  selected: boolean;
  onSelect: (() => void) | undefined;
}) {
  const tone = node.tone ?? "neutral";
  return (
    <div
      className={cn(
        "flex h-full w-full text-xs",
        row ? "border-t border-border/60 hover:bg-accent" : "border shadow-sm",
        compact
          ? "items-center px-2 text-left text-[11px]"
          : "flex-col items-center justify-center gap-0.5 px-3 py-1.5 text-center",
        !row && (node.shape === "pill" ? "rounded-full" : compact ? "rounded-md" : "rounded-lg"),
        row ? (tone === "info" ? "bg-sky-500/10 text-foreground" : "text-foreground") : TONE_NODE_CLASS[tone],
        node.muted && (row ? "text-muted-foreground" : "border-dashed text-muted-foreground shadow-none"),
        !row && node.muted && tone === "neutral" && "bg-muted",
        selected && (row ? "bg-primary/10 ring-2 ring-inset ring-primary" : "ring-2 ring-primary ring-offset-2 ring-offset-background"),
        onSelect && "cursor-pointer",
      )}
      {...(onSelect
        ? {
            role: "button" as const,
            tabIndex: 0,
            "aria-pressed": selected,
            onClick: onSelect,
            onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => activateOnKey(event, onSelect),
          }
        : {})}
      aria-label={node.ariaLabel}
      title={node.title}
    >
      <NodeLabel node={node} oneLine={oneLine || compact} />
      {row && node.aside != null && <span className="ml-auto min-w-0 truncate pl-2 font-mono text-[10px] text-muted-foreground">{node.aside}</span>}
      {node.mark != null && (
        // Kept out of the node's accessible name, which stays the node's own; the mark is its tooltip.
        <span data-graph-node-mark="" aria-hidden className={cn("flex shrink-0 items-center", compact ? (row && node.aside != null ? "pl-1" : "ml-auto pl-1") : "absolute right-1 top-1")}>
          {node.mark}
        </span>
      )}
      {!compact && node.detail != null && (
        <span className="line-clamp-1 text-[10px] leading-tight text-muted-foreground">{node.detail}</span>
      )}
      {!compact && node.badge != null && <span className="mt-0.5">{node.badge}</span>}
    </div>
  );
}

export function GraphDiagramNodes({
  nodes,
  positions,
  windowOf,
  place,
  nodeWidth,
  nodeHeight,
  nodeHeights,
  recordNodes,
  selectedId,
  onNodeSelect,
  onNodeExpand,
  onNodeHover,
}: GraphDiagramNodesProps) {
  return (
    <>
      {nodes.map((node) => {
        const height = nodeHeights[node.id] ?? nodeHeight;
        const compact = node.id in nodeHeights;
        const windowBox = windowOf.get(node.id);
        return (
          <div
            key={node.id}
            data-graph-node={node.id}
            data-graph-node-size={compact ? "compact" : "regular"}
            {...(windowBox !== undefined ? { "data-graph-window": windowBox } : {})}
            className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
            style={{ ...place(requireEntry(positions, node.id, "layout position")), width: nodeWidth, height }}
            {...(onNodeHover ? hoverHandlers(node.id, onNodeHover) : {})}
          >
            <NodeBody
              node={node}
              oneLine={height < TWO_LINE_HEIGHT}
              compact={compact}
              row={recordNodes.has(node.id)}
              selected={selectedId != null && node.id === selectedId}
              onSelect={onNodeSelect ? () => onNodeSelect(node.id) : undefined}
            />
            {node.expandCount != null && node.expandCount > 0 && (
              <ExpandControl node={node} onExpand={onNodeExpand ? () => onNodeExpand(node.id) : undefined} />
            )}
          </div>
        );
      })}
    </>
  );
}
