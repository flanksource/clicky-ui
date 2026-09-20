import type { SessionInfo, SessionMetadata, SessionStreamRef } from "./sessionTypes";

export const JVM_TRACE_EVENTS: SessionStreamRef = {
  stream: "probe:FileMessageListener.onMessage.617519d6",
  kind: "jvm_trace",
  generation: "9b2f6c1e-4d0a-4c7e-8e1f-2a5b7d3c9f10",
  low: 1,
  high: 1843,
  from: 1,
  to: 1843,
  total: 1843,
  expiresAt: "2026-10-15T10:09:12Z",
  store: {
    backend: "sqlite",
    host: "mission-control-oipa-6d9f",
    file: "/data/oipa-cli/trace-results/environments/oipa.lab/records.sqlite",
  },
};

// The stopped web-armed JVM trace from the recorded-trace-sessions plan (§3):
// its `:start` and `:status` records flattened into one SessionInfo, as
// `GET /api/v1/sessions/{id}` serves it. Shared by the SessionHeader stories
// and specs so both exercise the same wire shape.
export const STOPPED_JVM_TRACE_SESSION: SessionInfo = {
  schemaVersion: 1,
  id: "7c1e2f4a-3b5d-4e6f-8a9b-0c1d2e3f4a5b",
  profile: "trace-capture/jvm_trace",
  kind: "capture",
  role: "capture",
  params: {
    target: "cycle",
    class: "com.example.messaging.FileMessageListener",
    method: "onMessage",
    loader: "org.apache.catalina.loader.ParallelWebappClassLoader@617519d6",
    args: true,
    return: true,
    exception: true,
    calls: true,
    events: 1000,
    expand: 3,
    chars: 16384,
    durationMs: 900000,
  },
  labels: {
    target: "cycle",
    origin: "web",
    via: "http",
    label: "FileMessageListener#onMessage (trace)",
    environment: "oipa.lab",
  },
  principal: "admin",
  owner: { host: "mission-control-oipa-6d9f", pid: 1, boot: "b41c9e0d" },
  startedAt: "2026-09-15T10:00:00Z",
  state: "stopped",
  eventCount: 1843,
  updatedAt: "2026-09-15T10:09:14Z",
  heartbeatAt: "2026-09-15T10:09:00Z",
  stopAt: "2026-09-15T10:15:00Z",
  stoppedAt: "2026-09-15T10:09:12Z",
  stopReason: "stopped by admin",
  handle: "FileMessageListener.onMessage.617519d6",
  events: JVM_TRACE_EVENTS,
  summary: {
    calls: 1843,
    errors: 3,
    p95Ms: 412,
    dropped: 0,
    suppressed: 12,
    methods: ["onMessage(Message)"],
  },
  // A stopped session is out of every registry, so no server can control it.
  controllable: false,
  localWriter: true,
  eventsAvailable: true,
  unresponsive: false,
  restartable: true,
};

export function sessionFixture(overrides: Partial<SessionInfo> = {}): SessionInfo {
  return { ...STOPPED_JVM_TRACE_SESSION, ...overrides };
}

/** The same capture while it is still armed in this process: no stoppedAt, a deadline ahead. */
export function runningSessionFixture(stopAt: string, overrides: Partial<SessionInfo> = {}): SessionInfo {
  const { stoppedAt: _stoppedAt, stopReason: _stopReason, ...running } = STOPPED_JVM_TRACE_SESSION;
  return { ...running, state: "running", stopAt, controllable: true, restartable: false, ...overrides };
}

/** The same events in a kv store: the server omits host and file, since a kv backend has neither. */
export const KV_STORE_EVENTS: SessionStreamRef = { ...JVM_TRACE_EVENTS, store: { backend: "kv" } };

/** What a SQL Server Extended Events capture reports once armed: the statements that opened it. */
export const SQL_XEVENT_STATEMENTS: SessionMetadata = {
  name: "sql_xevent.statements",
  label: "Started with",
  language: "sql",
  value: `CREATE EVENT SESSION [trace_7c1e2f4a] ON SERVER
ADD EVENT sqlserver.rpc_completed (
    ACTION (package0.event_sequence, sqlserver.client_app_name, sqlserver.client_hostname, sqlserver.database_name, sqlserver.session_id, sqlserver.sql_text, sqlserver.username)
    WHERE ([duration] >= 1000 AND sqlserver.like_i_sql_unicode_string(sqlserver.database_name, N'POLICY[_]%') AND NOT (sqlserver.equal_i_sql_unicode_string(sqlserver.client_app_name, N'go/example-cli')) AND sqlserver.like_i_sql_unicode_string(sqlserver.client_hostname, N'cycle%'))
),
ADD EVENT sqlserver.sql_batch_completed (
    ACTION (package0.event_sequence, sqlserver.client_app_name, sqlserver.client_hostname, sqlserver.database_name, sqlserver.session_id, sqlserver.sql_text, sqlserver.username)
    WHERE ([duration] >= 1000 AND sqlserver.like_i_sql_unicode_string(sqlserver.database_name, N'POLICY[_]%') AND NOT (sqlserver.equal_i_sql_unicode_string(sqlserver.client_app_name, N'go/example-cli')) AND sqlserver.like_i_sql_unicode_string(sqlserver.client_hostname, N'cycle%'))
)
ADD TARGET package0.ring_buffer (SET max_memory = 4096, max_events_limit = 8192)
WITH (MAX_DISPATCH_LATENCY = 1 SECONDS, TRACK_CAUSALITY = OFF, STARTUP_STATE = OFF);

ALTER EVENT SESSION [trace_7c1e2f4a] ON SERVER STATE = START;`,
};

/** A stopped SQL Server trace, with the statements that opened its Extended Events session. */
export const STOPPED_SQL_XEVENT_SESSION: SessionInfo = sessionFixture({
  profile: "trace-capture/sql_xevent",
  params: { database: "POLICY_*", host: "cycle*", minDuration: "1ms", durationMs: 600000 },
  labels: { target: "sql", origin: "web", label: "SQL trace · cycle*", environment: "oipa.lab" },
  handle: "trace_7c1e2f4a",
  events: { ...JVM_TRACE_EVENTS, stream: "sql_xevent:trace_7c1e2f4a", kind: "sql_xevent" },
  summary: { events: 1843, errors: 0 },
  metadata: [SQL_XEVENT_STATEMENTS],
});
