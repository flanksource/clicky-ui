import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

export type TreeRowContext<T> = {
  node: T;
  depth: number;
  open: boolean;
  selected: boolean;
  hasChildren: boolean;
  toggle: () => void;
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
}: TreeNodeProps<T>) {
  const children = getChildren(node);
  const hasChildren = (children?.length ?? 0) > 0;
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

  function toggle() {
    if (hasChildren) setOpen((o) => !o);
  }

  const defaultRowBg = isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent";
  const rowClassName = rowClass ? rowClass(node, isSelected) : defaultRowBg;

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? isOpen : undefined}
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
        {hasChildren ? (
          <Icon
            name={isOpen ? "codicon:chevron-down" : "codicon:chevron-right"}
            className="text-muted-foreground text-xs w-3"
          />
        ) : (
          <span className="w-3 shrink-0" aria-hidden />
        )}
        {renderRow({ node, depth, open: isOpen, selected: isSelected, hasChildren, toggle })}
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
            />
          ))}
        </div>
      )}
    </div>
  );
}
