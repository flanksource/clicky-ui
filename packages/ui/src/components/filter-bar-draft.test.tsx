import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FilterBarContext } from "./filter-bar-context";
import {
  useDebouncedMultiDraft,
  type FilterBarMultiFilterMode,
} from "./filter-bar-field-utils";

describe("controlled multi-filter draft", () => {
  it("accepts an external clear without emitting the previous selection", () => {
    const onChange = vi.fn();
    const selected: Record<string, FilterBarMultiFilterMode> = {
      error: "exclude",
    };
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedMultiDraft(value, onChange),
      {
        initialProps: { value: selected },
        wrapper: ({ children }) => (
          <FilterBarContext.Provider
            value={{ autoSubmit: false, compact: false }}
          >
            {children}
          </FilterBarContext.Provider>
        ),
      },
    );
    rerender({ value: {} });
    expect(result.current[0]).toEqual({});
    expect(onChange).not.toHaveBeenCalled();
  });
});
