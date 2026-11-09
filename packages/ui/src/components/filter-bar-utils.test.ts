import { describe, expect, it, vi } from "vitest";
import type { FilterBarFilter } from "./FilterBar";
import { clearFilterBarFilter, isFilterBarFilterActive } from "./filter-bar-utils";

function tristate(value: boolean | undefined, onChange = vi.fn()): FilterBarFilter {
  return { key: "intercompany", kind: "tristate", label: "Intercompany", value, onChange };
}

describe("tri-state filters", () => {
  // "No" narrows the result set just as much as "Yes"; only the unset state
  // means the filter is off, so a falsy check would drop it from the count.
  it("counts both yes and no as active, and only unset as off", () => {
    expect(isFilterBarFilterActive(tristate(true))).toBe(true);
    expect(isFilterBarFilterActive(tristate(false))).toBe(true);
    expect(isFilterBarFilterActive(tristate(undefined))).toBe(false);
  });

  it("clears back to unset rather than to false", () => {
    const onChange = vi.fn();
    clearFilterBarFilter(tristate(false, onChange));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });
});

describe("required enum filters", () => {
  const source = (required: boolean, onChange = vi.fn()): FilterBarFilter => ({
    key: "source", kind: "enum", label: "Source", value: "records", options: [{ value: "records" }, { value: "receiver" }], onChange, required,
  });

  it("keeps a required choice through Clear all, and clears an optional one", () => {
    const kept = vi.fn();
    const cleared = vi.fn();
    clearFilterBarFilter(source(true, kept));
    clearFilterBarFilter(source(false, cleared));
    expect({ kept: kept.mock.calls, cleared: cleared.mock.calls }).toEqual({ kept: [], cleared: [[""]] });
  });

  it("does not count a required choice as an active filter", () => {
    expect([isFilterBarFilterActive(source(true)), isFilterBarFilterActive(source(false))]).toEqual([false, true]);
  });
});
