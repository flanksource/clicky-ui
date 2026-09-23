import {
  effectiveProperties,
  evaluatePredicate,
  type EffectiveProperties,
} from "./json-schema-form-conditionals";
import { cloneSchemaDefault } from "./json-schema-form-defaults";
import type {
  ChangeActions,
  ChangeListener,
  ExpressionEvaluator,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

// `x-on-change` listeners: a property names what happens to its siblings when
// its value is, or becomes, something. See ChangeActions for the split between
// derived state actions and transitional value actions.

export interface ListenerOptions {
  root: Record<string, unknown>;
  evaluate?: ExpressionEvaluator;
}

type ListName = "hide" | "show" | "enable" | "disable" | "require" | "optional" | "reset";

const STATE_FLAGS: [ListName, "x-hidden" | "x-disabled", boolean][] = [
  ["hide", "x-hidden", true],
  ["show", "x-hidden", false],
  ["disable", "x-disabled", true],
  ["enable", "x-disabled", false],
];

const CONTRADICTIONS: [ListName, ListName][] = [
  ["hide", "show"],
  ["enable", "disable"],
  ["require", "optional"],
];

const LIST_NAMES: ListName[] = ["hide", "show", "enable", "disable", "require", "optional", "reset"];

// applyListenerState is effectiveProperties plus the state actions of every
// listener on the resulting properties, evaluated against the current value.
// A listener is applied after `allOf`, so it wins over a branch; later
// listeners win over earlier ones. A target the current shape does not declare
// stays absent. Property schemas are cloned, never mutated.
export function applyListenerState(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  options: ListenerOptions,
): EffectiveProperties {
  const { properties, required } = effectiveProperties(schema, value);
  const requiredSet = new Set(required);
  const known = declaredKeys(schema);
  for (const [key, prop] of Object.entries(properties)) {
    for (const listener of listenersOf(key, prop)) {
      const actions = selectActions({ listener, key, self: value, known, options });
      for (const [name, keyword, flag] of STATE_FLAGS) {
        for (const target of list(actions, name)) {
          const targetProp = properties[target];
          if (targetProp) properties[target] = { ...targetProp, [keyword]: flag };
        }
      }
      for (const target of list(actions, "require")) {
        if (properties[target]) requiredSet.add(target);
      }
      for (const target of list(actions, "optional")) requiredSet.delete(target);
    }
  }
  return { properties, required: [...requiredSet] };
}

// applyChangeEffects commits `next` at `key` and runs the value actions
// (reset/set) of that key's listeners against the post-edit object. A target
// whose value actually changes fires its own listeners in turn; each key fires
// at most once per commit, so a cycle ends. When `root` is the edited object
// itself (the top level), expressions see the post-edit value as root too.
export function applyChangeEffects(
  schema: JsonSchemaObject,
  edit: ListenerOptions & { value: Record<string, unknown>; key: string; next: unknown },
): Record<string, unknown> {
  let current: Record<string, unknown> = { ...edit.value, [edit.key]: edit.next };
  const known = declaredKeys(schema);
  const fired = new Set<string>();
  const queue = [edit.key];
  for (let source = queue.shift(); source !== undefined; source = queue.shift()) {
    if (fired.has(source)) continue;
    fired.add(source);
    const { properties } = effectiveProperties(schema, current);
    const options: ListenerOptions = {
      root: edit.root === edit.value ? current : edit.root,
      ...(edit.evaluate ? { evaluate: edit.evaluate } : {}),
    };
    for (const listener of listenersOf(source, properties[source])) {
      const actions = selectActions({ listener, key: source, self: current, known, options });
      for (const [target, nextValue] of valueChanges(actions, properties)) {
        if (Object.is(current[target], nextValue)) continue;
        current = { ...current };
        if (nextValue === undefined) delete current[target];
        else current[target] = nextValue;
        queue.push(target);
      }
    }
  }
  return current;
}

function valueChanges(
  actions: ChangeActions,
  properties: Record<string, JsonSchemaProperty>,
): [string, unknown][] {
  return [
    ...list(actions, "reset").map((target): [string, unknown] => {
      const fallback = properties[target]?.default;
      return [target, fallback === undefined ? undefined : cloneSchemaDefault(fallback)];
    }),
    ...Object.entries(actions.set ?? {}).map(([target, v]): [string, unknown] => [target, cloneSchemaDefault(v)]),
  ];
}

function listenersOf(key: string, prop: JsonSchemaProperty | undefined): ChangeListener[] {
  const listeners = prop?.["x-on-change"];
  if (listeners === undefined) return [];
  if (!Array.isArray(listeners)) {
    throw new Error(`"${key}": x-on-change must be an array of listeners, got ${typeof listeners}`);
  }
  return listeners;
}

// selectActions validates both branches of a listener (so a schema error
// surfaces whichever branch is live) and returns the one that applies now.
function selectActions({
  listener,
  key,
  self,
  known,
  options,
}: {
  listener: ChangeListener;
  key: string;
  self: Record<string, unknown>;
  known: Set<string>;
  options: ListenerOptions;
}): ChangeActions {
  validateActions(key, listener, known);
  if (listener.else) validateActions(key, listener.else, known);
  return listenerHolds(listener, key, self, options) ? listener : (listener.else ?? {});
}

function listenerHolds(
  listener: ChangeListener,
  key: string,
  self: Record<string, unknown>,
  options: ListenerOptions,
): boolean {
  if (listener.when === undefined) return true;
  const { expr, ...predicate } = listener.when;
  const hasPredicate = Object.keys(predicate).length > 0;
  if (!hasPredicate && expr === undefined) {
    throw new Error(`x-on-change on "${key}": when states nothing it can evaluate`);
  }
  if (expr !== undefined && typeof expr !== "string") {
    throw new Error(`x-on-change on "${key}": when.expr must be a string, got ${typeof expr}`);
  }
  if (expr !== undefined && !options.evaluate) {
    throw new Error(`x-on-change on "${key}": when.expr "${expr}" needs the form's expressionEvaluator`);
  }
  if (hasPredicate) {
    const holds = evaluatePredicate(predicate, self[key]);
    if (holds === undefined) {
      throw new Error(`x-on-change on "${key}": when states nothing it can evaluate (${JSON.stringify(predicate)})`);
    }
    if (!holds) return false;
  }
  if (expr === undefined || !options.evaluate) return true;
  const result: unknown = options.evaluate({ expr, key, value: self[key], self, root: options.root });
  if (typeof result !== "boolean") {
    throw new Error(`x-on-change on "${key}": expressionEvaluator returned ${typeof result} for "${expr}", expected boolean`);
  }
  return result;
}

function validateActions(key: string, actions: ChangeActions, known: Set<string>): void {
  if (actions.set !== undefined && (typeof actions.set !== "object" || actions.set === null || Array.isArray(actions.set))) {
    throw new Error(`x-on-change on "${key}": set must be an object of target → value`);
  }
  const setKeys = Object.keys(actions.set ?? {});
  for (const target of [...LIST_NAMES.flatMap((name) => list(actions, name)), ...setKeys]) {
    if (!known.has(target)) throw new Error(`x-on-change on "${key}": unknown target "${target}"`);
  }
  const pairs: [string, string[], string, string[]][] = [
    ...CONTRADICTIONS.map(([a, b]): [string, string[], string, string[]] => [a, list(actions, a), b, list(actions, b)]),
    ["reset", list(actions, "reset"), "set", setKeys],
  ];
  for (const [a, left, b, right] of pairs) {
    const clash = left.find((target) => right.includes(target));
    if (clash !== undefined) {
      throw new Error(`x-on-change on "${key}": both ${a} and ${b} "${clash}"`);
    }
  }
}

function list(actions: ChangeActions, name: ListName): string[] {
  const targets = actions[name];
  if (targets === undefined) return [];
  if (!Array.isArray(targets)) {
    throw new Error(`x-on-change: ${name} must be an array of property keys, got ${typeof targets}`);
  }
  return targets;
}

// Every key the schema can declare in any branch — a listener may target a
// field that only exists while some `allOf` branch is live.
function declaredKeys(schema: JsonSchemaObject): Set<string> {
  const keys = new Set(Object.keys(schema.properties ?? {}));
  for (const clause of schema.allOf ?? []) {
    for (const branch of [clause, clause.then, clause.else]) {
      for (const key of Object.keys(branch?.properties ?? {})) keys.add(key);
    }
  }
  return keys;
}
