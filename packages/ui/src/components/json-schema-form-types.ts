import type { ReactNode } from "react";

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
  minimum?: number;
  maximum?: number;
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  // false = closed object; true = open; sub-schema = open string/typed map.
  additionalProperties?: boolean | JsonSchemaProperty;
  allOf?: JsonSchemaConditional[];
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

export interface JsonSchemaConditional {
  if?: JsonSchemaProperty;
  then?: JsonSchemaProperty;
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
  | "string-map"
  | "array"
  | "object";

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

  // enum
  options?: FieldOption[];
  // Generic free-text-allowed flag (the consumer's escape hatch for tokens /
  // values outside the enum). Never inferred from value syntax.
  allowCustomValue?: boolean;

  // adornment hints (set by pre-extensions)
  badge?: string;
  helper?: string;

  // number
  minimum?: number;
  // When true (default for number), a clean numeric string is emitted as a
  // Number; otherwise the raw string is preserved. Consumers set false to keep
  // non-numeric values (e.g. template tokens) intact.
  coerceNumber?: boolean;

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
  /** Property keys to omit from rendering. */
  hiddenKeys?: string[];
  title?: string;
  pre?: PreExtension[];
  post?: PostExtension[];
}
