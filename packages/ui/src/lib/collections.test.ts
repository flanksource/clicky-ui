import { describe, expect, it } from "vitest";
import { duplicateIndex, isPlainObject, moveItem, removeIndex, setIndex } from "./collections";

describe("immutable array helpers", () => {
  it("setIndex replaces one element without mutating the source", () => {
    const src = [1, 2, 3];
    const out = setIndex(src, 1, 9);
    expect(out).toEqual([1, 9, 3]);
    expect(src).toEqual([1, 2, 3]);
  });

  it("removeIndex drops one element without mutating the source", () => {
    const src = ["a", "b", "c"];
    const out = removeIndex(src, 0);
    expect(out).toEqual(["b", "c"]);
    expect(src).toEqual(["a", "b", "c"]);
  });

  it("moveItem reorders and is a no-op past the boundaries", () => {
    expect(moveItem([1, 2, 3], 0, 1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 2, 1)).toEqual([1, 3, 2]);
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(moveItem([1, 2, 3], 2, 3)).toEqual([1, 2, 3]);
  });

  it("duplicateIndex inserts the copy after the source", () => {
    expect(duplicateIndex(["a", "b", "c"], 1)).toEqual(["a", "b", "b", "c"]);
  });

  it("duplicateIndex clones an object item so edits cannot write through", () => {
    const source = { path: "/users" };
    const [, copy] = duplicateIndex([source], 0) as Array<{ path: string }>;
    expect(copy).not.toBe(source);
    copy!.path = "/events";
    expect(source.path).toBe("/users");
  });

  it("duplicateIndex defers to a supplied clone for nested state", () => {
    const source = { headers: { accept: "json" } };
    const [, copy] = duplicateIndex([source], 0, (item) => ({
      headers: { ...item.headers },
    }));
    expect(copy!.headers).not.toBe(source.headers);
  });

  it("isPlainObject accepts records and rejects arrays and null", () => {
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject([1])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject("a")).toBe(false);
  });
});
