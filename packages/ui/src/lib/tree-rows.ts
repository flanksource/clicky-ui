import { useState } from "react";

export type TreeRowsAccessors<T> = {
  getChildren: (node: T) => T[] | undefined;
  getKey: (node: T) => string;
};

export type TreeRow<T> = {
  node: T;
  key: string;
  depth: number;
  hasChildren: boolean;
  open: boolean;
};

/**
 * Expansion overrides keyed by node key. A key that is absent falls back to
 * `defaultExpanded`, so nodes that appear later (a new page, a new filter)
 * still get the default.
 */
export type TreeExpansion = Record<string, boolean>;

export type TreeExpansionProps<T> = {
  /** Controlled expansion overrides. Requires `onExpandedChange`. */
  expanded?: TreeExpansion;
  onExpandedChange?: (next: TreeExpansion) => void;
  /** Whether a node without an override starts open. Defaults to false. */
  defaultExpanded?: boolean | ((node: T, depth: number) => boolean);
};

/** Depth-first rows of every node whose ancestors are all open. */
export function visibleTreeRows<T>(
  roots: T[],
  { getChildren, getKey }: TreeRowsAccessors<T>,
  isOpen: (node: T, key: string, depth: number) => boolean,
): TreeRow<T>[] {
  const rows: TreeRow<T>[] = [];
  const walk = (nodes: T[], depth: number) => {
    for (const node of nodes) {
      const key = getKey(node);
      const children = getChildren(node) ?? [];
      const hasChildren = children.length > 0;
      const open = hasChildren && isOpen(node, key, depth);
      rows.push({ node, key, depth, hasChildren, open });
      if (open) walk(children, depth + 1);
    }
  };
  walk(roots, 0);
  return rows;
}

/** Keys of every node that has children, e.g. to expand or collapse them all. */
export function collectTreeKeys<T>(roots: T[], { getChildren, getKey }: TreeRowsAccessors<T>): string[] {
  return roots.flatMap((node) => {
    const children = getChildren(node) ?? [];
    return children.length ? [getKey(node), ...collectTreeKeys(children, { getChildren, getKey })] : [];
  });
}

/** Sets every parent node in `roots` to `open`. */
export function expandAllTree<T>(roots: T[], accessors: TreeRowsAccessors<T>, open: boolean): TreeExpansion {
  return Object.fromEntries(collectTreeKeys(roots, accessors).map((key) => [key, open]));
}

/** Visible rows plus a toggle, over controlled or internal expansion state. */
export function useTreeRows<T>(
  roots: T[],
  accessors: TreeRowsAccessors<T>,
  { expanded, onExpandedChange, defaultExpanded = false }: TreeExpansionProps<T>,
) {
  if (expanded !== undefined && !onExpandedChange) {
    throw new Error("Controlled tree expansion requires onExpandedChange");
  }
  const [local, setLocal] = useState<TreeExpansion>({});
  const state = expanded ?? local;
  const rows = visibleTreeRows(roots, accessors, (node, key, depth) =>
    state[key] ?? (typeof defaultExpanded === "function" ? defaultExpanded(node, depth) : defaultExpanded),
  );
  const toggle = (row: TreeRow<T>) => {
    const next = { ...state, [row.key]: !row.open };
    if (expanded === undefined) setLocal(next);
    onExpandedChange?.(next);
  };
  return { rows, toggle };
}
