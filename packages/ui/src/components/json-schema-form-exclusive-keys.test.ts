import { describe, expect, it } from "vitest";
import { exclusiveKeys, switchExclusiveKey } from "./json-schema-form-exclusive-keys";
import type { JsonSchemaObject } from "./json-schema-form-types";

const statement = { type: "string" } as const;
const properties = { MUST: statement, "MUST NOT": statement, SHOULD: statement, status: { type: "string" } as const };
const keyed = (oneOf: unknown[]): JsonSchemaObject => ({ type: "object", properties, oneOf } as JsonSchemaObject);

describe("exclusiveKeys", () => {
  it("names the properties of a oneOf whose branches each require exactly one of them", () => {
    expect(exclusiveKeys(keyed([{ required: ["MUST"] }, { required: ["MUST NOT"] }, { required: ["SHOULD"] }]))).toEqual(["MUST", "MUST NOT", "SHOULD"]);
  });

  it.each([
    ["no oneOf", undefined],
    ["a single branch", [{ required: ["MUST"] }]],
    ["a branch requiring two keys", [{ required: ["MUST", "SHOULD"] }, { required: ["MUST NOT"] }]],
    ["a branch with its own constraints", [{ required: ["MUST"], properties: { MUST: { minLength: 3 } } }, { required: ["SHOULD"] }]],
    ["a branch naming an undeclared property", [{ required: ["MUST"] }, { required: ["MAY"] }]],
  ])("finds none for %s", (_case, oneOf) => {
    expect(exclusiveKeys({ type: "object", properties, ...(oneOf ? { oneOf } : {}) } as JsonSchemaObject)).toBeUndefined();
  });
});

describe("switchExclusiveKey", () => {
  it("moves the value to the chosen key and drops the other keys, keeping unrelated fields", () => {
    expect(switchExclusiveKey({ value: { MUST: "create the policy", status: "built" }, keys: ["MUST", "MUST NOT", "SHOULD"], next: "SHOULD" }))
      .toEqual({ SHOULD: "create the policy", status: "built" });
  });

  it("sets nothing for the chosen key while no key holds a value yet", () => {
    expect(switchExclusiveKey({ value: { status: "built" }, keys: ["MUST", "SHOULD"], next: "SHOULD" })).toEqual({ status: "built" });
  });
});
