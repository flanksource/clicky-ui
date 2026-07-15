import { describe, expect, it, vi } from "vitest";
import {
  isEmptyValue,
  matchesFieldFilter,
  moveItem,
  normalizeColSpan,
  normalizeColumns,
  orderByPriority,
  orderRequiredFirst,
  removeIndex,
  seedFromSchema,
  setIndex,
  softError,
} from "./json-schema-form-utils";
import type { FieldControl } from "./json-schema-form-types";

function field(over: Partial<FieldControl>): FieldControl {
  return {
    key: "f",
    kind: "string",
    label: "f",
    required: false,
    schema: { type: "string" },
    value: "",
    onChange: vi.fn(),
    ...over,
  };
}

describe("immutable array helpers", () => {
  it("setIndex replaces one element without mutating the source", () => {
    const src = [1, 2, 3];
    const out = setIndex(src, 1, 9);
    expect(out).toEqual([1, 9, 3]);
    expect(src).toEqual([1, 2, 3]);
  });

  it("removeIndex drops one element without mutating the source", () => {
    const src = ["a", "b", "c"];
    const out = removeIndex(src, 0);
    expect(out).toEqual(["b", "c"]);
    expect(src).toEqual(["a", "b", "c"]);
  });

  it("moveItem reorders and is a no-op past the boundaries", () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 2, 1)).toEqual([1, 3, 2]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(moveItem([1, 2, 3], 2, 3)).toEqual([1, 2, 3]);
  });
});

describe("orderRequiredFirst", () => {
  const entries: [string, number][] = [
    ["a", 1],
    ["b", 2],
    ["c", 3],
    ["d", 4],
  ];

  it("moves required keys to the front, preserving order within each group", () => {
    expect(orderRequiredFirst(entries, ["c", "a"]).map(([k]) => k)).toEqual(["a", "c", "b", "d"]);
  });

  it("is a no-op when no entries are required", () => {
    expect(orderRequiredFirst(entries, []).map(([k]) => k)).toEqual(["a", "b", "c", "d"]);
  });

  it("ignores required keys that are not present", () => {
    expect(orderRequiredFirst(entries, ["x", "b"]).map(([k]) => k)).toEqual(["b", "a", "c", "d"]);
  });
});

describe("isEmptyValue", () => {
  it("treats nullish, empty string, empty array and empty object as empty", () => {
    expect(isEmptyValue(undefined)).toBe(true);
    expect(isEmptyValue(null)).toBe(true);
    expect(isEmptyValue("")).toBe(true);
    expect(isEmptyValue([])).toBe(true);
    expect(isEmptyValue({})).toBe(true);
  });
  it("treats false, zero, and populated containers as filled", () => {
    expect(isEmptyValue(false)).toBe(false);
    expect(isEmptyValue(0)).toBe(false);
    expect(isEmptyValue("x")).toBe(false);
    expect(isEmptyValue([1])).toBe(false);
    expect(isEmptyValue({ a: 1 })).toBe(false);
  });
});

describe("orderByPriority", () => {
  const entries: [string, number][] = [
    ["a", 1],
    ["b", 2],
    ["c", 3],
    ["d", 4],
  ];

  it("ranks required-filled, required-empty, optional-filled, optional-empty", () => {
    // a: optional+filled (1), b: required+empty (2), c: required+filled (3), d: optional+empty (0)
    const values = { a: "x", b: "", c: "y", d: "" };
    expect(orderByPriority(entries, ["b", "c"], values).map(([k]) => k)).toEqual([
      "c",
      "b",
      "a",
      "d",
    ]);
  });

  it("keeps incoming order among equally-scored keys", () => {
    // every key is optional+empty → all score 0, so order is unchanged
    expect(orderByPriority(entries, [], {}).map(([k]) => k)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("matchesFieldFilter", () => {
  it("matches everything when the filter is blank or whitespace", () => {
    expect(matchesFieldFilter("email", { type: "string" }, "")).toBe(true);
    expect(matchesFieldFilter("email", { type: "string" }, "   ")).toBe(true);
  });
  it("matches on the title case-insensitively", () => {
    const prop = { type: "string", title: "First Name" };
    expect(matchesFieldFilter("firstName", prop, "name")).toBe(true);
    expect(matchesFieldFilter("firstName", prop, "NAME")).toBe(true);
  });
  it("matches on the key when there is no title", () => {
    expect(matchesFieldFilter("alpha", { type: "string" }, "alph")).toBe(true);
    expect(matchesFieldFilter("beta", { type: "string" }, "alph")).toBe(false);
  });
  it("returns false when neither key nor title contains the query", () => {
    expect(matchesFieldFilter("email", { type: "string", title: "Email" }, "phone")).toBe(false);
  });
});

describe("seedFromSchema", () => {
  it("honours an explicit default", () => {
    expect(seedFromSchema({ type: "string", default: "x" })).toBe("x");
  });
  it("seeds containers and scalars", () => {
    expect(seedFromSchema({ type: "array" })).toEqual([]);
    expect(seedFromSchema({ type: "object" })).toEqual({});
    expect(seedFromSchema({ type: "boolean" })).toBe(false);
    expect(seedFromSchema({ type: "number" })).toBe("");
    expect(seedFromSchema({ type: "string" })).toBe("");
  });
});

describe("softError", () => {
  it("flags an empty required field", () => {
    expect(softError(field({ required: true, value: "" }))).toBe("Required");
  });
  it("flags a number below minimum", () => {
    expect(softError(field({ kind: "number", minimum: 0, value: -3 }))).toBe("Must be ≥ 0");
  });
  it("flags an unknown enum value only when custom values are disallowed", () => {
    expect(
      softError(field({ kind: "enum", options: [{ value: "a", label: "a" }], value: "z" })),
    ).toBe("Unknown value (allowed)");
    expect(
      softError(
        field({ kind: "enum", options: [{ value: "a", label: "a" }], value: "z", allowCustomValue: true }),
      ),
    ).toBeUndefined();
  });
  it("returns undefined for a valid field", () => {
    expect(softError(field({ value: "ok" }))).toBeUndefined();
  });
});

describe("normalizeColumns / normalizeColSpan", () => {
  it("keeps a 12-track grid (so span-4 + span-3 rows fit) and clamps beyond 12", () => {
    expect(normalizeColumns(12)).toBe(12);
    expect(normalizeColumns(3)).toBe(3);
    expect(normalizeColumns(24)).toBe(12);
    expect(normalizeColumns(0)).toBe(1);
    expect(normalizeColumns("nope")).toBe(1);
  });

  it("clamps a field span to the column count, defaulting to 1", () => {
    expect(normalizeColSpan(3, 12)).toBe(3);
    expect(normalizeColSpan(20, 12)).toBe(12);
    expect(normalizeColSpan(undefined, 12)).toBe(1);
    expect(normalizeColSpan(0, 12)).toBe(1);
  });
});
