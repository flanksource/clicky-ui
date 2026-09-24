import { isPlainObject } from "../lib/collections";
import {
  effectiveProperties,
  evaluatePredicate,
  matchesIf,
  type EffectiveProperties,
} from "./json-schema-form-conditionals";
import { cloneSchemaDefault } from "./json-schema-form-defaults";
import { isPathTarget, patchTarget, targetSegments } from "./json-schema-form-listener-paths";
import type {
  ChangeActions,
  ChangeListener,
  ExpressionEvaluator,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

// `x-on-change` listeners: a property names what happens to its siblings when
// its value is, or becomes, something. `x-on-load` listeners: an object names
// the state its properties start in. See ChangeActions for the split between
// derived state actions and transitional value actions.

export interface ListenerOptions {
  root: Record<string, unknown>;
  evaluate?: ExpressionEvaluator;
}

// ListenerSource says where a listener came from. `label` prefixes every error
// it raises; `key` is the property whose value `when` reads (and the
// evaluator's `key`) — for x-on-load, "" and the object itself.
interface ListenerSource {
  label: string;
  key: string;
  load: boolean;
}

interface BoundListener {
  listener: ChangeListener;
  source: ListenerSource;
}

type ListName = "hide" | "show" | "enable" | "disable" | "require" | "optional" | "reset";

// Actions that write values or required-ness: they act on sibling keys only
// (never a path), and have no place in x-on-load, which only derives state.
const LOCAL_ACTIONS: ("require" | "optional" | "reset" | "set")[] = ["require", "optional", "reset", "set"];

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

// Keywords a `patch` may not set, with the tool that does the job instead.
const PATCH_DENIED: Record<string, string> = {
  ...Object.fromEntries(
    ["type", "properties", "items", "additionalProperties", "patternProperties", "allOf", "anyOf", "oneOf", "if", "then", "else", "not", "$ref", "$defs"].map(
      (keyword) => [keyword, "it changes the field's shape; use an allOf branch"],
    ),
  ),
  required: "use require/optional",
  default: "a patch changes presentation, not values; use set/reset",
  const: "a patch changes presentation, not values; use set/reset",
  "x-on-change": "listeners cannot be patched in",
  "x-on-load": "listeners cannot be patched in",
};

// applyListenerState is effectiveProperties plus the state actions of every
// listener, evaluated against the current value: first the object's
// `x-on-load` listeners, then each property's `x-on-change` listeners — load,
// then change, the order the events happen in. A listener is applied after
// `allOf`, so it wins over a branch; later listeners win over earlier ones. A
// target the current shape does not declare stays absent. Property schemas are
// cloned, never mutated.
export function applyListenerState(
  schema: JsonSchemaObject,
  value: Record<string, unknown>,
  options: ListenerOptions,
): EffectiveProperties {
  const { properties, required } = effectiveProperties(schema, value);
  const requiredSet = new Set(required);
  const known = declaredKeys(schema);
  const bound: BoundListener[] = [
    ...loadListenersOf(schema, value),
    ...Object.entries(properties).flatMap(([key, prop]) =>
      listenersOf(key, prop).map((listener) => ({ listener, source: changeSource(key) })),
    ),
  ];
  for (const { listener, source } of bound) {
    const actions = selectActions({ listener, source, self: value, known, options });
    for (const [name, keyword, flag] of STATE_FLAGS) {
      for (const target of list(actions, name)) {
        patchTarget({ properties, value, target, apply: (leaf) => ({ ...leaf, [keyword]: flag }) });
      }
    }
    for (const target of list(actions, "require")) {
      if (properties[target]) requiredSet.add(target);
    }
    for (const target of list(actions, "optional")) requiredSet.delete(target);
    for (const [target, keywords] of Object.entries(actions.patch ?? {})) {
      patchTarget({ properties, value, target, apply: (leaf) => ({ ...leaf, ...keywords }) });
    }
  }
  return { properties, required: [...requiredSet] };
}

// loadListenersOf collects an object's `x-on-load` listeners in order: the
// schema's own, then each `allOf` member's — an unconditional member's own, or
// those of the `then`/`else` branch that applies, selected exactly as
// effectiveProperties selects the branch it merges.
function loadListenersOf(schema: JsonSchemaObject, value: Record<string, unknown>): BoundListener[] {
  const bound = loadListenersAt(schema["x-on-load"], "#/x-on-load");
  for (const [index, clause] of (schema.allOf ?? []).entries()) {
    if (clause.if === undefined && clause.then === undefined) {
      bound.push(...loadListenersAt(clause["x-on-load"], `#/allOf/${index}/x-on-load`));
      continue;
    }
    const branch = matchesIf(clause.if, value) ? "then" : "else";
    bound.push(...loadListenersAt(clause[branch]?.["x-on-load"], `#/allOf/${index}/${branch}/x-on-load`));
  }
  return bound;
}

function loadListenersAt(listeners: unknown, pointer: string): BoundListener[] {
  if (listeners === undefined) return [];
  if (!Array.isArray(listeners)) {
    throw new Error(`x-on-load at ${pointer} must be an array of listeners, got ${typeof listeners}`);
  }
  return listeners.map((listener: ChangeListener, index) => ({
    listener,
    source: { label: `x-on-load at ${pointer}/${index}`, key: "", load: true },
  }));
}

function changeSource(key: string): ListenerSource {
  return { label: `x-on-change on "${key}"`, key, load: false };
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
      const actions = selectActions({ listener, source: changeSource(source), self: current, known, options });
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
  source,
  self,
  known,
  options,
}: {
  listener: ChangeListener;
  source: ListenerSource;
  self: Record<string, unknown>;
  known: Set<string>;
  options: ListenerOptions;
}): ChangeActions {
  validateActions(source, listener, known);
  if (listener.else) validateActions(source, listener.else, known);
  return listenerHolds(listener, source, self, options) ? listener : (listener.else ?? {});
}

// listenerHolds evaluates `when` against the source's subject: the property's
// value for x-on-change, the object itself for x-on-load.
function listenerHolds(
  listener: ChangeListener,
  { label, key, load }: ListenerSource,
  self: Record<string, unknown>,
  options: ListenerOptions,
): boolean {
  if (listener.when === undefined) return true;
  const { expr, ...predicate } = listener.when;
  const hasPredicate = Object.keys(predicate).length > 0;
  const subject = load ? self : self[key];
  if (!hasPredicate && expr === undefined) {
    throw new Error(`${label}: when states nothing it can evaluate`);
  }
  if (expr !== undefined && typeof expr !== "string") {
    throw new Error(`${label}: when.expr must be a string, got ${typeof expr}`);
  }
  if (expr !== undefined && !options.evaluate) {
    throw new Error(`${label}: when.expr "${expr}" needs the form's expressionEvaluator`);
  }
  if (hasPredicate) {
    const holds = evaluatePredicate(predicate, subject);
    if (holds === undefined) {
      throw new Error(`${label}: when states nothing it can evaluate (${JSON.stringify(predicate)})`);
    }
    if (!holds) return false;
  }
  if (expr === undefined || !options.evaluate) return true;
  const result: unknown = options.evaluate({ expr, key, value: subject, self, root: options.root });
  if (typeof result !== "boolean") {
    throw new Error(`${label}: expressionEvaluator returned ${typeof result} for "${expr}", expected boolean`);
  }
  return result;
}

function validateActions(source: ListenerSource, actions: ChangeActions, known: Set<string>): void {
  const { label } = source;
  if (actions.set !== undefined && !isPlainObject(actions.set)) {
    throw new Error(`${label}: set must be an object of target → value`);
  }
  if (source.load) {
    const local = LOCAL_ACTIONS.find((name) => actions[name] !== undefined);
    if (local) {
      throw new Error(`${label}: ${local} is not allowed in x-on-load, which only derives state (hide/show/enable/disable/patch)`);
    }
  }
  const setKeys = Object.keys(actions.set ?? {});
  for (const name of LOCAL_ACTIONS) {
    const targets = name === "set" ? setKeys : list(actions, name);
    const path = targets.find(isPathTarget);
    if (path !== undefined) {
      throw new Error(`${label}: ${name} "${path}" cannot take a path; value and required actions act on sibling keys only`);
    }
  }
  for (const target of [...LIST_NAMES.flatMap((name) => list(actions, name)), ...setKeys]) {
    validateTarget(label, target, known);
  }
  const pairs: [string, string[], string, string[]][] = [
    ...CONTRADICTIONS.map(([a, b]): [string, string[], string, string[]] => [a, list(actions, a), b, list(actions, b)]),
    ["reset", list(actions, "reset"), "set", setKeys],
  ];
  for (const [a, left, b, right] of pairs) {
    const clash = left.find((target) => right.includes(target));
    if (clash !== undefined) {
      throw new Error(`${label}: both ${a} and ${b} "${clash}"`);
    }
  }
  validatePatch(label, actions, known);
}

// validateTarget checks a target's grammar and that its first segment is a key
// the schema declares in some branch.
function validateTarget(label: string, target: string, known: Set<string>): void {
  if (isPathTarget(target) && known.has(target)) {
    throw new Error(`${label}: target "${target}" is both a declared key and a path`);
  }
  const [first = ""] = targetSegments(label, target);
  if (!known.has(first)) throw new Error(`${label}: unknown target "${target}"`);
}

// validatePatch checks a `patch`: an object of keyword objects on known
// targets, no denied keyword, and no keyword a verb in the same actions sets.
function validatePatch(label: string, actions: ChangeActions, known: Set<string>): void {
  const patch: unknown = actions.patch;
  if (patch === undefined) return;
  if (!isPlainObject(patch)) {
    throw new Error(`${label}: patch must be an object of target → keywords`);
  }
  for (const [target, keywords] of Object.entries(patch)) {
    validateTarget(label, target, known);
    if (!isPlainObject(keywords)) {
      throw new Error(`${label}: patch "${target}" must be an object of keywords`);
    }
    for (const keyword of Object.keys(keywords)) {
      const denied = PATCH_DENIED[keyword];
      if (denied) throw new Error(`${label}: patch "${target}" may not set ${keyword} (${denied})`);
    }
    for (const [verb, keyword] of STATE_FLAGS) {
      if (keyword in keywords && list(actions, verb).includes(target)) {
        throw new Error(`${label}: both ${verb} and patch ${keyword} on "${target}"`);
      }
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
