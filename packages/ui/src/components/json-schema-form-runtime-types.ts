import type { ReactNode } from "react";
import type {
  FieldInstancePath,
  FormErrorContext,
  FormErrorProps,
} from "./json-schema-form-error-types";
import type { FormSize } from "./json-schema-form-size";
import type { SortMode, LayoutMode } from "./json-schema-form-preferences";
import type {
  FieldControl,
  FieldOption,
  JsonSchemaProperty,
  JsonSchemaObject,
  HelpDisplay,
} from "./json-schema-form-types";

// LookupDescriptor is the `x-clicky-lookup` schema extension on a form field: it
// turns a string property into an async entity-reference picker. The form fetches
// options from another entity's list endpoint (the `__lookup` convention) and
// renders a searchable dropdown. Generic — any entity reference can use it.
export interface LookupDescriptor {
  // Entity list path that serves the lookup (e.g. "/api/v1/connection").
  url: string;
  // Filter key sent as `__lookup_filter`; the lookup response keys its options
  // (and the committed value) under it.
  filter: string;
  // Query-string key for the search term. Informational — the client issues the
  // standard `__lookup_q`. Defaults to "__lookup_q".
  searchParam?: string;
  // Whether multiple values may be selected. Single-select also allows free-form
  // entry (so a typed value outside the option set still commits).
  multi?: boolean;
  // Optional scoping: derive an extra query param from a sibling form field so the
  // lookup is filtered by it (e.g. a connection picker scoped to the provider type).
  scope?: LookupScope;
  // Optional hierarchy: renders the options as a browsable tree instead of a flat
  // list, splitting each option's label on any character in `delimiters` (e.g.
  // "./" turns "jms.incoming" into jms › incoming). Purely presentational — the
  // committed value is still the option's value, unsplit.
  hierarchy?: LookupHierarchy;
}

// LookupHierarchy declares how an option label encodes a hierarchy, so the
// picker can browse it rather than scroll a long flat list.
export interface LookupHierarchy {
  // Characters that separate one level from the next. Every other character is
  // an ordinary label character — declaring "." leaves "remote-debugger" whole.
  delimiters: string;
}

// LookupScope derives an extra query param for a lookup from a sibling field, so
// the option set is filtered by another part of the form's value.
export interface LookupScope {
  // Query-string key to send (e.g. "types").
  param: string;
  // Dotted path into the form's root value (e.g. "provider.type").
  from: string;
  // Maps the source value to the emitted value(s) (e.g. "sql" → [postgres, ...]).
  // When absent the source value is sent verbatim.
  map?: Record<string, string[]>;
  // Joins mapped values into the param (default ",").
  join?: string;
}

// LookupFetcher resolves the options for an `x-clicky-lookup` field. The host
// wires it (typically from the operations api client's lookup endpoint), so the
// form stays decoupled from any specific RPC client. `rootValue` lets the fetcher
// scope the lookup by sibling fields (see LookupScope).
export type LookupFetcher = (args: {
  descriptor: LookupDescriptor;
  query: string;
  rootValue?: Record<string, unknown>;
}) => Promise<FieldOption[]>;

// PreExtension transforms a resolved control before it renders, or returns null
// to drop the field. Composed in array order; each sees the prior's output.
// `ctx.rootValue` is the form's top-level value (the same object at every depth),
// so a widget can read sibling fields (e.g. a selected namespace) to scope itself.
export interface PreExtensionContext {
  key: string;
  prop: JsonSchemaProperty;
  value: unknown;
  rootValue?: Record<string, unknown>;
  onRootChange?: (next: Record<string, unknown>) => void;
}

export type PreExtension = (
  field: FieldControl,
  ctx: PreExtensionContext,
) => FieldControl | null;

// PostExtension wraps the rendered label/value nodes (e.g. add a button beside
// the value, or helper text under the label). Composed in array order. The
// optional third arg carries `rootValue` (the form's top-level value) so a
// replacement widget can read sibling fields without global state.
export interface PostExtensionContext {
  rootValue?: Record<string, unknown>;
  onRootChange?: (next: Record<string, unknown>) => void;
  /**
   * RFC 6901 pointer to the field being rendered, e.g. `/columns/3/jsonpath`.
   *
   * With `rootValue` and `onRootChange` it is what lets an extension write a
   * *sibling* of its own field — a control whose value only means something
   * paired with another one has to be able to set both, rather than rendering
   * an instruction telling the author to go and finish the job by hand.
   */
  instancePath?: string;
}

export type PostExtension = (
  field: FieldControl,
  nodes: { label: ReactNode; value: ReactNode },
  ctx?: PostExtensionContext,
) => { label: ReactNode; value: ReactNode };

// FieldArgs is the raw input for rendering one field: the property key/schema,
// whether it is required, and the current value + committer.
export interface FieldArgs extends FieldInstancePath {
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
  renderFieldNodes(
    args: FieldArgs,
    ctx: RenderContext,
  ): { label: ReactNode; value: ReactNode } | null;
  renderFieldRow(
    args: FieldArgs,
    ctx: RenderContext,
    opts?: { labelOverride?: string },
  ): ReactNode | null;
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
export interface RenderContext extends FormErrorContext {
  readOnly: boolean;
  /** Render value content only, including descendants of a properties preview. */
  presentation?: boolean;
  // Drop fields whose resolved control is read-only (schema `readOnly: true`)
  // instead of rendering them as value displays. Applies at every depth.
  hideReadOnlyFields: boolean;
  // Drop fields whose value is empty; see JsonSchemaFormProps.hideEmpty.
  hideEmpty: boolean;
  // Commit a properties-layout edit on blur instead of parking it behind a
  // tick/cross; see JsonSchemaFormProps.autoSave.
  autoSave: boolean;
  // Resolved form layout (mode + inline width caps); see FormLayout.
  layout: FormLayout;
  // Form-wide size token scaling inputs and labels; see FormSize.
  size: FormSize;
  // Optional namespace for generated input ids, so multiple forms on one page
  // don't collide on duplicate ids (which would break label/input focus).
  idPrefix?: string;
  // sortMode reorders each object level: "schema" keeps schema/x-order order,
  // "required-first" floats required fields up, "priority" floats required AND
  // non-empty fields up (see SortMode and JsonSchemaFormProps.requiredFirst).
  sortMode: SortMode;
  // Case-insensitive substring the display-options menu filters top-level fields
  // by (matched against keys, labels, and non-secret values, including nested values). Only the outermost object
  // level (depth 0) is filtered, so nested object subtrees stay intact. Unset or
  // blank shows every field.
  fieldFilter?: string;
  pre: PreExtension[];
  post: PostExtension[];
  // The form's top-level value, threaded unchanged through every depth so a
  // widget can read sibling fields (e.g. a selected namespace).
  rootValue?: Record<string, unknown>;
  // Commits a replacement top-level value. Consumer extensions use this to
  // atomically update sibling fields from a composite editor.
  onRootChange?: (next: Record<string, unknown>) => void;
  depth: number;
  // The recursion entry points (see RenderApi).
  render: RenderApi;
}

// FormLayout describes how a form arranges each field's label and value. It is
// resolved once at the top level and threaded through every depth via
// RenderContext, so width caps apply uniformly to nested objects and array items.
export interface FormLayout {
  /** "properties" = click-to-edit table; "inline" = label/value; "stacked" = label above value. */
  mode: LayoutMode;
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
  /**
   * How every field's description is presented. "inline" (default) keeps
   * today's paragraph under the control; "hover" moves it behind a `?` beside
   * the label, which costs no vertical space. A field's own `x-help-display`
   * wins over this.
   */
  help?: HelpDisplay;
}
export interface JsonSchemaFormProps extends FormErrorProps {
  schema: JsonSchemaObject;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  /** Full document exposed to extensions when this form edits a projection. */
  rootValue?: Record<string, unknown>;
  /** Atomically replaces the full extension root. Required by sibling edits. */
  onRootChange?: (next: Record<string, unknown>) => void;
  /** RFC 6901 path where this projected form is mounted in its full document. */
  instancePath?: string;
  readOnly?: boolean;
  /**
   * Shorthand for `layout: { mode: "inline" }` (2-column label/value); stacked
   * when false (default). Ignored when `layout` is provided.
   */
  inline?: boolean;
  /**
   * Form-level layout. Takes precedence over `inline`. Inline mode shrinks the
   * label column to fit (capped/truncated at 40ch) and caps the value column at
   * 600px. Properties mode renders a table with indented nested labels and
   * click-to-edit values. The inline check saves the edit; cancel discards it.
   * Leaving the field parks the edit instead — the row shows the pending value
   * with the check and cancel still offered. See `autoSave` to commit instead.
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
  /**
   * Omit fields the value says nothing about, at every depth. For a record that
   * is finished being edited — an audit view of a submitted form — the blanks
   * are noise: they say only that a field existed, and a schema wide enough to
   * describe many records can leave far more blank than filled.
   *
   * Empty means `undefined`, `null`, `""`, `[]` or `{}`. `false` and `0` are
   * answers and always render. An object whose fields are all empty is itself
   * empty and goes with them.
   *
   * For an editable form this is usually wrong: there, a blank field is the
   * question.
   */
  hideEmpty?: boolean;
  /**
   * Drop the properties layout's per-field confirm step: leaving a field or
   * pressing Enter commits it through `onChange`, and no check/cancel pair is
   * rendered. Escape still reverts to the saved value.
   *
   * Use it when the form already sits behind a save of its own, so confirming
   * each field twice buys nothing. Left off, an edit that loses focus is parked
   * on the row — shown, unsaved, and waiting for the check.
   *
   * Only the `properties` layout has a draft to commit; `stacked` and `inline`
   * send every keystroke straight to `onChange`, so this does nothing there.
   */
  autoSave?: boolean;
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
   * Resolves options for `x-clicky-lookup` fields (async entity-reference
   * pickers). When set, the form provides it to its lookup controls via context.
   * Hosts typically build it from the operations api client's lookup endpoint.
   */
  lookupFetcher?: LookupFetcher;
  /**
   * Show the top-right three-dot display-options menu (size, layout, and sort).
   * Defaults to true. The menu controls only this form's appearance — never
   * global page density or field values. When false the form renders exactly as
   * before and performs no preference reads/writes.
   */
  showPreferencesMenu?: boolean;
  /**
   * Show a persistent name/value filter above the form. Defaults to true for
   * properties layout when display options are enabled, false otherwise.
   * Matching nested content keeps its top-level group intact. Password values
   * are excluded. Filtering never modifies the submitted values.
   */
  showFilter?: boolean;
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
