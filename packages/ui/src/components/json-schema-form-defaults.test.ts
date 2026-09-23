import { describe, expect, it } from "vitest";
import { applySchemaDefaults } from "./json-schema-form-defaults";

describe("applySchemaDefaults", () => {
  it("recursively applies defaults without replacing existing values", () => {
    const value = { name: "existing", nested: {} };
    const result = applySchemaDefaults(
      {
        type: "object",
        properties: {
          name: { type: "string", default: "default" },
          nested: {
            type: "object",
            properties: { enabled: { type: "boolean", default: false } },
          },
        },
      },
      value,
    );
    expect(result).toEqual({ name: "existing", nested: { enabled: false } });
    expect(value).toEqual({ name: "existing", nested: {} });
  });

  it("uses a defaulted discriminator to select an if/then branch", () => {
    const result = applySchemaDefaults(
      {
        type: "object",
        properties: {
          authType: { type: "string", enum: ["none", "basic"], default: "none" },
        },
        allOf: [
          {
            if: {
              properties: { authType: { const: "none" } },
              required: ["authType"],
            },
            then: {
              properties: { anonymous: { type: "boolean", default: true } },
            },
          },
        ],
      },
      {},
    );
    expect(result).toEqual({ authType: "none", anonymous: true });
  });

  it("creates a missing nested object only when it contains a default", () => {
    const result = applySchemaDefaults(
      {
        type: "object",
        properties: {
          authentication: {
            type: "object",
            properties: { authType: { type: "string", default: "none" } },
          },
          untouched: {
            type: "object",
            properties: { label: { type: "string" } },
          },
        },
      },
      {},
    );
    expect(result).toEqual({ authentication: { authType: "none" } });
  });
});
