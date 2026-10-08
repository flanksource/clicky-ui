import { describe, expect, it, vi } from "vitest";
import { fireEvent, renderHook } from "@testing-library/react";
import { useEscapeLayer, useFloatingZIndex, useModalStack, useTourLayer } from "./modalStack";
import { zIndex } from "./zIndex";

describe("useEscapeLayer", () => {
  it("routes a second Escape to the parent layer before the dismissed child unmounts", () => {
    const closeParent = vi.fn();
    const closeChild = vi.fn();
    const parent = renderHook(() => useEscapeLayer(true, closeParent));
    const child = renderHook(() => useEscapeLayer(true, closeChild));

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.keyDown(document, { key: "Escape" });

    expect([closeChild.mock.calls.length, closeParent.mock.calls.length]).toEqual([1, 1]);
    child.unmount();
    parent.unmount();
  });

  it("owns Escape again once a layer that stayed open re-renders", () => {
    const keepOpen = vi.fn();
    const layer = renderHook(() => useEscapeLayer(true, keepOpen));

    fireEvent.keyDown(document, { key: "Escape" });
    layer.rerender();
    fireEvent.keyDown(document, { key: "Escape" });

    expect(keepOpen).toHaveBeenCalledTimes(2);
    layer.unmount();
  });
});

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
