import type { ReactNode } from "react";
import { Tree } from "./Tree";

// ObjectGraph renders a generic, type-agnostic expandable object/value
// inspector — a bean's fields, a map's entries, a list's elements, a scalar
// leaf. It is the shared home for what used to be per-feature object viewers
// (e.g. an OGNL inspector): any producer maps its data into ObjectGraphNode and
// gets the same tree, search, and lazy-expansion behaviour.

export type ObjectGraphNode = {
  /** Stable unique key within the tree. */
  id: string;
  /** Display label (field name, map key, index, …). */
  label: string;
  /** Optional type annotation rendered as `@type`. */
  type?: string;
  /** Scalar value for a leaf; absent for containers. */
  value?: string | number | boolean | null;
  /** Free-form node kind hint (object|map|list|scalar|…). */
  kind?: string;
  /** Accessor path from the root (used by lazy expansion). */
  path?: string;
  /** Verbatim preview for an opaque node with no structured children. */
  raw?: string;
  /** Node can be expanded via loadChildren even with no inline children. */
  expandable?: boolean;
  /** Caller-opaque context (carried through, not rendered by default). */
  metadata?: Record<string, unknown>;
  children?: ObjectGraphNode[];
};

export type ObjectGraphProps<T extends ObjectGraphNode = ObjectGraphNode> = {
  roots: T[];
  className?: string;
  empty?: ReactNode;
  showControls?: boolean;
  /** Open nodes shallower than this depth on first render (default 2). */
  defaultOpenDepth?: number;
  /** Override the row label rendering. */
  renderLabel?: (node: T) => ReactNode;
  /**
   * Lazily fetch a node's children the first time an `expandable` node opens.
   * When omitted, only inline `children` are shown.
   */
  loadChildren?: (node: T) => Promise<T[]>;
};

export function ObjectGraph<T extends ObjectGraphNode = ObjectGraphNode>({
  roots,
  className,
  empty,
  showControls,
  defaultOpenDepth = 2,
  renderLabel,
  loadChildren,
}: ObjectGraphProps<T>) {
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
      renderRow={({ node, loading, error }) => (
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 font-mono text-xs">
          {renderLabel ? renderLabel(node) : <DefaultObjectLabel node={node} />}
          {loading && <span className="shrink-0 text-muted-foreground">…</span>}
          {error != null && (
            <span className="break-all text-red-600">
              {error instanceof Error ? error.message : String(error)}
            </span>
          )}
        </div>
      )}
    />
  );
}

function DefaultObjectLabel({ node }: { node: ObjectGraphNode }) {
  return (
    <>
      <span className="text-muted-foreground">{node.label}</span>
      {node.type && <span className="text-muted-foreground/60">@{node.type}</span>}
      {node.value != null ? (
        <span className="break-all text-foreground">{String(node.value)}</span>
      ) : node.raw && !node.children ? (
        <span className="break-all italic text-muted-foreground/70">{node.raw}</span>
      ) : null}
    </>
  );
}
