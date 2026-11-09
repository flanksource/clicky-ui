import { act, renderHook } from "@testing-library/react";
import { expect, it } from "vitest";
import { describeEditable } from "./editable-dom";
import { useEditableSelection } from "./useEditableSelection";

const MARKER = "flanksource/_facet-diagrams/cells.tsx:12:7#0@aaaaaaaaaaaa";
function targets() {
  const root = document.createElement("div");
  root.innerHTML = `<svg><rect data-editable-source="${MARKER}" /></svg><div data-editable-box="variant" data-box-style="card" data-editable-source="${MARKER}"></div>`;
  return { svg: describeEditable(root.querySelector("rect")!), facet: describeEditable(root.lastElementChild!) };
}

it("retains the active editor until both pending sources are clear", () => {
  const { svg, facet } = targets();
  const { result } = renderHook(() => useEditableSelection({ page: "example", enabled: true }));
  act(() => result.current.select(svg));
  act(() => { result.current.onSvgPendingChange(true); result.current.onFacetPendingChange(false); });
  act(() => result.current.select(facet));
  expect([result.current.selected?.node.kind, result.current.pending, result.current.notice]).toEqual([
    "svg", true, "Save or revert the current visual edit before selecting another element",
  ]);
  act(() => result.current.onSvgPendingChange(false));
  act(() => result.current.select(facet));
  expect([result.current.selected?.node.kind, result.current.pending, result.current.notice]).toEqual(["box", false, null]);
});

it("does not remount the same selected target and clears selection on page change", () => {
  const { svg } = targets();
  const { result, rerender } = renderHook(({ page }) => useEditableSelection({ page, enabled: true }), { initialProps: { page: "first" } });
  act(() => result.current.select(svg));
  const key = result.current.selected?.key;
  act(() => result.current.select(svg));
  expect(result.current.selected?.key).toBe(key);
  rerender({ page: "second" });
  expect([result.current.selected, result.current.pending]).toEqual([null, false]);
});

it("refuses selection when editing is unavailable", () => {
  const { svg } = targets();
  const { result } = renderHook(() => useEditableSelection({ page: "example", enabled: false }));
  act(() => result.current.select(svg));
  expect(result.current.selected).toBeNull();
  expect(result.current.notice).toMatch(/live preview with clean source/);
});

it("allows the CSS editor to replace only a settled visual selection", () => {
  const { svg } = targets();
  const { result } = renderHook(() => useEditableSelection({ page: "example", enabled: true }));
  act(() => result.current.select(svg));
  act(() => result.current.onSvgPendingChange(true));
  act(() => expect(result.current.beginCssEdit()).toBe(false));
  expect(result.current.selected?.node.kind).toBe("svg");
  act(() => result.current.onSvgPendingChange(false));
  act(() => expect(result.current.beginCssEdit()).toBe(true));
  expect(result.current.selected).toBeNull();
});
