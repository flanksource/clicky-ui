import { cn } from "../lib/utils";
import { inputSizeClass, type FormSize } from "./json-schema-form-size";
import type {
  FieldControl,
  FieldOption,
  GridColumns,
  JsonSchemaProperty,
} from "./json-schema-form-types";

// Non-size styling shared by every text-like input box; the size token supplies
// height, horizontal padding, and text size (see inputSizeClass).
const INPUT_BASE =
  "w-full min-w-0 rounded-md border border-input bg-background text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring";

export function inputClass(size: FormSize): string {
  return cn(INPUT_BASE, inputSizeClass[size]);
}

// fieldInputId derives a control's DOM id from its JSON-pointer instance path,
// not from its leaf key: a schema that repeats a property name under two parents
// (e.g. /journalLine1/asset and /journalLine2/asset) must not produce the same
// id, or every `label[for]` binds to the first control. Path segments join with
// "-" and any other separator inside a segment collapses to "_", so "/a-b" and
// "/a/b" stay distinct.
export function fieldInputId(instancePath: string, prefix?: string): string {
  const safe = instancePath
    .split("/")
    .filter(Boolean)
    .map((token) =>
      token.replaceAll("~1", "/").replaceAll("~0", "~").replace(/[^a-zA-Z0-9_]/g, "_"),
    )
    .join("-");
  return prefix ? `jsf-${prefix}-${safe}` : `jsf-${safe}`;
}

// fieldErrorId names the element that holds a field's validation messages, so a
// control can point at it with aria-describedby.
export function fieldErrorId(fieldId: string): string {
  return `${fieldId}-error`;
}

// fieldAriaProps is the assistive-technology half of a control: the visual `*`
// and red message mean nothing to a screen reader on their own, so every
// editable control spreads these onto its input element.
export function fieldAriaProps(
  field: FieldControl,
  fieldId: string,
): {
  "aria-required"?: true;
  "aria-invalid"?: true;
  "aria-describedby"?: string;
} {
  return {
    ...(field.required ? { "aria-required": true as const } : {}),
    ...(field.invalid ? { "aria-invalid": true as const, "aria-describedby": fieldErrorId(fieldId) } : {}),
  };
}

// comboboxAriaProps is the fieldAriaProps equivalent for Combobox, which takes
// the same state as named props rather than raw aria-* attributes.
export function comboboxAriaProps(
  field: FieldControl,
  fieldId: string,
): { ariaRequired?: true; invalid?: true; describedBy?: string } {
  return {
    ...(field.required ? { ariaRequired: true as const } : {}),
    ...(field.invalid ? { invalid: true as const, describedBy: fieldErrorId(fieldId) } : {}),
  };
}

export function defaultPlaceholder(schema: JsonSchemaProperty): string {
  if (schema.default != null && typeof schema.default !== "object") return String(schema.default);
  return "";
}

export function toText(value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "object") return "";
  return String(value);
}

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// hasObjectItemProperties reports whether an array's items are objects with a
// fixed `properties` set — the precondition for both the column-per-property
// table and the summary-row accordion, which need to know the item's shape.
export function hasObjectItemProperties(
  items: JsonSchemaProperty | undefined,
): boolean {
  return (
    !!items && !!items.properties && Object.keys(items.properties).length > 0
  );
}

// Object-level `x-columns`: how many equal columns to split a stacked object
// into. "auto" fits as many as the width allows. A number is clamped to [1, 12]
// (a standard 12-track grid, so a 3-across row of span-4 fields and a 4-across
// row of span-3 fields share one object); anything invalid is a single column.
export function normalizeColumns(value: unknown): GridColumns {
  if (value === "auto") return "auto";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.trunc(n), 12);
}

// Per-field `x-col-span`: how many of the object's columns a field occupies.
// "full" spans the whole row. Under `x-columns: "auto"` a numeric span cannot be
// clamped against a track count that only exists at layout time, so it is capped
// at the 12-track maximum instead. Invalid falls back to 1.
export function normalizeColSpan(
  value: unknown,
  columns: GridColumns,
): number | "full" {
  if (value === "full") return "full";
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(Math.trunc(n), columns === "auto" ? 12 : columns);
}

// The `x-columns: "auto"` column floor: wide enough for a labelled control to
// stay readable, narrow enough that a 1440px pane gets three columns, not two.
export const DEFAULT_COLUMN_MIN_WIDTH = "15rem";

// cssLength guards a schema-supplied CSS length before it reaches an inline
// style. Non-strings (and the empty string) fall back rather than emitting a
// declaration the browser will drop.
export function cssLength(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

// duplicateIndex copies the item at `index` and inserts the copy after it.
// Plain objects and arrays are cloned one level deep so editing the copy cannot
// write through to the original.
export function duplicateIndex<T>(items: T[], index: number): T[] {
  const source = items[index];
  const copy = Array.isArray(source)
    ? ([...source] as T)
    : isPlainObject(source)
      ? ({ ...source } as T)
      : source;
  const next = [...items];
  next.splice(index + 1, 0, copy as T);
  return next;
}

// withSyntheticValue prepends the current value as an option when it is not in
// the enum, so an out-of-enum value (e.g. a template token) still displays.
export function withSyntheticValue(options: FieldOption[], value: string): FieldOption[] {
  if (!value || options.some((o) => o.value === value)) return options;
  return [{ value, label: value }, ...options];
}

// keyPickerOptions narrows the map-key enum to keys not already used by another
// entry, while always keeping this row's current key so it stays selectable.
export function keyPickerOptions(
  options: FieldOption[],
  usedKeys: string[],
  currentKey: string,
): FieldOption[] {
  const taken = new Set(usedKeys.filter((k) => k !== currentKey));
  return options.filter((o) => !taken.has(o.value));
}

// matchesFieldFilter reports whether a property should stay visible under the
// display-options field filter: a case-insensitive substring match against the
// field's key and its display label (`title` when set, otherwise the key). A
// blank filter matches everything, so an empty box never hides fields.
export function matchesFieldFilter(
  key: string,
  prop: JsonSchemaProperty,
  filter: string,
): boolean {
  const query = filter.trim().toLowerCase();
  if (!query) return true;
  const label = typeof prop.title === "string" && prop.title ? prop.title : key;
  return key.toLowerCase().includes(query) || label.toLowerCase().includes(query);
}

// orderByXOrder reorders property entries by the schema's `x-order` hint: keys
// named there render first (in that order), the rest keep document order. A
// missing/empty hint is a no-op, so document order remains the default.
export function orderByXOrder<T>(entries: [string, T][], order: unknown): [string, T][] {
  if (!Array.isArray(order) || order.length === 0) return entries;
  const rank = new Map(
    order.filter((k): k is string => typeof k === "string").map((k, i) => [k, i]),
  );
  const listed = entries
    .filter(([key]) => rank.has(key))
    .sort((a, b) => rank.get(a[0])! - rank.get(b[0])!);
  const rest = entries.filter(([key]) => !rank.has(key));
  return [...listed, ...rest];
}

// orderByClickyOrder stably sorts property entries by each property's numeric
// `x-clicky-order` (lower first); entries without it keep their incoming order
// after the ordered ones. An explicit index tie-break keeps it stable regardless
// of the engine's sort stability. Unlike the object-level `x-order` array, this
// composes across merged if/then branches because each property carries its own
// order — the right tool when fields come from different (embedded) sources.
export function orderByClickyOrder(
  entries: [string, JsonSchemaProperty][],
): [string, JsonSchemaProperty][] {
  const rank = (prop: JsonSchemaProperty): number => {
    const o = prop["x-clicky-order"];
    return typeof o === "number" ? o : Number.POSITIVE_INFINITY;
  };
  return entries
    .map((entry, index) => ({ entry, index, rank: rank(entry[1]) }))
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map((ranked) => ranked.entry);
}

// orderRequiredFirst stably partitions property entries so the keys named in
// `required` come first (in their original order), then the rest (in theirs).
// A stable two-pass partition, so it never reshuffles within either group.
export function orderRequiredFirst<T>(
  entries: [string, T][],
  required: string[],
): [string, T][] {
  const isRequired = new Set(required);
  const head = entries.filter(([key]) => isRequired.has(key));
  const tail = entries.filter(([key]) => !isRequired.has(key));
  return [...head, ...tail];
}

// isEmptyValue reports whether a field's value carries no data, so priority
// sorting can sink unfilled fields. Empty = undefined/null/"" plus empty arrays
// and empty plain objects; `false` and `0` count as filled (they are choices).
export function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}

// orderByPriority sorts property entries so the fields that matter most surface
// first, ranking each by a score: +2 if required, +1 if its value is non-empty.
// Required-and-filled lead, then required-and-empty, then optional-and-filled,
// then optional-and-empty. Ties keep their incoming order (explicit index
// tie-break, so it does not depend on the engine's sort stability).
export function orderByPriority<T>(
  entries: [string, T][],
  required: string[],
  values: Record<string, unknown>,
): [string, T][] {
  const isRequired = new Set(required);
  const score = (key: string): number =>
    (isRequired.has(key) ? 2 : 0) + (isEmptyValue(values[key]) ? 0 : 1);
  return entries
    .map((entry, index) => ({ entry, index, score: score(entry[0]) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map((ranked) => ranked.entry);
}

// softError computes a display-only validation hint. It never blocks onChange.
// Consumers suppress the unknown-enum hint by setting allowCustomValue.
export function softError(field: FieldControl): string | undefined {
  const v = field.value;
  const isEmpty = v === undefined || v === null || v === "";
  if (field.required && isEmpty) return "Required";

  if (field.kind === "number" && typeof field.minimum === "number" && typeof v === "number") {
    if (v < field.minimum) return `Must be ≥ ${field.minimum}`;
  }

  if (field.kind === "enum" && !field.allowCustomValue && !isEmpty) {
    const known = (field.options ?? []).some((o) => o.value === String(v));
    if (!known) return "Unknown value (allowed)";
  }
  return undefined;
}

// Immutable array helpers used by the array control.
export function setIndex<T>(arr: T[], i: number, v: T): T[] {
  return arr.map((x, idx) => (idx === i ? v : x));
}

export function removeIndex<T>(arr: T[], i: number): T[] {
  return arr.filter((_, idx) => idx !== i);
}

export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length) return arr;
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved as T);
  return next;
}

// seedFromSchema produces the initial value for a freshly-added array item or
// object field, honouring an explicit default.
export function seedFromSchema(schema: JsonSchemaProperty): unknown {
  if (schema.default !== undefined) return schema.default;
  const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;
  if (type === "array") return [];
  if (type === "object") return {};
  if (type === "boolean") return false;
  // Numbers seed as "" so the soft Required hint can show without coercion
  // surprises; the number control coerces on first real input.
  return "";
}
