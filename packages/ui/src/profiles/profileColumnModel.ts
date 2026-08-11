
// One ProfileColumn, defined where the draft model is. The picker used to keep
// a narrower copy of the same shape; two definitions of one concept drifted
// apart unnoticed while they lived in separate modules and only collided once
// the package exported both.
import type { ProfileColumn } from "./profileWizardModel";

export function profileColumnTypeLabel(type?: string) {
  return type ? (PROFILE_COLUMN_TYPE_LABELS[type] ?? type) : "string";
}

/**
 * mapTimestampColumn marks the chosen column as the profile's time range and
 * clears the mark from whichever column previously held it.
 */
export function mapTimestampColumn(
  columns: ProfileColumn[],
  timestampColumn: string,
): ProfileColumn[] {
  return columns.map((column) => {
    if (column.name === timestampColumn) {
      return { ...column, type: "datetime", kind: "timestamp" };
    }
    if (column.kind !== "timestamp") return column;
    const { kind: _kind, ...rest } = column;
    return rest;
  });
}

const PROFILE_COLUMN_TYPE_LABELS: Record<string, string> = {
  key_value: "KeyValue{}",
  key_values: "[]KeyValue",
  json: "JSON"
};
