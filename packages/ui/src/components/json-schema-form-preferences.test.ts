import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readPreferences,
  writePreferences,
  type FormPreferences,
} from "./json-schema-form-preferences";

const KEY = "test-prefs";

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("readPreferences", () => {
  it("returns an empty record when nothing is stored", () => {
    expect(readPreferences(KEY)).toEqual({});
  });

  it("reads a valid stored size, layout mode, and sort mode", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ size: "lg", layoutMode: "inline", sortMode: "priority" }),
    );
    expect(readPreferences(KEY)).toEqual({ size: "lg", layoutMode: "inline", sortMode: "priority" });
  });

  it("drops an invalid sort mode but keeps the rest", () => {
    localStorage.setItem(KEY, JSON.stringify({ size: "md", sortMode: "by-name" }));
    expect(readPreferences(KEY)).toEqual({ size: "md" });
  });

  it("ignores invalid JSON", () => {
    localStorage.setItem(KEY, "{not json");
    expect(readPreferences(KEY)).toEqual({});
  });

  it("drops an out-of-range size but keeps a valid layout mode", () => {
    localStorage.setItem(KEY, JSON.stringify({ size: "huge", layoutMode: "stacked" }));
    expect(readPreferences(KEY)).toEqual({ layoutMode: "stacked" });
  });

  it("drops an invalid layout mode but keeps a valid size", () => {
    localStorage.setItem(KEY, JSON.stringify({ size: "xs", layoutMode: "grid" }));
    expect(readPreferences(KEY)).toEqual({ size: "xs" });
  });

  it("ignores a non-object payload", () => {
    localStorage.setItem(KEY, JSON.stringify("md"));
    expect(readPreferences(KEY)).toEqual({});
  });

  it("returns an empty record when localStorage.getItem throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage disabled");
    });
    expect(readPreferences(KEY)).toEqual({});
  });
});

describe("writePreferences", () => {
  it("round-trips a record through readPreferences", () => {
    const prefs: FormPreferences = { size: "sm", layoutMode: "inline" };
    writePreferences(KEY, prefs);
    expect(readPreferences(KEY)).toEqual(prefs);
  });

  it("swallows a localStorage.setItem failure", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });
    expect(() => writePreferences(KEY, { size: "md" })).not.toThrow();
  });
});
