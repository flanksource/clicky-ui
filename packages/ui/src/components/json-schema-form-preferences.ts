import type { FormSize } from "./json-schema-form-size";

// FormPreferences are the form-local appearance overrides the display-options
// menu persists: the input/label scale and the layout mode. They never touch
// field values or the global page density — only how one form looks.
export interface FormPreferences {
  size?: FormSize;
  layoutMode?: LayoutMode;
  sortMode?: SortMode;
}

export type LayoutMode = "stacked" | "inline";

// SortMode controls the order fields render in at every object level:
// - "schema": schema/x-order order (the default).
// - "required-first": required keys first, then optional, each group stable.
// - "priority": required AND non-empty keys bubble to the top — required-and-
//   filled, then required-and-empty, then optional-and-filled, then the rest.
export type SortMode = "schema" | "required-first" | "priority";

export const DEFAULT_PREFERENCES_STORAGE_KEY = "clicky-ui-json-schema-form-preferences";

const VALID_SIZES: readonly string[] = ["xs", "sm", "md", "lg", "xl"];

function isFormSize(value: unknown): value is FormSize {
  return typeof value === "string" && VALID_SIZES.includes(value);
}

function isLayoutMode(value: unknown): value is LayoutMode {
  return value === "stacked" || value === "inline";
}

function isSortMode(value: unknown): value is SortMode {
  return value === "schema" || value === "required-first" || value === "priority";
}

// readPreferences loads stored preferences, tolerating anything malformed: a
// missing key, invalid JSON, a non-object payload, out-of-range values, or a
// localStorage that throws (private mode / storage disabled). Each field is
// validated independently so one bad value doesn't discard the whole record.
// Display preferences are best-effort, so a read failure yields {} rather than
// an error — the form falls back to its props.
export function readPreferences(storageKey: string): FormPreferences {
  let raw: string | null;
  try {
    raw = localStorage.getItem(storageKey);
  } catch {
    return {};
  }
  if (!raw) return {};

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (typeof parsed !== "object" || parsed === null) return {};

  const record = parsed as Record<string, unknown>;
  const prefs: FormPreferences = {};
  if (isFormSize(record.size)) prefs.size = record.size;
  if (isLayoutMode(record.layoutMode)) prefs.layoutMode = record.layoutMode;
  if (isSortMode(record.sortMode)) prefs.sortMode = record.sortMode;
  return prefs;
}

// writePreferences persists the record as JSON, swallowing localStorage errors
// (quota exceeded / storage disabled). Like reads, persistence is best-effort:
// failing to save a display preference must never break the form.
export function writePreferences(storageKey: string, prefs: FormPreferences): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(prefs));
  } catch {
    // Best-effort persistence; ignore storage failures.
  }
}
