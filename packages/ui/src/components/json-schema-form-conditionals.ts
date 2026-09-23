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

// effectiveProperties merges the schema's base `properties` with each `allOf`
// member's contribution. An `if`/`then` member contributes `then.properties`
// when its `if` matches the current value and `else.properties` when it does
// not; an unconditional member (e.g. an inlined `$ref` composition, which
// carries its own `properties` and no `if`) always contributes. Later members
// win on key collision; required is the union. A branch REPLACES a property
// wholesale rather than deep-merging it, so a branch that re-declares a field
// also re-declares its keywords (`readOnly`, `x-hidden`, …). Pure and
// idempotent.
export function effectiveProperties(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
): EffectiveProperties {
  const properties: Record<string, JsonSchemaProperty> = {
    ...schema.properties,
  };
  const required = new Set(schema.required ?? []);
  for (const clause of schema.allOf ?? []) {
    // Unconditional composition member: merge its own properties/required.
    if (clause.if === undefined && clause.then === undefined) {
      mergeBranch(clause, properties, required);
      continue;
    }
    mergeBranch(
      matchesIf(clause.if, value) ? clause.then : clause.else,
      properties,
      required,
    );
  }
  return { properties, required: [...required] };
}
