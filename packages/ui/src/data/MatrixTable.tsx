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
  className,
  columnClassName,
  rowLabelClassName,
  cellClassName,
}: MatrixTableProps) {
  if (rows.length === 0 || columns.length === 0) {
    return <div className="text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className={cn("overflow-auto rounded-md border border-border", className)}>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th
              scope="col"
              className={cn(
                "sticky left-0 z-10 min-w-44 border-r border-border bg-muted/40 px-density-3 py-density-2 text-left font-medium",
                columnClassName,
              )}
            >
              {corner}
            </th>
            {columns.map((column, index) => (
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
            ))}
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
                  className={cn("px-density-3 py-density-2 text-center align-middle", cellClassName)}
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
