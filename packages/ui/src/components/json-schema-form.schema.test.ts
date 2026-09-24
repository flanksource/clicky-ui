import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Ajv2020 from "ajv/dist/2020";
import { describe, expect, it } from "vitest";
import { collectionLayoutsSchema } from "./json-schema-form-collection-layouts.fixtures";
import { allPropertiesSchema } from "./json-schema-form-properties.fixtures";

const here = dirname(fileURLToPath(import.meta.url));
const metaSchema = JSON.parse(
  readFileSync(resolve(here, "../../schemas/json-schema-form.schema.json"), "utf8"),
) as { properties: Record<string, { description?: string }> };
const typesSource = readFileSync(resolve(here, "json-schema-form-types.ts"), "utf8");

// Keys read only by the opt-in extensions (createUnitFormExtensions,
// createSecretFormExtensions), not by the form itself, so they are documented in
// the schema without being declared on JsonSchemaProperty.
const OPT_IN_KEYS = ["x-clicky-component", "x-clicky-default-source", "x-clicky-unit"];

function interfaceExtensionKeys(name: string): string[] {
  const body = typesSource.split(`export interface ${name} `)[1]?.split("\n}")[0];
  if (!body) throw new Error(`interface ${name} not found in json-schema-form-types.ts`);
  return [...body.matchAll(/^\s*"(x-[a-z-]+)"\?:/gm)].map((m) => m[1]!);
}

function validator() {
  // strictTypes is off because a meta-schema cannot pin `type: object` next to
  // `properties`: a boolean (`true`/`false`) is a valid subschema too.
  const ajv = new Ajv2020({ strict: true, strictTypes: false, allErrors: true });
  return ajv.compile(metaSchema);
}

describe("json-schema-form.schema.json", () => {
  it("compiles as a 2020-12 meta-schema in strict mode", () => {
    expect(validator).not.toThrow();
  });

  it("documents exactly the x-* keys JsonSchemaProperty/JsonSchemaObject declare, plus opt-in extension keys", () => {
    const declared = [
      ...interfaceExtensionKeys("JsonSchemaProperty"),
      ...interfaceExtensionKeys("JsonSchemaObject"),
      ...OPT_IN_KEYS,
    ].sort();
    const documented = Object.keys(metaSchema.properties).filter((k) => k.startsWith("x-")).sort();
    expect(documented).toEqual(declared);
  });

  it("gives every documented keyword a description", () => {
    const undocumented = Object.entries(metaSchema.properties)
      .filter(([, def]) => !def.description?.trim())
      .map(([key]) => key);
    expect(undocumented).toEqual([]);
  });

  const validSchemas: [string, unknown][] = [
    ["the all-properties fixture", allPropertiesSchema],
    ["the collection-layouts fixture", collectionLayoutsSchema],
    [
      "listeners with when/else, expr, set and reset",
      {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["auto", "manual"],
            "x-on-change": [
              {
                when: { const: "manual", expr: "self.amount > 0" },
                show: ["amount"],
                require: ["amount"],
                set: { retries: 3 },
                else: { hide: ["amount"], reset: ["amount"] },
              },
            ],
          },
          amount: { type: "number", "x-hidden": true, default: 0 },
        },
      },
    ],
    [
      "an allOf branch flipping x-hidden and x-disabled",
      {
        type: "object",
        "x-discriminator": "kind",
        properties: { kind: { enum: ["a", "b"] }, extra: { type: "string", "x-hidden": true } },
        allOf: [
          {
            if: { properties: { kind: { const: "b" } } },
            then: { properties: { extra: { type: "string", "x-hidden": false, "x-disabled": true } } },
          },
        ],
      },
    ],
    [
      "a listener patching readOnly, writeOnly, title and bounds",
      {
        type: "object",
        properties: {
          mode: {
            type: "string",
            "x-on-change": [
              {
                when: { const: "locked" },
                patch: { amount: { readOnly: true, title: "Locked amount", maximum: 25 }, token: { writeOnly: true } },
                else: { patch: { amount: { readOnly: false } } },
              },
            ],
          },
          amount: { type: "number" },
          token: { type: "string" },
        },
      },
    ],
    [
      "path targets and x-on-load, at the root and in an allOf branch",
      {
        type: "object",
        "x-on-load": [{ hide: ["groups/Rates/Amount"], patch: { "groups/Rates": { title: "Rates" } } }],
        properties: {
          mode: {
            type: "string",
            "x-on-change": [{ when: { const: "01" }, show: ["groups/Rates"], else: { hide: ["groups/Rates"] } }],
          },
          groups: { type: "object" },
        },
        allOf: [
          { "x-on-load": [{ disable: ["mode"] }] },
          {
            if: { properties: { mode: { const: "02" } } },
            then: { "x-on-load": [{ when: { properties: { mode: { const: "02" } } }, show: ["groups"] }] },
          },
        ],
      },
    ],
    [
      "unknown consumer x-* keys",
      { type: "object", properties: { a: { type: "string", "x-acme-widget": { any: "shape" } } } },
    ],
  ];

  it.each(validSchemas)("accepts %s", (_, schema) => {
    const validate = validator();
    expect(validate(schema), JSON.stringify(validate.errors)).toBe(true);
  });

  const nest = (field: Record<string, unknown>) => ({
    type: "object",
    properties: {
      a: { type: "array", items: { type: "object", properties: { b: field } } },
    },
  });

  const invalidFields: [string, Record<string, unknown>, string][] = [
    ["an unknown x-enum-display", { enum: ["x"], "x-enum-display": "dropdown" }, "/x-enum-display"],
    ["a zero x-col-span", { type: "string", "x-col-span": 0 }, "/x-col-span"],
    ["a non-numeric x-columns", { type: "object", "x-columns": "two" }, "/x-columns"],
    ["x-on-change that is not an array", { type: "string", "x-on-change": { hide: ["a"] } }, "/x-on-change"],
    ["a misspelled x-on-change action", { type: "string", "x-on-change": [{ hides: ["a"] }] }, "/x-on-change/0"],
    ["a patch setting a shape keyword", { type: "string", "x-on-change": [{ patch: { a: { type: "number" } } }] }, "/x-on-change/0/patch/a"],
    ["a patch target that is not an object", { type: "string", "x-on-change": [{ patch: { a: true } }] }, "/x-on-change/0/patch/a"],
    ["x-on-load that is not an array", { type: "object", "x-on-load": { hide: ["a"] } }, "/x-on-load"],
    ["an x-on-load value action", { type: "object", "x-on-load": [{ set: { a: 1 } }] }, "/x-on-load/0"],
    ["an x-on-load required action in else", { type: "object", "x-on-load": [{ when: { const: 1 }, else: { require: ["a"] } }] }, "/x-on-load/0/else"],
    ["an unknown x-item action", { type: "array", "x-item": { actions: ["delete"] } }, "/x-item/actions/0"],
    ["x-clicky-lookup without filter", { type: "string", "x-clicky-lookup": { url: "/x" } }, "/x-clicky-lookup"],
    ["an unknown x-enum-tones hue", { enum: ["x"], "x-enum-tones": { x: "red" } }, "/x-enum-tones/x"],
  ];

  describe.each([
    ["at the top level", (field: Record<string, unknown>) => field, ""],
    ["nested under properties/items/properties", nest, "/properties/a/items/properties/b"],
  ])("rejects %s", (_, wrap, prefix) => {
    it.each(invalidFields)("%s", (_, field, path) => {
      const validate = validator();
      expect(validate(wrap(field))).toBe(false);
      expect(validate.errors?.map((e) => e.instancePath)).toContain(`${prefix}${path}`);
    });
  });
});
