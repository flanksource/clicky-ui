import type { ReactNode } from "react";
import { UiChevronDown, UiChevronRight } from "../icons";
import { cn } from "../lib/utils";
import { useTreeRows, type TreeExpansionProps, type TreeRowsAccessors } from "../lib/tree-rows";
import { MatrixTable, type MatrixTableGroupRow, type MatrixTableProps, type MatrixTableRow } from "./MatrixTable";

export type TreeLabelContext = { depth: number; open: boolean; hasChildren: boolean };

export type MatrixTreeTableProps<T> = Omit<MatrixTableProps, "rows"> &
  TreeRowsAccessors<T> &
  TreeExpansionProps<T> & {
    roots: T[];
    renderLabel: (node: T, context: TreeLabelContext) => ReactNode;
    /** Names a parent node in its expand/collapse button. */
    getAriaLabel: (node: T) => string;
    /** Cells of a leaf row, one per column. Parent nodes render as group bands. */
    getCells: (node: T) => ReactNode[];
    getGroupClassName?: (node: T, depth: number) => string | undefined;
  };

/** The chevron that opens or closes a tree row; `label` names the row for assistive tech. */
export function TreeRowToggle({ open, label, onToggle }: { open: boolean; label: string; onToggle: () => void }) {
  const Icon = open ? UiChevronDown : UiChevronRight;
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={`${open ? "Collapse" : "Expand"} ${label}`}
      className="inline-flex size-4 shrink-0 items-center justify-center rounded text-muted-foreground hover:text-foreground"
      onClick={(event) => { event.stopPropagation(); onToggle(); }}
    >
      <Icon className="size-3.5" />
    </button>
  );
}

// One tree level: the chevron (1rem) plus its gap (0.25rem), so a child's text
// starts one step right of its parent's text.
const TREE_STEP_REM = 1.25;

/**
 * The indent and chevron that lead a tree row's label. Parents get a toggle
 * (`onToggle` + `label`); leaves get a chevron-sized spacer so they line up.
 */
export function TreeRowLead({ depth, open = false, label, onToggle, children }: { depth: number; open?: boolean; label?: string; onToggle?: () => void; children: ReactNode }) {
  if (onToggle && label === undefined) throw new Error("TreeRowLead needs a label to name its toggle");
  return (
    <span data-tree-depth={depth} className="inline-flex min-w-0 items-center gap-1" style={{ paddingLeft: `${depth * TREE_STEP_REM}rem` }}>
      {onToggle ? <TreeRowToggle open={open} label={label!} onToggle={onToggle} /> : <span aria-hidden className="size-4 shrink-0" />}
      {children}
    </span>
  );
}

/**
 * A MatrixTable whose rows form a tree: parent nodes are collapsible group
 * bands that span every column, leaves are data rows, both indented by depth.
 */
export function MatrixTreeTable<T>({
  roots,
  getChildren,
  getKey,
  renderLabel,
  getAriaLabel,
  getCells,
  getGroupClassName,
  expanded,
  onExpandedChange,
  defaultExpanded,
  ...table
}: MatrixTreeTableProps<T>) {
  const { rows, toggle } = useTreeRows(roots, { getChildren, getKey }, {
    ...(expanded !== undefined ? { expanded } : {}),
    ...(onExpandedChange ? { onExpandedChange } : {}),
    ...(defaultExpanded !== undefined ? { defaultExpanded } : {}),
  });
  const matrixRows = rows.map((row): MatrixTableRow | MatrixTableGroupRow => {
    const label = renderLabel(row.node, { depth: row.depth, open: row.open, hasChildren: row.hasChildren });
    if (!row.hasChildren) return { key: row.key, label: <TreeRowLead depth={row.depth}>{label}</TreeRowLead>, cells: getCells(row.node) };
    // MatrixTable's depth would indent a second time, so nested bands get its softer style here.
    const className = cn(row.depth > 0 && "bg-muted/30 font-medium", getGroupClassName?.(row.node, row.depth));
    return {
      type: "group",
      key: row.key,
      ...(className ? { className } : {}),
      label: <TreeRowLead depth={row.depth} open={row.open} label={getAriaLabel(row.node)} onToggle={() => toggle(row)}>{label}</TreeRowLead>,
    };
  });
  return <MatrixTable {...table} rows={matrixRows} />;
}
