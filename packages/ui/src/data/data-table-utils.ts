import type { DataTableColumn } from "./DataTable";

export function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object") {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function normalizeTokens(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeTokens(item)).filter(Boolean);
  }

  if (value == null) return [];
  if (typeof value === "object") return [JSON.stringify(value)];

  const token = String(value).trim();
  return token ? [token] : [];
}

/**
 * Reads a column's raw value from a row, honoring a column `accessor` when
 * present (for literal/empty/dotted SQL keys) and otherwise resolving `key` as
 * a dotted path. This is the single value-access seam for rendering, sorting,
 * and filtering.
 */
export function resolveColumnValue<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
): unknown {
  return column.accessor ? column.accessor(row) : resolvePath(row, column.key);
}

export function getFilterCandidate<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
) {
  const rawValue = resolveColumnValue(row, column);
  return column.filterValue ? column.filterValue(rawValue, row) : rawValue;
}

export function getFilterTokens<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
) {
  return normalizeTokens(getFilterCandidate(row, column));
}

export function prettifyKey(key: string) {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (value) => value.toUpperCase())
    .trim();
}

export function inferColumns<T extends Record<string, unknown>>(
  data: T[],
  opts?: {
    /**
     * Treat every key as a literal property name rather than a dotted path,
     * and tolerate empty/dotted column names (e.g. raw SQL result sets). Each
     * column carries an `accessor` reading `row[key]` directly, and blank keys
     * get a stable placeholder id + label so the table renders instead of
     * crashing on an id-less column.
     */
    literalKeys?: boolean;
  },
): DataTableColumn<T>[] {
  if (data.length === 0) return [];
  const literalKeys = opts?.literalKeys ?? false;

  const keys = new Set<string>();
  for (const row of data.slice(0, 20)) {
    Object.keys(row)
      .filter((key) => !key.startsWith("_"))
      .forEach((key) => keys.add(key));
  }

  return Array.from(keys).map((key, index) => ({
    key: key || `__col_${index}`,
    label: key ? prettifyKey(key) : "(no column name)",
    sortable: true,
    filterable: true,
    ...(literalKeys
      ? { accessor: (row: T) => (row as Record<string, unknown>)[key] }
      : {}),
  }));
}
