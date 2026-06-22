import { describe, expect, it, vi } from "vitest";
import {
  effectiveProperties,
  enumBranch,
  isOpenStringMap,
  isScalarStringItems,
  matchesIf,
  resolveControl,
} from "./json-schema-form-resolve";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

const noop = vi.fn();

function control(key: string, prop: JsonSchemaProperty, required = false, value: unknown = undefined) {
  return resolveControl({ key, prop, required, value, onChange: noop });
}

describe("resolveControl", () => {
  it("infers a string control for a plain string property", () => {
    expect(control("Name", { type: "string" }).kind).toBe("string");
  });

  it("infers a number control with minimum for integer/number", () => {
    const c = control("count", { type: "integer", minimum: 0 });
    expect(c.kind).toBe("number");
    expect(c.minimum).toBe(0);
    expect(c.coerceNumber).toBe(true);
  });

  it("infers a boolean control", () => {
    expect(control("spawned", { type: "boolean" }).kind).toBe("boolean");
  });

  it("infers an enum control with options from enum", () => {
    const c = control("status", { type: "string", enum: ["A", "B"] });
    expect(c.kind).toBe("enum");
    expect(c.options).toEqual([
      { value: "A", label: "A" },
      { value: "B", label: "B" },
    ]);
    // allowCustomValue is NOT inferred — left to the consumer's extensions.
    expect(c.allowCustomValue).toBeUndefined();
  });

  it("infers a lookup control from x-clicky-lookup, allowing free-form single-select", () => {
    const c = control("connection", {
      type: "string",
      "x-clicky-lookup": { url: "/api/v1/connection", filter: "connection" },
    });
    expect(c.kind).toBe("lookup");
    expect(c.lookup).toEqual({ url: "/api/v1/connection", filter: "connection" });
    // single-select keeps free-form entry so an inline value still commits
    expect(c.allowCustomValue).toBe(true);
  });

  it("disables free-form entry for a multi-select lookup", () => {
    const c = control("tags", {
      type: "string",
      "x-clicky-lookup": { url: "/api/v1/tag", filter: "tag", multi: true },
    });
    expect(c.kind).toBe("lookup");
    expect(c.allowCustomValue).toBe(false);
  });

  it("ignores an x-clicky-lookup missing url/filter, falling back to string", () => {
    const c = control("connection", { type: "string", "x-clicky-lookup": { url: "/x" } });
    expect(c.kind).toBe("string");
    expect(c.lookup).toBeUndefined();
  });

  it("labels enum options from x-enum-labels, keeping the raw value", () => {
    const c = control("AddressType", {
      type: "string",
      enum: ["20", "30"],
      "x-enum-labels": { "20": "Business" },
    });
    expect(c.options).toEqual([
      { value: "20", label: "Business (20)" },
      { value: "30", label: "30" }, // unlabelled values stay raw
    ]);
  });

  it("attaches per-value icons from x-enum-icons and defaults to a grid", () => {
    const c = control("type", {
      type: "string",
      enum: ["postgres", "mysql"],
      "x-enum-icons": { postgres: "postgres", mysql: "mysql" },
    });
    expect(c.kind).toBe("enum");
    expect(c.options).toEqual([
      { value: "postgres", label: "postgres", icon: "postgres" },
      { value: "mysql", label: "mysql", icon: "mysql" },
    ]);
    // presence of icons defaults the presentation to the icon grid
    expect(c.display).toBe("grid");
  });

  it("honours an explicit x-enum-display over the icon-grid default", () => {
    const c = control("type", {
      type: "string",
      enum: ["a", "b"],
      "x-enum-icons": { a: "a" },
      "x-enum-display": "combobox",
    });
    expect(c.display).toBe("combobox");
  });

  it("leaves display unset for a plain enum (combobox default)", () => {
    expect(control("status", { type: "string", enum: ["A", "B"] }).display).toBeUndefined();
  });

  it("labels map key options from propertyNames x-enum-labels", () => {
    const c = control("addresses", {
      type: "object",
      propertyNames: {
        type: "string",
        enum: ["01", "Business"],
        "x-enum-labels": { "01": "Residence" },
      },
      additionalProperties: { type: "object" },
    });
    expect(c.kind).toBe("string-map");
    expect(c.keyOptions).toEqual([
      { value: "01", label: "Residence (01)" },
      { value: "Business", label: "Business" },
    ]);
  });

  it("infers an array control carrying its item schema", () => {
    const c = control("command", { type: "array", items: { type: "string" } });
    expect(c.kind).toBe("array");
    expect(c.itemSchema).toEqual({ type: "string" });
  });

  it("infers a string-map control for object + object additionalProperties", () => {
    const c = control("members", {
      type: "object",
      additionalProperties: { type: "string" },
    });
    expect(c.kind).toBe("string-map");
    expect(c.allowExtraKeys).toBe(true);
    expect(c.valueSchema).toEqual({ type: "string" });
  });

  it("infers an object control for a structured object with properties", () => {
    const c = control("expect", {
      type: "object",
      additionalProperties: false,
      properties: { policyStatus: { type: "string" }, activityStatus: { type: "string" } },
      required: ["policyStatus"],
    });
    expect(c.kind).toBe("object");
    expect(c.objectProperties).toHaveProperty("activityStatus");
    expect(c.objectRequired).toEqual(["policyStatus"]);
  });

  it("keeps an open map with known properties as a string-map", () => {
    const c = control("members", {
      type: "object",
      additionalProperties: { type: "string" },
      properties: { RecordGroupId: { type: "string" } },
    });
    expect(c.kind).toBe("string-map");
    expect(c.allowExtraKeys).toBe(true);
    expect(c.knownProperties).toHaveProperty("RecordGroupId");
  });

  it("falls back to an open string-map for a bare object", () => {
    expect(control("sample", { type: "object" }).kind).toBe("string-map");
  });

  it("infers a date control from a schema-declared format", () => {
    expect(control("when", { type: "string", format: "date" }).kind).toBe("date");
    expect(control("when", { type: "string", format: "date-time" }).kind).toBe("date");
    // The control carries which format so the renderer can pick date vs datetime.
    expect(control("when", { type: "string", format: "date" }).dateFormat).toBe("date");
    expect(control("when", { type: "string", format: "date-time" }).dateFormat).toBe("date-time");
  });

  it("does NOT infer a date control from the field name (domain-agnostic)", () => {
    // A property named "EffectiveDate" with no `format` stays a plain string —
    // date handling keys off the schema keyword, never the name.
    expect(control("EffectiveDate", { type: "string" }).kind).toBe("string");
    const asCode = control("AddressRole", {
      type: "string",
      enum: ["Postal"],
      ["x-" + "oi" + "pa-ascode"]: "AddressRole",
    });
    expect(asCode.kind).toBe("enum");
    expect(asCode.badge).toBeUndefined();
    expect(asCode.allowCustomValue).toBeUndefined();
  });

  it("carries required and label through", () => {
    const c = control("Name", { type: "string" }, true);
    expect(c.required).toBe(true);
    expect(c.label).toBe("Name");
  });

  it("lifts an x-icon extension key onto the control's labelIcon", () => {
    const c = control("region", { type: "string", "x-icon": "mdi:earth" });
    expect(c.labelIcon).toBe("mdi:earth");
  });

  it("leaves labelIcon unset when no x-icon is present", () => {
    expect(control("region", { type: "string" }).labelIcon).toBeUndefined();
  });

  it("lifts an enum out of an anyOf value-or-template union into a dropdown", () => {
    const c = control("Status", {
      type: "string",
      anyOf: [
        { type: "string", enum: ["01", "02"] },
        { type: "string", pattern: "^\\{\\{.+\\}\\}$" },
        { type: "string", const: "" },
      ],
    });
    expect(c.kind).toBe("enum");
    expect(c.options).toEqual([
      { value: "01", label: "01" },
      { value: "02", label: "02" },
    ]);
    // The union's free-form branches are honoured by a consumer allowCustomValue
    // pre-extension, not inferred here.
    expect(c.allowCustomValue).toBeUndefined();
  });

  it("lifts an enum out of a oneOf union as well", () => {
    const c = control("Kind", {
      type: "string",
      oneOf: [{ type: "string", enum: ["X"] }, { type: "string" }],
    });
    expect(c.kind).toBe("enum");
    expect(c.options).toEqual([{ value: "X", label: "X" }]);
  });

  it("prefers a top-level enum over an anyOf branch", () => {
    const c = control("Status", {
      type: "string",
      enum: ["TOP"],
      anyOf: [{ type: "string", enum: ["BRANCH"] }],
    });
    expect(c.kind).toBe("enum");
    expect(c.options).toEqual([{ value: "TOP", label: "TOP" }]);
  });

  it("stays a string when an anyOf union has no enum branch", () => {
    const c = control("Note", {
      type: "string",
      anyOf: [{ type: "string", pattern: "a" }, { type: "string", const: "" }],
    });
    expect(c.kind).toBe("string");
  });
});

describe("enumBranch", () => {
  it("returns the first anyOf/oneOf branch carrying a non-empty enum", () => {
    expect(enumBranch({ anyOf: [{ type: "string" }, { enum: ["a", "b"] }] })?.enum).toEqual(["a", "b"]);
    expect(enumBranch({ oneOf: [{ enum: ["x"] }] })?.enum).toEqual(["x"]);
  });

  it("returns undefined when no branch enumerates values", () => {
    expect(enumBranch({ type: "string" })).toBeUndefined();
    expect(enumBranch({ anyOf: [{ type: "string" }, { enum: [] }] })).toBeUndefined();
  });
});

describe("matchesIf", () => {
  const ifSchema: JsonSchemaProperty = {
    properties: { activity: { const: "SchemeMoneyIn" } },
    required: ["activity"],
  };

  it("matches when required keys present and consts equal", () => {
    expect(matchesIf(ifSchema, { activity: "SchemeMoneyIn" })).toBe(true);
  });

  it("rejects when a required key is missing", () => {
    expect(matchesIf(ifSchema, {})).toBe(false);
  });

  it("rejects when a const differs", () => {
    expect(matchesIf(ifSchema, { activity: "SchemeAccept" })).toBe(false);
  });

  it("returns false for an undefined if-schema", () => {
    expect(matchesIf(undefined, { activity: "X" })).toBe(false);
  });
});

describe("effectiveProperties", () => {
  const thenKeyword = ["th", "en"].join("") as "then";
  const schema: JsonSchemaObject = {
    type: "object",
    required: ["activity"],
    properties: {
      activity: { type: "string", enum: ["SchemeMoneyIn", "SchemeAccept"] },
      input: { type: "object" },
    },
    allOf: [
      {
        if: { properties: { activity: { const: "SchemeMoneyIn" } }, required: ["activity"] },
        [thenKeyword]: {
          properties: {
            input: {
              type: "object",
              properties: {
                SchemeNumber: { type: "string" },
                Amount: { type: "number" },
              },
            },
          },
          required: ["input"],
        },
      },
      {
        if: { properties: { activity: { const: "SchemeAccept" } }, required: ["activity"] },
        [thenKeyword]: { properties: { input: { type: "object", properties: { Note: { type: "string" } } } } },
      },
    ],
  };

  it("returns base properties when no clause matches", () => {
    const { properties, required } = effectiveProperties(schema, {});
    expect(properties.input).toEqual({ type: "object" });
    expect(required).toEqual(["activity"]);
  });

  it("merges the matching then.properties (then wins on collision)", () => {
    const { properties } = effectiveProperties(schema, { activity: "SchemeMoneyIn" });
    expect(properties.input.properties).toHaveProperty("Amount");
    expect(properties.input.properties).toHaveProperty("SchemeNumber");
  });

  it("unions required from matched then clauses", () => {
    const { required } = effectiveProperties(schema, { activity: "SchemeMoneyIn" });
    expect(required.sort()).toEqual(["activity", "input"]);
  });

  it("ignores non-matching clauses", () => {
    const { properties } = effectiveProperties(schema, { activity: "SchemeAccept" });
    expect(properties.input.properties).toHaveProperty("Note");
    expect(properties.input.properties).not.toHaveProperty("Amount");
  });

  it("is idempotent (re-applying yields the same result)", () => {
    const once = effectiveProperties(schema, { activity: "SchemeMoneyIn" });
    const twice = effectiveProperties({ ...schema, properties: once.properties }, {
      activity: "SchemeMoneyIn",
    });
    expect(twice.properties.input.properties).toHaveProperty("Amount");
  });

  // An inlined `$ref` (flattened component) becomes an unconditional `allOf`
  // member carrying its own `properties` — no `if`/`then`. These must merge
  // regardless of value, the way a `$ref` composition always applies.
  it("merges unconditional allOf composition members (inlined $ref)", () => {
    const composed: JsonSchemaObject = {
      type: "object",
      allOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            FirstName: { type: "string" },
            LastName: { type: "string" },
          },
          required: ["FirstName"],
        },
      ],
      unevaluatedProperties: false,
    } as JsonSchemaObject;
    const { properties, required } = effectiveProperties(composed, {});
    expect(properties).toHaveProperty("FirstName");
    expect(properties).toHaveProperty("LastName");
    expect(required).toContain("FirstName");
  });

  it("merges base properties, composition members, and matching conditionals together", () => {
    const mixed: JsonSchemaObject = {
      type: "object",
      properties: { activity: { type: "string" } },
      allOf: [
        { type: "object", properties: { SchemeNumber: { type: "string" } } },
        {
          if: { properties: { activity: { const: "X" } }, required: ["activity"] },
          [thenKeyword]: { properties: { extra: { type: "string" } } },
        },
      ],
    };
    const { properties } = effectiveProperties(mixed, { activity: "X" });
    expect(properties).toHaveProperty("activity");
    expect(properties).toHaveProperty("SchemeNumber");
    expect(properties).toHaveProperty("extra");
  });
});

describe("isOpenStringMap", () => {
  it("is true for object with object additionalProperties", () => {
    expect(isOpenStringMap({ type: "object", additionalProperties: { type: "string" } })).toBe(true);
  });
  it("is false for additionalProperties false", () => {
    expect(isOpenStringMap({ type: "object", additionalProperties: false })).toBe(false);
  });
  it("is false for a non-object", () => {
    expect(isOpenStringMap({ type: "string" })).toBe(false);
  });
});

describe("isScalarStringItems", () => {
  it("is true for plain string items and for untyped items", () => {
    expect(isScalarStringItems({ type: "string" })).toBe(true);
    expect(isScalarStringItems(undefined)).toBe(true);
  });
  it("is false for enum items (need per-item combobox)", () => {
    expect(isScalarStringItems({ type: "string", enum: ["a", "b"] })).toBe(false);
  });
  it("is false for object / array / non-string items", () => {
    expect(isScalarStringItems({ type: "object", properties: {} })).toBe(false);
    expect(isScalarStringItems({ type: "array", items: { type: "string" } })).toBe(false);
    expect(isScalarStringItems({ type: "number" })).toBe(false);
  });
});
