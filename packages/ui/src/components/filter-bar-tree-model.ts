import type { LabelIconSpec } from "../data/Icon";
import type { FilterBarMultiFilterMode } from "./filter-bar-field-utils";

export type FilterTreeNode = {
  /**
   * Selection key. For a path-shaped tree this is the joined path, and a key on
   * a folder stands for everything beneath it (see `matchesTreeSelection`).
   */
  key: string;
  label: string;
  /** Secondary line under the label; also searchable. */
  description?: string;
  children?: FilterTreeNode[];
};

export type FilterBarTreeFilter = {
  key: string;
  /** A hierarchical include/exclude picker; folders and leaves are both selectable. */
  kind: "tree";
  label: string;
  /** Leading glyph shown instead of the text label: a runtime icon name or a node. */
  icon?: LabelIconSpec;
  description?: string;
  /** Node key to include/exclude state. Same wire shape as the `multi` kind. */
  value: Record<string, FilterBarMultiFilterMode>;
  nodes: FilterTreeNode[];
  onChange: (value: Record<string, FilterBarMultiFilterMode>) => void;
  /** Ghost text shown after the label while nothing is selected. */
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};

function treeLabelIndex(nodes: FilterTreeNode[]): Map<string, string> {
  const labels = new Map<string, string>();
  const visit = (node: FilterTreeNode) => {
    labels.set(node.key, node.label);
    node.children?.forEach(visit);
  };
  nodes.forEach(visit);
  return labels;
}

// "Acme, −Billing": included labels first, then excluded ones behind a minus
// sign. A selected key missing from the tree shows as the raw key rather than
// disappearing, so a stale URL value stays visible and removable.
export function treeSelectionSummary(
  nodes: FilterTreeNode[],
  value: Record<string, FilterBarMultiFilterMode>,
): string {
  const labels = treeLabelIndex(nodes);
  const named = (mode: FilterBarMultiFilterMode) =>
    Object.keys(value)
      .filter((key) => value[key] === mode)
      .map((key) => labels.get(key) ?? key);
  return [...named("include"), ...named("exclude").map((label) => `−${label}`)].join(", ");
}

export function hasSelectedDescendant(
  node: FilterTreeNode,
  value: Record<string, FilterBarMultiFilterMode>,
): boolean {
  return (node.children ?? []).some(
    (child) => value[child.key] !== undefined || hasSelectedDescendant(child, value),
  );
}
