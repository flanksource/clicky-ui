import { describe, expect, it } from "vitest";
import type { FilterBarMultiFilterMode } from "../components/filter-bar-field-utils";
import {
  parseMultiFilterValue,
  serializeMultiFilterValue,
  splitCommaValues,
  updateFilterSelection,
} from "./data-table-filter-values";

type Selection = Record<string, FilterBarMultiFilterMode>;

describe("multi-filter wire format", () => {
  // Values the server's `entity.MultiFilter` grammar can express must survive
  // byte-identically, or a serialized selection stops matching server-side.
  it.each([
    [{ failed: "include" } satisfies Selection, "failed"],
    [{ failed: "exclude" } satisfies Selection, "!failed"],
    [
      { failed: "include", pending: "exclude" } satisfies Selection,
      "failed,!pending",
    ],
  ])("serializes %j to the bare server grammar %j", (selection, wire) => {
    expect(serializeMultiFilterValue(selection)).toBe(wire);
  });

  it("drops empty keys rather than emitting an unaddressable item", () => {
    expect(serializeMultiFilterValue({ "": "include", ok: "include" })).toBe(
      "ok",
    );
  });

  it("parses a hand-edited value with padding around the separators", () => {
    expect(parseMultiFilterValue("  failed , !pending  ")).toEqual({
      failed: "include",
      pending: "exclude",
    });
  });

  it("ignores empty items so a trailing comma is not a filter", () => {
    expect(parseMultiFilterValue("failed,,")).toEqual({ failed: "include" });
  });

  it("reads an empty value as no selection", () => {
    expect(parseMultiFilterValue("")).toEqual({});
  });
});

describe("multi-filter round trip", () => {
  // The regression this guards: an *included* "!failed" used to serialize as
  // "!failed" and read back as an *exclusion* of "failed", so the table
  // requested the opposite of the filter the user clicked.
  const cases: Array<[string, Selection]> = [
    ["a value that starts with the exclusion marker", { "!failed": "include" }],
    ["that same value excluded", { "!failed": "exclude" }],
    ["a value containing the item separator", { "a,b": "include" }],
    ["a value containing the separator, excluded", { "a,b": "exclude" }],
    ["both punctuation forms at once", { "!a,b": "exclude" }],
    ["a bare exclusion marker", { "!": "include" }],
    ["a value carrying a literal backslash", { "a\\b": "include" }],
    ["a value ending in a backslash", { "a\\": "include" }],
    ["a value whose backslash precedes a separator", { "a\\,b": "include" }],
    ["a value padded with significant whitespace", { " padded ": "include" }],
    [
      "a mixed selection",
      { "!failed": "include", "a,b": "exclude", plain: "include" },
    ],
  ];

  it.each(cases)("preserves %s", (_label, selection) => {
    expect(parseMultiFilterValue(serializeMultiFilterValue(selection))).toEqual(
      selection,
    );
  });

  it("keeps an included marker-prefixed value distinct from an exclusion", () => {
    const included = serializeMultiFilterValue({ "!failed": "include" });
    const excluded = serializeMultiFilterValue({ failed: "exclude" });

    expect(included).not.toBe(excluded);
    expect(parseMultiFilterValue(included)).toEqual({ "!failed": "include" });
    expect(parseMultiFilterValue(excluded)).toEqual({ failed: "exclude" });
  });
});

describe("splitCommaValues", () => {
  it("trims items and drops the empties a trailing comma leaves behind", () => {
    expect(splitCommaValues(" a , b ,, c,")).toEqual(["a", "b", "c"]);
  });
});

describe("updateFilterSelection", () => {
  it("stores a non-empty serialized value under its key", () => {
    expect(updateFilterSelection({ page: "2" }, "status", "!failed")).toEqual({
      page: "2",
      status: "!failed",
    });
  });

  // An absent key and a key holding "" would send different query strings for
  // the same "nothing selected", so only the absent form is ever built.
  it("removes the key when the selection serializes to nothing", () => {
    expect(
      updateFilterSelection({ page: "2", status: "!failed" }, "status", ""),
    ).toEqual({ page: "2" });
  });
});
