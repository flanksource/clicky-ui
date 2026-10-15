import { useMemo, useState } from "react";
import { Switch } from "../../components/Switch";
import { cn } from "../../lib/utils";
import { Badge } from "../Badge";
import { CodeBlock } from "../CodeBlock";
import { DataTable, type DataTableColumn } from "../DataTable";
import { JsonView } from "../JsonView";
import { formatStatementDuration, groupStatements, type SqlDisplayRow } from "./sql-trace";
import type { SqlStatementRow } from "./types";

export type SqlTraceTableProps = {
  /** `pg_proxy` / `sql_statements` trace records. */
  rows: SqlStatementRow[];
  /** Start with statements sharing a `repeatKey` collapsed into one counted row. Defaults to true. */
  groupRepeated?: boolean;
  /** Shown when there are no statements. */
  emptyLabel?: string;
  /** Classes applied to the table root. */
  className?: string;
};

const COLUMNS: DataTableColumn<SqlDisplayRow>[] = [
  { key: "startedAt", label: "Time", kind: "timestamp", shrink: true },
  {
    key: "op",
    label: "Op",
    shrink: true,
    filterable: true,
    render: (value) => (
      <Badge variant="soft" tone="neutral" size="xs" className="font-mono">
        {String(value)}
      </Badge>
    ),
  },
  { key: "tables", label: "Tables", kind: "tags", shrink: true },
  {
    key: "sql",
    label: "SQL",
    grow: true,
    render: (_value, row) => (
      <span className="flex min-w-0 items-center gap-density-2">
        <CodeBlock inline language="sql" source={row.sql} />
        {row.count > 1 ? (
          <span title={`${row.count} executions`}>
            <Badge variant="soft" tone="info" size="xs">
              {`×${row.count}`}
            </Badge>
          </span>
        ) : null}
      </span>
    ),
  },
  {
    key: "durationMs",
    label: "Duration",
    align: "right",
    shrink: true,
    render: (value, row) => (
      <span className="tabular-nums" title={row.count > 1 ? `${row.count} executions in total` : undefined}>
        {formatStatementDuration(Number(value))}
      </span>
    ),
    sortValue: (value) => Number(value),
  },
  {
    key: "rows",
    label: "Rows",
    align: "right",
    shrink: true,
    render: (value) => (Number(value) < 0 ? <span className="text-muted-foreground">—</span> : <span className="tabular-nums">{String(value)}</span>),
    sortValue: (value) => Number(value),
  },
  {
    key: "error",
    label: "Error",
    grow: true,
    render: (value, row) =>
      value ? (
        <span className="truncate text-destructive" title={String(value)}>
          {String(value)}
          {row.count > 1 ? ` (${row.failed} of ${row.count} failed)` : ""}
        </span>
      ) : null,
  },
];

function StatementDetails({ row }: { row: SqlDisplayRow }) {
  const [first] = row.occurrences as [SqlStatementRow, ...SqlStatementRow[]];
  return (
    <div className="space-y-density-3">
      <CodeBlock language="sql" source={row.sql} copyable />
      {row.error ? (
        <div>
          <div className="mb-1 font-semibold text-foreground">Error</div>
          <pre className="whitespace-pre-wrap break-all text-destructive">{row.error}</pre>
        </div>
      ) : null}
      <div className="text-xs text-muted-foreground">
        {first.connection} · {first.driver}
        {first.truncated?.length ? ` · truncated: ${first.truncated.join(", ")}` : ""}
      </div>
      {row.count > 1 ? (
        <ul className="space-y-1 text-xs" aria-label="Executions">
          {row.occurrences.map((occurrence, index) => (
            <li key={index} className={cn("flex items-baseline gap-density-3", occurrence.error && "text-destructive")}>
              <span className="tabular-nums text-muted-foreground">{occurrence.startedAt}</span>
              <span className="tabular-nums">{formatStatementDuration(occurrence.durationMs)}</span>
              <span className="tabular-nums">{occurrence.rows < 0 ? "— rows" : `${occurrence.rows} rows`}</span>
              {occurrence.args ? <code className="font-mono">{JSON.stringify(occurrence.args)}</code> : null}
              {occurrence.error ? <span>{occurrence.error}</span> : null}
            </li>
          ))}
        </ul>
      ) : first.args ? (
        <div>
          <div className="mb-1 font-semibold text-foreground">Arguments</div>
          <JsonView data={first.args} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * `pg_proxy` / `sql_statements` records as a DataTable: time, op, tables, SQL,
 * duration, rows and error. Statements that differ only by their values share a
 * `repeatKey` and collapse into one row with a count badge and their total
 * duration; the switch above the table shows each execution instead.
 */
export function SqlTraceTable({ rows, groupRepeated = true, emptyLabel = "No SQL statements recorded", className }: SqlTraceTableProps) {
  const [group, setGroup] = useState(groupRepeated);
  const displayRows = useMemo(() => groupStatements(rows, { group }), [rows, group]);
  return (
    <div className={cn("flex h-full min-h-0 flex-col gap-density-2", className)}>
      <Switch checked={group} onChange={setGroup} label="Group repeated statements" className="self-start px-density-2" />
      <DataTable
        data={displayRows}
        columns={COLUMNS}
        autoFilter
        emptyMessage={emptyLabel}
        globalFilterPlaceholder="Filter SQL, table, or error…"
        getRowId={(row) => row.id}
        renderExpandedRow={(row) => <StatementDetails row={row} />}
      />
    </div>
  );
}
