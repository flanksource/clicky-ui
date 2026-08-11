/**
 * The data types a profile field may declare.
 *
 * Kept apart from profileFieldGrid.tsx so that module exports only components
 * (react/only-export-components).
 */

export const PROFILE_FIELD_TYPES = [
  "string",
  "number",
  "boolean",
  "datetime",
  "duration",
  "bytes",
  "status",
  "health",
  "key_value",
  "key_values",
  "json",
] as const;
