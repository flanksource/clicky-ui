import type { ExpressionEvaluator, JsonSchemaObject, JsonSchemaProperty } from "@flanksource/clicky-ui";

type CompiledExpression = (value: unknown, self: Record<string, unknown>, root: Record<string, unknown>) => unknown;

const compiled = new Map<string, CompiledExpression>();

/**
 * The kitchen sink's pluggable runtime for `when.expr`: a JavaScript expression
 * with `value`, `self` and `root` in scope. It runs text the viewer typed into
 * their own browser, which is fine for a local demo and wrong for a product —
 * a real host plugs in a sandboxed language (e.g. a client-side CEL).
 */
export const javascriptEvaluator: ExpressionEvaluator = ({ expr, value, self, root }) => {
  let run = compiled.get(expr);
  if (!run) {
    run = new Function("value", "self", "root", `"use strict"; return (${expr});`) as CompiledExpression;
    compiled.set(expr, run);
  }
  const result = run(value, self, root);
  if (typeof result !== "boolean") {
    throw new Error(`expression "${expr}" returned ${typeof result}, expected boolean`);
  }
  return result;
};

export type ParsedSchema = { schema: JsonSchemaObject } | { error: string };

/** Parses the editor text; anything but a JSON object is an error to show, not a schema. */
export function parseSchemaText(text: string): ParsedSchema {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { error: `expected a JSON object schema, got ${Array.isArray(parsed) ? "array" : typeof parsed}` };
  }
  return { schema: parsed as JsonSchemaObject };
}

const keys = (description: string): JsonSchemaProperty => ({
  type: "array",
  items: { type: "string" },
  description,
});

const PATHS = " A target may be a path into a sibling's subtree (`groups/Table/Column`; arrays are crossed into their items).";

const actionProperties: Record<string, JsonSchemaProperty> = {
  hide: keys(`Sibling keys hidden while this branch applies.${PATHS}`),
  show: keys(`Sibling keys shown while this branch applies (overrides x-hidden).${PATHS}`),
  enable: keys(`Sibling keys enabled while this branch applies.${PATHS}`),
  disable: keys(`Sibling keys rendered as disabled controls while this branch applies.${PATHS}`),
  patch: {
    type: "object",
    additionalProperties: { type: "object" },
    description: `Keywords (readOnly, title, bounds, x-*) merged over each target while this branch applies.${PATHS}`,
  },
  require: keys("Sibling keys marked required while this branch applies."),
  optional: keys("Sibling keys made optional while this branch applies."),
  reset: keys("On edit: sibling keys reset to their schema default, or removed."),
  set: {
    type: "object",
    additionalProperties: true,
    description: "On edit: a literal value per sibling key.",
  },
};

/**
 * The editor's own schema: enough of JSON Schema plus the `x-on-change`
 * vocabulary for Monaco to complete keywords and flag typos in a listener.
 */
export const LISTENER_META_SCHEMA: JsonSchemaObject = {
  $ref: "#/$defs/property",
  $defs: {
    actions: { type: "object", additionalProperties: false, properties: actionProperties },
    listener: {
      type: "object",
      additionalProperties: false,
      properties: {
        when: {
          type: "object",
          description: "Predicate on this field's value (const/enum/not/properties) and/or an expr for the host evaluator.",
          properties: {
            expr: { type: "string", description: "Evaluated by the form's expressionEvaluator (value, self, root)." },
            const: { description: "Holds when the value equals this." },
            enum: { type: "array", description: "Holds when the value is one of these." },
            not: { type: "object", description: "Holds when the nested predicate does not." },
          },
        },
        ...actionProperties,
        else: { $ref: "#/$defs/actions", description: "Actions applied while `when` does not hold." },
      },
    },
    property: {
      type: "object",
      properties: {
        type: { enum: ["object", "array", "string", "integer", "number", "boolean", "null"] },
        title: { type: "string" },
        description: { type: "string" },
        enum: { type: "array" },
        default: {},
        format: { type: "string" },
        required: { type: "array", items: { type: "string" } },
        properties: { type: "object", additionalProperties: { $ref: "#/$defs/property" } },
        items: { $ref: "#/$defs/property" },
        readOnly: { type: "boolean", description: "Show the value as text, with no input." },
        writeOnly: { type: "boolean", description: "Never shown back: omitted from a read-only view." },
        "x-layout": { enum: ["inline", "stack", "table"] },
        "x-hidden": { type: "boolean", description: "Render nothing for this property." },
        "x-disabled": { type: "boolean", description: "Render the control disabled." },
        "x-on-load": {
          type: "array",
          items: { $ref: "#/$defs/listener" },
          description: "Object-level load listeners: `when` reads the object itself; applied before any x-on-change. hide/show/enable/disable/patch only.",
        },
        "x-enum-labels": { type: "object", additionalProperties: { type: "string" } },
        "x-enum-display": { enum: ["combobox", "radio", "grid", "segmented"] },
        "x-on-change": {
          type: "array",
          items: { $ref: "#/$defs/listener" },
          description: "Change listeners acting on sibling properties.",
        },
      },
    },
  },
};
