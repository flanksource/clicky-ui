// Wire types for the commons-db query sessions API (`cmd/query/sessions`):
// `GET /api/v1/sessions/{id}` answers one SessionInfo, flat JSON — the
// immutable SessionStart and the mutable SessionStatus side by side, plus the
// fields the serving process derives. Field names are the Go json tags of
// `query.SessionStart`, `query.SessionStatus`, `query.SessionInfo` and
// `recordresults.StreamRef`, spelled exactly.

export const SESSION_STATES = [
  "starting",
  "running",
  "stopping",
  "completed",
  "failed",
  "stopped",
  "interrupted",
] as const;

export type SessionState = (typeof SESSION_STATES)[number];

/** `capture` sessions create data and are persisted; `view` sessions follow existing data and never are. */
export type SessionRole = "capture" | "view";

export type SessionProfileKind = "trace" | "top" | "capture";

export type SessionOwner = {
  host: string;
  pid: number;
  /** Process boot id: a different boot on the same host means the owner restarted. */
  boot: string;
};

/** A store the server omits `host` and `file` for when the backend has neither (a kv store). */
export type SessionStoreLocation = {
  backend: string;
  host?: string;
  file?: string;
};

/** Where a capture's canonical event rows live in the record store. */
export type SessionStreamRef = {
  stream: string;
  kind: string;
  generation: string;
  low: number;
  high: number;
  from: number;
  to: number;
  total: number;
  expiresAt?: string;
  store: SessionStoreLocation;
};

/**
 * One thing a capture reported about how it runs once armed — the statements
 * that opened an Extended Events session, say. `name` keys it within the
 * session; `language` names `value`'s language when it is code (`sql`).
 */
export type SessionMetadata = {
  name: string;
  label: string;
  language?: string;
  value: string;
};

export type SessionInfo = {
  // SessionStart — written once.
  schemaVersion: number;
  id: string;
  profile: string;
  kind: SessionProfileKind;
  role: SessionRole;
  /** Exactly what a restart replays; `durationMs` 0 or absent means the run had no bound. */
  params?: Record<string, unknown>;
  labels?: Record<string, string>;
  principal?: string;
  owner: SessionOwner;
  restartOf?: string;
  startedAt: string;

  // SessionStatus — overwritten on every change.
  state: SessionState;
  error?: string;
  warning?: string;
  eventCount: number;
  updatedAt: string;
  heartbeatAt: string;
  stopAt?: string;
  stoppedAt?: string;
  stopReason?: string;
  handle?: string;
  events?: SessionStreamRef;
  summary?: unknown;
  result?: unknown;
  /** Written once the capture is armed, then kept. */
  metadata?: SessionMetadata[];

  // Derived by the serving process.
  /** Live in this process's registry: Stop and Extend act on it. */
  controllable: boolean;
  /** The owner boot is this process, so its tail wakes in-process. */
  localWriter: boolean;
  /** The `events` stream's store is readable here. */
  eventsAvailable: boolean;
  /** Still active but its heartbeat is older than the registry's StaleAfter. */
  unresponsive: boolean;
  /** This process holds a RestartFunc for the session's profile and origin. */
  restartable: boolean;
  /** Ids of sessions whose `restartOf` names this one, computed on read from the index. */
  restartedAs?: string[];
};

const TERMINAL_STATES: ReadonlySet<SessionState> = new Set([
  "completed",
  "failed",
  "stopped",
  "interrupted",
]);

export function isSessionTerminal(state: SessionState): boolean {
  return TERMINAL_STATES.has(state);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSessionState(value: unknown): value is SessionState {
  return typeof value === "string" && (SESSION_STATES as readonly string[]).includes(value);
}

/**
 * parseSessionInfo checks the fields a session view reads before it trusts a
 * response, and throws naming the first one that is missing or mistyped — a
 * header that rendered `undefined` as a state or an owner would hide a server
 * that stopped sending the contract.
 */
export function parseSessionInfo(value: unknown, source: string): SessionInfo {
  if (!isRecord(value)) {
    throw new Error(`${source}: expected a session object, got ${JSON.stringify(value)}`);
  }
  const fail: FieldFailure = (field, expected, got = value[field]) => {
    throw new Error(`${source}: session field "${field}" must be ${expected}, got ${JSON.stringify(got)}`);
  };
  for (const field of ["id", "profile", "kind", "role", "startedAt", "updatedAt", "heartbeatAt"]) {
    if (typeof value[field] !== "string" || value[field] === "") fail(field, "a non-empty string");
  }
  if (!isSessionState(value.state)) fail("state", `one of ${SESSION_STATES.join("|")}`);
  if (typeof value.eventCount !== "number") fail("eventCount", "a number");
  for (const field of ["controllable", "localWriter", "eventsAvailable", "unresponsive", "restartable"]) {
    if (typeof value[field] !== "boolean") fail(field, "a boolean");
  }
  const owner = value.owner;
  if (!isRecord(owner) || typeof owner.host !== "string" || typeof owner.pid !== "number") {
    fail("owner", "{host: string, pid: number, boot: string}");
  }
  if (value.restartedAs !== undefined && !Array.isArray(value.restartedAs)) {
    fail("restartedAs", "an array of session ids");
  }
  if (value.events !== undefined) checkStreamRef(value.events, fail);
  if (value.metadata !== undefined) checkMetadata(value.metadata, fail);
  return value as SessionInfo;
}

type FieldFailure = (field: string, expected: string, got?: unknown) => never;

function checkMetadata(metadata: unknown, fail: FieldFailure): void {
  if (!Array.isArray(metadata)) return fail("metadata", "an array of metadata entries", metadata);
  metadata.forEach((entry: unknown, index) => {
    const at = `metadata[${index}]`;
    if (!isRecord(entry)) return fail(at, "{name, label, value: string, language?: string}", entry);
    for (const field of ["name", "label", "value"]) {
      if (typeof entry[field] !== "string" || entry[field] === "") {
        fail(`${at}.${field}`, "a non-empty string", entry[field]);
      }
    }
    if (entry.language !== undefined && typeof entry.language !== "string") {
      fail(`${at}.language`, "a string when present", entry.language);
    }
  });
}

function checkStreamRef(events: unknown, fail: FieldFailure): void {
  if (!isRecord(events)) return fail("events", "a stream reference object", events);
  for (const field of ["stream", "kind", "generation"]) {
    if (typeof events[field] !== "string") fail(`events.${field}`, "a string", events[field]);
  }
  for (const field of ["low", "high", "from", "to", "total"]) {
    if (typeof events[field] !== "number") fail(`events.${field}`, "a number", events[field]);
  }
  const store = events.store;
  if (!isRecord(store)) return fail("events.store", "{backend: string, host?: string, file?: string}", store);
  if (typeof store.backend !== "string") fail("events.store.backend", "a string", store.backend);
  for (const field of ["host", "file"]) {
    if (store[field] !== undefined && typeof store[field] !== "string") {
      fail(`events.store.${field}`, "a string when present", store[field]);
    }
  }
}

/**
 * sessionDurationParam renders a duration for the sessions API's `duration`
 * query param, which the server reads with Go's time.ParseDuration.
 */
export function sessionDurationParam(durationMs: number): string {
  if (!Number.isInteger(durationMs) || durationMs <= 0) {
    throw new Error(`session duration must be a positive whole number of milliseconds, got ${durationMs}`);
  }
  return `${durationMs}ms`;
}

/** The run's own bound, from `params.durationMs`; undefined when it had none (0 or absent). */
export function sessionParamsDurationMs(session: SessionInfo): number | undefined {
  const value = session.params?.durationMs;
  if (value === undefined || value === 0) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    throw new Error(
      `session ${session.id}: params.durationMs must be a non-negative whole number, got ${JSON.stringify(value)}`,
    );
  }
  return value;
}
