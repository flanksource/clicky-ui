import { describe, expect, it } from "vitest";
import {
  formatBytes,
  formatBytesPerSecond,
  formatDuration,
  formatShort,
  formatUnit,
} from "./format";

describe("formatBytes", () => {
  it.each([
    [0, "0 B"],
    [-5, "0 B"],
    [undefined, "0 B"],
    [512, "512 B"],
    [1024, "1 KB"],
    [1536, "1.5 KB"],
    [1024 * 1024 + 512 * 1024, "1.5 MB"],
    [1024 ** 3, "1 GB"],
    [15 * 1024 * 1024, "15 MB"],
  ])("formats %p as %p (1024-based)", (input, want) => {
    expect(formatBytes(input)).toBe(want);
  });

  it("supports decimal (1000) base", () => {
    expect(formatBytes(1_500_000, { base: 1000 })).toBe("1.5 MB");
  });
});

describe("formatBytesPerSecond", () => {
  it("appends /s", () => {
    expect(formatBytesPerSecond(1024 * 1024)).toBe("1 MB/s");
  });
});

describe("formatShort", () => {
  it.each([
    [999, "999"],
    [1200, "1.2K"],
    [3_400_000, "3.4M"],
    [12_000, "12K"],
    [-1500, "-1.5K"],
  ])("formats %p as %p", (input, want) => {
    expect(formatShort(input)).toBe(want);
  });
});

describe("formatDuration", () => {
  it.each([
    [850, "850 ms"],
    [1500, "1.5 s"],
    [90_000, "1.5 min"],
    [3_600_000, "1 h"],
  ])("formats %p ms as %p", (input, want) => {
    expect(formatDuration(input)).toBe(want);
  });

  it("accepts seconds input", () => {
    expect(formatDuration(90, { from: "s" })).toBe("1.5 min");
  });
});

describe("formatUnit", () => {
  it.each([
    ["percent", 42.3, "42.3%"],
    ["percentunit", 0.42, "42%"],
    ["bytes", 1024 * 1024 + 512 * 1024, "1.5 MB"],
    ["decbytes", 1_500_000, "1.5 MB"],
    ["Bps", 1024 * 1024, "1 MB/s"],
    ["short", 3_400_000, "3.4M"],
    ["none", 1200, "1.2K"],
    ["ms", 1500, "1.5 s"],
    ["s", 90, "1.5 min"],
  ])("dispatches unit %p", (unit, value, want) => {
    expect(formatUnit(value, unit)).toBe(want);
  });

  it("keeps back-compat: literal % maps to percent", () => {
    expect(formatUnit(42, "%")).toBe("42%");
  });

  it("keeps back-compat: unknown unit becomes a raw suffix", () => {
    expect(formatUnit(5, "req")).toBe("5req");
  });

  it("renders a plain number when no unit is given", () => {
    expect(formatUnit(1234.5)).toBe("1,234.5");
  });

  it("coerces non-finite values to 0", () => {
    expect(formatUnit(NaN, "bytes")).toBe("0 B");
  });
});
