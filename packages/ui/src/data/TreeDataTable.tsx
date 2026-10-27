import { useTreeRows, type TreeExpansionProps, type TreeRow, type TreeRowsAccessors } from "../lib/tree-rows";
import { DataTable, type DataTableColumn, type DataTableProps } from "./DataTable";
import { TreeRowLead } from "./MatrixTreeTable";

export type TreeDataTableProps<T extends Record<string, unknown>> = Omit<
  DataTableProps<T>,
  "data" | "columns" | "getRowId" | "grouping" | "groupingModes" | "groupingMode" | "defaultGroupingMode" | "onGroupingModeChange" | "defaultSort" | "sort" | "onSortChange"
> &
  TreeRowsAccessors<T> &
  TreeExpansionProps<T> & {
    roots: T[];
    columns: DataTableColumn<T>[];
    /** Key of the column that carries the indent and the expand/collapse chevron. */
    treeColumn: string;
    /** Names a parent node in its expand/collapse button. */
    getAriaLabel: (node: T) => string;
  };

/**
 * A DataTable whose rows form a tree. Parent and leaf nodes share the columns;
 * the tree column indents each row by depth and gives parents a chevron. Tree
 * order is the row order, so sorting and grouping are not offered.
 */
export function TreeDataTable<T extends Record<string, unknown>>({
  roots,
  getChildren,
  getKey,
  getAriaLabel,
  treeColumn,
  columns,
  expanded,
  onExpandedChange,
  defaultExpanded,
  ...table
}: TreeDataTableProps<T>) {
  if (!columns.some((column) => column.key === treeColumn)) {
    throw new Error(`TreeDataTable treeColumn "${treeColumn}" is not one of its columns`);
  }
  const { rows, toggle } = useTreeRows(roots, { getChildren, getKey }, {
    ...(expanded !== undefined ? { expanded } : {}),
    ...(onExpandedChange ? { onExpandedChange } : {}),
    ...(defaultExpanded !== undefined ? { defaultExpanded } : {}),
  });
  const byNode = new Map<T, TreeRow<T>>(rows.map((row) => [row.node, row]));
  const treeColumns = columns.map((column): DataTableColumn<T> => {
    const { sortable: _sortable, ...rest } = column;
    if (column.key !== treeColumn) return rest;
    return {
      ...rest,
      render: (value, node) => {
        const row = byNode.get(node)!;
        const content = column.render ? column.render(value, node) : String(value ?? "");
        return row.hasChildren
          ? <TreeRowLead depth={row.depth} open={row.open} label={getAriaLabel(node)} onToggle={() => toggle(row)}>{content}</TreeRowLead>
          : <TreeRowLead depth={row.depth}>{content}</TreeRowLead>;
      },
    };
  });
  return <DataTable<T> {...table} columns={treeColumns} data={rows.map((row) => row.node)} getRowId={(node) => byNode.get(node)!.key} />;
}
