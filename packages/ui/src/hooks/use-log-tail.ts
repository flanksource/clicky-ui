import { useEffect, useRef, useState } from "react";
import type { ClickyRow } from "../data/Clicky";
import { isSessionState, isSessionTerminal, type SessionState } from "../rpc/sessionTypes";

// use-log-tail is the clicky-ui client for a *follow* session: the server opens
// a live source for a query profile and streams rows out of it until someone
// closes it. The resource underneath is unforgiving. A follow session holds a
// websocket to Loki, or a log stream to a kubelet, for as long as it exists,
// and the server caps how many may run at once (ErrMaxSessions, surfaced as
// HTTP 409). The server owns that slot's release: a view session ends shortly
// after its last subscriber disconnects, so every exit path — unmount and a
// parameter change included — only has to abort the start request and close
// the EventSource.
//
// Events travel over SSE only. The events route serves SSE (or ndjson on
// request) and resumes through Last-Event-ID; there is no JSON-array polling
// shape to fall back to, so a browser without EventSource fails loudly.
//
// Each SSE frame carries an `id:`, so a reconnecting EventSource sends
// Last-Event-ID and the server resumes from that sequence — re-delivering
// frames the client may already hold. Sequences are the server's, not a client
// index: they do not start at 1 and they do not reset, so the accumulator
// dedupes against the highest sequence it has applied rather than against a
// position in an array.

/** The sessions API's state, under the name this hook has always exported. */
export type LogSessionState = SessionState;

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
 *
 * `clickyRow` is the presented row — `{cells, detail?}`, built by the exact
 * function that fills in `node.rows[n]` of the list's own
 * `application/json+clicky` document — riding next to the raw `row` on a
 * trace/follow session's per-row events. A plain log tail (or a top-session
 * snapshot event) never sets it; only a reader that reconciles rows against a
 * presented table, i.e. OperationCatalog's follow mode, depends on it.
 */
export interface LogTailEvent {
  sessionId: string;
  sequence: number;
  time?: string;
  row?: Record<string, unknown>;
  rows?: Record<string, unknown>[];
  /** The presented ClickyRow for `row`, when the profile sends one. */
  clickyRow?: ClickyRow;
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
  | "connection lost — retrying"
  | "completed"
  | "failed"
  | "stopped"
  | "interrupted";

/**
 * `stopping` is a stop in flight: the source may still flush rows, so the tail
 * keeps reading until the done frame.
 */
export function isTerminalSessionState(state: LogSessionState | undefined): boolean {
  return state !== undefined && isSessionTerminal(state);
}

function isTerminalTailStatus(status: LogTailStatus): boolean {
  return isSessionState(status) && isSessionTerminal(status);
}

export interface LogTailBuffer {
  /** Rows in arrival order, oldest first — the order this surface tails in. */
  rows: Record<string, unknown>[];
  /**
   * Each entry's presented ClickyRow, index-aligned with `rows` (same length,
   * same order) — `undefined` where the event carried none. Additive: a plain
   * log tail never reads this and `rows` itself is unchanged, so existing
   * `useLogTail` consumers keep working exactly as before.
   */
  clickyRows: (ClickyRow | undefined)[];
  /** Highest sequence applied, or null before the first frame. Never assumed to start at 1. */
  lastSequence: number | null;
  /** Rows evicted by the cap. Kept so the UI can say so instead of quietly shortening history. */
  dropped: number;
}

export const emptyLogTailBuffer: LogTailBuffer = {
  rows: [],
  clickyRows: [],
  lastSequence: null,
  dropped: 0,
};

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

  // A batched `rows` frame has no per-item clickyRow equivalent — only the
  // single-`row` shape trace/follow sessions use ever carries one — so a
  // batch pads with `undefined` to stay index-aligned with `rows`.
  const incomingClickyRows: (ClickyRow | undefined)[] = event.rows
    ? event.rows.map(() => undefined)
    : [event.clickyRow];

  const merged = buffer.rows.concat(incoming);
  const mergedClickyRows = buffer.clickyRows.concat(incomingClickyRows);
  const overflow = Math.max(0, merged.length - Math.max(1, maxRows));
  return {
    rows: overflow > 0 ? merged.slice(overflow) : merged,
    clickyRows: overflow > 0 ? mergedClickyRows.slice(overflow) : mergedClickyRows,
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
  /** Start/stop is the caller's: flipping this to false closes the stream; the server reaps the unsubscribed session. */
  following?: boolean | undefined;
  /** Rows kept in memory; older ones are evicted and counted in `droppedRows`. */
  maxRows?: number | undefined;
}

export interface UseLogTailResult {
  /** Accumulated rows, oldest first. */
  rows: Record<string, unknown>[];
  /** Each row's presented ClickyRow, index-aligned with `rows`; `undefined`
   *  where the event carried none (a plain log tail, or a top-session
   *  snapshot event). */
  clickyRows: (ClickyRow | undefined)[];
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
const DEFAULT_MAX_ROWS = 5_000;

function hasEventSource(): boolean {
  return typeof globalThis !== "undefined" && typeof globalThis.EventSource !== "undefined";
}

export function useLogTail(options: UseLogTailOptions): UseLogTailResult {
  const {
    profile,
    params,
    basePath = DEFAULT_BASE,
    following: wantFollow = false,
    maxRows = DEFAULT_MAX_ROWS,
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

    // Checked before the session exists: a session nobody can subscribe to
    // would hold a server slot until the reaper noticed.
    if (!hasEventSource()) {
      setStatus("failed");
      setError({
        scope: "start",
        message: `cannot follow ${profile}: this browser has no EventSource, and session events are served only as SSE`,
      });
      return;
    }
    setStatus("starting");

    let cancelled = false;
    const aborter = new AbortController();
    let source: EventSource | undefined;
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

    const start = async () => {
      let info: LogSessionInfo;
      try {
        const res = await fetch(
          `${basePath}/profile/${encodeURIComponent(profile)}/sessions?follow=true${paramsQuery}`,
          { method: "POST", headers: { Accept: "application/json" }, signal: aborter.signal },
        );
        if (cancelled) return;
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
        // Our own abort on unmount or a parameter change: nothing is left to report to.
        if (cancelled) return;
        setStatus("failed");
        setError({
          scope: "start",
          message: `could not reach ${basePath} to start a follow session for ${profile}: ${String(cause)}`,
        });
        return;
      }

      // The caller stopped following while the POST was in flight. If the
      // session was created, nothing ever subscribes, so the server ends it.
      if (cancelled) return;
      setSession(info);
      subscribe(info.id);
    };

    void start();
    // Aborting the start and closing the stream is the whole release: a view
    // session without a subscriber ends server-side.
    return () => {
      cancelled = true;
      aborter.abort();
      source?.close();
    };
  }, [profile, paramsQuery, basePath, wantFollow]);

  // Stopping returns the surface to idle, but a session that ended on its own
  // keeps its terminal status so the reason it ended stays on screen.
  useEffect(() => {
    if (!wantFollow) setStatus((prev) => (isTerminalTailStatus(prev) ? prev : "idle"));
  }, [wantFollow]);

  return {
    rows: buffer.rows,
    clickyRows: buffer.clickyRows,
    status,
    error,
    sessionId: session?.id ?? null,
    following: wantFollow && !isTerminalTailStatus(status),
    droppedRows: buffer.dropped,
    lastSequence: buffer.lastSequence,
    session,
  };
}
