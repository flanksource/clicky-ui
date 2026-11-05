import { describe, expect, it } from "vitest";
import {
  CLICKY_COLUMN_FORMAT_OPTIONS,
  CLICKY_COLUMN_UNIT_OPTIONS,
  elapsedMs,
  formatBytes,
  formatBytesPerSecond,
  formatDuration,
  formatShort,
  formatUnit,
} from "./format";

describe("column formatting options", () => {
  it("publishes the strict profile format and unit values", () => {
    expect(CLICKY_COLUMN_FORMAT_OPTIONS.map(({ value }) => value)).toEqual([
      "date",
      "float",
      "duration",
      "bytes",
      "currency",
    ]);
    expect(CLICKY_COLUMN_UNIT_OPTIONS.map(({ value }) => value)).toEqual([
      "none",
      "short",
      "percent",
      "percentunit",
      "bytes",
      "decbytes",
      "Bps",
      "binBps",
      "ms",
      "s",
    ]);
  });
});

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

describe("elapsedMs", () => {
  const startedAt = "2026-10-15T07:00:00Z";
  const now = Date.parse("2026-10-15T07:00:42.500Z");

  it.each([
    ["not started", undefined, undefined, undefined],
    ["finished", startedAt, "2026-10-15T07:02:00.250Z", 120_250],
    ["running", startedAt, undefined, 42_500],
    ["finished earlier than the client clock", startedAt, "2026-10-15T07:00:10Z", 10_000],
    ["running with a client clock behind the server", "2026-10-15T07:01:00Z", undefined, 0],
  ])("%s", (_name, started, finished, want) => {
    expect(elapsedMs(started, finished, now)).toBe(want);
  });

  it("names the field and value of a malformed timestamp", () => {
    expect(() => elapsedMs("yesterday", undefined, now)).toThrow('startedAt "yesterday"');
    expect(() => elapsedMs(startedAt, "soon", now)).toThrow('finishedAt "soon"');
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
