import { useMemo } from "react";
import { cn } from "../lib/utils";
import { AnsiHtml } from "./AnsiHtml";
import {
  DataTable,
  type DataTableColumn,
  type DataTableProps,
  type DataTableRowDetailContext,
} from "./DataTable";
import { LogDetails } from "./LogDetails";
import { normalizeLogsTableRows, type LogsTableInput, type LogsTableRow } from "./logs-normalize";

export type { LogsTableInput, LogsTableRow } from "./logs-normalize";

export type LogsTableProps = Omit<DataTableProps<LogsTableRow>, "data" | "columns"> & {
  /** Raw newline-delimited log text or pre-parsed log records. */
  logs: string | LogsTableInput[];
  /** Optional custom columns; defaults to timestamp, level, pod, logger, thread, message, and tags. */
  columns?: DataTableColumn<LogsTableRow>[];
  /** Render parsed/raw log details when a row is expanded. */
  showRawDetails?: boolean;
};

// Matches CSI / SGR escape sequences (e.g. "\x1b[31m"). Used to skip the
// AnsiHtml render for plain messages so the cell stays a fast text node.
const ANSI_PATTERN = new RegExp(`${String.fromCharCode(27)}\\[[0-9;?]*[ -/]*[@-~]`);

const DEFAULT_LOG_COLUMNS: DataTableColumn<LogsTableRow>[] = [
  {
    key: "timestamp",
    label: "Timestamp",
    kind: "timestamp",
    shrink: true,
    minWidth: 180,
  },
  {
    key: "level",
    label: "Level",
    kind: "status",
    shrink: true,
    minWidth: 96,
    status: { showLabel: true },
  },
  { key: "pod", label: "Pod", shrink: true, minWidth: 180 },
  { key: "logger", label: "Logger", shrink: true, minWidth: 220 },
  { key: "thread", label: "Thread", shrink: true, minWidth: 180 },
  {
    key: "message",
    label: "Message",
    grow: true,
    minWidth: 360,
    cellClassName: "font-mono text-xs",
    render: (value) => {
      const text = typeof value === "string" ? value : value == null ? "" : String(value);
      if (!ANSI_PATTERN.test(text)) return text;
      return <AnsiHtml as="span" text={text} className="whitespace-pre-wrap break-words" />;
    },
  },
  {
    key: "tags",
    label: "Tags",
    kind: "tags",
    grow: true,
    tags: { maxVisible: 4 },
  },
];

const DEFAULT_SORT = {
  key: "timestamp",
  dir: "desc",
} satisfies NonNullable<DataTableProps<LogsTableRow>["defaultSort"]>;

function renderLogDetails(row: LogsTableRow, context: DataTableRowDetailContext<LogsTableRow>) {
  return (
    <LogDetails row={row} filterActions={context.filterActionsByColumn} columns={context.columns} />
  );
}

export function LogsTable({
  logs,
  columns,
  showRawDetails = true,
  className,
  autoFilter = true,
  defaultSort,
  getRowId,
  renderExpandedRow,
  showDensityControl = true,
  showThemeControl = true,
  showFullscreenControl = true,
  fullscreenTitle = "Logs",
  fullscreenButtonLabel = "Open logs full screen",
  defaultDensity = "compact",
  ...tableProps
}: LogsTableProps) {
  const rows = useMemo(() => normalizeLogsTableRows(logs), [logs]);
  const resolvedRenderExpandedRow =
    renderExpandedRow ?? (showRawDetails ? renderLogDetails : undefined);
  return (
    <DataTable
      {...tableProps}
      data={rows}
      columns={columns ?? DEFAULT_LOG_COLUMNS}
      className={cn("rounded-md bg-background p-2", className)}
      autoFilter={autoFilter}
      defaultDensity={defaultDensity}
      defaultSort={defaultSort ?? DEFAULT_SORT}
      getRowId={getRowId ?? ((row) => row.id)}
      showDensityControl={showDensityControl}
      showThemeControl={showThemeControl}
      showFullscreenControl={showFullscreenControl}
      fullscreenTitle={fullscreenTitle}
      fullscreenButtonLabel={fullscreenButtonLabel}
      {...(resolvedRenderExpandedRow ? { renderExpandedRow: resolvedRenderExpandedRow } : {})}
    />
  );
}
