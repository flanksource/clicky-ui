import { ClickyNodeRenderer, type ClickyNode } from "../../Clicky";
import type { DataTableColumn } from "../../DataTable";

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
        const cells = row._presentation as Record<string, ClickyNode>;
        const cell = cells[column.name];
        return cell ? <ClickyNodeRenderer node={cell} /> : null;
      },
    }));
  return { rows: presented, columns };
}
