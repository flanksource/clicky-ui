import { describe, expect, it } from "vitest";
import { matchesFieldFilter } from "./json-schema-form-filter";
import type { JsonSchemaProperty } from "./json-schema-form-types";

describe("schema-aware value matching", () => {
  it.each([
    [
      { type: "string", "x-enum-labels": { s: "Small team" } },
      "s",
      "TEAM",
      true,
    ],
    [{ type: "array", items: { type: "number" } }, [0, 5], "0", true],
    [
      { type: "object", additionalProperties: { type: "string" } },
      { owner: "Platform" },
      "platform",
      true,
    ],
    [
      { type: "object", additionalProperties: true },
      { owner: "Platform" },
      "platform",
      true,
    ],
    [
      {
        type: "object",
        patternProperties: { "^private": { format: "password" } },
      },
      { privateKey: "secret-fixture" },
      "secret-fixture",
      false,
    ],
    [
      { type: "array", items: { format: "password" } },
      ["secret-fixture"],
      "secret-fixture",
      false,
    ],
    [
      { properties: { visible: { type: "string" } } },
      { hidden: "secret-fixture" },
      "secret-fixture",
      false,
    ],
  ] satisfies [JsonSchemaProperty, unknown, string, boolean][])(
    "matches %j with value %j",
    (prop, value, filter, expected) => {
      expect(matchesFieldFilter({ key: "field", prop, value, filter })).toBe(
        expected,
      );
    },
  );

  it("searches the active conditional branch", () => {
    const prop: JsonSchemaProperty = {
      type: "object",
      properties: { mode: { type: "string" } },
      allOf: [
        {
          if: { properties: { mode: { const: "local" } } },
          then: {
            properties: { host: { type: "string", title: "Local host" } },
          },
        },
      ],
    };
    expect(
      matchesFieldFilter({
        key: "connection",
        prop,
        value: { mode: "local", host: "localhost" },
        filter: "localhost",
      }),
    ).toBe(true);
  });
});
