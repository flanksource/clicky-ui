import type { ReactNode } from "react";
import type { LabelIconSpec } from "../data/Icon";
import type { FormSize } from "./json-schema-form-size";

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
  // Per-key-pattern value schemas: each entry whose key matches the regex is
  // typed by its sub-schema. Lets a keyed map render a different value form per
  // key (e.g. House vs Apartment), the standard JSON-Schema way to vary a map
  // value by its key.
  patternProperties?: Record<string, JsonSchemaProperty>;
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
  // Explicit property render order for an object: listed keys render first (in
  // this order), unlisted keys keep document order after them. Lets emitters
  // whose serializer alphabetizes maps (e.g. Go) state the intended UX order.
  "x-order"?: string[];
  // Human label per enum value ({ "20": "Business" }); the option renders as
  // "Business (20)" while the raw value is what's stored.
  "x-enum-labels"?: Record<string, string>;
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
  // Per-key-pattern value schemas (from the schema's `patternProperties`): the
  // first whose regex matches an entry key types that entry's value, falling
  // back to `valueSchema`. Lets the value form vary by key.
  valuePatternSchemas?: { pattern: string; schema: JsonSchemaProperty }[];
  knownProperties?: Record<string, JsonSchemaProperty>;
  allowExtraKeys?: boolean;
  // Strict enum options for the map key, resolved from the schema's
  // `propertyNames.enum`. When set, extra keys render as a picker limited to
  // these options (no free-text); unset keeps the free-text key input.
  keyOptions?: FieldOption[];

  // Per-field layout override, resolved from the schema's `x-layout` extension.
  // "inline"/"stack" force the field's subtree into that FormLayout mode;
  // "table" renders an array (or string-map) as compact rows with column
  // headers. Takes precedence over the form-level layout.
  layout?: "inline" | "stack" | "table";

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

// FieldArgs is the raw input for rendering one field: the property key/schema,
// whether it is required, and the current value + committer.
export interface FieldArgs {
  key: string;
  prop: JsonSchemaProperty;
  required: boolean;
  value: unknown;
  onChange: (next: unknown) => void;
}

// RenderApi is the recursive render pipeline, injected into RenderContext so
// container controls (array/object/map) can descend without importing the
// renderer module — keeping the module graph one-directional (controls never
// import the renderer), which Vite HMR needs to hot-apply edits instead of
// falling back to full page reloads.
export interface RenderApi {
  renderFieldNodes(args: FieldArgs, ctx: RenderContext): { label: ReactNode; value: ReactNode } | null;
  renderFieldRow(args: FieldArgs, ctx: RenderContext, opts?: { labelOverride?: string }): ReactNode | null;
  renderObjectFields(
    schema: JsonSchemaObject,
    value: Record<string, unknown>,
    onChange: (next: Record<string, unknown>) => void,
    ctx: RenderContext,
    opts?: { hiddenKeys?: string[] },
  ): ReactNode[];
}

// RenderContext carries everything the recursive renderer needs to descend into
// array items and object/map values: readOnly/inline layout, the consumer's
// pre/post extension stacks (so they apply at EVERY depth, not just the top
// level), and the current depth (for keys/labels).
export interface RenderContext {
  readOnly: boolean;
  // Drop fields whose resolved control is read-only (schema `readOnly: true`)
  // instead of rendering them as value displays. Applies at every depth.
  hideReadOnlyFields: boolean;
  // Resolved form layout (mode + inline width caps); see FormLayout.
  layout: FormLayout;
  // Form-wide size token scaling inputs and labels; see FormSize.
  size: FormSize;
  // Optional namespace for generated input ids, so multiple forms on one page
  // don't collide on duplicate ids (which would break label/input focus).
  idPrefix?: string;
  // requiredFirst stably reorders each object level so required fields render
  // before optional ones (see JsonSchemaFormProps.requiredFirst).
  requiredFirst: boolean;
  pre: PreExtension[];
  post: PostExtension[];
  depth: number;
  // The recursion entry points (see RenderApi).
  render: RenderApi;
}

// FormLayout describes how a form arranges each field's label and value. It is
// resolved once at the top level and threaded through every depth via
// RenderContext, so width caps apply uniformly to nested objects and array items.
export interface FormLayout {
  /** "inline" = 2-column label/value; "stacked" = label above value. */
  mode: "inline" | "stacked";
  /**
   * Inline only: the label column shrinks to fit its widest label and is capped
   * at this width, truncating longer labels with an ellipsis. Default "40ch".
   */
  labelMaxWidth?: string;
  /**
   * Max width of the value column (inline) or the whole label+value stack
   * (stacked), as a CSS length. Default "600px". Keeps controls readable on
   * wide viewports instead of stretching edge to edge.
   */
  valueMaxWidth?: string;
}

export interface JsonSchemaFormProps {
  schema: JsonSchemaObject;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  readOnly?: boolean;
  /**
   * Shorthand for `layout: { mode: "inline" }` (2-column label/value); stacked
   * when false (default). Ignored when `layout` is provided.
   */
  inline?: boolean;
  /**
   * Form-level layout. Takes precedence over `inline`. Inline mode shrinks the
   * label column to fit (capped/truncated at 40ch) and caps the value column at
   * 600px.
   */
  layout?: FormLayout;
  /**
   * Scales every input and label form-wide. One of "xs" | "sm" | "md" | "lg" |
   * "xl"; defaults to "md" (the original fixed sizing). Applies at every depth.
   */
  size?: FormSize;
  /**
   * Namespaces generated input/label ids (`jsf-<idPrefix>-<key>`). Set this when
   * more than one form renders on the same page so their ids don't collide,
   * which would otherwise break label/input focus association.
   */
  idPrefix?: string;
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
  /**
   * Show the top-right three-dot display-options menu (size + layout mode).
   * Defaults to true. The menu controls only this form's appearance — never
   * global page density or field values. When false the form renders exactly as
   * before and performs no preference reads/writes.
   */
  showPreferencesMenu?: boolean;
  /**
   * Persist menu selections to localStorage so they survive remounts. Defaults
   * to true. When false the menu still adjusts the current instance, but nothing
   * is read from or written to localStorage.
   */
  persistPreferences?: boolean;
  /**
   * localStorage key the display preferences are stored under. Defaults to a
   * shared key, so by default every form shares one set of preferences; pass a
   * distinct key to isolate a screen or form.
   */
  preferencesStorageKey?: string;
}
