import { describe, expect, it } from "vitest";
import { METRICS } from "../fixtures/classes";
import type { JvmMemoryPool } from "../protocol/types";
import { capturedAtMs, poolLimit, poolTone, sumPools } from "./memory";

const pool = (overrides: Partial<JvmMemoryPool>): JvmMemoryPool => ({ name: "p", used: 0, committed: 0, max: -1, ...overrides });

describe("poolLimit", () => {
  it("uses max when the pool has one", () => {
    expect(poolLimit(pool({ used: 10, committed: 20, max: 100 }))).toEqual({ limit: 100, bounded: true });
  });

  it("falls back to committed and says there is no max", () => {
    expect(poolLimit(pool({ used: 10, committed: 20, max: -1 }))).toEqual({ limit: 20, bounded: false });
  });
});

describe("poolTone", () => {
  it.each([
    [{ used: 50, committed: 100, max: 100 }, "success"],
    [{ used: 75, committed: 100, max: 100 }, "warning"],
    [{ used: 90, committed: 100, max: 100 }, "danger"],
    [{ used: 99, committed: 100, max: -1 }, "info"],
    [{ used: 0, committed: 0, max: -1 }, "neutral"],
  ] as const)("%j is %s", (fields, expected) => {
    expect(poolTone(pool(fields))).toBe(expected);
  });
});

describe("sumPools", () => {
  it("adds used and limit across pools, using committed for pools without a max", () => {
    expect(sumPools(METRICS.memory.heap)).toEqual({ used: (182 + 611 + 12) * 1024 * 1024, limit: (256 + 1024 + 16) * 1024 * 1024 });
  });
});

describe("capturedAtMs", () => {
  it("parses the ISO capture time", () => {
    expect(capturedAtMs("2026-11-15T08:00:00Z")).toBe(Date.UTC(2026, 10, 15, 8));
  });

  it("throws on a malformed timestamp instead of rendering Invalid Date", () => {
    expect(() => capturedAtMs("yesterday")).toThrow(/capturedAt/);
  });
});
