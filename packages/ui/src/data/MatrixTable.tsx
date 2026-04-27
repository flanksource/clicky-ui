import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type MatrixTableRow = {
  key: string;
  label: ReactNode;
  cells: ReactNode[];
};

export type MatrixTableProps = {
  columns: ReactNode[];
  rows: MatrixTableRow[];
  corner?: ReactNode;
  emptyMessage?: ReactNode;
  angledHeaders?: boolean;
  columnWidth?: number;
  headerHeight?: number;
  className?: string;
  columnClassName?: string;
  rowLabelClassName?: string;
  cellClassName?: string;
};

export function MatrixTable({
  columns,
  rows,
  corner,
  emptyMessage = "No data",
  angledHeaders = false,
  columnWidth = 48,
  headerHeight = 120,
  className,
  columnClassName,
  rowLabelClassName,
  cellClassName,
}: MatrixTableProps) {
  if (rows.length === 0 || columns.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  const textWidth = Math.round(headerHeight * 1.41);
  const diagonalOverhang = Math.round(headerHeight * 0.71);

  return (
    <div
      className={cn("overflow-auto rounded-md border border-border", className)}
      style={angledHeaders ? { paddingRight: diagonalOverhang } : undefined}
    >
      <table className="w-max border-collapse text-sm">
        {angledHeaders && (
          <colgroup>
            <col />
            {columns.map((_, index) => (
              <col key={index} style={{ width: columnWidth }} />
            ))}
          </colgroup>
        )}
        <thead>
          <tr className={cn("bg-muted/40", !angledHeaders && "border-b border-border")}>
            <th
              scope="col"
              className={cn(
                "sticky left-0 z-10 min-w-44 border-r border-border bg-muted/40 px-density-3 py-density-2 text-left font-medium",
                angledHeaders ? "align-bottom" : columnClassName,
              )}
            >
              {corner}
            </th>
            {columns.map((column, index) =>
              angledHeaders ? (
                <th
                  key={index}
                  scope="col"
                  title={columnTitle(column)}
                  className={cn(
                    "relative overflow-visible border-b border-border p-0 align-bottom",
                    columnClassName,
                  )}
                  style={{
                    width: columnWidth,
                    minWidth: columnWidth,
                    maxWidth: columnWidth,
                    height: headerHeight,
                  }}
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
                    className="absolute bottom-2 overflow-hidden text-ellipsis whitespace-nowrap pl-1 text-left text-xs font-medium leading-none text-muted-foreground"
                    style={{
                      left: columnWidth / 2,
                      width: textWidth,
                      transform: "rotate(-45deg)",
                      transformOrigin: "0 100%",
                    }}
                  >
                    {column}
                  </div>
                </th>
              ) : (
                <th
                  key={index}
                  scope="col"
                  className={cn(
                    "min-w-24 whitespace-nowrap px-density-3 py-density-2 text-center text-xs font-medium text-muted-foreground",
                    columnClassName,
                  )}
                >
                  {column}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-border last:border-b-0">
              <th
                scope="row"
                className={cn(
                  "sticky left-0 z-10 border-r border-border bg-background px-density-3 py-density-2 text-left font-medium",
                  rowLabelClassName,
                )}
              >
                {row.label}
              </th>
              {columns.map((_, index) => (
                <td
                  key={index}
                  className={cn(
                    angledHeaders
                      ? "p-0 text-center align-middle"
                      : "px-density-3 py-density-2 text-center align-middle",
                    cellClassName,
                  )}
                  style={
                    angledHeaders
                      ? {
                          width: columnWidth,
                          minWidth: columnWidth,
                          maxWidth: columnWidth,
                        }
                      : undefined
                  }
                >
                  {row.cells[index] ?? null}
                </td>
              ))}
            </tr>
          ))}
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
