import { describe, expect, it } from "vitest";
import { includePlatformFromState, updateClassesState, type ClassesSurfaceState } from "./classes-state";

describe("updateClassesState", () => {
  it("overwrites the given keys and keeps the rest", () => {
    const state: ClassesSurfaceState = { q: "Order", loader: "6d06d69c", class: "com.example.orders.Ledger" };
    expect(updateClassesState(state, { class: "com.example.orders.OrderService", method: "checkout" })).toEqual({
      q: "Order",
      loader: "6d06d69c",
      class: "com.example.orders.OrderService",
      method: "checkout",
    });
  });

  it("drops a key set to the empty string, so a persisted URL carries no empty parameters", () => {
    expect(updateClassesState({ class: "a.B", method: "run", line: "12" }, { method: "", line: "" })).toEqual({ class: "a.B" });
  });

  it("does not mutate the previous state", () => {
    const state: ClassesSurfaceState = { q: "x" };
    updateClassesState(state, { q: "" });
    expect(state).toEqual({ q: "x" });
  });
});

describe("includePlatformFromState", () => {
  it.each([
    [{ platform: "true" }, true],
    [{ platform: "false" }, false],
    [{ platform: "" }, false],
    [{}, false],
  ] as const)("%j -> %s", (state, expected) => {
    expect(includePlatformFromState(state)).toBe(expected);
  });
});
