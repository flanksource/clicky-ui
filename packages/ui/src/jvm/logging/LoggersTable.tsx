import { useMemo } from "react";
import { Button } from "../../components/button";
import { InputField } from "../../components/InputField";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import { UiEdit } from "../../icons";
import { filterLoggerRows, loggerRows, type LoggerRow } from "../model/loggers";
import type { JvmLogger } from "../protocol/types";

export type LoggersTableProps = {
  loggers: JvmLogger[];
  /** Substring filter on the logger name. */
  filter: string;
  onFilterChange: (filter: string) => void;
  /** Called with the row whose Edit button was pressed. */
  onEdit: (logger: LoggerRow) => void;
  /** Edit buttons are enabled. */
  canEdit: boolean;
  className?: string;
};

/** java.util.logging loggers with their own and effective levels, filterable by name. */
export function LoggersTable({ loggers, filter, onFilterChange, onEdit, canEdit, className }: LoggersTableProps) {
  const rows = useMemo(() => loggerRows(loggers), [loggers]);
  const visible = useMemo(() => filterLoggerRows(rows, filter), [rows, filter]);
  const columns = useMemo<DataTableColumn<LoggerRow>[]>(
    () => [
      { key: "name", label: "Logger", accessor: (row) => row.displayName, sortable: true, grow: true, render: (value) => <span className="font-mono text-xs">{String(value)}</span> },
      {
        key: "level",
        label: "Level",
        accessor: (row) => row.levelLabel,
        render: (_value, row) => <span className={row.level === null ? "font-mono text-xs text-muted-foreground" : "font-mono text-xs font-medium"}>{row.levelLabel}</span>,
      },
      { key: "parent", label: "Parent", accessor: (row) => row.parentName, render: (value) => <span className="font-mono text-xs text-muted-foreground">{String(value)}</span> },
      {
        key: "actions",
        label: "",
        align: "right",
        sortable: false,
        accessor: () => "",
        render: (_value, row) => (
          <Button size="xs" variant="ghost" disabled={!canEdit} aria-label={`Edit level of ${row.displayName}`} onClick={() => onEdit(row)}>
            <UiEdit /> Edit
          </Button>
        ),
      },
    ],
    [canEdit, onEdit],
  );

  return (
    <div className={className ?? "flex min-h-0 flex-1 flex-col gap-2"}>
      <div className="flex items-center gap-3">
        <InputField className="max-w-sm flex-1" aria-label="Filter loggers" placeholder="Filter loggers" value={filter} onChange={(value) => onFilterChange(value)} clearable onClear={() => onFilterChange("")} />
        <span className="text-xs text-muted-foreground">
          {visible.length} of {rows.length} loggers
        </span>
      </div>
      <DataTable<LoggerRow>
        className="min-h-0 flex-1"
        data={visible}
        columns={columns}
        getRowId={(row) => row.name}
        persistColumnWidths={false}
        persistColumnVisibility={false}
        hideableColumns={false}
        showHeaderFilters={false}
        emptyMessage="No loggers match."
      />
    </div>
  );
}
