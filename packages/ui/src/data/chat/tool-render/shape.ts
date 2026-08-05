// L2 of the tool-render pipeline: classify a tool result by its value alone,
// so tools with no published schema still render as something better than a
// JSON blob. The shapes mirror what clicky operations actually return: a
// PagedResult envelope, a bare list, one record, a bag of counts, or a scalar.

import type { DataTableColumn } from "../../DataTable";
import type { ToolFieldMeta } from "./schema";

export type ToolValueShape = "paged" | "list" | "record" | "counts" | "scalar" | "empty";

export type ToolPageInfo = { limit?: number; offset?: number; total?: number };

export type ClassifiedToolValue =
  | { shape: "empty" }
  | { shape: "scalar"; value: string | number | boolean }
  | { shape: "counts"; record: Record<string, number> }
  | { shape: "record"; record: Record<string, unknown> }
  | { shape: "list"; items: unknown[]; rows: Record<string, unknown>[] | null }
  | { shape: "paged"; items: unknown[]; rows: Record<string, unknown>[] | null; page: ToolPageInfo };

const COLUMN_SCAN_ROWS = 50;
const DEFAULT_MAX_COLUMNS = 8;
const CELL_TEXT_LIMIT = 80;
const LEADING_KEYS = ["id", "code", "name", "title"];

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function objectRows(items: unknown[]): Record<string, unknown>[] | null {
  return items.every(isPlainObject) ? (items as Record<string, unknown>[]) : null;
}

function numberField(source: Record<string, unknown>, key: string): number | undefined {
  const value = source[key];
  return typeof value === "number" ? value : undefined;
}

function pageInfo(value: Record<string, unknown>): ToolPageInfo | null {
  const page = isPlainObject(value["page"]) ? value["page"] : value;
  const limit = numberField(page, "limit");
  const offset = numberField(page, "offset");
  const total = numberField(page, "total");
  if (limit === undefined && offset === undefined && total === undefined) return null;
  return {
    ...(limit !== undefined ? { limit } : {}),
    ...(offset !== undefined ? { offset } : {}),
    ...(total !== undefined ? { total } : {}),
  };
}

/** Classify a normalized tool result. Ordering matters: the paged envelope is
 *  checked before the generic record, and an all-numeric record before it. */
export function classifyToolValue(value: unknown): ClassifiedToolValue {
  if (value === undefined || value === null) return { shape: "empty" };

  if (typeof value === "string") {
    return value.trim() === "" ? { shape: "empty" } : { shape: "scalar", value };
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return { shape: "scalar", value };
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return { shape: "empty" };
    return { shape: "list", items: value, rows: objectRows(value) };
  }

  if (!isPlainObject(value)) return { shape: "empty" };

  const keys = Object.keys(value);
  if (keys.length === 0) return { shape: "empty" };

  const data = value["data"];
  if (Array.isArray(data)) {
    const page = pageInfo(value);
    if (page) return { shape: "paged", items: data, rows: objectRows(data), page };
    return { shape: "list", items: data, rows: objectRows(data) };
  }

  if (keys.every((key) => typeof value[key] === "number")) {
    return { shape: "counts", record: value as Record<string, number> };
  }

  return { shape: "record", record: value };
}

function cellText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  const text = JSON.stringify(value) ?? "";
  return text.length > CELL_TEXT_LIMIT ? `${text.slice(0, CELL_TEXT_LIMIT)}…` : text;
}

function isTimestampKey(key: string, field?: ToolFieldMeta): boolean {
  if (field?.format === "date-time" || field?.format === "date") return true;
  return /(_at|At|date|Date)$/.test(key);
}

function columnRank(key: string): number {
  const index = LEADING_KEYS.indexOf(key);
  return index >= 0 ? index : LEADING_KEYS.length;
}

/** Columns derived from the union of row keys, capped so a wide record does not
 *  blow out a chat bubble. Labels come from the schema when one was published. */
export function deriveColumns(
  rows: Record<string, unknown>[],
  options: { fields?: Record<string, ToolFieldMeta> | undefined; max?: number | undefined } = {},
): DataTableColumn<Record<string, unknown>>[] {
  const fields = options.fields ?? {};
  const max = options.max ?? DEFAULT_MAX_COLUMNS;

  const keys: string[] = [];
  for (const row of rows.slice(0, COLUMN_SCAN_ROWS)) {
    for (const key of Object.keys(row)) {
      if (!keys.includes(key)) keys.push(key);
    }
  }

  return keys
    .sort((a, b) => columnRank(a) - columnRank(b))
    .slice(0, max)
    .map((key) => {
      const field = fields[key];
      const timestamp = isTimestampKey(key, field);
      const allNumeric = rows.every((row) => row[key] === undefined || typeof row[key] === "number");
      return {
        key,
        label: field?.label ?? key,
        // `kind` supplies DataTable's own renderer, so only stringify otherwise.
        ...(timestamp
          ? { kind: "timestamp" as const }
          : { render: (value: unknown) => cellText(value) }),
        ...(allNumeric ? { align: "right" as const } : {}),
      };
    });
}
