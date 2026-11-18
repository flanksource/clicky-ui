export interface TraceFeedRecord extends Record<string, unknown> {
  runId: string;
  kind: string;
  stream: string;
  seq: number;
  timestamp: string | null;
  summary: string;
  ansi?: string;
  record: Record<string, unknown>;
}

export interface TraceFeedRequest {
  kind: string;
  sort: "seq" | "timestamp";
  cursor: string;
}

export interface TraceFeedPage {
  rows: TraceFeedRecord[];
  nextCursor: string;
}

export const traceFeedKey = (record: TraceFeedRecord) => `${record.runId}/${record.kind}/${record.stream}/${record.seq}`;

export function orderTraceFeed(rows: TraceFeedRecord[], sort: TraceFeedRequest["sort"]): TraceFeedRecord[] {
  return [...rows].sort((a, b) => {
    if (sort === "timestamp") {
      const left = a.timestamp === null ? Infinity : Date.parse(a.timestamp);
      const right = b.timestamp === null ? Infinity : Date.parse(b.timestamp);
      if (Number.isNaN(left) || Number.isNaN(right)) throw new Error("Trace feed contains an invalid timestamp");
      if (left !== right) return left < right ? -1 : 1;
    }
    return a.seq - b.seq || a.kind.localeCompare(b.kind) || a.stream.localeCompare(b.stream);
  });
}
