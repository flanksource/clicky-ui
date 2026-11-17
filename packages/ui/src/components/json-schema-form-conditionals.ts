import { isPlainObject } from "../lib/collections";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// evaluatePredicate answers whether one `if.properties[k]` sub-schema holds for
// the value at that key, or `undefined` when the sub-schema states nothing this
// form knows how to check. The tri-state is what lets the caller fail closed:
// "cannot tell" is never silently promoted to "matches".
//
// Recognised: `const`, `enum`, `not` (negating any of these), and a nested
// `properties`/`required` object sub-schema, evaluated recursively against the
// value at that key. Every recognised keyword present must hold.
//
// The value is read positionally — an absent key evaluates as `undefined`, so
// `const` rejects it. State presence requirements in `if.required` rather than
// relying on a predicate to imply them.
export function evaluatePredicate(
  sub: JsonSchemaProperty,
  value: unknown,
): boolean | undefined {
  let decided = false;
  let holds = true;

  if ("const" in sub) {
    decided = true;
    if (value !== sub.const) holds = false;
  }
  if (sub.enum !== undefined) {
    decided = true;
    if (!sub.enum.some((option) => option === value)) holds = false;
  }
  if (sub.not !== undefined) {
    // A negation of something unevaluatable is itself unevaluatable.
    const inner = evaluatePredicate(sub.not, value);
    if (inner === undefined) return undefined;
    decided = true;
    if (inner) holds = false;
  }
  if (sub.properties !== undefined || sub.required !== undefined) {
    decided = true;
    if (!isPlainObject(value) || !matchesIf(sub, value as Record<string, unknown>)) {
      holds = false;
    }
  }

  return decided ? holds : undefined;
}

// matchesIf reports whether the `if` sub-schema holds for the current value:
// every `if.required` key is present AND every `if.properties[k]` predicate
// holds for `value[k]`.
//
// A predicate this form cannot evaluate (a bare `type`, a `pattern`, a numeric
// bound) makes the whole `if` false, never true. Merging a `then` branch the
// form could not verify would put fields in front of the user that the schema
// never asked for, so an unreadable condition fails closed.
export function matchesIf(
  ifSchema: JsonSchemaProperty | undefined,
  value: Record<string, unknown>,
): boolean {
  if (!ifSchema) return false;
  for (const k of ifSchema.required ?? []) {
    if (!(k in value)) return false;
  }
  for (const [k, sub] of Object.entries(ifSchema.properties ?? {})) {
    if (evaluatePredicate(sub, value[k]) !== true) return false;
  }
  return true;
}

export interface EffectiveProperties {
  properties: Record<string, JsonSchemaProperty>;
  required: string[];
}

function mergeBranch(
  branch: Pick<JsonSchemaProperty, "properties" | "required"> | undefined,
  properties: Record<string, JsonSchemaProperty>,
  required: Set<string>,
): void {
  if (!branch) return;
  for (const [k, sub] of Object.entries(branch.properties ?? {})) {
    properties[k] = sub;
  }
  for (const k of branch.required ?? []) required.add(k);
}

// mergeConditional merges the branch a node's own `if`/`then`/`else` selects, and
// then whatever conditional that branch itself carries. A branch is a full
// subschema, so an `else` that holds another `if`/`then`/`else` is a chain of
// alternatives (`$ref`s rehydrated into the branches, as a handling answer's
// not-applicable / open / handling choice is), and a chosen branch's own
// conditional applies on top of it.
type Conditional = Pick<JsonSchemaProperty, "if" | "then" | "else">;

// selectedBranches lists, outermost first, the branches a node's own
// `if`/`then`/`else` selects for `value`, with the JSON Pointer of each relative
// to the node (`/else/then`). The chain stops at a branch with no conditional.
export function selectedBranches(
  node: Conditional,
  value: Record<string, unknown>,
  pointer = "",
): { branch: JsonSchemaProperty; pointer: string }[] {
  if (node.if === undefined && node.then === undefined && node.else === undefined) return [];
  const key = matchesIf(node.if, value) ? "then" : "else";
  const branch = node[key];
  if (!branch) return [];
  const at = `${pointer}/${key}`;
  return [{ branch, pointer: at }, ...selectedBranches(branch, value, at)];
}

// declaredBranches lists every branch of a node's own `if`/`then`/`else` chain,
// selected or not: what the schema can declare in any state of its value.
export function declaredBranches(node: Conditional): JsonSchemaProperty[] {
  return [node.then, node.else].flatMap((branch) => (branch ? [branch, ...declaredBranches(branch)] : []));
}

function mergeConditional(
  node: Conditional,
  context: {
    value: Record<string, unknown>;
    properties: Record<string, JsonSchemaProperty>;
    required: Set<string>;
  },
): void {
  for (const { branch } of selectedBranches(node, context.value)) {
    mergeBranch(branch, context.properties, context.required);
  }
}

// effectiveProperties merges the schema's base `properties` with the branch its
// own `if`/`then`/`else` selects and with each `allOf` member's contribution. A
// member always contributes its own `properties` (e.g. an inlined `$ref`
// composition), and an `if`/`then` member also contributes `then.properties`
// when its `if` matches the current value and `else.properties` when it does
// not. Later members win on key collision; required is the
// union. A branch REPLACES a property wholesale rather than deep-merging it, so a
// branch that re-declares a field also re-declares its keywords (`readOnly`,
// `x-hidden`, …). Pure and idempotent.
export function effectiveProperties(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
): EffectiveProperties {
  const context = {
    value,
    properties: { ...schema.properties } as Record<string, JsonSchemaProperty>,
    required: new Set(schema.required ?? []),
  };
  mergeConditional(schema, context);
  for (const clause of schema.allOf ?? []) {
    // A member always contributes its own properties/required (an inlined
    // `$ref` composition), and on top of them the branch its own if selects.
    mergeBranch(clause, context.properties, context.required);
    mergeConditional(clause, context);
  }
  return { properties: context.properties, required: [...context.required] };
}
