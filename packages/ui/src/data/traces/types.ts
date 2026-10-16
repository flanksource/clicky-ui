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
  /** CPU % over the last sampling window (per core); unknown until a full window has been observed. */
  cpuPercent?: number | null;
  rssBytes: number;
  /** Highest known `cpuPercent`; unknown until one is known. */
  peakCpuPercent?: number | null;
  peakRssBytes: number;
  /**
   * The ways a stack of this process can be collected, as the `stacks` kind's
   * dumpers offer them for it. A destructive transport (sigquit) kills the
   * process. Absent when no dumper can reach it.
   */
  stackTransports?: ProcessStackTransport[];
  /** The environment read once when the node was created, already masked. Absent unless the tree armed `environment`. */
  environment?: ProcessEnv;
  /** Why the environment could not be read. */
  environmentError?: string;
};

/** One way to take a stack dump of a process. */
export type ProcessStackTransport = {
  /** "inprocess", "native", "pprof", "gops" or "sigquit". */
  transport: string;
  /** Taking the dump terminates the process. */
  destructive: boolean;
};

/** The environment of a process: variable name to value. */
export type ProcessEnv = Record<string, string>;

/**
 * One file, socket or connection a process holds open, as `process_samples`
 * stores it (the clicky `process.Descriptor` shape).
 */
export type ProcessDescriptor = {
  fd: string;
  type: string;
  name: string;
  protocol?: string;
  state?: string;
  localAddr?: string;
  remoteAddr?: string;
  port?: number;
};

/** The descriptor facets a `process_samples` session can arm. */
export type ProcessSampleFacet = "openFiles" | "sockets" | "ports" | "connections";

/** One `process_samples` record: a process's usage at one tick. */
export type ProcessSampleRow = {
  sampledAt: string;
  tick: number;
  key: string;
  pid: number;
  /** CPU % over the window ending at this sample; unknown on a process's first sample. */
  cpuPercent?: number | null;
  memoryPercent: number;
  rssBytes: number;
  /** Cumulative bytes the process has read from disk. */
  diskReadBytes?: number;
  /** Cumulative bytes the process has written to disk. */
  diskWriteBytes?: number;
  /** Counts, present on every tick of a session that armed the facet and absent otherwise. */
  openFiles?: number;
  sockets?: number;
  ports?: number;
  connections?: number;
  /**
   * The full lists, stored only on a tick where they differ from the process's
   * previously stored list (the first tick always stores them). An empty list is
   * omitted, so a zero count with no list means the list is empty.
   */
  openFileList?: ProcessDescriptor[];
  socketList?: ProcessDescriptor[];
  portList?: ProcessDescriptor[];
  connectionList?: ProcessDescriptor[];
};

/** A source location in a stack or profile. */
export type StackFrame = {
  func: string;
  file: string;
  line: number;
};

/** The format of a stack dump: Go goroutines or a native thread sample. Empty on a dump that failed. */
export type StackFormat = "go" | "native" | "";

/**
 * One `stacks` record: a goroutine (Go format), or a whole dump (native format,
 * no frames). A dump that failed is one record with `error` set. Records of one
 * checkpoint share a `checkpointId`.
 */
export type StackRecord = {
  checkpointId: string;
  takenAt: string;
  /** Why the checkpoint was taken, for example a watchdog timeout or a manual request. */
  reason: string;
  /** How it was taken: "inprocess", "native", "pprof", "gops" or "sigquit". */
  transport: string;
  /** The `process_tree` key of the dumped process. */
  key: string;
  pid: number;
  format: StackFormat;
  goroutineId?: number;
  /** The goroutine state, for example "running" or "chan receive". */
  state?: string;
  waitMinutes?: number;
  lockedToThread?: boolean;
  /** Innermost frame first. */
  frames?: StackFrame[];
  createdBy?: StackFrame;
  raw: string;
  error?: string;
};

/**
 * What a view needs of a profile sample, whatever produced it (a `goprof` record,
 * later a `jfr` sample): a value of some type and unit, attributed to a stack.
 */
export type ProfileSample = {
  /** For example "cpu", "samples", "inuse_space" or "alloc_objects". */
  sampleType: string;
  /** For example "nanoseconds", "bytes" or "count". */
  unit: string;
  value: number;
  /** Innermost frame first. */
  frames: StackFrame[];
};

/** One `goprof` record: a pprof sample type's value for one stack, at one checkpoint. */
export type GoProfileRecord = ProfileSample & {
  checkpointId: string;
  takenAt: string;
  reason: string;
  /** Where the profile was read from: "pprof", "gops" or "file". */
  source: string;
  key: string;
  pid: number;
  /** "cpu", "heap", "allocs", "mutex", "block" or "goroutine". */
  profile: string;
  stackHash: string;
};

/** A record of a kind `TraceView` has no dedicated viewer for. */
export type TraceRow = Record<string, unknown>;
