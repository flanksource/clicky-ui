import { describe, expect, it } from "vitest";
import { orderTraceFeed, type TraceFeedRecord } from "./trace-feed";

const record = (kind: string, seq: number, timestamp: string | null): TraceFeedRecord => ({ runId: "run-example", kind, stream: kind, seq, timestamp, summary: kind, record: { kind: "stdout" } });

describe("trace feed ordering", () => {
  it("breaks overlapping sequences by capture and preserves native payload fields", () => {
    const records = [record("sql", 1, null), record("http", 2, null), record("http", 1, null)];
    expect(orderTraceFeed(records, "seq")).toEqual([records[2], records[0], records[1]]);
    expect(records[0]?.record).toEqual({ kind: "stdout" });
  });
  it("orders timestamps chronologically across offsets with untimed records last", () => {
    const records = [record("sql", 1, null), record("http", 1, "2026-01-01T10:00:00+02:00"), record("logs", 1, "2026-01-01T07:00:00Z")];
    expect(orderTraceFeed(records, "timestamp")).toEqual([records[2], records[1], records[0]]);
  });
});
