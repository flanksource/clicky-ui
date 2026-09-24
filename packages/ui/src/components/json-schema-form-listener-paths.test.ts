import { describe, expect, it, vi } from "vitest";
import { effectiveProperties } from "./json-schema-form-conditionals";
import { applyListenerState } from "./json-schema-form-listeners";
import type {
  ChangeActions,
  ChangeListener,
  ExpressionEvaluator,
  JsonSchemaObject,
  JsonSchemaProperty,
} from "./json-schema-form-types";

// `then` is the JSON Schema 2020-12 conditional keyword, not a Promise
// thenable; spelling it indirectly keeps unicorn/no-thenable quiet here.
const thenKeyword = ["th", "en"].join("") as "then";

const YES = "01";
const NO = "00";

// A step-shaped object: `input` carries the listeners, `mf` holds the groups.
// G1 arrives through an allOf-inlined composition member (a flattened $ref),
// not `mf.properties`, so a path must resolve it through effectiveProperties.
function stepSchema(listeners: ChangeListener[]): JsonSchemaObject {
  return {
    type: "object",
    properties: {
      input: { type: "object", properties: { X: { type: "string" } }, "x-on-change": listeners },
      mf: {
        type: "object",
        properties: {
          G2: {
            type: "array",
            "x-hidden": true,
            items: { type: "object", properties: { cell: { type: "number" }, other: { type: "string" } } },
          },
        },
        allOf: [
          {
            properties: {
              G1: {
                type: "array",
                items: { type: "object", properties: { cell: { type: "number" }, other: { type: "string" } } },
              },
            },
          },
        ],
      },
      note: { type: "string" },
    },
  };
}

function stateOf(schema: JsonSchemaObject, value: Record<string, unknown> = {}, evaluate?: ExpressionEvaluator) {
  return applyListenerState(schema, value, { root: value, ...(evaluate ? { evaluate } : {}) }).properties;
}

// groupsOf resolves the groups a path patch leaves on `mf`, as the nested
// renderer would: through effectiveProperties, since the patch is appended as
// an unconditional allOf member rather than written into `mf.properties`.
function groupsOf(properties: Record<string, JsonSchemaProperty>, mfValue: Record<string, unknown> = {}) {
  return effectiveProperties(properties.mf as JsonSchemaObject, mfValue).properties;
}

function cellsOf(group: JsonSchemaProperty | undefined) {
  return effectiveProperties(group?.items as JsonSchemaObject, {}).properties;
}

describe("applyListenerState path targets", () => {
  it("hides a group declared by an allOf member of the sibling, leaving its other properties intact", () => {
    const schema = stepSchema([{ hide: ["mf/G1"] }]);
    const groups = groupsOf(stateOf(schema));
    const original = groupsOf(schema.properties!);
    expect(groups).toEqual({ ...original, G1: { ...original.G1, "x-hidden": true } });
  });

  it("descends an array into its items to hide one cell", () => {
    const groups = groupsOf(stateOf(stepSchema([{ hide: ["mf/G1/cell"] }])));
    expect(cellsOf(groups.G1)).toEqual({ cell: { type: "number", "x-hidden": true }, other: { type: "string" } });
    expect(groups.G1?.["x-hidden"]).toBeUndefined();
  });

  it("lets a later listener show a path an earlier one hid", () => {
    const groups = groupsOf(stateOf(stepSchema([{ hide: ["mf/G1"] }, { show: ["mf/G1"] }])));
    expect(groups.G1?.["x-hidden"]).toBe(false);
  });

  it("keeps both listeners when they target different groups under the same sibling", () => {
    const groups = groupsOf(stateOf(stepSchema([{ hide: ["mf/G1"] }, { show: ["mf/G2"] }])));
    expect([groups.G1?.["x-hidden"], groups.G2?.["x-hidden"]]).toEqual([true, false]);
  });

  it("switches a group by the source value, through when/else", () => {
    const schema = stepSchema([
      { when: { properties: { X: { const: YES } } }, show: ["mf/G2"], else: { hide: ["mf/G2"] } },
    ]);
    expect(groupsOf(stateOf(schema, { input: { X: YES } })).G2?.["x-hidden"]).toBe(false);
    expect(groupsOf(stateOf(schema, { input: { X: NO } })).G2?.["x-hidden"]).toBe(true);
  });

  it("disables through a path", () => {
    expect(cellsOf(groupsOf(stateOf(stepSchema([{ disable: ["mf/G1/other"] }]))).G1).other).toEqual({
      type: "string",
      "x-disabled": true,
    });
  });

  it("patches keywords through a path", () => {
    const groups = groupsOf(stateOf(stepSchema([{ patch: { "mf/G2/cell": { readOnly: true, title: "Rate" } } }])));
    expect(cellsOf(groups.G2).cell).toEqual({ type: "number", readOnly: true, title: "Rate" });
  });

  it("resolves a path through the sibling's own conditional branch, by the sibling's value", () => {
    const schema = stepSchema([{ hide: ["mf/G3"] }]);
    schema.properties!.mf!.allOf!.push({
      if: { properties: { Kind: { const: "loan" } } },
      [thenKeyword]: { properties: { G3: { type: "array", items: { type: "object" } } } },
    });
    expect(groupsOf(stateOf(schema, { mf: { Kind: "loan" } }), { Kind: "loan" }).G3?.["x-hidden"]).toBe(true);
    expect(groupsOf(stateOf(schema, { mf: { Kind: "card" } }), { Kind: "card" })).not.toHaveProperty("G3");
  });

  it.each([
    ["an undeclared group", "mf/Missing"],
    ["an undeclared cell", "mf/G1/missing"],
    ["a segment below a scalar", "note/deeper"],
  ])("leaves the sibling untouched for %s", (_name, target) => {
    const schema = stepSchema([{ hide: [target] }]);
    const properties = stateOf(schema);
    const first = target.split("/")[0]!;
    expect(properties[first]).toBe(schema.properties![first]);
  });

  it("does not mutate the schema", () => {
    const schema = stepSchema([{ hide: ["mf/G1/cell"] }]);
    const before = structuredClone(schema);
    stateOf(schema);
    expect(schema).toEqual(before);
  });

  it.each<[string, ChangeActions, RegExp]>([
    ["an unknown first segment", { hide: ["nope/G1"] }, /x-on-change on "input".*unknown target "nope\/G1"/],
    ["an unknown first segment in a patch", { patch: { "nope/G1": { readOnly: true } } }, /x-on-change on "input".*unknown target "nope\/G1"/],
    ["an empty segment", { hide: ["mf//G1"] }, /x-on-change on "input".*"mf\/\/G1".*empty/],
    ["a leading slash", { show: ["/mf"] }, /x-on-change on "input".*"\/mf".*empty/],
    ["a trailing slash", { disable: ["mf/"] }, /x-on-change on "input".*"mf\/".*empty/],
    ["set with a path", { set: { "mf/G1": [] } }, /x-on-change on "input".*set "mf\/G1".*path/],
    ["reset with a path", { reset: ["mf/G1"] }, /x-on-change on "input".*reset "mf\/G1".*path/],
    ["require with a path", { require: ["mf/G1"] }, /x-on-change on "input".*require "mf\/G1".*path/],
    ["optional with a path", { optional: ["mf/G1"] }, /x-on-change on "input".*optional "mf\/G1".*path/],
    ["hide and show on the same path", { hide: ["mf/G1"], show: ["mf/G1"] }, /x-on-change on "input".*both hide and show "mf\/G1"/],
    ["a patch injecting load listeners", { patch: { mf: { "x-on-load": [] } } }, /x-on-change on "input".*patch "mf" may not set x-on-load/],
  ])("throws on %s", (_name, actions, message) => {
    expect(() => stateOf(stepSchema([actions]))).toThrow(message);
  });

  it("throws when a target is both a declared key and a path", () => {
    const schema = stepSchema([{ hide: ["a/b"] }]);
    schema.properties!["a/b"] = { type: "string" };
    schema.properties!.a = { type: "object", properties: { b: { type: "string" } } };
    expect(() => stateOf(schema)).toThrow(/x-on-change on "input".*"a\/b" is both a declared key and a path/);
  });
});

function loadSchema(onLoad: ChangeListener[], change: ChangeListener[] = []): JsonSchemaObject {
  return {
    type: "object",
    "x-on-load": onLoad,
    properties: {
      Mode: { type: "string", "x-on-change": change },
      Amount: { type: "number" },
      Hidden: { type: "string", "x-hidden": true },
      mf: stepSchema([]).properties!.mf!,
    },
  };
}

function hiddenOf(properties: Record<string, JsonSchemaProperty>): string[] {
  return Object.keys(properties).filter((key) => properties[key]?.["x-hidden"] === true).sort();
}

describe("applyListenerState x-on-load", () => {
  it("applies before x-on-change, so a change listener can show what load hid", () => {
    expect(hiddenOf(stateOf(loadSchema([{ hide: ["Amount"] }], [{ show: ["Amount"] }])))).toEqual(["Hidden"]);
  });

  it("applies before x-on-change, so a change listener can hide what load showed", () => {
    expect(hiddenOf(stateOf(loadSchema([{ show: ["Hidden"] }], [{ hide: ["Hidden"] }])))).toEqual(["Hidden"]);
  });

  it("applies load listeners in order, a later one winning", () => {
    expect(hiddenOf(stateOf(loadSchema([{ hide: ["Amount"] }, { show: ["Amount"] }])))).toEqual(["Hidden"]);
  });

  it("evaluates a nested properties predicate against the object itself", () => {
    const schema = loadSchema([{ when: { properties: { Mode: { const: YES } } }, hide: ["Amount"] }]);
    expect(hiddenOf(stateOf(schema, { Mode: YES }))).toEqual(["Amount", "Hidden"]);
    expect(hiddenOf(stateOf(schema, { Mode: NO }))).toEqual(["Hidden"]);
  });

  it("hands expr the object as both value and self, with an empty key", () => {
    const evaluate = vi.fn<ExpressionEvaluator>(({ self }) => self.Mode === YES);
    const value = { Mode: YES };
    const schema = loadSchema([{ when: { expr: "self.Mode == '01'" }, hide: ["Amount"] }]);
    expect(hiddenOf(stateOf(schema, value, evaluate))).toEqual(["Amount", "Hidden"]);
    expect(evaluate).toHaveBeenCalledWith({ expr: "self.Mode == '01'", key: "", value, self: value, root: value });
  });

  it("takes listeners from unconditional allOf members and from the branch that applies", () => {
    const schema = loadSchema([]);
    schema.allOf = [
      { "x-on-load": [{ disable: ["Amount"] }] },
      {
        if: { properties: { Mode: { const: YES } } },
        [thenKeyword]: { "x-on-load": [{ hide: ["Amount"] }] },
        else: { "x-on-load": [{ show: ["Hidden"] }] },
      },
    ];
    const matching = stateOf(schema, { Mode: YES });
    expect([hiddenOf(matching), matching.Amount?.["x-disabled"]]).toEqual([["Amount", "Hidden"], true]);
    expect(hiddenOf(stateOf(schema, { Mode: NO }))).toEqual([]);
  });

  it("applies root listeners before allOf ones", () => {
    const schema = loadSchema([{ hide: ["Amount"] }]);
    schema.allOf = [{ "x-on-load": [{ show: ["Amount"] }] }];
    expect(hiddenOf(stateOf(schema))).toEqual(["Hidden"]);
  });

  it("targets paths", () => {
    const properties = stateOf(loadSchema([{ hide: ["mf/G1/cell"], patch: { "mf/G2": { title: "Rates" } } }]));
    const groups = groupsOf(properties);
    expect([cellsOf(groups.G1).cell?.["x-hidden"], groups.G2?.title]).toEqual([true, "Rates"]);
  });

  it.each<[string, ChangeListener, RegExp]>([
    ["set", { set: { Amount: 1 } }, /x-on-load at #\/x-on-load\/0.*set.*not allowed/],
    ["reset", { reset: ["Amount"] }, /x-on-load at #\/x-on-load\/0.*reset.*not allowed/],
    ["require", { require: ["Amount"] }, /x-on-load at #\/x-on-load\/0.*require.*not allowed/],
    ["optional in else", { when: { properties: { Mode: { const: YES } } }, else: { optional: ["Amount"] } }, /x-on-load at #\/x-on-load\/0.*optional.*not allowed/],
    ["an unknown target", { hide: ["Missing"] }, /x-on-load at #\/x-on-load\/0.*unknown target "Missing"/],
    ["a when with nothing evaluable", { when: { type: "string" }, hide: ["Amount"] }, /x-on-load at #\/x-on-load\/0.*nothing it can evaluate/],
  ])("throws on %s", (_name, listener, message) => {
    expect(() => stateOf(loadSchema([listener]), { Mode: YES })).toThrow(message);
  });

  it("names the allOf member a failing listener came from", () => {
    const schema = loadSchema([]);
    schema.allOf = [{ if: { properties: { Mode: { const: YES } } }, [thenKeyword]: { "x-on-load": [{ set: { Amount: 1 } }] } }];
    expect(() => stateOf(schema, { Mode: YES })).toThrow(/x-on-load at #\/allOf\/0\/then\/x-on-load\/0/);
  });

  it("throws when x-on-load is not an array", () => {
    const schema = loadSchema([]);
    schema["x-on-load"] = { hide: ["Amount"] } as unknown as ChangeListener[];
    expect(() => stateOf(schema)).toThrow(/#\/x-on-load must be an array of listeners/);
  });
});
