import type { StackRecord } from "./types";

/** The stack records one checkpoint took of one process. */
export type StackCheckpoint = {
  checkpointId: string;
  takenAt: string;
  reason: string;
  transport: string;
  /** The checkpoint's dump failed: its single record carries an error. */
  failed: boolean;
  records: StackRecord[];
};

/**
 * Groups one process's `stacks` records by checkpoint, oldest first, so the
 * last entry is the latest. Records of other processes are ignored. A
 * checkpoint's time, reason and transport are those of its first record.
 */
export function stackCheckpoints(records: StackRecord[], key: string): StackCheckpoint[] {
  const byCheckpoint = new Map<string, StackRecord[]>();
  for (const record of records) {
    if (record.key !== key) continue;
    byCheckpoint.set(record.checkpointId, [...(byCheckpoint.get(record.checkpointId) ?? []), record]);
  }
  return [...byCheckpoint]
    .map(([checkpointId, group]): StackCheckpoint => {
      const [first] = group as [StackRecord, ...StackRecord[]];
      return {
        checkpointId,
        takenAt: first.takenAt,
        reason: first.reason,
        transport: first.transport,
        failed: group.some((record) => record.error),
        records: group,
      };
    })
    .sort((a, b) => Date.parse(a.takenAt) - Date.parse(b.takenAt));
}
