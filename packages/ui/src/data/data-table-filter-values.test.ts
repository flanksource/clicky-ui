import { describe, expect, it } from "vitest";
import type { FilterBarMultiFilterMode } from "../components/filter-bar-field-utils";
import {
  parseBoundsValue,
  parseDurationBoundsValue,
  parseMultiFilterValue,
  serializeBoundsValue,
  serializeDurationBoundsValue,
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

describe("bounded filter wire format", () => {
  it("uses the declared operator for bare values without changing explicit comparisons", () => {
    expect(parseBoundsValue("100", ">")).toEqual({ min: "100", minOperator: ">" });
    expect(parseBoundsValue("<=100", ">")).toEqual({ max: "100", maxOperator: "<=" });
    expect(parseBoundsValue("", ">")).toEqual({ minOperator: ">" });
    expect(parseDurationBoundsValue("1.5s", "ms", ">")).toEqual({ min: "1500", minOperator: ">", minUnit: "ms" });
  });
  it("preserves strict and inclusive operators independently", () => {
    const value = parseBoundsValue(">100,<=500");

    expect(value).toEqual({
      min: "100",
      minOperator: ">",
      max: "500",
      maxOperator: "<=",
    });
    expect(serializeBoundsValue(value)).toBe(">100,<=500");
  });

  it("defaults omitted operators to inclusive bounds", () => {
    expect(serializeBoundsValue({ min: "100", max: "500" })).toBe(
      ">=100,<=500",
    );
  });

  it("normalizes compound Go durations into the declared storage unit", () => {
    expect(parseDurationBoundsValue(">2m30s,<=3h", "s")).toEqual({
      min: "150",
      minOperator: ">",
      minUnit: "s",
      max: "10800",
      maxOperator: "<=",
      maxUnit: "s",
    });
  });

  it("serializes each duration edge with its selected unit", () => {
    expect(
      serializeDurationBoundsValue({
        min: "500",
        minOperator: ">",
        minUnit: "ms",
        max: "2",
        maxOperator: "<=",
        maxUnit: "m",
      }),
    ).toBe(">500ms,<=2m");
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
