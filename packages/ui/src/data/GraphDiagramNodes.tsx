import type { KeyboardEvent } from "react";
import { cn } from "../lib/utils";
import type { GraphLayoutPosition } from "./graph-layout";
import type { GraphLayoutGroupBox } from "./graph-columns-layout";
import {
  activateOnKey,
  hoverHandlers,
  nodeName,
  requireEntry,
  TONE_NODE_CLASS,
  type GraphDiagramGroup,
  type GraphDiagramNode,
  type GraphPlacer,
} from "./graph-diagram-model";

export interface GraphDiagramNodesProps {
  nodes: GraphDiagramNode[];
  positions: Record<string, GraphLayoutPosition>;
  place: GraphPlacer;
  nodeWidth: number;
  nodeHeight: number;
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
    <span className="flex max-w-full items-center gap-1.5">
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
  selected,
  onSelect,
}: {
  node: GraphDiagramNode;
  /** The node is too short for two label lines. */
  oneLine: boolean;
  selected: boolean;
  onSelect: (() => void) | undefined;
}) {
  const tone = node.tone ?? "neutral";
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-0.5 border px-3 py-1.5 text-center text-xs shadow-sm",
        node.shape === "pill" ? "rounded-full" : "rounded-lg",
        TONE_NODE_CLASS[tone],
        node.muted && "border-dashed text-muted-foreground shadow-none",
        node.muted && tone === "neutral" && "bg-muted",
        selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
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
      <NodeLabel node={node} oneLine={oneLine} />
      {node.detail != null && (
        <span className="line-clamp-1 text-[10px] leading-tight text-muted-foreground">{node.detail}</span>
      )}
      {node.badge != null && <span className="mt-0.5">{node.badge}</span>}
    </div>
  );
}

export function GraphDiagramNodes({
  nodes,
  positions,
  place,
  nodeWidth,
  nodeHeight,
  selectedId,
  onNodeSelect,
  onNodeExpand,
  onNodeHover,
}: GraphDiagramNodesProps) {
  return (
    <>
      {nodes.map((node) => (
        <div
          key={node.id}
          data-graph-node={node.id}
          className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2"
          style={{ ...place(requireEntry(positions, node.id, "layout position")), width: nodeWidth, height: nodeHeight }}
          {...(onNodeHover ? hoverHandlers(node.id, onNodeHover) : {})}
        >
          <NodeBody
            node={node}
            oneLine={nodeHeight < TWO_LINE_HEIGHT}
            selected={selectedId != null && node.id === selectedId}
            onSelect={onNodeSelect ? () => onNodeSelect(node.id) : undefined}
          />
          {node.expandCount != null && node.expandCount > 0 && (
            <ExpandControl node={node} onExpand={onNodeExpand ? () => onNodeExpand(node.id) : undefined} />
          )}
        </div>
      ))}
    </>
  );
}

export interface GraphDiagramGroupBoxesProps {
  boxes: GraphLayoutGroupBox[];
  groups: GraphDiagramGroup[] | undefined;
}

/** Group rectangles, drawn behind the edges and nodes, each captioned on its top border. */
export function GraphDiagramGroupBoxes({ boxes, groups }: GraphDiagramGroupBoxesProps) {
  const captions = new Map(groups?.map((group) => [group.id, group]));
  return (
    <>
      {boxes.map((box) => {
        const caption = captions.get(box.group);
        return (
          <div
            key={box.id}
            data-graph-group={box.id}
            className="absolute rounded-xl border border-dashed border-border bg-muted/30"
            style={{ left: box.x, top: box.y, width: box.width, height: box.height }}
          >
            <span
              title={caption?.title}
              className="absolute left-2 top-0 max-w-[calc(100%-1rem)] -translate-y-1/2 truncate rounded border border-border bg-background px-1.5 text-[10px] font-medium leading-4 text-muted-foreground"
            >
              {caption ? caption.label : box.group}
            </span>
          </div>
        );
      })}
    </>
  );
}
