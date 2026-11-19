import type { DataTableColumn } from "./DataTable";

/**
 * How a DataTable lays its rows out.
 * - "table" (default): the column grid.
 * - "list": one block per row — a title line with the row's status, then a
 *   meta line of the remaining columns — for a container too narrow for a grid.
 * - "auto": the list below `listBreakpoint` pixels of container width, the
 *   table at or above it.
 */
export type DataTableLayout = "table" | "list" | "auto";

/**
 * Where a column lands in the list layout.
 * - "title": line one, the row's name. Defaults to the first column.
 * - "status": end of line one; render it as an icon (see `listRender`).
 *   Defaults to the first `kind: "status"` column.
 * - "meta": one item of line two. The default for every other column.
 * - "hidden": left out of the list; still in the table, filters and sort.
 */
export type DataTableListRole = "title" | "status" | "meta" | "hidden";

export type DataTableListRoles<T extends Record<string, unknown>> = {
  title: DataTableColumn<T>;
  status: DataTableColumn<T> | undefined;
  meta: DataTableColumn<T>[];
};

function single<T extends Record<string, unknown>>(
  columns: DataTableColumn<T>[],
  role: DataTableListRole,
): DataTableColumn<T> | undefined {
  const declared = columns.filter((column) => column.listRole === role);
  if (declared.length > 1) {
    throw new Error(
      `DataTable list layout: columns ${declared.map((column) => `"${column.key}"`).join(", ")} all declare listRole "${role}"; only one may`,
    );
  }
  return declared[0];
}

/**
 * Resolves each visible column's list role. A declared title the reader hid
 * from the column menu falls back to the first undeclared column, then the
 * first meta column, so a column preference never leaves a row nameless.
 */
export function resolveListRoles<T extends Record<string, unknown>>(
  columns: DataTableColumn<T>[],
): DataTableListRoles<T> {
  const title =
    single(columns, "title") ??
    columns.find((column) => column.listRole === undefined) ??
    columns.find((column) => column.listRole === "meta");
  if (!title) {
    throw new Error(
      `DataTable list layout needs a title column; visible columns ${columns.map((column) => `"${column.key}"`).join(", ")} are all status or hidden`,
    );
  }
  const status =
    single(columns, "status") ??
    columns.find((column) => column !== title && column.listRole === undefined && column.kind === "status");
  const meta = columns.filter(
    (column) =>
      column !== title &&
      column !== status &&
      (column.listRole === "meta" || column.listRole === undefined),
  );
  return { title, status, meta };
}
