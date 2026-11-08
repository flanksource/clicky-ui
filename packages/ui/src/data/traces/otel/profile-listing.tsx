import { ClickyNodeRenderer, type ClickyNode } from "../../Clicky";
import type { DataTableColumn } from "../../DataTable";
import type { SortState } from "../../../hooks/use-sort";

const presentedCell = (row: Record<string, unknown>, name: string) =>
  (row._presentation as Record<string, ClickyNode>)[name];

/**
 * The listing's table sort bound to the server's: a header click becomes the
 * column's `sortKey`, and the server's current sort marks its column. The rows
 * arrive in that order, so the table must not re-sort them itself.
 */
export function profileListingSort(
  table: ClickyNode,
  server: { value: SortState | null; onChange: (sort: SortState | null) => void },
): { sort: SortState | null; onSortChange: (sort: SortState | null) => void; manualSort: true } {
  const columns = table.columns ?? [];
  const byName = (name: string) => {
    const column = columns.find((candidate) => candidate.name === name);
    if (!column?.sortKey) throw new Error(`Trace listing column ${name} does not declare a server sort key`);
    return column;
  };
  let sort: SortState | null = null;
  if (server.value) {
    const column = columns.find((candidate) => candidate.sortKey === server.value!.key);
    if (!column) throw new Error(`Server sort key ${server.value.key} does not match a trace listing column`);
    sort = { key: column.name, dir: server.value.dir };
  }
  return {
    sort,
    onSortChange: (next) => server.onChange(next ? { key: byName(next.key).sortKey!, dir: next.dir } : null),
    manualSort: true,
  };
}

export function profileTraceListing(
  rows: Record<string, unknown>[],
  table: ClickyNode,
) {
  if (
    table.kind !== "table" ||
    !table.columns ||
    table.rows?.length !== rows.length
  )
    throw new Error(
      "Trace listing requires a rendered table matching the span rows",
    );
  const presented = rows.map((row, index) => ({
    ...row,
    _presentation: table.rows![index]!.cells,
  }));
  const columns: DataTableColumn<Record<string, unknown>>[] = table.columns
    .filter((column) => !column.defaultHidden)
    .map((column) => ({
      key: column.name,
      label: column.header ? (
        <ClickyNodeRenderer node={column.header} />
      ) : (
        (column.label ?? column.name)
      ),
      render: (_value, row) => {
        const cell = presentedCell(row, column.name);
        return cell ? <ClickyNodeRenderer node={cell} /> : null;
      },
      sortable: Boolean(column.sortKey),
      ...(column.filterable !== undefined ? { filterable: column.filterable } : {}),
      // The server-filter key is what gives a cell its include/exclude hover
      // actions; the value is the one the server matches, not the display text.
      ...(column.filterKey
        ? {
            filterKey: column.filterKey,
            serverFilterValue: (value: unknown, row: Record<string, unknown>) =>
              presentedCell(row, column.name)?.filterValue ?? value,
          }
        : {}),
    }));
  return { rows: presented, columns };
}
