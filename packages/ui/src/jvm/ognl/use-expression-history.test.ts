import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { expressionHistoryStorageKey, useExpressionHistory } from "./use-expression-history";

const KEY = expressionHistoryStorageKey("agent-7", "ognl");

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("expressionHistoryStorageKey", () => {
  it("is scoped per host key and per language", () => {
    expect(new Set([KEY, expressionHistoryStorageKey("agent-7", "groovy"), expressionHistoryStorageKey("agent-8", "ognl")]).size).toBe(3);
  });
});

describe("useExpressionHistory", () => {
  it("starts from what an earlier session stored and persists changes", () => {
    localStorage.setItem(KEY, JSON.stringify(["#a", "#b"]));
    const { result } = renderHook(() => useExpressionHistory(KEY));
    expect(result.current[0]).toEqual(["#a", "#b"]);
    act(() => result.current[1](["#c"]));
    expect(result.current[0]).toEqual(["#c"]);
    expect(JSON.parse(localStorage.getItem(KEY) ?? "null")).toEqual(["#c"]);
  });

  it("stays in memory when no key is given", () => {
    const { result } = renderHook(() => useExpressionHistory(undefined));
    act(() => result.current[1](["#a"]));
    expect(result.current[0]).toEqual(["#a"]);
    expect(localStorage.length).toBe(0);
  });

  it.each([
    ["not JSON", "{oops"],
    ["not a list of strings", JSON.stringify([1, 2])],
  ])("starts empty when the stored value is %s", (_name, stored) => {
    localStorage.setItem(KEY, stored);
    const { result } = renderHook(() => useExpressionHistory(KEY));
    expect(result.current[0]).toEqual([]);
  });

  it("still works when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { result } = renderHook(() => useExpressionHistory(KEY));
    act(() => result.current[1](["#a"]));
    expect(result.current[0]).toEqual(["#a"]);
  });
});
