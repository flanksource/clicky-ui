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
  selected?: T | null;
  defaultOpen?: (node: T, depth: number) => boolean;
  getChildren: (node: T) => T[] | undefined;
  getKey: (node: T) => string | number;
  onSelect?: (node: T) => void;
  renderRow: (ctx: TreeRowContext<T>) => ReactNode;
  rowClass?: (node: T, selected: boolean) => string;
  indentPx?: number;
  basePaddingPx?: number;
};

export function TreeNode<T>({
  node,
  depth = 0,
  expandAll = null,
  selected = null,
  defaultOpen,
  getChildren,
  getKey,
  onSelect,
  renderRow,
  rowClass,
  indentPx = 16,
  basePaddingPx = 8,
}: TreeNodeProps<T>) {
  const children = getChildren(node);
  const hasChildren = (children?.length ?? 0) > 0;
  const initialOpen = defaultOpen ? defaultOpen(node, depth) : depth < 1;
  const [open, setOpen] = useState(initialOpen);
  const prevExpandAll = useRef(expandAll);
  const isSelected = selected === node;

  useEffect(() => {
    if (expandAll !== null && expandAll !== prevExpandAll.current) {
      setOpen(expandAll);
    }
    prevExpandAll.current = expandAll;
  }, [expandAll]);

  function toggle() {
    if (hasChildren) setOpen((o) => !o);
  }

  const defaultRowBg = isSelected ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-accent";
  const rowClassName = rowClass ? rowClass(node, isSelected) : defaultRowBg;

  return (
    <div role="treeitem" aria-expanded={hasChildren ? open : undefined} aria-selected={isSelected}>
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
            name={open ? "codicon:chevron-down" : "codicon:chevron-right"}
            className="text-muted-foreground text-xs w-3"
          />
        ) : (
          <span className="w-3 shrink-0" aria-hidden />
        )}
        {renderRow({ node, depth, open, selected: isSelected, hasChildren, toggle })}
      </div>
      {open && hasChildren && (
        <div role="group">
          {children!.map((child) => (
            <TreeNode
              key={getKey(child)}
              node={child}
              depth={depth + 1}
              expandAll={expandAll}
              selected={selected}
              defaultOpen={defaultOpen}
              getChildren={getChildren}
              getKey={getKey}
              onSelect={onSelect}
              renderRow={renderRow}
              rowClass={rowClass}
              indentPx={indentPx}
              basePaddingPx={basePaddingPx}
            />
          ))}
        </div>
      )}
    </div>
  );
}
