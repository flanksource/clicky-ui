import type { ReactNode } from "react";
import type { LabelIconSpec } from "../data/Icon";
import type { FieldTone } from "./json-schema-form-tone";
import type { MdxEditorPluginOptions } from "./mdx-editor-options";
import type { LookupDescriptor } from "./json-schema-form-runtime-types";

export type { FieldTone };
export type * from "./json-schema-form-runtime-types";

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
  // Standard JSON Schema step. Its presence opts a number field into a native
  // `<input type="number">` (with step/min/max) instead of the token-friendly
  // text input.
  multipleOf?: number;
  items?: JsonSchemaProperty;
  // Standard JSON Schema array bounds. The form treats them as the limits they
  // are: it stops offering "add" at maxItems and stops offering per-item
  // "remove" at minItems, so an array whose length the producer owns (a fixed
  // pair of journal lines, say) cannot be lengthened or shortened in the form
  // while its cells stay editable.
  minItems?: number;
  maxItems?: number;
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
  // Icon (runtime name resolved by the fallback provider) per enum value
  // ({ "postgres": "postgres" }). Presence flips the enum control to a
  // selectable icon grid unless x-enum-display says otherwise.
  "x-enum-icons"?: Record<string, string>;
  // Secondary descriptive line per enum value ({ "plan": "No tool execution" }).
  // Used by the "segmented" (and grid) display to render descriptive cards.
  "x-enum-descriptions"?: Record<string, string>;
  // Hue per enum value ({ "list": "indigo" }), from the closed FieldTone
  // vocabulary. Purely decorative — unlike x-enum-icons it does NOT change which
  // enum control renders. Consumed by displays that colour a value, e.g. the
  // accordion array's leading glyph.
  "x-enum-tones"?: Record<string, FieldTone>;
  // Force the enum presentation: "combobox" (default), "radio", "grid", or
  // "segmented".
  "x-enum-display"?: EnumDisplay;
  // Force an array's presentation. "filter-pills" renders each enum item as a
  // compact toggle (an empty stored array means all options); "accordion" and
  // "cards" render object items as summary rows or titled cards, both reading
  // `x-item` for the summary; "list" renders scalar values as compact editable
  // list items. Object items default to the accordion, so this is only needed to
  // say "cards" or to opt out with "stacked".
  "x-array-display"?: ArrayDisplay;
  // Force how this field's description is presented, overriding the form-level
  // `FormLayout.help`. Defaults to "inline" (a paragraph under the control).
  "x-help-display"?: HelpDisplay;
  // Array-level: how to summarize one item in a collapsed accordion row. Every
  // value names a property of the item. See ArrayItemSpec.
  "x-item"?: ArrayItemSpec;
  // Render a bounded number (needs `maximum`) as a single-thumb slider with a
  // progress-filled track instead of a numeric input.
  "x-number-display"?: "slider";
  // Per-property render order: lower values sort first, properties without it
  // keep document order after the ordered ones. Composes across merged if/then
  // branches (each field carries its own order), unlike the object-level
  // `x-order` array.
  "x-clicky-order"?: number;
  // Options passed to the MDXEditor-backed markdown field when `format: "md"`.
  "x-md-editor"?: MdxEditorPluginOptions;
  // Optional inline help metadata emitted by CLI/schema generators. The form
  // renders `body` together with `description` as helper text.
  "x-help"?: JsonSchemaHelpBlock;
  // Presentation extensions (all optional, additive). Extra classes merged onto
  // the field's label / input; text or runtime-icon-name adornments rendered
  // inside the input; label stacked on top vs. inline; and a grid column span
  // (honoured when the enclosing object sets `x-columns`).
  "x-label-classes"?: string;
  "x-input-classes"?: string;
  "x-input-prefix"?: string;
  "x-input-suffix"?: string;
  "x-input-prefix-icon"?: string;
  "x-input-suffix-icon"?: string;
  "x-label-position"?: "top" | "left";
  // How many of the object's columns this field occupies. "full" spans the whole
  // row — the only meaningful answer under `x-columns: "auto"`, where the track
  // count is not known when the schema is written.
  "x-col-span"?: number | "full";
  // Object-level: lay this object's fields out in N equal columns (stacked
  // layout). Fields span one column unless they set `x-col-span`. "auto" fills
  // as many equal columns as the container width allows, at `x-column-min-width`
  // each — so a wide viewport gains columns instead of stretching one.
  "x-columns"?: GridColumns;
  // Object-level, `x-columns: "auto"` only: the minimum width of one column, as
  // a CSS length (default "15rem"), and an optional cap on the whole grid. Both
  // are lengths rather than classes because a class inside a JSON schema is data
  // no Tailwind scanner ever reads.
  "x-column-min-width"?: string;
  "x-columns-max-width"?: string;
  // Object-level: extra classes merged onto the object's fields-grid container,
  // e.g. `"gap-2"` to set the section's row/column gap, or padding/background.
  "x-classes"?: string;
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
// An unconditional member is a full subschema, so it can also carry the standard
// subschema fields a flattened `$ref` keeps (e.g. `additionalProperties`,
// `description`).
export interface JsonSchemaConditional {
  if?: JsonSchemaProperty;
  then?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean | JsonSchemaProperty;
  description?: string;
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
  // Names a property whose value selects a "kind" (e.g. connection `type`). When
  // set, the form renders that property first as a picker; once chosen it shows
  // the matched branch's fields (the picker collapses to a compact header with a
  // "change" affordance). Drives the two-phase connection form.
  "x-discriminator"?: string;
}

export type FieldControlKind =
  | "string"
  | "number"
  | "boolean"
  | "enum"
  // An async entity-reference picker resolved from `x-clicky-lookup`: a searchable
  // dropdown whose options are fetched lazily from another entity's list endpoint.
  | "lookup"
  | "date"
  | "string-map"
  | "array"
  | "object"
  // A multi-line text box (a long-form string). Resolved from `format: textarea`
  // or set by a consumer pre-extension.
  | "textarea"
  // An MDXEditor-backed rich markdown editor. Resolved from `format: md`.
  | "markdown"
  // A static, non-editable presentation element (a heading, a block of info
  // text, a horizontal divider, or an empty spacer) — carries no input. Used for
  // schema fields that label/structure a form rather than collect a value.
  | "display"
  // A read-only external hyperlink.
  | "link";

// How a display control renders (FieldControl.displayVariant): a bold section
// "heading", a muted block of "text", a horizontal "divider", or an empty
// "spacer" gap.
export type DisplayVariant = "heading" | "text" | "divider" | "spacer";

// How an enum control renders. "combobox" (default) is the searchable dropdown;
// "radio" is a segmented radio-button group for small, fixed option sets; "grid"
// is a filterable grid of selectable icon cards (for enums with x-enum-icons);
// "segmented" renders the shared SegmentedControl (icons, and large descriptive
// cards when x-enum-descriptions is present).
export type EnumDisplay = "combobox" | "radio" | "grid" | "segmented";

// How many columns a stacked object's fields flow into: a fixed count, or
// "auto" to fit as many as the container width allows.
export type GridColumns = number | "auto";

// How a field's description reaches the reader. "inline" is a permanent
// paragraph under the control (the default, and what every form does today);
// "hover" moves it behind a `?` beside the label, costing no vertical space.
export type HelpDisplay = "inline" | "hover";

// The scalar an array's items hold, when they hold one. A list of scalars is a
// tag list: type a value, get a pill — whatever the type. Integer/number lists
// commit numbers, so the control converts on the way in and out.
export type ScalarItemType = "string" | "integer" | "number";

// How an array control renders. "filter-pills" needs enum item options;
// "accordion" and "cards" both need object items and both read `x-item` — the
// accordion collapses every item to one line and opens one at a time, cards
// keep every item open under a titled, hue-edged header. An object-item array
// renders as an accordion without being asked; "stacked" is the opt-out back to
// one full sub-form per item, labelled *Item N*.
export type ArrayDisplay = "filter-pills" | "accordion" | "cards" | "stacked" | "list";

// A per-item editing action an object-array row can offer. "reorder" covers both
// the up and the down button — a list where only one direction moved would be a
// list you cannot put back.
export type ArrayItemAction = "reorder" | "duplicate" | "remove";

// ArrayItemSpec is the `x-item` extension on an ARRAY schema: it says how to
// summarize one element of this list in a collapsed row. Every value names a
// property of the item — the library never learns what the item *is*, so the
// consumer keeps ownership of its domain. It lives on the array rather than on
// `items` because one item schema (often a shared $ref) may be summarized
// differently by each array that uses it.
export interface ArrayItemSpec {
  /** Property keys tried in order; the first with a non-empty value is the row title. */
  title?: string[];
  /** Title used when every `title` candidate is empty. Defaults to `Item <n>`. */
  fallback?: string;
  /** The monospace trailing line, joined with " · ". */
  summary?: Array<string | ArrayItemSummaryPart>;
  /** Enum property supplying the leading glyph's icon and tone. */
  glyph?: string;
  /** Enum property supplying a secondary chip. */
  badge?: string;
  /** Boolean property rendered as the required mark. */
  flag?: string;
  /**
   * Which per-item actions the rows offer. Omit for all of them (the default);
   * `[]` for a list that can only be read and reordered by no one.
   */
  actions?: ArrayItemAction[];
  /** Noun for the add row ("Add parameter"). Defaults to `items.title`, then "item". */
  noun?: string;
  /** Plural for the count line ("4 parameters"). Defaults to the array title, then "items". */
  nounPlural?: string;
  /** Copy shown by the add row at zero items. Defaults to the array's own description. */
  empty?: string;
}

// One part of the summary line. `pattern` wraps the value, with a single literal
// `{}` marking where it goes — the whole mechanism by which copy like
// `{{.params.<name>}}` stays the consumer's rather than the library's.
export interface ArrayItemSummaryPart {
  property: string;
  pattern?: string;
}

// ArrayItemSummary is the derived, render-ready description of one collapsed
// row. A PreExtension may supply it directly via FieldControl.itemSummary to
// bypass `x-item` entirely.
export interface ArrayItemSummary {
  title: string;
  summary?: string;
  glyph?: { icon?: LabelIconSpec; tone: FieldTone; label?: string };
  badge?: { icon?: LabelIconSpec; label: string };
  flagged?: boolean;
}

export interface JsonSchemaHelpBlock {
  source?: string;
  section?: string;
  body?: string;
}

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

  // True when the form was given a validation error at this field's instance
  // path. Set by the renderer, not by resolveControl, and consumed only through
  // fieldAriaProps so the control announces itself as invalid and points at its
  // own error text.
  invalid?: boolean;

  // Leading glyph for the label, lifted from the schema's `x-icon` extension.
  labelIcon?: LabelIconSpec;

  // Extra classes merged onto the field's <label> / input element, lifted from
  // the schema's `x-label-classes` / `x-input-classes` extensions.
  labelClassName?: string;
  inputClassName?: string;

  // Grid column span for a multi-column object layout, from `x-col-span`. Only
  // honoured when the enclosing object sets `x-columns` > 1 (stacked layout);
  // otherwise ignored.
  // Resolved `x-col-span`. "full" both spans the whole grid row and lifts the
  // stacked value-width cap — a field given the full row is asking to use it.
  colSpan?: number | "full";

  // enum
  options?: FieldOption[];
  // Generic free-text-allowed flag (the consumer's escape hatch for tokens /
  // values outside the enum). Never inferred from value syntax.
  allowCustomValue?: boolean;

  // lookup — the async entity-reference descriptor, resolved from the schema's
  // `x-clicky-lookup` extension. Drives the LookupControl, which fetches options
  // lazily via the form's LookupFetcher.
  lookup?: LookupDescriptor;
  // lookup — true while options are being fetched (drives the combobox spinner).
  loading?: boolean;
  // Enum presentation. Defaults to "combobox" when unset. A pre-extension sets
  // "radio" to render a small fixed option set as segmented radio buttons.
  display?: EnumDisplay;

  // Resolved `x-help-display`. Overrides the form-level FormLayout.help for this
  // field only. Unset defers to the form.
  helpDisplay?: HelpDisplay;

  // adornment hints (set by pre-extensions)
  badge?: string;
  helper?: string;
  // Generic trailing in-field adornment. When set, the control renders this node
  // inside the input's wrapper (before any built-in trailing controls such as a
  // combobox chevron or date calendar button), positioned absolutely at the
  // right. The wrapper carries `data-jsf-control` so the adornment can locate its
  // sibling `input[data-jsf-input]` (e.g. for caret-aware text insertion). Set by
  // a pre-extension; clicky-ui only positions it — the consumer owns the node.
  suffix?: ReactNode;
  // Generic leading in-field adornment — the left-edge mirror of `suffix`. When
  // set, the control renders this node inside the input's wrapper, positioned
  // absolutely at the left, and reserves left padding so it never overlaps the
  // text. The wrapper carries `data-jsf-control` so the adornment can locate its
  // sibling `input[data-jsf-input]`. Set by a pre-extension; clicky-ui only
  // positions it — the consumer owns the node.
  prefix?: ReactNode;

  // number
  minimum?: number;
  // When true (default for number), a clean numeric string is emitted as a
  // Number; otherwise the raw string is preserved. Consumers set false to keep
  // non-numeric values (e.g. template tokens) intact.
  coerceNumber?: boolean;
  // A static trailing unit rendered inside a number input (e.g. "%"). Display
  // only — never part of the committed value. Resolved from `format: percent` or
  // set by a consumer pre-extension.
  unit?: string;

  // display — which static element to render (no input). See DisplayVariant.
  displayVariant?: DisplayVariant;

  // link — the href for a read-only external link control. When unset, a value
  // that looks like an absolute URL is used as the href.
  href?: string;

  // date — which JSON Schema format produced this control: "date" (date only)
  // or "date-time" (date + time).
  dateFormat?: "date" | "date-time";

  // markdown — typed MDXEditor plugin/toolbar options, resolved from the
  // schema's `x-md-editor` extension.
  markdownOptions?: MdxEditorPluginOptions;

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
  // array — resolved minItems/maxItems. Gate "add" and per-item "remove"; they
  // are not validation, and an array already outside its bounds is left alone
  // rather than trapped.
  minItems?: number;
  maxItems?: number;
  // array — optional presentation override resolved from x-array-display.
  arrayDisplay?: ArrayDisplay;
  // array — resolved `x-item`: how to summarize one item in a collapsed row.
  itemSpec?: ArrayItemSpec;
  // array — a PreExtension-supplied summariser. Wins over `itemSpec` entirely,
  // for a consumer whose row needs more than the declarative form can say.
  itemSummary?: (args: { item: unknown; index: number }) => ArrayItemSummary;

  // object — a nested structured sub-form (its own properties + required).
  objectProperties?: Record<string, JsonSchemaProperty>;
  objectRequired?: string[];
}

export interface FieldOption {
  value: string;
  label: string;
  // Optional leading glyph (runtime icon name or a rendered node), shown by the
  // grid enum display. Resolved from the schema's x-enum-icons.
  icon?: LabelIconSpec;
  // Optional secondary description, resolved from the schema's
  // x-enum-descriptions. Shown by the segmented (card) enum display.
  description?: string;
  // Optional hue, resolved from the schema's x-enum-tones. Used where a value
  // is rendered as a coloured mark (e.g. the accordion array's item glyph).
  tone?: FieldTone;
}
