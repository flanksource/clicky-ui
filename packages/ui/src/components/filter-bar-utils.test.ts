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
