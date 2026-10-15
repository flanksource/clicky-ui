import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { inferColumns } from "../data-table-utils";
import { DataTable } from "../DataTable";
import { ProcessTraceTree } from "./ProcessTraceTree";
import { SqlTraceTable } from "./SqlTraceTable";
import { TerminalCastPlayer } from "./TerminalCastPlayer";
import { TraceHarView } from "./TraceHarView";
import type {
  HttpExchangeRow,
  ProcessNodeRow,
  ProcessSampleRow,
  SqlStatementRow,
  TerminalEvent,
  TraceRow,
} from "./types";

export type TraceViewProps = {
  /** The record kind: `http`, `http_proxy`, `pg_proxy`, `sql_statements`, `terminal`, `process_tree`, or any other. */
  kind: string;
  /** The kind's records, as its stream stores them. */
  rows: TraceRow[];
  /** `process_samples` records of the same root; used by `process_tree` for CPU sparklines. */
  samples?: TraceRow[];
  /** Classes applied to the viewer root. */
  className?: string;
};

/** Each row of a kind with a dedicated viewer must carry the field that viewer cannot do without. */
function requireField(kind: string, rows: TraceRow[], field: string): void {
  rows.forEach((row, index) => {
    if (row[field] === undefined || row[field] === null) {
      throw new Error(`trace kind "${kind}" row ${index} has no "${field}"`);
    }
  });
}

function GenericTraceTable({ kind, rows }: { kind: string; rows: TraceRow[] }) {
  const columns = useMemo(() => inferColumns(rows, { literalKeys: true }), [rows]);
  return <DataTable data={rows} columns={columns} autoFilter emptyMessage={`No ${kind} records`} />;
}

function ProcessTraceView({ rows, samples }: { rows: ProcessNodeRow[]; samples: ProcessSampleRow[] | undefined }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  return <ProcessTraceTree nodes={rows} selectedKey={selectedKey} onSelect={setSelectedKey} {...(samples ? { samples } : {})} />;
}

/**
 * Renders a trace kind's records with its dedicated viewer: HTTP exchanges in
 * a HAR panel, SQL statements in a table, a terminal session in a cast player,
 * a process tree as a tree. Any other kind gets a table over the row keys.
 */
export function TraceView({ kind, rows, samples, className }: TraceViewProps) {
  const body = (() => {
    switch (kind) {
      case "http":
      case "http_proxy":
        requireField(kind, rows, "request");
        requireField(kind, rows, "response");
        return <TraceHarView rows={rows as HttpExchangeRow[]} />;
      case "pg_proxy":
      case "sql_statements":
        requireField(kind, rows, "sql");
        return <SqlTraceTable rows={rows as SqlStatementRow[]} />;
      case "terminal":
        requireField(kind, rows, "kind");
        requireField(kind, rows, "offset");
        return <TerminalCastPlayer events={rows as TerminalEvent[]} />;
      case "process_tree":
        requireField(kind, rows, "key");
        if (samples) requireField("process_samples", samples, "key");
        return <ProcessTraceView rows={rows as ProcessNodeRow[]} samples={samples as ProcessSampleRow[] | undefined} />;
      default:
        return <GenericTraceTable kind={kind} rows={rows} />;
    }
  })();
  return <div className={cn("flex h-full min-h-0 flex-col", className)}>{body}</div>;
}
