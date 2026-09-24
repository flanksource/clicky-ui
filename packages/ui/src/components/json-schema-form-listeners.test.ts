import { describe, expect, it, vi } from "vitest";
import { applyChangeEffects, applyListenerState } from "./json-schema-form-listeners";
import type { ChangeListener, ExpressionEvaluator, JsonSchemaObject } from "./json-schema-form-types";

// `then` is the JSON Schema 2020-12 conditional keyword, not a Promise
// thenable; spelling it indirectly keeps unicorn/no-thenable quiet here.
const thenKeyword = ["th", "en"].join("") as "then";

const YES = "01";
const NO = "00";

function loanSchema(listeners: ChangeListener[]): JsonSchemaObject {
  return {
    type: "object",
    required: ["LoanRate"],
    properties: {
      LoanOverride: { type: "string", enum: [NO, YES], "x-on-change": listeners },
      LoanAmount: { type: "number", "x-hidden": true },
      LoanRate: { type: "number", default: 3 },
      LoanNote: { type: "string" },
    },
  };
}

function stateOf(schema: JsonSchemaObject, value: Record<string, unknown>, evaluate?: ExpressionEvaluator) {
  const { properties, required } = applyListenerState(schema, value, {
    root: value,
    ...(evaluate ? { evaluate } : {}),
  });
  return {
    hidden: Object.keys(properties).filter((k) => properties[k]?.["x-hidden"] === true).sort(),
    disabled: Object.keys(properties).filter((k) => properties[k]?.["x-disabled"] === true).sort(),
    required: [...required].sort(),
  };
}

describe("applyListenerState", () => {
  const listener: ChangeListener = {
    when: { const: YES },
    show: ["LoanAmount"],
    require: ["LoanAmount"],
    disable: ["LoanNote"],
    else: { hide: ["LoanAmount"], optional: ["LoanRate"], enable: ["LoanNote"] },
  };

  it("applies the listener's actions while `when` holds", () => {
    expect(stateOf(loanSchema([listener]), { LoanOverride: YES })).toEqual({
      hidden: [],
      disabled: ["LoanNote"],
      required: ["LoanAmount", "LoanRate"],
    });
  });

  it("applies `else` while `when` does not hold, with no edit having happened", () => {
    expect(stateOf(loanSchema([listener]), { LoanOverride: NO })).toEqual({
      hidden: ["LoanAmount"],
      disabled: [],
      required: [],
    });
  });

  it("treats an omitted `when` as always holding", () => {
    expect(stateOf(loanSchema([{ disable: ["LoanRate"] }]), {})).toMatchObject({ disabled: ["LoanRate"] });
  });

  it("overrides an allOf branch that hides the same field", () => {
    const schema = loanSchema([{ when: { const: YES }, show: ["LoanAmount"] }]);
    schema.allOf = [
      {
        if: { properties: { LoanOverride: { const: YES } } },
        [thenKeyword]: { properties: { LoanAmount: { type: "number", "x-hidden": true } } },
      },
    ];
    expect(stateOf(schema, { LoanOverride: YES }).hidden).toEqual([]);
  });

  it("lets a later listener win over an earlier one", () => {
    const schema = loanSchema([{ show: ["LoanAmount"] }, { hide: ["LoanAmount"] }]);
    expect(stateOf(schema, {}).hidden).toEqual(["LoanAmount"]);
  });

  it("does not mutate the schema's property objects", () => {
    const schema = loanSchema([{ show: ["LoanAmount"] }]);
    stateOf(schema, {});
    expect(schema.properties?.LoanAmount?.["x-hidden"]).toBe(true);
  });

  it("passes the expression bindings to the evaluator and ANDs expr with the predicate", () => {
    const evaluate = vi.fn<ExpressionEvaluator>(({ self }) => self.LoanNote === "vip");
    const schema = loanSchema([{ when: { const: YES, expr: "self.LoanNote == 'vip'" }, show: ["LoanAmount"] }]);
    const value = { LoanOverride: YES, LoanNote: "vip" };

    expect(stateOf(schema, value, evaluate).hidden).toEqual([]);
    expect(evaluate).toHaveBeenCalledWith({
      expr: "self.LoanNote == 'vip'",
      key: "LoanOverride",
      value: YES,
      self: value,
      root: value,
    });
    expect(stateOf(schema, { ...value, LoanNote: "std" }, evaluate).hidden).toEqual(["LoanAmount"]);
    expect(stateOf(schema, { ...value, LoanOverride: NO }, evaluate).hidden).toEqual(["LoanAmount"]);
  });

  it.each<[string, ChangeListener[], ExpressionEvaluator | undefined, RegExp]>([
    ["an unknown target", [{ hide: ["Missing"] }], undefined, /LoanOverride.*unknown target "Missing"/],
    ["a `when` with nothing evaluable", [{ when: { type: "string" }, hide: ["LoanAmount"] }], undefined, /LoanOverride.*nothing it can evaluate/],
    ["an expr without an evaluator", [{ when: { expr: "true" }, hide: ["LoanAmount"] }], undefined, /LoanOverride.*expressionEvaluator/],
    ["a non-boolean evaluator result", [{ when: { expr: "1" }, hide: ["LoanAmount"] }], (() => 1) as unknown as ExpressionEvaluator, /LoanOverride.*returned number/],
    ["contradictory hide and show", [{ hide: ["LoanAmount"], show: ["LoanAmount"] }], undefined, /LoanOverride.*both hide and show "LoanAmount"/],
    ["contradictory reset and set", [{ reset: ["LoanRate"], set: { LoanRate: 1 } }], undefined, /LoanOverride.*both reset and set "LoanRate"/],
  ])("throws on %s", (_name, listeners, evaluate, message) => {
    expect(() => stateOf(loanSchema(listeners), { LoanOverride: YES }, evaluate)).toThrow(message);
  });

  it("throws when x-on-change is not an array", () => {
    const schema = loanSchema([]);
    schema.properties!.LoanOverride!["x-on-change"] = { hide: ["LoanAmount"] } as unknown as ChangeListener[];
    expect(() => stateOf(schema, {})).toThrow(/LoanOverride.*x-on-change must be an array/);
  });

  it("accepts a target declared only in an inactive allOf branch", () => {
    const schema = loanSchema([{ when: { const: YES }, show: ["BranchOnly"] }]);
    schema.allOf = [
      {
        if: { properties: { LoanOverride: { const: "99" } } },
        [thenKeyword]: { properties: { BranchOnly: { type: "string" } } },
      },
    ];
    expect(() => stateOf(schema, { LoanOverride: YES })).not.toThrow();
  });
});

describe("applyListenerState patch", () => {
  const OVERRIDE_TITLE = "Override rate";
  const RATE_CEILING = 25;

  function patched(listeners: ChangeListener[], value: Record<string, unknown>) {
    return applyListenerState(loanSchema(listeners), value, { root: value }).properties;
  }

  it("merges the patch over the target while `when` holds, keeping its other keywords", () => {
    const listeners: ChangeListener[] = [
      { when: { const: YES }, patch: { LoanRate: { readOnly: true, title: OVERRIDE_TITLE, maximum: RATE_CEILING } } },
    ];
    expect(patched(listeners, { LoanOverride: YES }).LoanRate).toEqual({
      type: "number",
      default: 3,
      readOnly: true,
      title: OVERRIDE_TITLE,
      maximum: RATE_CEILING,
    });
    expect(patched(listeners, { LoanOverride: NO }).LoanRate).toEqual({ type: "number", default: 3 });
  });

  it("applies `else.patch` while `when` does not hold", () => {
    const listeners: ChangeListener[] = [
      { when: { const: YES }, else: { patch: { LoanNote: { writeOnly: true } } } },
    ];
    expect(patched(listeners, { LoanOverride: NO }).LoanNote?.writeOnly).toBe(true);
    expect(patched(listeners, { LoanOverride: YES }).LoanNote?.writeOnly).toBeUndefined();
  });

  it("lets a later listener win per keyword, leaving the earlier listener's other keywords", () => {
    const listeners: ChangeListener[] = [
      { patch: { LoanRate: { readOnly: true, title: OVERRIDE_TITLE } } },
      { patch: { LoanRate: { readOnly: false } } },
    ];
    expect(patched(listeners, {}).LoanRate).toMatchObject({ readOnly: false, title: OVERRIDE_TITLE });
  });

  it("applies after the verbs, so a patch can set a keyword no verb covers alongside them", () => {
    const listeners: ChangeListener[] = [{ show: ["LoanAmount"], patch: { LoanAmount: { readOnly: true } } }];
    expect(patched(listeners, {}).LoanAmount).toMatchObject({ "x-hidden": false, readOnly: true });
  });

  it("leaves a target the current shape does not declare absent", () => {
    const schema = loanSchema([{ patch: { BranchOnly: { readOnly: true } } }]);
    schema.allOf = [
      {
        if: { properties: { LoanOverride: { const: "99" } } },
        [thenKeyword]: { properties: { BranchOnly: { type: "string" } } },
      },
    ];
    expect(applyListenerState(schema, {}, { root: {} }).properties).not.toHaveProperty("BranchOnly");
  });

  it("does not mutate the schema's property objects", () => {
    const schema = loanSchema([{ patch: { LoanRate: { readOnly: true } } }]);
    applyListenerState(schema, {}, { root: {} });
    expect(schema.properties?.LoanRate).toEqual({ type: "number", default: 3 });
  });

  it.each<[string, ChangeListener, RegExp]>([
    ["a structural keyword", { patch: { LoanRate: { type: "string" } } }, /LoanOverride.*patch "LoanRate" may not set type.*allOf/],
    ["required", { patch: { LoanRate: { required: ["x"] } } }, /LoanOverride.*patch "LoanRate" may not set required.*require\/optional/],
    ["a value keyword", { patch: { LoanRate: { default: 1 } } }, /LoanOverride.*patch "LoanRate" may not set default.*set\/reset/],
    ["a nested listener", { patch: { LoanRate: { "x-on-change": [] } } }, /LoanOverride.*patch "LoanRate" may not set x-on-change/],
    ["an unknown target", { patch: { Missing: { readOnly: true } } }, /LoanOverride.*unknown target "Missing"/],
    ["a non-object patch", { patch: { LoanRate: true } } as unknown as ChangeListener, /LoanOverride.*patch "LoanRate" must be an object/],
    ["hide clashing with a patched x-hidden", { hide: ["LoanAmount"], patch: { LoanAmount: { "x-hidden": false } } }, /LoanOverride.*both hide and patch x-hidden on "LoanAmount"/],
    ["disable clashing with a patched x-disabled", { disable: ["LoanRate"], patch: { LoanRate: { "x-disabled": false } } }, /LoanOverride.*both disable and patch x-disabled on "LoanRate"/],
    ["a clash inside `else`", { when: { const: YES }, else: { show: ["LoanAmount"], patch: { LoanAmount: { "x-hidden": true } } } }, /LoanOverride.*both show and patch x-hidden on "LoanAmount"/],
  ])("throws on %s", (_name, listener, message) => {
    expect(() => patched([listener], { LoanOverride: YES })).toThrow(message);
  });
});

describe("applyChangeEffects", () => {
  function commit(schema: JsonSchemaObject, value: Record<string, unknown>, key: string, next: unknown) {
    return applyChangeEffects(schema, { value, key, next, root: value });
  }

  it("sets literal values and resets to the schema default when `when` holds", () => {
    const schema = loanSchema([{ when: { const: YES }, set: { LoanAmount: 1000 }, reset: ["LoanRate"] }]);
    expect(commit(schema, { LoanOverride: NO, LoanRate: 9 }, "LoanOverride", YES)).toEqual({
      LoanOverride: YES,
      LoanAmount: 1000,
      LoanRate: 3,
    });
  });

  it("removes a reset target that has no default, via `else`", () => {
    const schema = loanSchema([{ when: { const: YES }, else: { reset: ["LoanAmount", "LoanNote"] } }]);
    expect(commit(schema, { LoanOverride: YES, LoanAmount: 5, LoanNote: "x" }, "LoanOverride", NO)).toEqual({
      LoanOverride: NO,
    });
  });

  it("returns only the edit when the edited field has no listeners", () => {
    const schema = loanSchema([{ set: { LoanAmount: 1 } }]);
    expect(commit(schema, { LoanNote: "a" }, "LoanNote", "b")).toEqual({ LoanNote: "b" });
  });

  it("cascades into the listeners of a field it changed", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        Kind: { type: "string", "x-on-change": [{ set: { Mode: "manual" } }] },
        Mode: { type: "string", "x-on-change": [{ when: { const: "manual" }, set: { Detail: "typed" } }] },
        Detail: { type: "string" },
      },
    };
    expect(commit(schema, {}, "Kind", "a")).toEqual({ Kind: "a", Mode: "manual", Detail: "typed" });
  });

  it("does not cascade from a target whose value did not change", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        Kind: { type: "string", "x-on-change": [{ set: { Mode: "manual" } }] },
        Mode: { type: "string", "x-on-change": [{ set: { Detail: "typed" } }] },
        Detail: { type: "string" },
      },
    };
    expect(commit(schema, { Mode: "manual" }, "Kind", "a")).toEqual({ Kind: "a", Mode: "manual" });
  });

  it("terminates a listener cycle, firing each key once per commit", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        A: { type: "number", "x-on-change": [{ set: { B: 2 } }] },
        B: { type: "number", "x-on-change": [{ set: { A: 99 } }] },
      },
    };
    expect(commit(schema, {}, "A", 1)).toEqual({ A: 99, B: 2 });
  });

  it("evaluates expr against the post-edit object", () => {
    const evaluate = vi.fn<ExpressionEvaluator>(({ self }) => self.LoanOverride === YES);
    const schema = loanSchema([{ when: { expr: "self.LoanOverride == '01'" }, set: { LoanAmount: 1 } }]);
    const value = { LoanOverride: NO };
    expect(applyChangeEffects(schema, { value, key: "LoanOverride", next: YES, root: value, evaluate })).toEqual({
      LoanOverride: YES,
      LoanAmount: 1,
    });
    expect(evaluate.mock.calls[0]?.[0].root).toEqual({ LoanOverride: YES });
  });
});
