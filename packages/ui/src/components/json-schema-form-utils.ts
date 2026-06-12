import { cn } from "../lib/utils";
import { inputSizeClass, type FormSize } from "./json-schema-form-size";
import type { FieldControl, FieldOption, JsonSchemaProperty } from "./json-schema-form-types";

// Non-size styling shared by every text-like input box; the size token supplies
// height, horizontal padding, and text size (see inputSizeClass).
const INPUT_BASE =
  "w-full min-w-0 rounded-md border border-input bg-background text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring";

export function inputClass(size: FormSize): string {
  return cn(INPUT_BASE, inputSizeClass[size]);
}

export function fieldInputId(key: string, prefix?: string): string {
  const safe = key.replace(/[^a-zA-Z0-9_-]/g, "_");
  return prefix ? `jsf-${prefix}-${safe}` : `jsf-${safe}`;
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
