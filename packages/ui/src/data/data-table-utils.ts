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

export function getFilterCandidate<T extends Record<string, unknown>>(
  row: T,
  column: DataTableColumn<T>,
) {
  const rawValue = resolvePath(row, column.key);
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
): DataTableColumn<T>[] {
  if (data.length === 0) return [];

  const keys = new Set<string>();
  for (const row of data.slice(0, 20)) {
    Object.keys(row)
      .filter((key) => !key.startsWith("_"))
      .forEach((key) => keys.add(key));
  }

  return Array.from(keys).map((key) => ({
    key,
    label: prettifyKey(key),
    sortable: true,
    filterable: true,
  }));
}
