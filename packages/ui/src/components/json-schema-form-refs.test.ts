import { describe, expect, it } from "vitest";
import { rehydrateRefs } from "./json-schema-form-refs";
import type { JsonSchemaObject } from "./json-schema-form-types";

describe("rehydrateRefs", () => {
  it("returns a schema with no $defs unchanged", () => {
    const schema = { type: "object", properties: { a: { type: "string" } } } as JsonSchemaObject;
    expect(rehydrateRefs(schema)).toBe(schema);
  });

  it("resolves repeated #/$defs refs and shares the component by reference", () => {
    const schema = {
      type: "object",
      properties: {
        a: { $ref: "#/$defs/addr" },
        b: { $ref: "#/$defs/addr" },
      },
      $defs: { addr: { type: "object", properties: { country: { type: "string" } } } },
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
      $defs: { cust: { type: "object", properties: { Owner: { type: "string" } } } },
    } as unknown as JsonSchemaObject;

    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.fields.allOf[0].properties.Owner).toEqual({ type: "string" });
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

  it("leaves a dangling local ref permissive", () => {
    const schema = {
      properties: { x: { $ref: "#/$defs/missing" } },
      $defs: { other: { type: "string" } },
    } as unknown as JsonSchemaObject;
    const out = rehydrateRefs(schema) as Record<string, any>;
    expect(out.properties.x).toEqual({});
  });
});
