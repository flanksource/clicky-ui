import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useSort } from "./use-sort";

type Row = { id: number; name: string; nested: { n: number } };

const rows: Row[] = [
  { id: 3, name: "Charlie", nested: { n: 30 } },
  { id: 1, name: "Alice", nested: { n: 10 } },
  { id: 2, name: "Bob", nested: { n: 20 } },
];

describe("useSort", () => {
  it("returns items unchanged when no sort is active", () => {
    const { result } = renderHook(() => useSort(rows));
    expect(result.current.sorted.map((r) => r.id)).toEqual([3, 1, 2]);
  });

  it("toggles asc -> desc -> none on the same key", () => {
    const { result } = renderHook(() => useSort(rows));
    act(() => result.current.toggle("id"));
    expect(result.current.sort).toEqual({ key: "id", dir: "asc" });
    act(() => result.current.toggle("id"));
    expect(result.current.sort).toEqual({ key: "id", dir: "desc" });
    act(() => result.current.toggle("id"));
    expect(result.current.sort).toBeNull();
  });

  it("sorts numbers numerically", () => {
    const { result } = renderHook(() => useSort(rows, { defaultKey: "id" }));
    expect(result.current.sorted.map((r) => r.id)).toEqual([1, 2, 3]);
  });

  it("sorts dot-path keys", () => {
    const { result } = renderHook(() => useSort(rows, { defaultKey: "nested.n" }));
    expect(result.current.sorted.map((r) => r.nested.n)).toEqual([10, 20, 30]);
  });

  it("uses resolvers when provided", () => {
    const { result } = renderHook(() =>
      useSort(rows, {
        defaultKey: "reverseName",
        resolvers: { reverseName: (r) => r.name.split("").reverse().join("") },
      }),
    );
    // Reversed: Alice→ecilA, Bob→boB, Charlie→eilrahC. Asc: boB < ecilA < eilrahC.
    expect(result.current.sorted.map((r) => r.name)).toEqual(["Bob", "Alice", "Charlie"]);
  });
});
