import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useFloatingZIndex, useModalStack, useTourLayer } from "./modalStack";
import { zIndex } from "./zIndex";

describe("useFloatingZIndex", () => {
  it("sits at the popover floor with nothing else open", () => {
    const { result } = renderHook(() => useFloatingZIndex());

    expect(result.current).toBe(zIndex.popover);
  });

  it("clears an open modal", () => {
    renderHook(() => useModalStack(true));
    const { result } = renderHook(() => useFloatingZIndex());

    expect(result.current).toBe(zIndex.modal + zIndex.popoverOverModalOffset);
  });

  it("clears a running tour's dim and step card", () => {
    renderHook(() => useTourLayer(true));
    const { result } = renderHook(() => useFloatingZIndex());

    // The bug this prevents: a step that says "open this menu" spotlights the
    // trigger, the menu renders at the popover floor (9000), and the tour's dim
    // (50000) covers it — the user sees nothing happen.
    expect(result.current).toBeGreaterThan(zIndex.tour + zIndex.tourCardOffset);
  });

  it("returns to the popover floor once the tour unmounts", () => {
    const tour = renderHook(() => useTourLayer(true));
    tour.unmount();
    const { result } = renderHook(() => useFloatingZIndex());

    expect(result.current).toBe(zIndex.popover);
  });
});
