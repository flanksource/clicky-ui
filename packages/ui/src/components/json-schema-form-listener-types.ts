import type { JsonSchemaProperty } from "./json-schema-form-types";

// The `x-on-change` vocabulary. Re-exported from json-schema-form-types.

// ChangeActions names what a listener does to sibling fields. The state actions
// (hide/show, enable/disable, require/optional) are DERIVED: re-evaluated from
// the current value on every render, so a reloaded record shows the same shape
// it was saved with. The value actions (reset/set) are TRANSITIONAL: they fire
// only when the source field is committed through the form, in the same
// onChange as the edit, and cascade into the listeners of the fields they
// change (each key fires at most once per commit).
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
}

// ChangeCondition is the `if`-style predicate grammar (`const`, `enum`, `not`,
// nested `properties`/`required`) applied to the SOURCE field's value, plus an
// optional `expr` handed to the host's ExpressionEvaluator. When both are
// present both must hold.
export interface ChangeCondition extends JsonSchemaProperty {
  expr?: string;
}

// ChangeListener is one `x-on-change` entry: its actions apply while `when`
// holds (always, when omitted), and `else` applies while it does not.
export interface ChangeListener extends ChangeActions {
  when?: ChangeCondition;
  else?: ChangeActions;
}
