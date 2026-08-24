import type { DebugLevel, DebugLogLine, DebugStats, ExecutionSummary } from "./types";
import { DEFAULT_DEBUG_LEVEL } from "./types";

/**
 * The console's memory of what the server has told it.
 *
 * It is a plain external emitter rather than a context or a query cache because
 * the fetch wrapper writes to it, and that is not a hook — it runs inside the
 * API client, below React. `useSyncExternalStore` reads it, which is the same
 * idiom `useBrowserRouter` already uses and costs no new dependency.
 *
 * Everything here is bounded and lost on reload. Records hold request and
 * response bodies; a store that survived a refresh would be a place secrets
 * accumulate silently.
 */

/** Client-side ring caps, matching the server's own retention in spirit. */
export const MAX_RECORDS = 500;
export const MAX_LOG_LINES = 5000;

export type DebugStoreState = {
  /** Records oldest-first, the order they ran. */
  records: ExecutionSummary[];
  logs: DebugLogLine[];
  /** The level subsequent requests arm themselves at. */
  level: DebugLevel;
  /**
   * Whether subsequent requests also rebuild every metadata lookup they make.
   *
   * Off by default and never implied by the level: a page that re-derives every
   * field mapping and cardinality count can take seconds instead of
   * milliseconds, so it is something asked for rather than something arrived at.
   */
  refreshInspection: boolean;
  /** Live when the stream is connected; the console says so rather than looking empty. */
  connected: boolean;
  /** The last stream error, kept so a silent console can explain itself. */
  streamError?: string | undefined;
  /** What the server reports it holds, refreshed with each stats-bearing response. */
  stats?: DebugStats | undefined;
  /** How many records the client itself dropped to stay under its cap. */
  dropped: number;
};

const EMPTY: DebugStoreState = {
  records: [],
  logs: [],
  level: DEFAULT_DEBUG_LEVEL,
  refreshInspection: false,
  connected: false,
  dropped: 0,
};

export class DebugStore {
  private state: DebugStoreState = EMPTY;
  private listeners = new Set<() => void>();
  /** Sequence → index, so an SSE replay after a reconnect cannot double-file. */
  private seen = new Map<number, number>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = (): DebugStoreState => this.state;

  /**
   * The highest record sequence this store holds, which is what a reconnecting
   * stream resumes from. Zero means "replay everything you still have".
   */
  lastSequence(): number {
    const records = this.state.records;
    return records.length === 0 ? 0 : (records[records.length - 1]?.sequence ?? 0);
  }

  /**
   * Files a record. A record already held is replaced rather than appended:
   * the stream replays on reconnect, and the same execution arriving twice must
   * stay one row.
   */
  addRecord(record: ExecutionSummary): void {
    const existing = this.seen.get(record.sequence);
    if (existing !== undefined) {
      const records = this.state.records.slice();
      records[existing] = record;
      this.commit({ records });
      return;
    }
    const records = this.state.records.concat(record);
    let dropped = this.state.dropped;
    if (records.length > MAX_RECORDS) {
      dropped += records.length - MAX_RECORDS;
      records.splice(0, records.length - MAX_RECORDS);
    }
    this.reindex(records);
    this.commit({ records, dropped });
  }

  addRecords(records: ExecutionSummary[]): void {
    for (const record of records) this.addRecord(record);
  }

  /**
   * Appends a log line. Lines are keyed by source and sequence rather than
   * sequence alone: the request tail and the process tail are two independent
   * sequence spaces, and treating them as one would silently drop half.
   */
  addLog(line: DebugLogLine): void {
    const logs = this.state.logs.concat(line);
    if (logs.length > MAX_LOG_LINES) logs.splice(0, logs.length - MAX_LOG_LINES);
    this.commit({ logs });
  }

  addLogs(lines: DebugLogLine[]): void {
    if (lines.length === 0) return;
    const logs = this.state.logs.concat(lines);
    if (logs.length > MAX_LOG_LINES) logs.splice(0, logs.length - MAX_LOG_LINES);
    this.commit({ logs });
  }

  setLevel(level: DebugLevel): void {
    if (this.state.level === level) return;
    this.commit({ level });
  }

  setRefreshInspection(refreshInspection: boolean): void {
    if (this.state.refreshInspection === refreshInspection) return;
    this.commit({ refreshInspection });
  }

  setConnected(connected: boolean, streamError?: string): void {
    if (this.state.connected === connected && this.state.streamError === streamError) return;
    this.commit({ connected, streamError });
  }

  setStats(stats: DebugStats): void {
    this.commit({ stats });
  }

  /** Empties the client's view. The server's buffer is cleared separately. */
  clear(): void {
    this.seen.clear();
    this.commit({ records: [], logs: [], dropped: 0 });
  }

  private reindex(records: ExecutionSummary[]): void {
    this.seen.clear();
    records.forEach((record, index) => this.seen.set(record.sequence, index));
  }

  private commit(patch: Partial<DebugStoreState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }
}

/**
 * The store the dock and the fetch wrapper share.
 *
 * A module-level instance, deliberately: the wrapper is handed to the API
 * client at construction, long before any component mounts, so there is no
 * provider it could read a per-tree store from.
 */
export const debugStore = new DebugStore();
