import { useMemo } from "react";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import type { DebugClient } from "../debugClient";
import { ExecutionDetail } from "../ExecutionDetail";
import type { ExecutionSummary } from "../types";

/**
 * What ran, in the order it ran.
 *
 * One row per request rather than per provider operation: a profile with
 * context sub-queries is one thing the user asked for, and its operations are
 * listed in the detail pane where their relationship is visible. The counts
 * column says how many there were, so a request that quietly ran four queries
 * cannot look like one.
 */

export type QueriesTabProps = {
  records: ExecutionSummary[];
  client?: DebugClient | undefined;
  /** Search term owned by the console header, shared across tabs. */
  search?: string | undefined;
  /**
   * Called when a row is opened. The Network and Inspection tabs are scoped to
   * one capture, and this is how they learn which.
   */
  onSelect?: ((record: ExecutionSummary) => void) | undefined;
};

type QueryRow = Record<string, unknown> & {
  id: string;
  time: string;
  surface: string;
  provider: string;
  query: string;
  rows: number;
  durationMs: number;
  status: string;
  operations: number;
  record: ExecutionSummary;
};

const COLUMNS: DataTableColumn<QueryRow>[] = [
  { key: "time", label: "Time", kind: "timestamp", shrink: true, minWidth: 120 },
  { key: "surface", label: "Surface", shrink: true, minWidth: 100, filterable: true },
  { key: "provider", label: "Provider", shrink: true, minWidth: 110, filterable: true },
  {
    key: "query",
    label: "Query",
    grow: true,
    minWidth: 280,
    cellClassName: "font-mono text-xs",
    render: (value) => <span title={String(value ?? "")}>{String(value ?? "")}</span>,
  },
  {
    key: "operations",
    label: "Ops",
    align: "right",
    shrink: true,
    // A request that ran one operation is the ordinary case; showing "1" on
    // every row would bury the four-operation request that is worth noticing.
    render: (value) => (Number(value ?? 0) > 1 ? String(value) : ""),
  },
  { key: "rows", label: "Rows", align: "right", shrink: true },
  {
    key: "durationMs",
    label: "Duration",
    align: "right",
    shrink: true,
    render: (value) => `${Number(value ?? 0).toFixed(1)}ms`,
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "status", label: "Status", kind: "status", shrink: true, minWidth: 90 },
];

export function QueriesTab({ records, client, search, onSelect }: QueriesTabProps) {
  const rows = useMemo(() => records.map(toRow), [records]);

  return (
    <DataTable<QueryRow>
      data={rows}
      columns={COLUMNS}
      {...(search === undefined ? { showGlobalFilter: true } : { globalFilter: search })}
      emptyMessage="No captures yet — run a query with the console open."
      defaultSort={{ key: "time", dir: "desc" }}
      onRowClick={(row) => {
        onSelect?.(row.record);
      }}
      renderExpandedRow={(row) => <ExecutionDetail record={row.record} {...(client ? { client } : {})} />}
    />
  );
}

function toRow(record: ExecutionSummary): QueryRow {
  const operations = record.operations ?? [];
  const first = operations[0];
  return {
    id: record.id,
    time: record.startedAt,
    surface: record.source.profile
      ? `${record.source.surface}: ${record.source.profile}`
      : record.source.surface,
    provider: providerLabel(operations.map((operation) => operation.provider)),
    query: first?.query ?? first?.url ?? "",
    rows: record.rows,
    durationMs: record.durationMs,
    status: statusLabel(record),
    operations: record.counts.operations,
    record,
  };
}

/** Several providers in one request is a fact about it, not a cell to truncate. */
function providerLabel(providers: string[]): string {
  const distinct = Array.from(new Set(providers.filter(Boolean)));
  if (distinct.length === 0) return "";
  if (distinct.length === 1) return distinct[0] as string;
  return `${distinct[0]} +${distinct.length - 1}`;
}

function statusLabel(record: ExecutionSummary): string {
  if (record.error) return "error";
  if (typeof record.status === "number" && record.status >= 400) return `error ${record.status}`;
  if (typeof record.status === "number") return String(record.status);
  return "ok";
}
