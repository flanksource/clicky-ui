import { useEffect, useRef, useState } from "react";

// use-log-tail is the clicky-ui client for a *follow* session: the server opens
// a live source for a query profile and streams rows out of it until someone
// closes it. It is shaped like use-task-run — SSE-first, polling only when
// EventSource is missing — but the resource underneath is far less forgiving. A
// follow session holds a websocket to Loki, or a log stream to a kubelet, for as
// long as it exists, and the server caps how many may run at once
// (ErrMaxSessions, surfaced as HTTP 409). A session that is left behind is
// therefore not untidy, it is a slot the next reader cannot have, which is why
// stopping is a DELETE the hook issues on every exit path including unmount.
//
// The second thing this stream does differently is replay. Each SSE frame
// carries an `id:`, so a reconnecting EventSource sends Last-Event-ID and the
// server resumes from that sequence — re-delivering frames the client may
// already hold. Sequences are the server's, not a client index: they do not
// start at 1 and they do not reset, so the accumulator dedupes against the
// highest sequence it has applied rather than against a position in an array.

export type LogSessionState =
  | "starting"
  | "running"
  | "completed"
  | "failed"
  | "stopped"
  | "interrupted";

/** SessionInfo as returned by POST /profile/{name}/sessions and the `done` frame. */
export interface LogSessionInfo {
  id: string;
  profile: string;
  kind: string;
  state: LogSessionState;
  params?: Record<string, unknown>;
  error?: string;
  eventCount: number;
  startedAt: string;
  stoppedAt?: string;
}

/**
 * One `event:` frame. It carries either a single `row` or a batch under `rows`
 * — never both — plus an `error` when the source failed mid-stream without the
 * session itself ending.
 */
export interface LogTailEvent {
  sessionId: string;
  sequence: number;
  time?: string;
  row?: Record<string, unknown>;
  rows?: Record<string, unknown>[];
  error?: string;
}

/**
 * Where a failure came from, because the three are not interchangeable to a
 * reader: `start` means the session never existed (409 is the cap), `stream`
 * means the session is alive but something in it went wrong, and `session`
 * means the server ended it.
 */
export interface LogTailError {
  scope: "start" | "stream" | "session";
  message: string;
  /** HTTP status when a request produced the failure. 409 is the session cap. */
  httpStatus?: number;
}

/** Renderable transport/session state. The terminal values are the server's own. */
export type LogTailStatus =
  | "idle"
  | "starting"
  | "streaming"
  | "polling"
  | "connection lost — retrying"
  | "completed"
  | "failed"
  | "stopped"
  | "interrupted";

const TERMINAL: ReadonlySet<string> = new Set(["completed", "failed", "stopped", "interrupted"]);

export function isTerminalSessionState(state: LogSessionState | undefined): boolean {
  return state !== undefined && TERMINAL.has(state);
}

export interface LogTailBuffer {
  /** Rows in arrival order, oldest first — the order this surface tails in. */
  rows: Record<string, unknown>[];
  /** Highest sequence applied, or null before the first frame. Never assumed to start at 1. */
  lastSequence: number | null;
  /** Rows evicted by the cap. Kept so the UI can say so instead of quietly shortening history. */
  dropped: number;
}

export const emptyLogTailBuffer: LogTailBuffer = { rows: [], lastSequence: null, dropped: 0 };

/**
 * Renders profile parameters as the tail of a session request's query string,
 * `""` when there are none, and each entry already `&`-prefixed so it appends
 * to a query that always begins with `?follow=true`.
 *
 * Keys are sorted so two callers passing the same parameters in a different
 * order produce the same string — the effect that opens the session depends on
 * it, and an unstable spelling would tear down a live tail and start a new one
 * on a render that changed nothing.
 *
 * A null or undefined value is omitted rather than sent as the text "null": the
 * server reads every query key as a supplied parameter, so spelling an absent
 * one out states a filter the caller did not ask for.
 */
export function encodeTailParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const query = new URLSearchParams();
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value === undefined || value === null) continue;
    query.append(key, String(value));
  }
  const encoded = query.toString();
  return encoded === "" ? "" : `&${encoded}`;
}

/**
 * Applies one frame to the buffer, dropping anything at or below the highest
 * sequence already seen. A watermark is enough — and cheaper than remembering
 * every id — because SSE is ordered within a connection and the only source of
 * duplicates is a reconnect, whose replay starts at Last-Event-ID and so can
 * only re-deliver frames the buffer has already passed.
 *
 * Returns the buffer unchanged when the frame adds nothing, so React can bail
 * out of the render.
 */
export function appendTailEvent(
  buffer: LogTailBuffer,
  event: LogTailEvent,
  maxRows: number,
): LogTailBuffer {
  if (buffer.lastSequence !== null && event.sequence <= buffer.lastSequence) return buffer;
  const incoming = event.rows ?? (event.row ? [event.row] : []);
  if (incoming.length === 0) return { ...buffer, lastSequence: event.sequence };

  const merged = buffer.rows.concat(incoming);
  const overflow = Math.max(0, merged.length - Math.max(1, maxRows));
  return {
    rows: overflow > 0 ? merged.slice(overflow) : merged,
    lastSequence: event.sequence,
    dropped: buffer.dropped + overflow,
  };
}

export interface UseLogTailOptions {
  /** Query profile to follow, e.g. "k8s-pod-logs". */
  profile: string;
  /** Profile parameters, sent as the session request's query string. */
  params?: Record<string, unknown> | undefined;
  /** Base path of the session API, e.g. "/api/v1". */
  basePath?: string | undefined;
  /** Start/stop is the caller's: flipping this to false DELETEs the session. */
  following?: boolean | undefined;
  /** Rows kept in memory; older ones are evicted and counted in `droppedRows`. */
  maxRows?: number | undefined;
  /** Poll interval (ms) for the fallback transport. */
  pollMs?: number | undefined;
  /** Force polling even when EventSource exists (mainly tests). */
  forcePoll?: boolean | undefined;
}

export interface UseLogTailResult {
  /** Accumulated rows, oldest first. */
  rows: Record<string, unknown>[];
  status: LogTailStatus;
  error: LogTailError | null;
  sessionId: string | null;
  /** True while the caller wants rows and the session has not reached a terminal state. */
  following: boolean;
  /** Rows the cap evicted; non-zero means the tail no longer holds the whole run. */
  droppedRows: number;
  /** Highest sequence applied — the resume point a reconnect would ask for. */
  lastSequence: number | null;
  /** Latest SessionInfo the server sent, for eventCount / startedAt / state. */
  session: LogSessionInfo | null;
}

const DEFAULT_BASE = "/api/v1";
const DEFAULT_POLL_MS = 1_000;
const DEFAULT_MAX_ROWS = 5_000;

function hasEventSource(): boolean {
  return typeof globalThis !== "undefined" && typeof globalThis.EventSource !== "undefined";
}

/** DELETE the session. Exported because a caller that owns the id (a saved tail,
 *  a beforeunload handler) has to be able to release it without the hook. */
export async function stopLogSession(basePath: string, id: string): Promise<void> {
  const res = await fetch(`${basePath}/sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
    keepalive: true,
  });
  if (!res.ok) {
    throw new Error((await res.text()) || `stopping session ${id} failed with HTTP ${res.status}`);
  }
}

export function useLogTail(options: UseLogTailOptions): UseLogTailResult {
  const {
    profile,
    params,
    basePath = DEFAULT_BASE,
    following: wantFollow = false,
    maxRows = DEFAULT_MAX_ROWS,
    pollMs = DEFAULT_POLL_MS,
    forcePoll = false,
  } = options;

  const [buffer, setBuffer] = useState<LogTailBuffer>(emptyLogTailBuffer);
  const [status, setStatus] = useState<LogTailStatus>("idle");
  const [error, setError] = useState<LogTailError | null>(null);
  const [session, setSession] = useState<LogSessionInfo | null>(null);

  // The cap is read when a frame lands rather than closed over, so changing how
  // much history to keep never tears down a live session to do it.
  const maxRowsRef = useRef(maxRows);
  maxRowsRef.current = maxRows;

  // Profile parameters travel in the query string because that is where the
  // session endpoint reads them from: it builds its params by walking
  // r.URL.Query() and never looks at the body, so a posted body is a filter the
  // server silently ignores — the tail would run the profile's defaults while
  // the reader believed they were following what they had filtered to.
  //
  // Serialized here rather than in the effect so it is also the effect's
  // dependency: two renders with equal parameters must not restart the session.
  const paramsQuery = encodeTailParams(params);

  useEffect(() => {
    if (!wantFollow) return;

    // Each start is a distinct server session replaying from its own first
    // sequence, so the previous run's rows cannot be continued — carrying them
    // over would interleave two unrelated sequence spaces in one list.
    setBuffer(emptyLogTailBuffer);
    setError(null);
    setSession(null);
    setStatus("starting");

    let cancelled = false;
    let source: EventSource | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let liveSessionId: string | null = null;
    let ended = false;

    const apply = (event: LogTailEvent) => {
      setBuffer((prev) => appendTailEvent(prev, event, maxRowsRef.current));
      // An event-level error does not end the session, so it is reported beside
      // the rows rather than in place of them.
      if (event.error) setError({ scope: "stream", message: event.error });
    };

    // Unlike the task stream this does not skip what it cannot parse: a tail
    // that silently discards frames is indistinguishable from a quiet log
    // source, which is the one thing a reader must never be left guessing at.
    const readFrame = (label: string, e: MessageEvent): unknown => {
      try {
        return JSON.parse(e.data as string);
      } catch (cause) {
        setError({ scope: "stream", message: `unparseable ${label} frame: ${String(cause)}` });
        return undefined;
      }
    };

    const settle = (info: LogSessionInfo) => {
      setSession(info);
      if (!isTerminalSessionState(info.state)) return;
      ended = true;
      setStatus(info.state as LogTailStatus);
      if (info.state === "failed") {
        setError({
          scope: "session",
          message: info.error || `session ${info.id} failed without reporting a reason`,
        });
      }
    };

    const subscribe = (id: string) => {
      const es = new EventSource(`${basePath}/sessions/${encodeURIComponent(id)}/events`);
      source = es;
      setStatus("streaming");
      es.addEventListener("event", (e) => {
        const frame = readFrame("event", e as MessageEvent);
        if (frame) apply(frame as LogTailEvent);
      });
      es.addEventListener("done", (e) => {
        const info = readFrame("done", e as MessageEvent);
        if (info) settle(info as LogSessionInfo);
        es.close();
      });
      // A dropped connection is not a failure: EventSource reconnects with
      // Last-Event-ID and the server replays. It is reported through `status`
      // only, so a blip never leaves a sticky error the reader has to dismiss —
      // and never after the session ended, where it would overwrite the reason
      // it ended with a reconnect that is not going to happen.
      es.onerror = () => {
        if (!ended) setStatus("connection lost — retrying");
      };
    };

    // The polling transport asks for the same replay the SSE reconnect gets:
    // `after` is Last-Event-ID by another name.
    const poll = (id: string) => {
      let after: number | null = null;
      const tick = async () => {
        try {
          const query = after === null ? "" : `?after=${after}`;
          const res = await fetch(
            `${basePath}/sessions/${encodeURIComponent(id)}/events${query}`,
            { headers: { Accept: "application/json" } },
          );
          if (!res.ok) {
            // A refused request is the session answering that it is gone or
            // broken; retrying it forever would render as an empty tail.
            ended = true;
            setStatus("failed");
            setError({
              scope: "session",
              httpStatus: res.status,
              message: `reading events for session ${id} failed with HTTP ${res.status}: ${
                (await res.text()).trim() || "no detail"
              }`,
            });
            return;
          }
          for (const event of (await res.json()) as LogTailEvent[]) {
            apply(event);
            if (after === null || event.sequence > after) after = event.sequence;
          }
          setStatus("polling");
        } catch {
          setStatus("connection lost — retrying");
        }
        if (!cancelled) timer = setTimeout(tick, pollMs);
      };
      void tick();
    };

    // Releasing can run while the component is already gone, so a failure here
    // cannot be raised into state — but it is the failure that costs everyone
    // else a session slot, so it is never swallowed either.
    const release = (id: string) =>
      stopLogSession(basePath, id).catch((cause: unknown) => {
        console.error(`[useLogTail] could not stop follow session ${id}`, cause);
      });

    const start = async () => {
      let info: LogSessionInfo;
      try {
        const res = await fetch(
          `${basePath}/profile/${encodeURIComponent(profile)}/sessions?follow=true${paramsQuery}`,
          { method: "POST", headers: { Accept: "application/json" } },
        );
        if (!res.ok) {
          const detail = (await res.text()).trim() || "no detail";
          setStatus("failed");
          setError({
            scope: "start",
            httpStatus: res.status,
            message:
              res.status === 409
                ? `the server is already running as many follow sessions as it allows (HTTP 409): ${detail}`
                : `could not start a follow session for ${profile} (HTTP ${res.status}): ${detail}`,
          });
          return;
        }
        info = (await res.json()) as LogSessionInfo;
      } catch (cause) {
        setStatus("failed");
        setError({
          scope: "start",
          message: `could not reach ${basePath} to start a follow session for ${profile}: ${String(cause)}`,
        });
        return;
      }

      if (cancelled) {
        // The caller stopped following while the POST was in flight. The session
        // exists on the server regardless, so it still has to be released.
        void release(info.id);
        return;
      }
      liveSessionId = info.id;
      setSession(info);
      if (forcePoll || !hasEventSource()) poll(info.id);
      else subscribe(info.id);
    };

    void start();
    // A session left running is not untidy, it is a slot the next reader cannot
    // have — so it is released on every exit path, unmount included.
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      source?.close();
      if (liveSessionId && !ended) void release(liveSessionId);
    };
  }, [profile, paramsQuery, basePath, wantFollow, pollMs, forcePoll]);

  // Stopping returns the surface to idle, but a session that ended on its own
  // keeps its terminal status so the reason it ended stays on screen.
  useEffect(() => {
    if (!wantFollow) setStatus((prev) => (TERMINAL.has(prev) ? prev : "idle"));
  }, [wantFollow]);

  return {
    rows: buffer.rows,
    status,
    error,
    sessionId: session?.id ?? null,
    following: wantFollow && !TERMINAL.has(status),
    droppedRows: buffer.dropped,
    lastSequence: buffer.lastSequence,
    session,
  };
}
