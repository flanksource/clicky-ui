import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { DensityProvider, useDensity } from "./use-density";

function wrapper({ children }: { children: React.ReactNode }) {
  return <DensityProvider>{children}</DensityProvider>;
}

describe("useDensity", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute("data-density");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-density");
  });

  it("defaults to comfortable and sets data-density", () => {
    const { result } = renderHook(() => useDensity(), { wrapper });
    expect(result.current.density).toBe("comfortable");
    expect(document.documentElement.getAttribute("data-density")).toBe("comfortable");
  });

  it("persists density changes to localStorage", () => {
    const { result } = renderHook(() => useDensity(), { wrapper });
    act(() => result.current.setDensity("compact"));
    expect(document.documentElement.getAttribute("data-density")).toBe("compact");
    expect(window.localStorage.getItem("clicky-ui-density")).toBe("compact");
  });

  it("throws when used outside <DensityProvider>", () => {
    expect(() => renderHook(() => useDensity())).toThrow(/DensityProvider/);
  });
});
