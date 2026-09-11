import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { useOperationCatalogFilterState } from "./operationCatalogFilterState";
import type { OpenAPIParameter } from "./types";

const listParameters: OpenAPIParameter[] = [
  { name: "q", in: "query" },
  { name: "stream", in: "query" },
];

function renderState(
  overrides: Partial<
    Parameters<typeof useOperationCatalogFilterState>[0]
  > = {},
) {
  return renderHook(() =>
    useOperationCatalogFilterState({
      listParameters,
      lockedValues: {},
      urlState: undefined,
      ...overrides,
    }),
  );
}

describe("useOperationCatalogFilterState", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("merges lockedValues into effectiveFilters without adding them to filters itself", () => {
    const { result } = renderState({ lockedValues: { stream: "trace-1" } });

    expect(result.current.filters).toEqual({});
    expect(result.current.effectiveFilters).toEqual({ stream: "trace-1" });
  });

  it("lets a locked value be overridden in effectiveFilters after a filter edit, still winning", () => {
    const { result } = renderState({ lockedValues: { stream: "trace-1" } });

    act(() => {
      result.current.setFilters((current) => ({ ...current, q: "foo" }));
    });

    expect(result.current.filters).toEqual({ q: "foo" });
    expect(result.current.effectiveFilters).toEqual({
      q: "foo",
      stream: "trace-1",
    });
  });

  it("seeds filters from the URL by default", () => {
    window.history.replaceState(null, "", "/?q=preset");
    const { result } = renderState();

    expect(result.current.filters).toEqual({ q: "preset" });
  });

  it("seeds nothing from the URL when urlState is false", () => {
    window.history.replaceState(null, "", "/?q=preset");
    const { result } = renderState({ urlState: false });

    expect(result.current.filters).toEqual({});
  });

  it("writes filter edits to the URL by default", () => {
    const { result } = renderState();

    act(() => {
      result.current.setFilters({ q: "foo" });
    });

    expect(new URLSearchParams(window.location.search).get("q")).toBe("foo");
  });

  it("writes nothing to the URL when urlState is false", () => {
    const { result } = renderState({ urlState: false });

    act(() => {
      result.current.setFilters({ q: "foo" });
    });

    expect(window.location.search).toBe("");
  });

  it("namespaces written filters under the given prefix", () => {
    const { result } = renderState({ urlState: { prefix: "tr" } });

    act(() => {
      result.current.setFilters({ q: "foo" });
    });

    const params = new URLSearchParams(window.location.search);
    expect(params.get("tr.q")).toBe("foo");
    expect(params.has("q")).toBe(false);
  });

  it("never writes a locked param's key to the URL", () => {
    const { result } = renderState({ lockedValues: { stream: "trace-1" } });

    act(() => {
      result.current.setFilters({ q: "foo", stream: "trace-1" });
    });

    expect(new URLSearchParams(window.location.search).has("stream")).toBe(
      false,
    );
  });
});
