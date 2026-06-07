import type { ReactNode } from "react";
import type { LabelIconSpec } from "../data/Icon";

// JsonSchemaProperty is the subset of JSON Schema (2020-12) the form reads. It
// is intentionally permissive: unknown keywords are ignored, and consumers may
// stamp arbitrary extension keys (read by their own extension functions).
export interface JsonSchemaProperty {
  type?: JsonSchemaType | JsonSchemaType[];
  description?: string;
  title?: string;
  enum?: unknown[];
  const?: unknown;
  default?: unknown;
  // Standard JSON Schema string format. `date`/`date-time` drive a date control.
  format?: string;
  // Standard JSON Schema 2020-12 keyword. When true the form renders the field
  // as a read-only value display (no input), or omits it under hideReadOnlyFields.
  readOnly?: boolean;
  minimum?: number;
  maximum?: number;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  // false = closed object; true = open; sub-schema = open string/typed map.
  additionalProperties?: boolean | JsonSchemaProperty;
  allOf?: JsonSchemaConditional[];
  // Union branches. The form does not validate against them, but it does mine
  // them for an `enum` branch so a value-or-template union (a string whose
  // anyOf carries one enum branch plus free-form branches) still renders as a
  // dropdown rather than a bare text input.
  anyOf?: JsonSchemaProperty[];
  oneOf?: JsonSchemaProperty[];
  if?: JsonSchemaProperty;
  then?: JsonSchemaProperty;
  else?: JsonSchemaProperty;
  // Consumer extension keys pass through untouched.
  [key: string]: unknown;
}

export type JsonSchemaType =
  | "object"
  | "array"
  | "string"
  | "integer"
  | "number"
  | "boolean"
  | "null";

// An `allOf` member is either a conditional (if/then) or an unconditional
// composition member that contributes its own `properties`/`required` — the
// latter is what an inlined `$ref` (a flattened component schema) collapses to.
export interface JsonSchemaConditional {
  if?: JsonSchemaProperty;
  then?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
}

// JsonSchemaObject is the flat object subschema the form renders — one control
// per entry in `properties`, plus any `then.properties` merged in by matching
// `allOf` if/then clauses against the current value.
export interface JsonSchemaObject extends JsonSchemaProperty {
  type?: "object";
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | JsonSchemaProperty;
  allOf?: JsonSchemaConditional[];
}

export type FieldControlKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  | "date"
  | "string-map"
  | "array"
  | "object";

// How an enum control renders. "combobox" (default) is the searchable dropdown;
// "radio" is a segmented radio-button group for small, fixed option sets.
export type EnumDisplay = "combobox" | "radio";

// FieldControl is the resolved, render-ready descriptor for one property. The
// orchestrator infers a base control from the schema, then lets pre-extensions
// transform it. `value`/`onChange` are carried here so post-extension adornments
// (e.g. an insert-snippet button) can read and mutate the field.
export interface FieldControl {
  key: string;
  kind: FieldControlKind;
  label: string;
  description?: string;
  required: boolean;
  schema: JsonSchemaProperty;
  value: unknown;
  onChange: (next: unknown) => void;

  // Resolved from the schema's standard `readOnly` keyword. A read-only field
  // renders as a value display (no input) regardless of the form-level readOnly
  // prop, and is dropped entirely when the form sets hideReadOnlyFields. A
  // pre-extension may set or clear it.
  readOnly?: boolean;

  // Leading glyph for the label, lifted from the schema's `x-icon` extension.
  labelIcon?: LabelIconSpec;

  // enum
  options?: FieldOption[];
  // Generic free-text-allowed flag (the consumer's escape hatch for tokens /
  // values outside the enum). Never inferred from value syntax.
  allowCustomValue?: boolean;
  // Enum presentation. Defaults to "combobox" when unset. A pre-extension sets
  // "radio" to render a small fixed option set as segmented radio buttons.
  display?: EnumDisplay;

  // adornment hints (set by pre-extensions)
  badge?: string;
  helper?: string;

  // number
  minimum?: number;
  // When true (default for number), a clean numeric string is emitted as a
  // Number; otherwise the raw string is preserved. Consumers set false to keep
  // non-numeric values (e.g. template tokens) intact.
  coerceNumber?: boolean;

  // date — which JSON Schema format produced this control: "date" (date only)
  // or "date-time" (date + time).
  dateFormat?: "date" | "date-time";

  // string-map
  valueSchema?: JsonSchemaProperty;
  knownProperties?: Record<string, JsonSchemaProperty>;
  allowExtraKeys?: boolean;

  // array — the schema each item is rendered against (recursively).
  itemSchema?: JsonSchemaProperty;

  // object — a nested structured sub-form (its own properties + required).
  objectProperties?: Record<string, JsonSchemaProperty>;
  objectRequired?: string[];
}

export interface FieldOption {
  value: string;
  label: string;
}

// PreExtension transforms a resolved control before it renders, or returns null
// to drop the field. Composed in array order; each sees the prior's output.
export type PreExtension = (
  field: FieldControl,
  ctx: { key: string; prop: JsonSchemaProperty; value: unknown },
) => FieldControl | null;

// PostExtension wraps the rendered label/value nodes (e.g. add a button beside
// the value, or helper text under the label). Composed in array order.
export type PostExtension = (
  field: FieldControl,
  nodes: { label: ReactNode; value: ReactNode },
) => { label: ReactNode; value: ReactNode };

export interface JsonSchemaFormProps {
  schema: JsonSchemaObject;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  readOnly?: boolean;
  /** Inline 2-column label/field layout; stacked when false (default). */
  inline?: boolean;
  /**
   * Omit fields whose schema declares `readOnly: true` entirely, instead of
   * rendering them as read-only value displays. Applies at every depth.
   */
  hideReadOnlyFields?: boolean;
  /** Property keys to omit from rendering. */
  hiddenKeys?: string[];
  /**
   * Render required fields before optional ones at every object level. The sort
   * is stable: required keys keep their relative order, then optional keys keep
   * theirs. Defaults to false (schema property order is preserved).
   */
  requiredFirst?: boolean;
  title?: string;
  pre?: PreExtension[];
  post?: PostExtension[];
}
