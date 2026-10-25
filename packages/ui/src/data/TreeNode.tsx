import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";
import { UiChevronDown, UiChevronRight } from "../icons";

// A row's content column starts after the chevron (`w-3`, 12px) plus the row's
// `gap-1.5` (6px) — fixed regardless of indentPx/basePaddingPx, since the
// chevron/spacer width and gap are not configurable. renderDetail's wrapper
// adds this on top of the row's own paddingLeft so it lines up under the label.
const ROW_CONTENT_OFFSET_PX = 18;
export type TreeKey = string | number;

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
  revealPath?: Map<TreeKey, TreeKey | null> | null;
  revealOverrides?: Map<TreeKey, boolean> | null;
  onRevealToggle?: (key: TreeKey, open: boolean) => void;
  selected?: T | null;
  defaultOpen?: (node: T, depth: number) => boolean;
  /** Controlled expansion, shared between tree instances. Requires onExpandedChange. */
  getExpanded?: (node: T) => boolean;
  /** Receives user and bulk expansion changes for controlled trees. */
  onExpandedChange?: (node: T, expanded: boolean) => void;
  getChildren: (node: T) => T[] | undefined;
  getKey: (node: T) => string | number;
  getAriaLabel?: (node: T) => string;
  onSelect?: (node: T) => void;
  renderRow: (ctx: TreeRowContext<T>) => ReactNode;
  /**
   * Render extra content beneath a node's row and above its children (e.g. the
   * decompiled source line a call was made from). Rendered for leaf and parent
   * nodes alike, regardless of open/collapsed state, and left-aligned with the
   * row's content column (after the depth indent and chevron). Returning
   * `null`/`undefined`/`false` renders nothing — no wrapper, no extra spacing.
   * A click or keydown inside it is stopped from propagating, so it can never
   * toggle the row's expand/collapse state.
   */
  renderDetail?: (node: T) => ReactNode;
  /** Render a node's result after its children, including when the children are collapsed. */
  renderAfterChildren?: (node: T) => ReactNode;
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
  revealPath = null,
  revealOverrides = null,
  onRevealToggle,
  selected = null,
  defaultOpen,
  getExpanded,
  onExpandedChange,
  getChildren,
  getKey,
  getAriaLabel,
  onSelect,
  renderRow,
  renderDetail,
  renderAfterChildren,
  rowClass,
  indentPx = 16,
  basePaddingPx = 8,
  isSecondary,
  hasMoreChildren,
  loadChildren,
}: TreeNodeProps<T>) {
  if (getExpanded && !onExpandedChange) throw new Error("Controlled tree expansion requires onExpandedChange");
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
  // An unloaded lazy node never opens in bulk either: opening it would fetch,
  // and bulk operations never trigger loads. Collapse-all still closes it.
  const skipExpandAll = secondaryNode || childrenAllSecondary || (expandAll === true && lazyUnloaded);
  // A non-null `expandAll` is a live bulk state, not just a one-off change
  // signal: a node mounted *while* expand-all is active (because an ancestor
  // just opened) inherits it as its initial open state, so opening a parent
  // cascades all the way down — expand/collapse-all are recursive. The
  // skipExpandAll guard keeps secondary subtrees from auto-flooding. When
  // expandAll is null (before any toolbar click) we fall back to defaultOpen.
  const initialOpen =
    expandAll !== null && !skipExpandAll
      ? expandAll
      : defaultOpen
        ? defaultOpen(node, depth)
        : depth < 1;
  const [open, setOpen] = useState(initialOpen);
  const prevExpandAll = useRef(getExpanded ? null : expandAll);
  const key = getKey(node);
  const isSelected = selected != null && getKey(selected) === key;
  const isForcedOpen = forcedOpenKeys?.has(key) ?? false;
  // Only the selection's ancestors are on the reveal path; the selected node
  // itself (mapped to null) keeps its own expansion.
  const revealNextKey = revealPath?.get(key) ?? null;
  const isOnRevealPath = revealNextKey !== null;
  const revealOverride = revealOverrides?.get(key);
  const pathOnly = isOnRevealPath && revealOverride === undefined;
  const ownOpen = getExpanded ? getExpanded(node) : open;
  const isOpen = isForcedOpen || pathOnly || (revealOverride ?? ownOpen);

  useEffect(() => {
    if (expandAll !== null && expandAll !== prevExpandAll.current && !skipExpandAll) {
      if (getExpanded) onExpandedChange!(node, expandAll);
      else setOpen(expandAll);
    }
    prevExpandAll.current = expandAll;
  }, [expandAll, skipExpandAll, getExpanded, onExpandedChange, node]);

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

  // A lazy node can be open without ever having been clicked — defaultOpen said
  // so, expand-all did, or the filter forced it open to reveal a match. Loading
  // only on the open transition would leave every one of those showing a caret
  // over nothing.
  //
  // A node that already failed is skipped: loadLazyChildren clears its own retry
  // guard on failure so a re-toggle can try again, and re-running here would
  // turn that into an unbounded retry loop instead.
  useEffect(() => {
    if (isOpen && lazyUnloaded && error === null) loadLazyChildren();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lazyUnloaded, error]);

  function toggle() {
    if (!expandable) return;
    if (isOnRevealPath) {
      if (!onRevealToggle) throw new Error("A revealed tree path requires onRevealToggle");
      const next = pathOnly || !revealOverride;
      if (next && lazyUnloaded) loadLazyChildren();
      onRevealToggle(key, next);
      return;
    }
    const next = !ownOpen;
    if (next && lazyUnloaded) loadLazyChildren();
    if (getExpanded) onExpandedChange!(node, next);
    else setOpen(next);
  }

  const defaultRowBg = isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent";
  const rowClassName = rowClass ? rowClass(node, isSelected) : defaultRowBg;
  const detail = renderDetail?.(node);
  const afterChildren = renderAfterChildren?.(node);

  return (
    <div
      role="treeitem"
      aria-label={getAriaLabel?.(node)}
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
          <button
            type="button"
            aria-label={pathOnly ? "Show all children" : isOpen ? "Collapse" : "Expand"}
            // The caret only toggles expansion — stopPropagation keeps the row's
            // onClick (which selects) from firing, so expanding a node never
            // selects it.
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            className="flex shrink-0 items-center text-muted-foreground"
          >
            <Icon icon={isOpen && !pathOnly ? UiChevronDown : UiChevronRight} className="text-xs w-3" />
          </button>
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
      {detail != null && detail !== false && (
        <div
          className="pb-1 pr-2"
          style={{ paddingLeft: `${depth * indentPx + basePaddingPx + ROW_CONTENT_OFFSET_PX}px` }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {detail}
        </div>
      )}
      {isOpen && hasChildren && (
        <div role="group">
          {(pathOnly ? children!.filter((child) => getKey(child) === revealNextKey) : children!).map((child) => (
            <TreeNode
              key={getKey(child)}
              node={child}
              depth={depth + 1}
              expandAll={expandAll}
              forcedOpenKeys={forcedOpenKeys}
              revealPath={revealPath}
              revealOverrides={revealOverrides}
              {...(onRevealToggle ? { onRevealToggle } : {})}
              selected={selected}
              getChildren={getChildren}
              getKey={getKey}
              renderRow={renderRow}
              indentPx={indentPx}
              basePaddingPx={basePaddingPx}
              {...(defaultOpen ? { defaultOpen } : {})}
              {...(getExpanded ? { getExpanded } : {})}
              {...(onExpandedChange ? { onExpandedChange } : {})}
              {...(renderDetail ? { renderDetail } : {})}
              {...(renderAfterChildren ? { renderAfterChildren } : {})}
              {...(getAriaLabel ? { getAriaLabel } : {})}
              {...(onSelect ? { onSelect } : {})}
              {...(rowClass ? { rowClass } : {})}
              {...(isSecondary ? { isSecondary } : {})}
              {...(hasMoreChildren ? { hasMoreChildren } : {})}
              {...(loadChildren ? { loadChildren } : {})}
            />
          ))}
        </div>
      )}
      {afterChildren != null && afterChildren !== false && (
        <div
          className="pb-1 pr-2"
          style={{ paddingLeft: `${depth * indentPx + basePaddingPx + ROW_CONTENT_OFFSET_PX}px` }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
        >
          {afterChildren}
        </div>
      )}
    </div>
  );
}
