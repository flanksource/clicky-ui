import { formatDuration } from "../../lib/format";
import type { SqlStatementRow } from "./types";

/** One table row: a statement, or every execution of statements sharing a `repeatKey`. */
export type SqlDisplayRow = {
  id: string;
  startedAt: string;
  op: string;
  tables: string[];
  sql: string;
  /** Total of the executions. */
  durationMs: number;
  /** Rows the executions returned, or -1 when no driver could tell. */
  rows: number;
  /** The first error among the executions, or "". */
  error: string;
  /** How many executions returned an error. */
  failed: number;
  /** How many executions the row stands for. */
  count: number;
  occurrences: SqlStatementRow[];
};

/** A statement's duration: sub-100ms values keep a decimal (a fast query is 0.9 ms, not 1 ms), longer ones read as elsewhere. */
export function formatStatementDuration(ms: number): string {
  if (ms >= 100) return formatDuration(ms);
  return `${Number(ms.toFixed(1))} ms`;
}

function sumKnownRows(statements: SqlStatementRow[]): number {
  const known = statements.filter((statement) => statement.rows >= 0);
  return known.length === 0 ? -1 : known.reduce((total, statement) => total + statement.rows, 0);
}

function toDisplayRow(id: string, statements: SqlStatementRow[]): SqlDisplayRow {
  const [first] = statements as [SqlStatementRow, ...SqlStatementRow[]];
  return {
    id,
    startedAt: first.startedAt,
    op: first.op,
    tables: first.tables,
    sql: first.sql,
    durationMs: statements.reduce((total, statement) => total + statement.durationMs, 0),
    rows: sumKnownRows(statements),
    error: statements.find((statement) => statement.error)?.error ?? "",
    failed: statements.filter((statement) => statement.error).length,
    count: statements.length,
    occurrences: statements,
  };
}

/**
 * Turns statements into table rows. With `group`, statements sharing a
 * non-empty `repeatKey` (the same statement run with different values) become
 * one row, placed where the first of them ran.
 */
export function groupStatements(statements: SqlStatementRow[], options: { group: boolean }): SqlDisplayRow[] {
  const groups = new Map<string, SqlStatementRow[]>();
  statements.forEach((statement, index) => {
    const key = options.group && statement.repeatKey ? `repeat:${statement.repeatKey}` : `row:${index}`;
    groups.set(key, [...(groups.get(key) ?? []), statement]);
  });
  return [...groups].map(([key, members]) => toDisplayRow(key, members));
}
