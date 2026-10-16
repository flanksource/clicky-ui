import { describe, expect, it } from "vitest";
import { stackRecords } from "./fixtures";
import { stackCheckpoints } from "./stack-checkpoints";

describe("stackCheckpoints", () => {
  it("groups one process's records by checkpoint, oldest first, with each checkpoint's time, reason and transport", () => {
    const checkpoints = stackCheckpoints(stackRecords, "100:1");
    expect(
      checkpoints.map(({ checkpointId, takenAt, reason, transport, failed, records }) => ({
        checkpointId,
        takenAt,
        reason,
        transport,
        failed,
        goroutines: records.map((record) => record.goroutineId),
      })),
    ).toEqual([
      { checkpointId: "ckpt-periodic", takenAt: "2026-10-01T09:00:10.000Z", reason: "periodic", transport: "inprocess", failed: false, goroutines: [1, 17] },
      { checkpointId: "ckpt-timeout", takenAt: "2026-10-01T09:00:28.000Z", reason: "timeout", transport: "inprocess", failed: false, goroutines: [1, 17, 22] },
    ]);
  });

  it("orders by time, not by arrival", () => {
    const reversed = [...stackRecords].reverse();
    expect(stackCheckpoints(reversed, "100:1").map((checkpoint) => checkpoint.checkpointId)).toEqual(["ckpt-periodic", "ckpt-timeout"]);
  });

  it("marks a checkpoint whose dump failed", () => {
    expect(stackCheckpoints(stackRecords, "102:101").map((checkpoint) => checkpoint.failed)).toEqual([true]);
  });

  it("is empty for a process with no records", () => {
    expect(stackCheckpoints(stackRecords, "300:299")).toEqual([]);
  });
});
