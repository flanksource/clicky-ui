import { describe, expect, it } from "vitest";
import { normalizeSchemaForMonaco } from "./schema-normalizer";

describe("normalizeSchemaForMonaco", () => {
  it("converts draft 2020-12 definitions and local references", () => {
    const result = normalizeSchemaForMonaco({
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
      $defs: { postgres: { type: "object", required: ["url"] } },
      allOf: [{ $ref: "#/$defs/postgres" }],
    });

    expect(result.unsupportedKeywords).toEqual([]);
    expect(result.schema).toMatchObject({
      $schema: "http://json-schema.org/draft-07/schema#",
      definitions: { postgres: { type: "object", required: ["url"] } },
      allOf: [{ $ref: "#/definitions/postgres" }],
    });
    expect(result.schema).not.toHaveProperty("$defs");
  });

  it("refuses unsupported newer-draft keywords", () => {
    const result = normalizeSchemaForMonaco({
      type: "object",
      unevaluatedProperties: false,
      dependentRequired: { name: ["type"] },
    });

    expect(result.schema).toBeUndefined();
    expect(result.unsupportedKeywords).toEqual(["dependentRequired", "unevaluatedProperties"]);
  });
});
