import type { ReactNode } from "react";

/** One contiguous run of rows sharing a group key, in post-sort order. */
export type DataTableGroup<T> = {
  key: string;
  rows: T[];
};

export type DataTableGroupMetaAlign = "start" | "end";

export type DataTableGrouping<T> = {
  /** Groups rows by the returned key. */
  getGroupKey: (row: T) => string;
  /** Human label for a group header. Defaults to the group key. */
  getGroupLabel?: (key: string, rows: T[]) => ReactNode;
  /** Summary rendered in the group header, placed by `metaAlign`. */
  getGroupMeta?: (key: string, rows: T[]) => ReactNode;
  /**
   * Where `getGroupMeta` sits in the header row. `"end"` (the default) pins it
   * to the trailing edge; `"start"` puts it immediately after the label and
   * count, which keeps a per-group aggregate next to the thing it aggregates
   * instead of a table-width away from it.
   */
  metaAlign?: DataTableGroupMetaAlign;
  /** Classes applied to the `getGroupMeta` wrapper. */
  metaClassName?: string;
  /** Whether a group starts collapsed. Defaults to expanded. */
  defaultCollapsed?: boolean | ((key: string, rows: T[]) => boolean);
  /** Reorders groups. Omit to keep first-appearance order, which follows the sort. */
  compareGroups?: (a: DataTableGroup<T>, b: DataTableGroup<T>) => number;
};

type DataTableGroupingModeBase = {
  /** Stable value used by the grouping picker and controlled state. */
  value: string;
  /** Text shown in the grouping picker. */
  label: string;
};

export type DataTableGroupingCustomMode<T> = DataTableGroupingModeBase &
  DataTableGrouping<T> & {
    type: "custom";
  };

export type DataTableGroupingColumnMode<T> = DataTableGroupingModeBase &
  Omit<DataTableGrouping<T>, "getGroupKey"> & {
    type: "column";
    /** Column key whose scalar value becomes the group key. */
    columnKey: string;
    /** Label used for null, undefined, or empty-string values. */
    emptyGroupLabel?: string;
  };

export type DataTableGroupingNoneMode = DataTableGroupingModeBase & {
  type: "none";
};

/** One selectable grouping strategy for DataTable's native picker. */
export type DataTableGroupingMode<T> =
  | DataTableGroupingCustomMode<T>
  | DataTableGroupingColumnMode<T>
  | DataTableGroupingNoneMode;

/** Converts an automatic column-group value to the stable string key DataTable requires. */
export function dataTableGroupKey(
  value: unknown,
  emptyGroupLabel = "(empty)",
): string {
  if (value === null || value === undefined || value === "") {
    return emptyGroupLabel;
  }
  switch (typeof value) {
    case "string":
    case "number":
    case "boolean":
    case "bigint":
      return String(value);
    default:
      throw new Error(
        `DataTable automatic grouping requires scalar values; received ${Array.isArray(value) ? "array" : typeof value}`,
      );
  }
}

/**
 * Buckets `records` by `getGroupKey`, preserving first-appearance order so
 * grouping never fights the active sort. Pure — no React, no DOM.
 */
export function groupRecords<T>(
  records: readonly T[],
  getGroupKey: (row: T) => string,
): Array<DataTableGroup<T>> {
  const byKey = new Map<string, T[]>();
  for (const record of records) {
    const key = getGroupKey(record);
    const bucket = byKey.get(key);
    if (bucket) bucket.push(record);
    else byKey.set(key, [record]);
  }
  return Array.from(byKey, ([key, rows]) => ({ key, rows }));
}

/** Resolves `defaultCollapsed` for one group. */
export function isGroupCollapsedByDefault<T>(
  group: DataTableGroup<T>,
  defaultCollapsed: DataTableGrouping<T>["defaultCollapsed"],
): boolean {
  if (typeof defaultCollapsed === "function") {
    return defaultCollapsed(group.key, group.rows);
  }
  return defaultCollapsed === true;
}
