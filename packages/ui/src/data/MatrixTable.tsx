import { isValidElement, type CSSProperties, type ReactNode } from "react";
import { cn } from "../lib/utils";

export type MatrixTableRow = {
  type?: "row";
  key: string;
  label: ReactNode;
  cells: ReactNode[];
  /** Indents the row label by `depth` steps, e.g. under nested group rows. */
  depth?: number;
};

/**
 * A full-width band between data rows (e.g. product → plan grouping). Its
 * label spans every column and stays pinned to the left edge while the matrix
 * scrolls horizontally.
 */
export type MatrixTableGroupRow = {
  type: "group";
  key: string;
  label: ReactNode;
  /** 0 = outermost group (bold, stronger band); deeper groups indent and soften. */
  depth?: number;
  className?: string;
};

/**
 * A column with per-column styling. `headerClassName`/`headerStyle` land on
 * the column's `<th>`, `cellClassName`/`cellStyle` on each of its body `<td>`s
 * (e.g. a column tint or an accent bar).
 */
export type MatrixTableColumn = {
  header: ReactNode;
  /** Header tooltip. Defaults to the header text when `header` is a string. */
  title?: string;
  headerClassName?: string;
  headerStyle?: CSSProperties;
  cellClassName?: string;
  cellStyle?: CSSProperties;
};

export type MatrixTableProps = {
  /** Column headers: a bare node, or a `MatrixTableColumn` for per-column styling. */
  columns: Array<ReactNode | MatrixTableColumn>;
  rows: Array<MatrixTableRow | MatrixTableGroupRow>;
  corner?: ReactNode;
  emptyMessage?: ReactNode;
  angledHeaders?: boolean;
  density?: "default" | "compact";
  columnWidth?: number;
  headerHeight?: number;
  // maxHeight caps the scroll viewport so the body scrolls under frozen
  // headers (Excel-style freeze panes). Accepts any CSS length; number => px.
  maxHeight?: number | string;
  className?: string;
  columnClassName?: string;
  rowLabelClassName?: string;
  cellClassName?: string;
  // headerClassName backgrounds the header plane and corner. Non-angled column
  // cells also receive it; angled cells stay transparent so their labels can
  // extend across neighbouring columns without being covered.
  headerClassName?: string;
  /** Classes added to every group row's cell. */
  groupRowClassName?: string;
};

// One indent step, in rem; an inline style rather than a computed arbitrary
// class so it survives a consumer's Tailwind scan.
const INDENT_REM = 0.75;

function isMatrixTableColumn(column: ReactNode | MatrixTableColumn): column is MatrixTableColumn {
  return (
    typeof column === "object" &&
    column !== null &&
    !isValidElement(column) &&
    !(Symbol.iterator in column) &&
    "header" in column
  );
}

function isGroupRow(row: MatrixTableRow | MatrixTableGroupRow): row is MatrixTableGroupRow {
  return row.type === "group";
}

function normalizeColumn(column: ReactNode | MatrixTableColumn): MatrixTableColumn {
  return isMatrixTableColumn(column) ? column : { header: column };
}

function Indented({ depth, children }: { depth: number | undefined; children: ReactNode }) {
  if (!depth) return <>{children}</>;
  return <div style={{ paddingLeft: `${depth * INDENT_REM}rem` }}>{children}</div>;
}

export function MatrixTable({
  columns: columnInputs,
  rows,
  corner,
  emptyMessage = "No data",
  angledHeaders = false,
  density = "default",
  columnWidth = 48,
  headerHeight = 120,
  maxHeight,
  className,
  columnClassName,
  rowLabelClassName,
  cellClassName,
  headerClassName,
  groupRowClassName,
}: MatrixTableProps) {
  const columns = columnInputs.map(normalizeColumn);
  const textWidth = Math.round(headerHeight * 1.41);
  const diagonalOverhang = Math.round(headerHeight * 0.71);
  const compact = density === "compact";
  const headerCellPadding = compact ? "px-density-2 py-density-1" : "px-density-3 py-density-2";
  const rowLabelPadding = compact ? "px-density-2 py-1" : "px-density-3 py-density-2";
  const bodyCellPadding = compact ? "px-density-2 py-1" : "px-density-3 py-density-2";
  const angledCellWidth = { width: columnWidth, minWidth: columnWidth, maxWidth: columnWidth };

  return (
    <div
      className={cn("overflow-auto rounded-md border border-border", className)}
      style={{
        ...(angledHeaders ? { paddingRight: diagonalOverhang } : undefined),
        ...(maxHeight !== undefined ? { maxHeight } : undefined),
      }}
    >
      <table className={cn("w-max min-w-full border-collapse", compact ? "text-xs" : "text-sm")}>
        {angledHeaders && (
          <colgroup>
            <col />
            {columns.map((_, index) => (
              <col key={index} style={{ width: columnWidth }} />
            ))}
          </colgroup>
        )}
        <thead className={cn(angledHeaders && "sticky top-0 z-20")}>
          <tr className={cn(!angledHeaders && "border-b border-border", headerClassName)}>
            <th
              scope="col"
              className={cn(
                "sticky left-0 top-0 z-30 min-w-44 border-r border-border text-left font-medium",
                headerCellPadding,
                angledHeaders ? "align-bottom" : cn("border-b border-border", columnClassName),
                headerClassName,
              )}
            >
              {corner}
            </th>
            {columns.map((column, index) =>
              angledHeaders ? (
                <th
                  key={index}
                  scope="col"
                  title={column.title ?? columnTitle(column.header)}
                  className={cn(
                    "relative overflow-visible border-b border-border p-0 align-bottom",
                    columnClassName,
                    headerClassName,
                    "bg-transparent",
                    column.headerClassName,
                  )}
                  style={{ ...angledCellWidth, height: headerHeight, ...column.headerStyle }}
                >
                  <div
                    className="absolute bottom-0 border-b border-border"
                    style={{
                      left: columnWidth,
                      width: textWidth,
                      transform: "rotate(-45deg)",
                      transformOrigin: "0 100%",
                    }}
                  />
                  {index === 0 && (
                    <div
                      className="absolute bottom-0 border-b border-border"
                      style={{
                        left: 0,
                        width: textWidth,
                        transform: "rotate(-45deg)",
                        transformOrigin: "0 100%",
                      }}
                    />
                  )}
                  <div
                    className="absolute bottom-0 overflow-hidden text-ellipsis whitespace-nowrap pl-1 text-left text-xs font-medium leading-none text-muted-foreground"
                    style={{
                      left: columnWidth / 2,
                      width: textWidth,
                      transform: "rotate(-45deg)",
                      transformOrigin: "0 100%",
                    }}
                  >
                    {column.header}
                  </div>
                </th>
              ) : (
                <th
                  key={index}
                  scope="col"
                  title={column.title}
                  className={cn(
                    "sticky top-0 z-20 min-w-24 whitespace-nowrap border-b border-border text-center text-xs font-medium text-muted-foreground",
                    headerCellPadding,
                    columnClassName,
                    headerClassName,
                    column.headerClassName,
                  )}
                  style={column.headerStyle}
                >
                  {column.header}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length + 1} className="p-density-3 text-sm text-muted-foreground">{emptyMessage}</td></tr>}
          {rows.map((row) =>
            isGroupRow(row) ? (
              <tr key={row.key} data-matrix-group={row.key} className="border-b border-border last:border-b-0">
                <th
                  scope="colgroup"
                  colSpan={columns.length + 1}
                  className={cn(
                    "p-0 text-left text-[11px] text-foreground",
                    (row.depth ?? 0) === 0 ? "bg-muted/70 font-semibold" : "bg-muted/30 font-medium",
                    groupRowClassName,
                    row.className,
                  )}
                >
                  <div className={cn("sticky left-0 inline-flex max-w-full items-center gap-1.5", rowLabelPadding)}>
                    <Indented depth={row.depth}>{row.label}</Indented>
                  </div>
                </th>
              </tr>
            ) : (
              <tr key={row.key} className="border-b border-border last:border-b-0">
                <th
                  scope="row"
                  className={cn(
                    "sticky left-0 z-10 border-r border-border bg-background text-left font-medium",
                    rowLabelPadding,
                    rowLabelClassName,
                  )}
                >
                  <Indented depth={row.depth}>{row.label}</Indented>
                </th>
                {columns.map((column, index) => (
                  <td
                    key={index}
                    className={cn(
                      angledHeaders
                        ? "p-0 text-center align-middle"
                        : cn(bodyCellPadding, "text-center align-middle"),
                      cellClassName,
                      column.cellClassName,
                    )}
                    style={
                      angledHeaders || column.cellStyle
                        ? { ...(angledHeaders ? angledCellWidth : undefined), ...column.cellStyle }
                        : undefined
                    }
                  >
                    {row.cells[index] ?? null}
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}

function columnTitle(column: ReactNode) {
  if (typeof column === "string" || typeof column === "number") {
    return String(column);
  }
  return undefined;
}
