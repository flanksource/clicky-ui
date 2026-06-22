import type { ReactNode } from "react";
import { Tree } from "./Tree";

// ExecutionTree renders a generic, type-agnostic call/execution tree — a method
// call tree, a span tree, an activity sequence — where each node carries a cost
// and a status and may nest. It is the shared home for what used to be
// per-feature call-tree renderers: any producer maps its data into
// ExecutionNode and gets the same tree, timing, and status rendering.

export type ExecutionNode = {
  /** Stable unique key within the tree. */
  id: string;
  /** Display label (method/operation/step name). */
  label: string;
  /** Free-form node kind hint. */
  kind?: string;
  /** Outcome: ok | error | warning | running | pending. */
  status?: string;
  /** Numeric cost in `unit`. */
  cost?: number;
  /** Cost unit (default "ms"). */
  unit?: string;
  /** Aggregated invocation count (renders ×N when > 1). */
  times?: number;
  /** Owning class / file, rendered as a muted suffix. */
  className?: string;
  lineNumber?: number;
  /** Extra key/values rendered as muted chips. */
  detail?: Record<string, string>;
  /** Node can be expanded via loadChildren even with no inline children. */
  expandable?: boolean;
  children?: ExecutionNode[];
};

export type ExecutionTreeProps<T extends ExecutionNode = ExecutionNode> = {
  roots: T[];
  className?: string;
  empty?: ReactNode;
  showControls?: boolean;
  /** Open nodes shallower than this depth on first render (default 1). */
  defaultOpenDepth?: number;
  /** Costs at or above this value render in red (slow-path highlight). */
  costThreshold?: number;
  /** Override the entire row rendering. */
  renderRow?: (node: T) => ReactNode;
  loadChildren?: (node: T) => Promise<T[]>;
};

export function ExecutionTree<T extends ExecutionNode = ExecutionNode>({
  roots,
  className,
  empty,
  showControls,
  defaultOpenDepth = 1,
  costThreshold,
  renderRow,
  loadChildren,
}: ExecutionTreeProps<T>) {
  return (
    <Tree<T>
      roots={roots}
      getKey={(n) => n.id}
      getChildren={(n) => n.children as T[] | undefined}
      defaultOpen={(_n, depth) => depth < defaultOpenDepth}
      {...(className !== undefined ? { className } : {})}
      {...(empty !== undefined ? { empty } : {})}
      {...(showControls !== undefined ? { showControls } : {})}
      {...(loadChildren ? { loadChildren, hasMoreChildren: (n: T) => n.expandable === true } : {})}
      renderRow={({ node }) =>
        renderRow ? renderRow(node) : <DefaultExecutionRow node={node} costThreshold={costThreshold} />
      }
    />
  );
}

function DefaultExecutionRow({ node, costThreshold }: { node: ExecutionNode; costThreshold: number | undefined }) {
  const slow = costThreshold != null && node.cost != null && node.cost >= costThreshold;
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 font-mono text-xs">
      {node.status && <StatusDot status={node.status} />}
      <span className="font-semibold text-foreground">{node.label}</span>
      {node.cost != null && (
        <span className={slow ? "text-red-600" : "text-muted-foreground"}>{formatCost(node)}</span>
      )}
      {node.times != null && node.times > 1 && (
        <span className="text-muted-foreground/60">×{node.times}</span>
      )}
      {node.className && (
        <span className="break-all text-muted-foreground/60">
          {node.className}
          {node.lineNumber != null && node.lineNumber > 0 ? `:${node.lineNumber}` : ""}
        </span>
      )}
      {node.detail &&
        Object.entries(node.detail).map(([k, v]) => (
          <span key={k} className="text-muted-foreground/60">
            {k}={v}
          </span>
        ))}
    </div>
  );
}

function formatCost(node: ExecutionNode): string {
  const unit = node.unit || "ms";
  const value = node.cost ?? 0;
  return unit === "ms" ? `${value.toFixed(3)}ms` : `${value} ${unit}`;
}

const STATUS_COLOR: Record<string, string> = {
  ok: "text-green-600",
  success: "text-green-600",
  error: "text-red-600",
  warning: "text-amber-500",
  running: "text-blue-600",
  pending: "text-muted-foreground",
};

function StatusDot({ status }: { status: string }) {
  return (
    <span className={`shrink-0 ${STATUS_COLOR[status] ?? "text-muted-foreground"}`} title={status}>
      ●
    </span>
  );
}
