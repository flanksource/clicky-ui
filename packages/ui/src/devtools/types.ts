import type { HARFile, HAREntry } from "../data/har/types";
import type { QueryBrowserDiagnostics } from "../data/query-browser/QueryBrowser.types";

/**
 * The devtools wire types, mirroring the server's `query` package field for
 * field.
 *
 * They are split in two the same way the server splits them. A summary is what
 * every armed request produces and what the stream pushes; a detail carries the
 * bodies, previews and correlated logs and is fetched for one record when
 * someone opens it. A console watching a busy server would otherwise be handed
 * megabytes of response bodies for queries nobody looked at.
 */

/** Capture levels, in the order the server accepts them. */
export type DebugLevel =
  | "off"
  | "error"
  | "warn"
  | "info"
  | "debug"
  | "trace"
  | "trace1"
  | "trace2"
  | "trace3"
  | "trace4";

/** The seam a recorded request came in on. */
export type ExecutionSource = {
  surface: string;
  profile?: string | undefined;
  method?: string | undefined;
  path?: string | undefined;
  /** The client's query string, credential-shaped values blanked. */
  query?: string | undefined;
};

/**
 * What detail exists to fetch, so a badge can be rendered without paying for
 * the payload behind it.
 */
export type RecordCounts = {
  operations: number;
  harEntries: number;
  harDropped: number;
  logLines: number;
  logDropped: number;
  probes: number;
  inspections: number;
};

/**
 * One provider operation inside a request.
 *
 * A request is routinely more than one — a profile with context sub-queries
 * runs several — and reporting them as a single row is what makes "which of
 * these three was slow" unanswerable.
 */
export type OperationSummary = {
  /** 1-based, in the order the operations started. */
  index: number;
  provider: string;
  connection?: string | undefined;
  query?: string | undefined;
  method?: string | undefined;
  url?: string | undefined;
  status?: number | undefined;
  durationMs: number;
  rows: number;
  pages?: number | undefined;
  error?: string | undefined;
};

/** The cheap half: what ran, against what, how long, and how much came back. */
export type ExecutionSummary = {
  id: string;
  /** Assigned by the server's store; also the stream's event id. */
  sequence: number;
  source: ExecutionSource;
  startedAt: string;
  durationMs: number;
  rows: number;
  status?: number | undefined;
  error?: string | undefined;
  /**
   * The level this run was armed at. A console showing a record it did not arm
   * needs it to explain why the bodies are missing, rather than implying the
   * request made none.
   */
  level: string;
  operations?: OperationSummary[] | undefined;
  counts: RecordCounts;
};

/** One line a request logged, or one the process logged while no request owned it. */
export type DebugLogLine = {
  sequence: number;
  time: string;
  level: string;
  /** `request` lines are captured structurally; `process` lines are scraped text. */
  source: "request" | "process" | string;
  logger?: string | undefined;
  event?: string | undefined;
  message: string;
  values?: Record<string, unknown> | undefined;
  recordId?: string | undefined;
  /** Which operation within the request wrote it; 0 when not attributable. */
  operation?: number | undefined;
};

/** A column-cardinality question and the filter kind its answer chose. */
export type CardinalityProbe = {
  provider: string;
  connection?: string | undefined;
  column: string;
  field?: string | undefined;
  distinct: number;
  limit: number;
  kind: string;
  cached: boolean;
};

/** One inspection-cache lookup a request made. */
export type InspectionRecord = {
  policy: string;
  key: string;
  /** ~0 for a hit, the whole fill for a miss. That difference is the point. */
  elapsedMs: number;
  cached: boolean;
  state?: string | undefined;
  refreshing?: boolean | undefined;
  ageMs: number;
  /** A failed refresh behind a value that was still served. */
  refreshError?: string | undefined;
  /** A failure the caller actually got. */
  error?: string | undefined;
};

/** The expensive half, served for one record on demand. */
export type ExecutionDetail = {
  summary: ExecutionSummary;
  operations?: QueryBrowserDiagnostics[] | undefined;
  har?: HARFile | undefined;
  logs?: DebugLogLine[] | undefined;
  probes?: CardinalityProbe[] | undefined;
  inspections?: InspectionRecord[] | undefined;
  /**
   * Credential capture was on, so the HAR entries hold live secrets. Stated
   * rather than refused: a console that hands the file to a colleague has to
   * know which kind of file it is.
   */
  harSensitive?: boolean | undefined;
};

/**
 * One metadata cache as the server holds it — the other half of the Inspection
 * tab. A record says what one request looked up; this says what is being kept
 * on everyone's behalf, which is the thing a flush throws away.
 */
export type InspectionCacheStats = {
  policy: string;
  entries: number;
  maxEntries: number;
  weight: number;
  maxWeight: number;
  /** Loads in flight. Always-filling means the freshness window is too short. */
  filling: number;
  oldest?: string | undefined;
  freshForSeconds: number;
  maxFreshForSeconds: number;
};

export type InspectionCaches = {
  caches: InspectionCacheStats[];
};

/** What a flush actually dropped, per cache. */
export type FlushResult = {
  caches: { policy: string; entries: number }[];
  entries: number;
};

/** What the server's record store currently holds and what it has let go. */
export type DebugStats = {
  records: number;
  recordsDropped: number;
  oldestSequence: number;
  logLines: number;
  logsDropped: number;
  logsOldestSequence: number;
  detailsHeld: number;
  detailBytes: number;
  detailsEvicted: number;
  maxDetailBytes: number;
  detailTtlSeconds: number;
};

/**
 * What this server will do, asked before anything is asked of it — so the UI is
 * not built around constants duplicated on the other side of the wire.
 */
export type DebugCapabilities = {
  enabled: boolean;
  levels: string[];
  header: string;
  param: string;
  idHeader: string;
  stats: DebugStats;
};

export type DebugRecordsPage = {
  records: ExecutionSummary[];
  stats: DebugStats;
};

/** The server's answer when a record exists but its detail has aged out. */
export type DetailEvicted = {
  code: "detail_evicted";
  id: string;
  reason: string;
};

export type { HARFile, HAREntry };

/** The console's tabs, in the order they appear. */
export const DEBUG_TABS = ["queries", "network", "console", "inspection"] as const;
export type DebugTab = (typeof DEBUG_TABS)[number];

/**
 * Offered in the level picker, in the order they cost more.
 *
 * A subset of DebugLevel: `error`/`warn` capture less than the summary every
 * run already produces, and trace3/trace4 add nothing this console renders — a
 * picker offering ten options where six differ is a picker nobody reads.
 */
export const SELECTABLE_LEVELS: DebugLevel[] = ["off", "info", "debug", "trace", "trace1", "trace2"];

/**
 * What each level buys, stated as the extra capture rather than as a number.
 *
 * These are the *existing* per-event defaults in the server's observability
 * policy, not a scale this console invented — which is why the wording names
 * concrete artifacts (HAR entries, the SQL statement, response bodies).
 */
export const LEVEL_HELP: Record<string, string> = {
  off: "Nothing is captured and an ordinary run pays nothing",
  info: "Query text, connection, filters, rows, duration and errors",
  debug: "Adds HAR entries and response previews — no bodies are buffered",
  trace: "Adds request headers and the SQL statement itself",
  trace1: "Adds request bodies and bound SQL arguments",
  trace2: "Adds response bodies, with truncation reported",
};

/** Default arming level. `debug` buys HAR entries without buffering bodies. */
export const DEFAULT_DEBUG_LEVEL: DebugLevel = "debug";

/** The header a request arms itself with, and the one the response answers by. */
export const DEBUG_LEVEL_HEADER = "X-Debug-Level";
export const DEBUG_ID_HEADER = "X-Debug-Id";
/**
 * Asks a request to rebuild every metadata lookup it makes rather than read
 * what is cached.
 *
 * It rides per-request so the cost lands on the caller who asked and on nobody
 * else — unlike flushing, which drops the entry for everyone. The console keeps
 * it on until it is switched off, and drops it when the console closes, exactly
 * as it does the capture level.
 */
export const DEBUG_REFRESH_HEADER = "X-Debug-Refresh-Inspection";
/** Says the same thing as the header for a caller that cannot set one. */
export const DEBUG_LEVEL_PARAM = "__debug";
