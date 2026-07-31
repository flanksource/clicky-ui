import { describe, expect, it } from "vitest";
import {
  formatServerTimingDuration,
  parseServerTiming,
  serverTimingCounterSummary,
  serverTimingMetricLabel,
} from "./server-timing";

describe("server timing", () => {
  it("parses phases and diagnostic counters from a Server-Timing header", () => {
    expect(
      parseServerTiming(
        'total;dur=120.5, command;dur=95.2, format;dur=4.1, sql;dur=18.6;desc="queries=2 rows_returned=501", redis;dur=1.2;desc="ops=3 hits=2 misses=1 errors=0"',
      ),
    ).toEqual([
      { name: "total", duration: 120.5, counters: {} },
      { name: "command", duration: 95.2, counters: {} },
      { name: "format", duration: 4.1, counters: {} },
      {
        name: "sql",
        duration: 18.6,
        description: "queries=2 rows_returned=501",
        counters: { queries: 2, rows_returned: 501 },
      },
      {
        name: "redis",
        duration: 1.2,
        description: "ops=3 hits=2 misses=1 errors=0",
        counters: { ops: 3, hits: 2, misses: 1, errors: 0 },
      },
    ]);
  });

  it("does not split delimiters inside quoted descriptions", () => {
    expect(parseServerTiming('lookup;dur=2.5;desc="Custom, cached; phase"')).toEqual([
      {
        name: "lookup",
        duration: 2.5,
        description: "Custom, cached; phase",
        counters: {},
      },
    ]);
  });

  it("formats durations, metric labels, and counter summaries", () => {
    expect(formatServerTimingDuration(3.25)).toBe("3.3 ms");
    expect(formatServerTimingDuration(125)).toBe("125 ms");
    expect(formatServerTimingDuration(12035.3)).toBe("12.0 s");
    expect(serverTimingMetricLabel({ name: "format", duration: 1, counters: {} })).toBe(
      "Format response",
    );
    expect(
      serverTimingMetricLabel({
        name: "lookup",
        duration: 1,
        description: "Session lookup",
        counters: {},
      }),
    ).toBe("Session lookup");
    expect(
      serverTimingCounterSummary({
        name: "redis",
        duration: 1,
        counters: { ops: 1, hits: 1, misses: 0, errors: 0 },
      }),
    ).toBe("1 operation · 1 hit · 0 misses · 0 errors");
  });

  it("returns no metrics for an absent header", () => {
    expect(parseServerTiming(undefined)).toEqual([]);
    expect(parseServerTiming(null)).toEqual([]);
    expect(parseServerTiming("")).toEqual([]);
  });
});
