import { describe, expect, it } from "vitest";
import { defaultArrayView, type ArrayViewOptions } from "./json-schema-form-array-view";
import { resolveControl } from "./json-schema-form-resolve";
import type { JsonSchemaProperty } from "./json-schema-form-types";

const EDITABLE: ArrayViewOptions = { hideReadOnlyFields: false, valueCells: false, layoutMode: "stacked" };
const DEFAULT_MAX_COLUMNS = 4;

function itemsWith(count: number, extra: Record<string, JsonSchemaProperty> = {}): JsonSchemaProperty {
  const properties = Object.fromEntries(
    Array.from({ length: count }, (_, i) => [`c${i + 1}`, { type: "string", title: `Cell ${i + 1}` }]),
  );
  return { type: "object", properties: { ...properties, ...extra } };
}

function viewOf(array: JsonSchemaProperty, value: unknown[] = [{}], options = EDITABLE) {
  const field = resolveControl({ key: "Group", prop: array, required: false, value, onChange: () => {} });
  return defaultArrayView(field, options);
}

describe("defaultArrayView", () => {
  it.each([
    [DEFAULT_MAX_COLUMNS, "grid"],
    [DEFAULT_MAX_COLUMNS + 1, "inline"],
  ])("renders %i visible columns with no hint as %s", (columns, view) => {
    expect(viewOf({ type: "array", items: itemsWith(columns) })).toBe(view);
  });

  it("raises the grid bound with x-table-max-columns", () => {
    expect(viewOf({ type: "array", "x-table-max-columns": 6, items: itemsWith(5) })).toBe("grid");
  });

  it("keeps an explicit x-layout table as a grid however wide it is", () => {
    expect(viewOf({ type: "array", "x-layout": "table", items: itemsWith(8) })).toBe("grid");
  });

  it("opens an explicit x-array-display accordion as a stack form however narrow it is", () => {
    expect(viewOf({ type: "array", "x-array-display": "accordion", items: itemsWith(2) })).toBe("stack");
  });

  it("keeps an explicit accordion's items inline inside an inline form", () => {
    const array: JsonSchemaProperty = { type: "array", "x-array-display": "accordion", items: itemsWith(2) };
    expect(viewOf(array, [{}], { ...EDITABLE, layoutMode: "inline" })).toBe("inline");
  });

  it("lets an explicit accordion outrank an explicit table", () => {
    const array: JsonSchemaProperty = { type: "array", "x-layout": "table", "x-array-display": "accordion", items: itemsWith(2) };
    expect(viewOf(array)).toBe("stack");
  });

  it("refuses an x-table-max-columns that is not a positive integer", () => {
    expect(() => viewOf({ type: "array", "x-table-max-columns": 0, items: itemsWith(2) })).toThrow(
      /x-table-max-columns must be a positive integer/,
    );
  });

  it.each<[string, JsonSchemaProperty]>([
    ["an object", { type: "object", properties: { a: { type: "string" } } }],
    ["a map", { type: "object", additionalProperties: { type: "string" } }],
    ["an object array", { type: "array", items: { type: "object", properties: { a: { type: "string" } } } }],
  ])("opens an item holding %s as the inline form however narrow", (_, nested) => {
    expect(viewOf({ type: "array", items: itemsWith(1, { nested }) })).toBe("inline");
  });

  it("keeps a scalar tag-list column in the grid", () => {
    expect(viewOf({ type: "array", items: itemsWith(1, { tags: { type: "array", items: { type: "string" } } }) })).toBe(
      "grid",
    );
  });

  it("does not count a column hidden in every row", () => {
    const items = itemsWith(DEFAULT_MAX_COLUMNS, { secret: { type: "string", "x-hidden": true } });
    expect(viewOf({ type: "array", items }, [{}, {}])).toBe("grid");
  });

  it("counts a column one row's own listener reveals", () => {
    const items = itemsWith(DEFAULT_MAX_COLUMNS, { extra: { type: "string", "x-hidden": true } });
    items.properties!.c1!["x-on-change"] = [{ when: { const: "reveal" }, show: ["extra"] }];
    expect(viewOf({ type: "array", items }, [{ c1: "keep" }, { c1: "reveal" }])).toBe("inline");
  });

  it("evaluates the load state of an empty row when the array has no rows", () => {
    const items = itemsWith(DEFAULT_MAX_COLUMNS, { extra: { type: "string" } });
    items["x-on-load"] = [{ hide: ["extra"] }];
    expect(viewOf({ type: "array", items }, [])).toBe("grid");
  });

  it("drops readOnly columns from the count when the form hides read-only fields", () => {
    const items = itemsWith(DEFAULT_MAX_COLUMNS, { derived: { type: "string", readOnly: true } });
    expect(viewOf({ type: "array", items }, [{}], { ...EDITABLE, hideReadOnlyFields: true })).toBe("grid");
  });
});
