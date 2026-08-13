import { describe, expect, it, vi } from "vitest";
import {
  fieldInputId,
  isEmptyValue,
  matchesFieldFilter,
  normalizeColSpan,
  normalizeColumns,
  orderByPriority,
  orderRequiredFirst,
  seedFromSchema,
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

describe("fieldInputId", () => {
  it("keeps a top-level field's id as its bare key", () => {
    expect(fieldInputId("/Name")).toBe("jsf-Name");
    expect(fieldInputId("/Name", "form")).toBe("jsf-form-Name");
  });

  it("distinguishes the same property name under different parents", () => {
    expect(fieldInputId("/journalLine1/asset", "req")).not.toBe(
      fieldInputId("/journalLine2/asset", "req"),
    );
  });

  it("does not let a hyphenated key collide with a nested path", () => {
    expect(fieldInputId("/asset-class")).not.toBe(fieldInputId("/asset/class"));
  });

  it("keeps keys that differ only by separator character distinct", () => {
    const ids = [
      fieldInputId("/asset-class"),
      fieldInputId("/asset_class"),
      fieldInputId("/asset.class"),
      fieldInputId("/asset/class"),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("preserves an empty pointer token instead of dropping it", () => {
    expect(fieldInputId("/a//b")).not.toBe(fieldInputId("/a/b"));
    expect(fieldInputId("")).not.toBe(fieldInputId("/"));
  });

  it("keeps the prefix separable from the path", () => {
    expect(fieldInputId("/b-c", "a")).not.toBe(fieldInputId("/c", "a-b"));
  });

  it("emits ids usable as CSS selectors", () => {
    for (const path of ["/asset-class", "/asset.class", "/a b", "/déjà~1vu", "/a//b"]) {
      expect(fieldInputId(path, "form-1")).toMatch(/^[A-Za-z][A-Za-z0-9_-]*$/);
    }
  });

  it("unescapes JSON pointer tokens and array indices into a usable id", () => {
    expect(fieldInputId("/lines/0/account~1code")).toBe("jsf-lines-0-account_2f_code");
  });
});
