import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";
import { UiChevronDown, UiChevronRight } from "../icons";

export type TreeRowContext<T> = {
  node: T;
  depth: number;
  open: boolean;
  selected: boolean;
  hasChildren: boolean;
  toggle: () => void;
  /** True while this node's lazy children are being fetched via loadChildren. */
  loading: boolean;
  /** The rejection value from loadChildren, or null when there was no error. */
  error: unknown;
};

export type TreeNodeProps<T> = {
  node: T;
  depth?: number;
  expandAll?: boolean | null;
  forcedOpenKeys?: Set<string | number> | null;
  selected?: T | null;
  defaultOpen?: (node: T, depth: number) => boolean;
  getChildren: (node: T) => T[] | undefined;
  getKey: (node: T) => string | number;
  onSelect?: (node: T) => void;
  renderRow: (ctx: TreeRowContext<T>) => ReactNode;
  rowClass?: (node: T, selected: boolean) => string;
  indentPx?: number;
  basePaddingPx?: number;
  /**
   * Reports that a node has children that are not yet loaded — it renders an
   * expand chevron even when `getChildren` returns nothing. On the first open
   * the node fetches them via `loadChildren`. Without this (the default), a
   * node is expandable only when `getChildren` already returns children.
   */
  hasMoreChildren?: (node: T) => boolean;
  /**
   * Lazily fetch a node's children the first time it is opened. Resolves to the
   * child nodes (which may themselves be lazy). A rejection is surfaced to
   * `renderRow` via `ctx.error` and is not retried until the node is collapsed
   * and reopened. Required for any node `hasMoreChildren` returns true for.
   */
  loadChildren?: (node: T) => Promise<T[]>;
  /**
   * Marks a node as a **secondary child** of its parent. Secondary
   * children keep the full tree structure (they render, they can be
   * opened manually) but opt out of the bulk behaviours a caller
   * typically wants when they click the toolbar:
   *
   *  - Tree-wide filter: their text is skipped during match detection
   *    so typing in the search box never surfaces a row because one
   *    of its secondary children happened to match.
   *  - Expand all: secondary nodes stay at their default-open state
   *    instead of being forced open, preventing 28k field rows from
   *    flooding the viewport when an operator hits the button on a
   *    schema with hundreds of tables.
   *
   * Default: every node is primary (returns false).
   */
  isSecondary?: (node: T) => boolean;
};

export function TreeNode<T>({
  node,
  depth = 0,
  expandAll = null,
  forcedOpenKeys = null,
  selected = null,
  defaultOpen,
  getChildren,
  getKey,
  onSelect,
  renderRow,
  rowClass,
  indentPx = 16,
  basePaddingPx = 8,
  isSecondary,
  hasMoreChildren,
  loadChildren,
}: TreeNodeProps<T>) {
  // Lazily-fetched children take precedence over the synchronous ones once a
  // load has resolved; until then `loadedChildren` is null and we fall back to
  // getChildren. A node can be "lazy" (hasMoreChildren) with no sync children.
  const [loadedChildren, setLoadedChildren] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const syncChildren = getChildren(node);
  const children = loadedChildren ?? syncChildren;
  const hasChildren = (children?.length ?? 0) > 0;
  const lazyUnloaded = (hasMoreChildren?.(node) ?? false) && loadedChildren === null;
  // The chevron shows when there is something to reveal: either real children
  // are present, or the node is lazy and has not been loaded yet.
  const expandable = hasChildren || lazyUnloaded;
  const initialOpen = defaultOpen ? defaultOpen(node, depth) : depth < 1;
  const [open, setOpen] = useState(initialOpen);
  const prevExpandAll = useRef(expandAll);
  const isSelected = selected === node;
  const key = getKey(node);
  const isForcedOpen = forcedOpenKeys?.has(key) ?? false;
  const isOpen = isForcedOpen || open;
  // A node opts out of bulk expand-all in two distinct cases:
  //
  //  1. The node itself is secondary (its edge from the parent is
  //     secondary) — rare at the root, but the rule is symmetric.
  //  2. All of the node's children are secondary — the common case.
  //     This is what keeps an "Expand all" on a schema tree from
  //     flooding the viewport with every table's field rows: the
  //     table opens to nothing structural worth seeing in bulk, so
  //     we leave it closed until the operator clicks it manually.
  //
  // In both cases the manual toggle still works, and filter matches
  // still force the row open via forcedOpenKeys, so users never
  // lose access — they just don't get auto-flooded.
  const secondaryNode = isSecondary?.(node) ?? false;
  const childrenAllSecondary =
    hasChildren && isSecondary != null && children!.every((c) => isSecondary(c));
  const skipExpandAll = secondaryNode || childrenAllSecondary;

  useEffect(() => {
    if (expandAll !== null && expandAll !== prevExpandAll.current && !skipExpandAll) {
      setOpen(expandAll);
    }
    prevExpandAll.current = expandAll;
  }, [expandAll, skipExpandAll]);

  // Guards a lazy fetch so a node loads its children at most once per mount and
  // a resolution arriving after the node was reused (key changed) is ignored.
  const loadRequested = useRef(false);
  const nodeKey = getKey(node);
  const loadKeyRef = useRef(nodeKey);

  function loadLazyChildren() {
    if (!loadChildren || loadRequested.current) return;
    loadRequested.current = true;
    loadKeyRef.current = nodeKey;
    setLoading(true);
    setError(null);
    loadChildren(node)
      .then((kids) => {
        if (loadKeyRef.current !== nodeKey) return;
        setLoadedChildren(kids);
        setLoading(false);
      })
      .catch((err) => {
        if (loadKeyRef.current !== nodeKey) return;
        // Surfaced to renderRow via ctx.error; allow a retry on re-toggle.
        loadRequested.current = false;
        setError(err);
        setLoading(false);
      });
  }

  function toggle() {
    if (!expandable) return;
    setOpen((o) => {
      const next = !o;
      // Only fetch when transitioning into the open state, so collapsing a
      // not-yet-loaded (e.g. previously-failed) lazy node never triggers a load.
      if (next && lazyUnloaded) loadLazyChildren();
      return next;
    });
  }

  const defaultRowBg = isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent";
  const rowClassName = rowClass ? rowClass(node, isSelected) : defaultRowBg;

  return (
    <div
      role="treeitem"
      aria-expanded={expandable ? isOpen : undefined}
      aria-selected={isSelected}
    >
      <div
        className={cn("flex items-center gap-1.5 py-1 px-2 cursor-pointer text-sm", rowClassName)}
        style={{ paddingLeft: `${depth * indentPx + basePaddingPx}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(node);
          toggle();
        }}
      >
        {expandable ? (
          <Icon
            icon={isOpen ? UiChevronDown : UiChevronRight}
            className="text-muted-foreground text-xs w-3"
          />
        ) : (
          <span className="w-3 shrink-0" aria-hidden />
        )}
        {renderRow({
          node,
          depth,
          open: isOpen,
          selected: isSelected,
          hasChildren,
          toggle,
          loading,
          error,
        })}
      </div>
      {isOpen && hasChildren && (
        <div role="group">
          {children!.map((child) => (
            <TreeNode
              key={getKey(child)}
              node={child}
              depth={depth + 1}
              expandAll={expandAll}
              forcedOpenKeys={forcedOpenKeys}
              selected={selected}
              getChildren={getChildren}
              getKey={getKey}
              renderRow={renderRow}
              indentPx={indentPx}
              basePaddingPx={basePaddingPx}
              {...(defaultOpen ? { defaultOpen } : {})}
              {...(onSelect ? { onSelect } : {})}
              {...(rowClass ? { rowClass } : {})}
              {...(isSecondary ? { isSecondary } : {})}
              {...(hasMoreChildren ? { hasMoreChildren } : {})}
              {...(loadChildren ? { loadChildren } : {})}
            />
          ))}
        </div>
      )}
    </div>
  );
}
