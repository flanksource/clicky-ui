export interface ProcessHeaderRow {
  runId: string;
  stream: string;
  key: string;
  pid: number;
  name: string;
  command: string;
  exitedAt?: string;
  sampledAt?: string;
  cpuPercent: number | null;
  rssBytes: number | null;
  memoryPercent: number | null;
}

export interface ProcessHeaderSnapshot {
  armed: boolean;
  rows: ProcessHeaderRow[];
}

export const processHeaderKey = (row: ProcessHeaderRow) => `${row.runId}/${row.stream}/${row.key}`;
