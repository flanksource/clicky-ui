import { describe, expect, it } from "vitest";
import { parseGoDurationMs, readDurationNumber } from "./duration";

describe("parseGoDurationMs", () => {
  it("sums every number+unit component", () => {
    expect(parseGoDurationMs("1h30m")).toBe(90 * 60_000);
    expect(parseGoDurationMs("1.5s")).toBe(1_500);
    expect(parseGoDurationMs("500ms")).toBe(500);
    expect(parseGoDurationMs("1µs")).toBe(1 / 1_000);
  });

  it("rejects strings that are not entirely number+unit components", () => {
    expect(parseGoDurationMs("")).toBeNull();
    expect(parseGoDurationMs("30")).toBeNull();
    expect(parseGoDurationMs("1h ")).toBeNull();
    expect(parseGoDurationMs("1hx")).toBeNull();
    expect(parseGoDurationMs("-1h")).toBeNull();
  });

  it("rejects a long digit run in linear time", () => {
    const start = performance.now();
    expect(parseGoDurationMs(`${"0".repeat(50_000)}x`)).toBeNull();
    expect(performance.now() - start).toBeLessThan(1_000);
  });
});

describe("readDurationNumber", () => {
  it("reads the decimal at the offset and reports where it ends", () => {
    expect(readDurationNumber("12.5ms", 0)).toEqual({ value: 12.5, next: 4 });
    expect(readDurationNumber("x.5", 1)).toEqual({ value: 0.5, next: 3 });
    expect(readDurationNumber("ms", 0)).toBeNull();
  });
});
