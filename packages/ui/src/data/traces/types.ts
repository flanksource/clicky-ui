import type { HARHeader } from "../har/types";

/**
 * Row shapes of the commons-db trace kinds, as their record streams store them
 * (camelCase JSON). Declared as `type` aliases so they satisfy DataTable's
 * `Record<string, unknown>` row constraint.
 */

/**
 * A request or response body as a trace stream stores it. The http kind parses
 * JSON bodies (`WithJSONProcessor`) so they are masked and filtered as
 * structure; a row read straight from the store therefore holds such a body as
 * an object or array, and as text again only when read back through the Go API.
 */
export type TraceBodyText = string | Record<string, unknown> | unknown[];

export type HttpExchangeRequest = {
  method: string;
  url: string;
  httpVersion?: string;
  headers?: HARHeader[] | null;
  queryString?: HARHeader[] | null;
  postData?: { mimeType?: string; text?: TraceBodyText | null } | null;
  headersSize?: number;
  bodySize?: number;
};

export type HttpExchangeResponse = {
  status: number;
  statusText?: string;
  httpVersion?: string;
  headers?: HARHeader[] | null;
  content?: { size?: number; mimeType?: string; text?: TraceBodyText | null; truncated?: boolean } | null;
  redirectURL?: string;
  headersSize?: number;
  bodySize?: number;
};

/** One `http` / `http_proxy` record: an outbound request and its response. */
export type HttpExchangeRow = {
  startedAt: string;
  feature?: string;
  method: string;
  host: string;
  url: string;
  status: number;
  durationMs: number;
  request: HttpExchangeRequest;
  response: HttpExchangeResponse;
  error?: string;
  /** Per-phase milliseconds; a phase the capture did not measure is -1. */
  timings?: { send?: number; wait?: number; receive?: number };
  serverIPAddress?: string;
  /** A CONNECT tunnel relayed without decrypting it: only the byte counts are known. */
  tunnelled?: boolean;
  bytesIn?: number;
  bytesOut?: number;
  /** `base64` when the response content is not UTF-8 text. */
  encoding?: string;
  comment?: string;
  /** Paths of the values the capture cut, such as `response.content.text`. */
  truncated?: string[];
};

/** One `pg_proxy` / `sql_statements` record. */
export type SqlStatementRow = {
  startedAt: string;
  connection: string;
  driver: string;
  op: string;
  tables: string[];
  sql: string;
  /** Keys statements that differ only by their values. */
  repeatKey: string;
  args?: unknown[];
  durationMs: number;
  /** Rows returned, or -1 when the driver could not tell. */
  rows: number;
  error?: string;
  truncated?: string[];
};

export type TerminalEventKind = "o" | "r" | "snapshot" | "exit";

/** One `terminal` record: output, a resize, the settled screen, or the end of the session. */
export type TerminalEvent = {
  /** Wall-clock time of the event. Absent on events parsed from a downloaded cast. */
  at?: string;
  /** Seconds since the first byte, the clock a cast plays on. */
  offset: number;
  kind: TerminalEventKind;
  /** The output of an `o` event, and the screen of a `snapshot`. */
  data: string;
  width: number;
  height: number;
  exitCode?: number;
  /** On the `exit` row: output events were not recorded (size caps or a full buffer). */
  truncated?: boolean;
  /** On the `exit` row: the command line the terminal ran. */
  command?: string;
};

/** One `process_tree` record: a process as last seen. */
export type ProcessNodeRow = {
  key: string;
  parentKey?: string;
  pid: number;
  ppid: number;
  name: string;
  command: string;
  cwd?: string;
  status: string;
  isRoot?: boolean;
  startedAt: string;
  exitedAt?: string | null;
  lastSeenAt: string;
  cpuPercent: number;
  rssBytes: number;
  peakCpuPercent: number;
  peakRssBytes: number;
  stack?: string;
  stackError?: string;
};

/** One `process_samples` record: a process's usage at one tick. */
export type ProcessSampleRow = {
  sampledAt: string;
  tick: number;
  key: string;
  pid: number;
  cpuPercent: number;
  memoryPercent: number;
  rssBytes: number;
};

/** A record of a kind `TraceView` has no dedicated viewer for. */
export type TraceRow = Record<string, unknown>;
