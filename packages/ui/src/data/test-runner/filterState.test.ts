import { describe, expect, it } from "vitest";
import {
  cycleFilterState,
  decodeFilterState,
  encodeFilterState,
  matchesFilterState,
} from "./filterState";

describe("cycleFilterState", () => {
  it("advances a key neutral → include → exclude → neutral", () => {
    let state = new Map<string, "include" | "exclude">();
    state = cycleFilterState(state, "failed");
    expect(state.get("failed")).toBe("include");
    state = cycleFilterState(state, "failed");
    expect(state.get("failed")).toBe("exclude");
    state = cycleFilterState(state, "failed");
    expect(state.has("failed")).toBe(false);
  });

  it("does not mutate the input map", () => {
    const original = new Map<string, "include" | "exclude">();
    cycleFilterState(original, "passed");
    expect(original.size).toBe(0);
  });
});

describe("matchesFilterState", () => {
  it("passes everything when the filter is empty", () => {
    expect(matchesFilterState("failed", new Map())).toBe(true);
    expect(matchesFilterState(undefined, new Map())).toBe(true);
  });

  it("excludes a value marked exclude", () => {
    const state = new Map([["passed", "exclude" as const]]);
    expect(matchesFilterState("passed", state)).toBe(false);
    expect(matchesFilterState("failed", state)).toBe(true);
  });

  it("with includes present, only included values pass", () => {
    const state = new Map([["failed", "include" as const]]);
    expect(matchesFilterState("failed", state)).toBe(true);
    expect(matchesFilterState("passed", state)).toBe(false);
    expect(matchesFilterState(undefined, state)).toBe(false);
  });

  it("exclude wins over a missing include set", () => {
    const state = new Map<string, "include" | "exclude">([
      ["failed", "exclude"],
      ["passed", "exclude"],
    ]);
    expect(matchesFilterState("failed", state)).toBe(false);
    expect(matchesFilterState("skipped", state)).toBe(true);
  });
});

describe("encode/decode round-trip", () => {
  it("round-trips include and exclude tokens, sorted", () => {
    const tokens = ["passed", "!failed", "skipped"];
    const decoded = decodeFilterState(tokens);
    expect(decoded.get("passed")).toBe("include");
    expect(decoded.get("failed")).toBe("exclude");
    expect(encodeFilterState(decoded)).toEqual(["!failed", "passed", "skipped"]);
  });
});
