// The ObjectGraph node contract and the pure helpers that operate on it. Kept
// out of ObjectGraph.tsx so that file only exports components (fast refresh).

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

// isNullLeaf reports whether a node carries nothing worth showing. Producers
// that stringify their values (an OGNL dump renders a null field as the literal
// text `null`) are covered alongside a real JSON null.
function isNullLeaf(node: ObjectGraphNode): boolean {
  if (node.raw) return false;
  if (node.value == null) return true;
  if (typeof node.value !== "string") return false;
  const text = node.value.trim();
  return text === "" || text === "null";
}

/**
 * pruneNullNodes drops every leaf whose value is null (or the literal string
 * `"null"`, or blank) and every container left with no surviving children.
 *
 * An `expandable` node is never dropped — it may have children that have not
 * been fetched yet, so dropping it would hide the only real value — but the
 * children it already carries are still pruned. Producers mark a node both
 * expandable and inline-populated (an arthas watch frame is exactly that), so
 * bailing out on `expandable` alone would make the filter a no-op.
 */
export function pruneNullNodes<T extends ObjectGraphNode>(roots: T[]): T[] {
  return roots.flatMap((node) => {
    const children = node.children ? pruneNullNodes(node.children as T[]) : undefined;
    if (children && children.length > 0) return [{ ...node, children } as T];
    if (node.expandable) return [(children ? { ...node, children } : node) as T];
    // A container whose children all pruned away carries no information of its
    // own, so it goes too — this is also what drops empty `foo [0]` lists.
    if (node.children && node.children.length > 0) return [];
    return isNullLeaf(node) ? [] : [node];
  });
}

export function countObjectGraphNodes(roots: ObjectGraphNode[]): number {
  return roots.reduce((total, node) => total + 1 + countObjectGraphNodes(node.children ?? []), 0);
}
