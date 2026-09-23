import { describe, expect, it } from "vitest";
import { effectiveProperties, matchesIf } from "./json-schema-form-conditionals";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

// `then` is the JSON Schema 2020-12 conditional keyword, not a Promise
// thenable; spelling it indirectly keeps unicorn/no-thenable quiet on these
// schema literals.
const thenKeyword = ["th", "en"].join("") as "then";

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

  it("matches an enum predicate only for a member value", () => {
    const anyScheme: JsonSchemaProperty = {
      properties: { activity: { enum: ["SchemeMoneyIn", "SchemeAccept"] } },
      required: ["activity"],
    };
    expect(matchesIf(anyScheme, { activity: "SchemeAccept" })).toBe(true);
    expect(matchesIf(anyScheme, { activity: "SchemeInstall" })).toBe(false);
  });

  it("negates a const with `not` — the OIPA `<>` guard", () => {
    const notAdd: JsonSchemaProperty = {
      properties: { MemberClassGroupOption: { not: { const: "01" } } },
      required: ["MemberClassGroupOption"],
    };
    expect(matchesIf(notAdd, { MemberClassGroupOption: "02" })).toBe(true);
    expect(matchesIf(notAdd, { MemberClassGroupOption: "01" })).toBe(false);
  });

  it("negates an enum with `not`", () => {
    const notTerminal: JsonSchemaProperty = {
      properties: { status: { not: { enum: ["01", "99"] } } },
      required: ["status"],
    };
    expect(matchesIf(notTerminal, { status: "02" })).toBe(true);
    expect(matchesIf(notTerminal, { status: "99" })).toBe(false);
  });

  // Failing closed is the point: a branch the form cannot verify must not be
  // merged into the schema the user edits.
  it("returns false for a predicate it cannot evaluate", () => {
    expect(matchesIf({ properties: { name: { pattern: "^a" } as JsonSchemaProperty } }, { name: "abc" })).toBe(false);
    expect(matchesIf({ properties: { age: { minimum: 18 } } }, { age: 21 })).toBe(false);
    expect(matchesIf({ properties: { name: {} } }, { name: "abc" })).toBe(false);
  });

  it("returns false when `not` wraps a predicate it cannot evaluate", () => {
    expect(matchesIf({ properties: { age: { not: { minimum: 18 } } } }, { age: 21 })).toBe(false);
  });

  it("still matches an if-schema carrying only `required`", () => {
    expect(matchesIf({ required: ["input"] }, { input: {} })).toBe(true);
    expect(matchesIf({ required: ["input"] }, {})).toBe(false);
  });

  it("evaluates a nested properties/required sub-schema against value[k]", () => {
    const nested: JsonSchemaProperty = {
      properties: {
        input: {
          properties: { MemberClassOption: { const: "01" } },
          required: ["MemberClassOption"],
        },
      },
      required: ["input"],
    };
    expect(matchesIf(nested, { input: { MemberClassOption: "01" } })).toBe(true);
    expect(matchesIf(nested, { input: { MemberClassOption: "02" } })).toBe(false);
    expect(matchesIf(nested, { input: {} })).toBe(false);
  });

  it("rejects a nested sub-schema when value[k] is not an object", () => {
    const nested: JsonSchemaProperty = {
      properties: { input: { properties: { MemberClassOption: { const: "01" } } } },
    };
    expect(matchesIf(nested, { input: "01" })).toBe(false);
  });
});

describe("effectiveProperties", () => {
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

  describe("else", () => {
    const branched: JsonSchemaObject = {
      type: "object",
      properties: { mode: { type: "string", enum: ["add", "update"] } },
      allOf: [
        {
          if: { properties: { mode: { const: "add" } }, required: ["mode"] },
          [thenKeyword]: { properties: { NewClassGroup: { type: "string" } }, required: ["NewClassGroup"] },
          else: { properties: { CurrentClassGroup: { type: "string" } }, required: ["CurrentClassGroup"] },
        },
      ],
    };

    it("merges else.properties when the if does not match", () => {
      const { properties, required } = effectiveProperties(branched, { mode: "update" });
      expect(properties).toHaveProperty("CurrentClassGroup");
      expect(properties).not.toHaveProperty("NewClassGroup");
      expect(required).toContain("CurrentClassGroup");
    });

    it("merges then.properties and skips else when the if matches", () => {
      const { properties, required } = effectiveProperties(branched, { mode: "add" });
      expect(properties).toHaveProperty("NewClassGroup");
      expect(properties).not.toHaveProperty("CurrentClassGroup");
      expect(required).toEqual(["NewClassGroup"]);
    });

    it("takes the else branch when the if is unevaluatable (fails closed)", () => {
      const unevaluatable: JsonSchemaObject = {
        type: "object",
        properties: { mode: { type: "string" } },
        allOf: [
          {
            if: { properties: { mode: { pattern: "^a" } as JsonSchemaProperty } },
            [thenKeyword]: { properties: { Matched: { type: "string" } } },
            else: { properties: { Fallback: { type: "string" } } },
          },
        ],
      };
      const { properties } = effectiveProperties(unevaluatable, { mode: "add" });
      expect(properties).toHaveProperty("Fallback");
      expect(properties).not.toHaveProperty("Matched");
    });
  });

  it("merges a then branch selected by a nested if predicate", () => {
    const nested: JsonSchemaObject = {
      type: "object",
      properties: { input: { type: "object", properties: { MemberClassOption: { type: "string" } } } },
      allOf: [
        {
          if: {
            properties: {
              input: {
                properties: { MemberClassOption: { const: "01" } },
                required: ["MemberClassOption"],
              },
            },
            required: ["input"],
          },
          [thenKeyword]: {
            properties: {
              input: {
                type: "object",
                properties: {
                  MemberClassOption: { type: "string" },
                  MemberGroupBenefits: { type: "string" },
                },
              },
            },
          },
        },
      ],
    };
    expect(
      effectiveProperties(nested, { input: { MemberClassOption: "01" } }).properties.input.properties,
    ).toHaveProperty("MemberGroupBenefits");
    expect(
      effectiveProperties(nested, { input: { MemberClassOption: "02" } }).properties.input.properties,
    ).not.toHaveProperty("MemberGroupBenefits");
  });
});
