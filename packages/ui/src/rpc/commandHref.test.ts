import { describe, expect, it } from "vitest";
import { trimTrailingSlash, withBasePath } from "./commandHref";

describe("trimTrailingSlash", () => {
  it.each([
    ["", ""],
    ["/", "/"],
    ["//", ""],
    ["///", ""],
    ["/a/", "/a"],
    ["a//", "a"],
    ["abc", "abc"],
    ["/api/v1/", "/api/v1"],
  ])("trims trailing slashes: %j -> %j", (input, expected) => {
    expect(trimTrailingSlash(input)).toBe(expected);
  });

  it("runs in linear time on long slash runs (no ReDoS)", () => {
    const hostile = `${"/".repeat(100_000)}x`;
    const start = performance.now();
    expect(trimTrailingSlash(hostile)).toBe(hostile);
    expect(performance.now() - start).toBeLessThan(1_000);
  });
});

describe("withBasePath", () => {
  it.each([
    ["", "/commands/x", "/commands/x"],
    ["/", "/commands/x", "/commands/x"],
    ["/app", "/commands/x", "/app/commands/x"],
    ["/app/", "/commands/x", "/app/commands/x"],
  ])("joins base %j with %j -> %j", (base, pathname, expected) => {
    expect(withBasePath(base, pathname)).toBe(expected);
  });
});
