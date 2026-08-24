import { describe, expect, it } from "vitest";
import { DebugStore, MAX_RECORDS } from "./debugStore";
import type { ExecutionSummary } from "./types";

function record(sequence: number, overrides: Partial<ExecutionSummary> = {}): ExecutionSummary {
  return {
    id: `record-${sequence}`,
    sequence,
    source: { surface: "profile", profile: "activities" },
    startedAt: "2026-08-23T10:00:00Z",
    durationMs: 12,
    rows: 3,
    level: "debug",
    counts: {
      operations: 1,
      harEntries: 0,
      harDropped: 0,
      logLines: 0,
      logDropped: 0,
      probes: 0,
      inspections: 0,
    },
    ...overrides,
  };
}

describe("DebugStore", () => {
  it("resumes from the highest sequence it holds", () => {
    const store = new DebugStore();
    expect(store.lastSequence()).toBe(0);

    store.addRecords([record(4), record(5)]);

    expect(store.lastSequence()).toBe(5);
  });

  // The stream replays from Last-Event-ID on every reconnect, so a record the
  // client already has will arrive again. Two rows for one execution would make
  // the console lie about how many queries ran.
  it("replaces a replayed record rather than appending it twice", () => {
    const store = new DebugStore();
    store.addRecord(record(7, { rows: 3 }));

    store.addRecord(record(7, { rows: 99 }));

    expect(store.getSnapshot().records).toHaveLength(1);
    expect(store.getSnapshot().records[0]?.rows).toBe(99);
  });

  it("drops the oldest records past its cap and says how many", () => {
    const store = new DebugStore();
    const overflow = 3;

    for (let sequence = 1; sequence <= MAX_RECORDS + overflow; sequence++) {
      store.addRecord(record(sequence));
    }

    const state = store.getSnapshot();
    expect(state.records).toHaveLength(MAX_RECORDS);
    expect(state.records[0]?.sequence).toBe(overflow + 1);
    expect(state.dropped).toBe(overflow);
  });

  // Eviction rewrites every index, so a record filed after a drop must still be
  // recognised on replay rather than appended a second time.
  it("keeps replay-dedupe correct after eviction", () => {
    const store = new DebugStore();
    for (let sequence = 1; sequence <= MAX_RECORDS + 1; sequence++) {
      store.addRecord(record(sequence));
    }

    store.addRecord(record(MAX_RECORDS + 1, { rows: 42 }));

    const records = store.getSnapshot().records;
    expect(records).toHaveLength(MAX_RECORDS);
    expect(records.filter((entry) => entry.sequence === MAX_RECORDS + 1)).toHaveLength(1);
    expect(records[records.length - 1]?.rows).toBe(42);
  });

  it("notifies subscribers and stops once unsubscribed", () => {
    const store = new DebugStore();
    let notifications = 0;
    const unsubscribe = store.subscribe(() => {
      notifications++;
    });

    store.addRecord(record(1));
    unsubscribe();
    store.addRecord(record(2));

    expect(notifications).toBe(1);
  });

  it("forgets what it held when cleared", () => {
    const store = new DebugStore();
    store.addRecords([record(1), record(2)]);

    store.clear();

    expect(store.getSnapshot().records).toEqual([]);
    expect(store.lastSequence()).toBe(0);
  });
});
