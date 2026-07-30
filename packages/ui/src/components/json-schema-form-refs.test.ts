import { describe, expect, it } from "vitest";
import { rehydrateRefs } from "./json-schema-form-refs";
import type { JsonSchemaObject } from "./json-schema-form-types";

describe("rehydrateRefs", () => {
  it("returns a schema with no $defs unchanged", () => {
    const schema = {
      type: "object",
      properties: { a: { type: "string" } },
    } as JsonSchemaObject;
    expect(rehydrateRefs(schema)).toBe(schema);
  });

  it("resolves repeated #/$defs refs and shares the component by reference", () => {
    const schema = {
      type: "object",
      properties: {
        a: { $ref: "#/$defs/addr" },
        b: { $ref: "#/$defs/addr" },
      },
      $defs: {
        addr: { type: "object", properties: { country: { type: "string" } } },
      },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.$defs).toBeUndefined();
    // Both positions resolve to the component body…
    expect(out.properties.a.properties.country).toEqual({ type: "string" });
    expect(out.properties.b.properties.country).toEqual({ type: "string" });
    // …and share the SAME object (resolved once, not copied per reference).
    expect(out.properties.a).toBe(out.properties.b);
  });

  it("resolves a $ref inside an allOf member so its properties merge", () => {
    const schema = {
      type: "object",
      properties: {
        fields: { allOf: [{ $ref: "#/$defs/cust" }] },
      },
      $defs: {
        cust: { type: "object", properties: { Owner: { type: "string" } } },
      },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.fields.allOf[0].properties.Owner).toEqual({
      type: "string",
    });
  });

  it("resolves arbitrary nested fragment pointers and decodes escaped tokens", () => {
    const schema = {
      type: "object",
      properties: {
        account: {
          $ref: "#/$defs/version~1company~02026/$defs/account~1dimensions",
        },
      },
      $defs: {
        "version/company~2026": {
          $defs: {
            "account/dimensions": {
              type: "object",
              properties: { asset_category: { type: "string" } },
            },
          },
        },
      },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.account.properties.asset_category).toEqual({
      type: "string",
    });
  });

  it("percent-decodes URI fragment pointers before traversing them", () => {
    const schema = {
      properties: { value: { $ref: "#/%24defs/account%20role" } },
      $defs: { "account role": { type: "string", title: "Account role" } },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.value).toMatchObject({
      type: "string",
      title: "Account role",
    });
  });

  it("traverses array indices without treating arbitrary properties as indices", () => {
    const schema = {
      properties: {
        valid: { $ref: "#/$defs/versions/0/$defs/role" },
        invalid: { $ref: "#/$defs/versions/01/$defs/role" },
      },
      $defs: {
        versions: [
          {
            $defs: {
              role: { type: "string", title: "Role" },
            },
          },
        ],
      },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.valid).toMatchObject({
      type: "string",
      title: "Role",
    });
    expect(out.properties.invalid).toEqual({
      $ref: "#/$defs/versions/01/$defs/role",
    });
  });

  it("merges sibling keywords over the referenced body (local keywords win)", () => {
    const schema = {
      properties: { x: { $ref: "#/$defs/c", title: "Override" } },
      $defs: { c: { type: "string", title: "Original", description: "d" } },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.x.title).toBe("Override");
    expect(out.properties.x.description).toBe("d");
    expect(out.properties.x.type).toBe("string");
  });

  it("breaks a cyclic ref with a stub instead of recursing forever", () => {
    const schema = {
      $ref: "#/$defs/a",
      $defs: {
        a: { type: "object", properties: { toB: { $ref: "#/$defs/b" } } },
        b: { type: "object", properties: { backToA: { $ref: "#/$defs/a" } } },
      },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    // a → b → a is broken: the deepest back-ref is the recursive stub, so the
    // structure is finite (this would not terminate if it looped).
    const back = out.properties.toB.properties.backToA;
    expect(back.description).toBe("↻ recursive schema");
  });

  it("retains a dangling local ref and its siblings instead of replacing it with an empty schema", () => {
    const schema = {
      properties: {
        x: { $ref: "#/$defs/missing", title: "Missing definition" },
        invalidEscape: { $ref: "#/$defs/bad~2key" },
      },
      $defs: { other: { type: "string" } },
    } as unknown as JsonSchemaObject;
    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.x).toEqual({
      $ref: "#/$defs/missing",
      title: "Missing definition",
    });
    expect(out.properties.invalidEscape).toEqual({
      $ref: "#/$defs/bad~2key",
    });
  });
});
