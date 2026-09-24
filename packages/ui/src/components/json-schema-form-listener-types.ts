import type { JsonSchemaProperty } from "./json-schema-form-types";

// The `x-on-change` / `x-on-load` vocabulary. Re-exported from
// json-schema-form-types.

// ChangeActions names what a listener does to sibling fields. The state actions
// (hide/show, enable/disable, require/optional) are DERIVED: re-evaluated from
// the current value on every render, so a reloaded record shows the same shape
// it was saved with. The value actions (reset/set) are TRANSITIONAL: they fire
// only when the source field is committed through the form, in the same
// onChange as the edit, and cascade into the listeners of the fields they
// change (each key fires at most once per commit).
//
// A hide/show/enable/disable target or a patch key may be a path,
// `sibling/child/…`, into a sibling's subtree: each segment after the first
// names a property of the object reached so far, and an array is crossed into
// its `items` without spending a segment (`groups/Rates/Amount` reaches the
// Amount column of the Rates array). require/optional/reset/set take sibling
// keys only.
export interface ChangeActions {
  hide?: string[];
  show?: string[];
  enable?: string[];
  disable?: string[];
  require?: string[];
  optional?: string[];
  // Back to the target's schema `default`, or removed when it has none.
  reset?: string[];
  // A literal value per target key.
  set?: Record<string, unknown>;
  // Derived, like hide/show: per target key, keywords shallow-merged over that
  // property while the condition holds — readOnly, writeOnly, title, enum,
  // bounds, any presentation `x-*`. Applied after the verbs; a later listener
  // wins per keyword. Keywords that change the property's shape (type,
  // properties, items, allOf, …), `required` and value keywords (default,
  // const) are refused: use an allOf branch, require/optional, set/reset.
  patch?: Record<string, ChangePatch>;
}

// Keywords a `patch` may not set; see ChangeActions.patch.
export type ChangePatchDeniedKeyword =
  | "type"
  | "properties"
  | "items"
  | "additionalProperties"
  | "patternProperties"
  | "allOf"
  | "anyOf"
  | "oneOf"
  | "if"
  | "then"
  | "else"
  | "not"
  | "required"
  | "default"
  | "const"
  | "x-on-change"
  | "x-on-load";

export type ChangePatch = Omit<Partial<JsonSchemaProperty>, ChangePatchDeniedKeyword>;

// ChangeCondition is the `if`-style predicate grammar (`const`, `enum`, `not`,
// nested `properties`/`required`) applied to the SOURCE field's value — or, in
// `x-on-load`, to the object itself — plus an optional `expr` handed to the
// host's ExpressionEvaluator. When both are present both must hold.
export interface ChangeCondition extends JsonSchemaProperty {
  expr?: string;
}

// ChangeListener is one `x-on-change` or `x-on-load` entry: its actions apply
// while `when` holds (always, when omitted), and `else` applies while it does
// not.
export interface ChangeListener extends ChangeActions {
  when?: ChangeCondition;
  else?: ChangeActions;
}
