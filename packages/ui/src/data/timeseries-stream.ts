import { createContext, useContext } from "react";
import type { EventSourceFactory, EventSourceLike } from "../hooks/event-source";
import type { TimeseriesPoint, TimeseriesServerSeries } from "./TimeseriesPanel.model";

// One subscription per (baseUrl, range, interval) group serves every widget on
// a page: widgets register the ids they show, registrations are coalesced over
// a short debounce, and each group holds a single
// `{baseUrl}stream?id=…&since=<range>&interval=<n>s` stream (clicky
// metrics.RegisterStreamRoutes). Opened through the EventSourceFactory, so
// under createEventHub every group rides the tab's one hub connection.

/** The payload of a stream's `snapshot` and `append` events. */
export interface TimeseriesStreamFrame {
  series: TimeseriesServerSeries[];
  /** Series ids (not sources) that no longer exist. */
  removed?: string[];
}

/** The identity of a stream group: every widget with the same three shares one subscription. */
export interface TimeseriesStreamGroup {
  /** Prefix the stream path is appended to, e.g. "/api/v1/metrics/". */
  baseUrl: string;
  /** The look-back window, sent as `since` (a Go duration or RFC3339 time). */
  range: string;
  /** The server tick, e.g. "5s" (see {@link timeseriesStreamInterval}). */
  interval: string;
}

export interface TimeseriesStreamRegistration extends TimeseriesStreamGroup {
  id: string;
}

/** What a group's widgets read, replaced (never mutated) on every change. */
export interface TimeseriesStreamGroupState {
  /** Every series held, grouped by the requested id (`source`) it answers. */
  bySource: ReadonlyMap<string, readonly TimeseriesServerSeries[]>;
  /** Requested ids a snapshot has answered; an id outside it is still loading. */
  answered: ReadonlySet<string>;
  /** The stream's error event, or its failure to open; cleared by the next snapshot. */
  error: Error | null;
}

export interface TimeseriesStream {
  /** Adds one widget's interest in an id; the returned function removes it. */
  register(registration: TimeseriesStreamRegistration): () => void;
  /** useSyncExternalStore subscription: called after any group's state changes. */
  subscribe(listener: () => void): () => void;
  /** Every group's state by {@link timeseriesStreamGroupKey}; a new map after any change. */
  getSnapshot(): ReadonlyMap<string, TimeseriesStreamGroupState>;
  /** The state of one group (empty when nothing is registered in it). */
  getGroup(key: string): TimeseriesStreamGroupState;
  /** Closes every subscription and forgets every registration; later registrations start afresh. */
  close(): void;
}

export interface TimeseriesStreamOptions {
  factory: EventSourceFactory;
  /** How long registrations coalesce before groups re-subscribe. Defaults to 50ms. */
  debounceMs?: number;
  /** Clock used to trim points older than the range window. Defaults to Date.now. */
  now?: () => number;
}

const DEFAULT_DEBOUNCE_MS = 50;
const CLOSED = 2;
// The server's window when `since` is empty (clicky metrics defaultWindow).
const DEFAULT_WINDOW_MS = 60 * 60 * 1000;

/** The state of a group nothing has been received for. */
export const EMPTY_TIMESERIES_STREAM_GROUP: TimeseriesStreamGroupState = Object.freeze({
  bySource: new Map(),
  answered: new Set<string>(),
  error: null,
});

export function timeseriesStreamGroupKey({ baseUrl, range, interval }: TimeseriesStreamGroup): string {
  return JSON.stringify([baseUrl, range, interval]);
}

/**
 * The stream tick for a widget's `refreshMs`: whole seconds, rounded up, at
 * least 1s (the server minimum). `null` for `refreshMs <= 0`, which asks for
 * no live updates, so such widgets fetch once instead of streaming.
 */
export function timeseriesStreamInterval(refreshMs: number): string | null {
  if (!(refreshMs > 0)) return null;
  return `${Math.max(1, Math.ceil(refreshMs / 1000))}s`;
}

/**
 * Where a widget's series streams from. With a `baseUrl` the series streams
 * as `id` from `{baseUrl}stream`. Without one (the single-`url` panel form),
 * the url is split at its last path `/`: `"/api/v1/metrics/sqlserver.cpu"`
 * streams as `sqlserver.cpu` from `/api/v1/metrics/stream`, the same single
 * segment the server's `GET {prefix}/metrics/{id}` route reads. A url with no
 * such prefix has no stream endpoint, so it is null and keeps fetching.
 */
export function timeseriesStreamAddress(baseUrl: string, id: string): { baseUrl: string; id: string } | null {
  if (baseUrl !== "") return { baseUrl, id };
  const query = id.indexOf("?");
  const slash = id.lastIndexOf("/", query === -1 ? id.length : query);
  if (slash === -1 || slash === id.length - 1 || slash === query - 1) return null;
  return { baseUrl: id.slice(0, slash + 1), id: id.slice(slash + 1) };
}

export function timeseriesStreamUrl(group: TimeseriesStreamGroup, ids: readonly string[]): string {
  const params = new URLSearchParams();
  for (const id of ids) params.append("id", id);
  if (group.range) params.set("since", group.range);
  params.set("interval", group.interval);
  return `${group.baseUrl}stream?${params.toString()}`;
}

const GO_DURATION_UNITS_MS: Record<string, number> = {
  ns: 1e-6,
  us: 1e-3,
  "µs": 1e-3,
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
};
const GO_DURATION = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:ns|us|µs|ms|s|m|h)(?:(?:\d+(?:\.\d*)?|\.\d+)(?:ns|us|µs|ms|s|m|h))*$/;
const GO_DURATION_PART = /(\d+(?:\.\d*)?|\.\d+)(ns|us|µs|ms|s|m|h)/g;

/**
 * The oldest timestamp (epoch ms) the window `range` keeps at `nowMs`, read the
 * way the server reads `since`: an RFC3339 time, or a Go duration before now.
 */
export function timeseriesWindowStart(range: string, nowMs: number): number {
  if (range === "") return nowMs - DEFAULT_WINDOW_MS;
  if (range === "0") return nowMs;
  if (GO_DURATION.test(range)) {
    let ms = 0;
    for (const [, amount, unit] of range.matchAll(GO_DURATION_PART)) {
      ms += Number(amount) * (GO_DURATION_UNITS_MS[unit as string] as number);
    }
    return nowMs - ms;
  }
  const at = Date.parse(range);
  if (Number.isNaN(at)) {
    throw new Error(`metrics range ${JSON.stringify(range)} is neither a Go duration nor an RFC3339 time`);
  }
  return at;
}

function pointTime(point: TimeseriesPoint): number {
  const at = Date.parse(point.at);
  if (Number.isNaN(at)) throw new Error(`metrics point has an invalid timestamp ${JSON.stringify(point.at)}`);
  return at;
}

function trimPoints(points: readonly TimeseriesPoint[], startMs: number): TimeseriesPoint[] {
  return points.filter((p) => pointTime(p) >= startMs);
}

/** `existing` with `fresh` merged in by timestamp (fresh wins), sorted oldest first. */
function mergePoints(existing: readonly TimeseriesPoint[], fresh: readonly TimeseriesPoint[]): TimeseriesPoint[] {
  const byTime = new Map<number, TimeseriesPoint>();
  for (const p of existing) byTime.set(pointTime(p), p);
  for (const p of fresh) byTime.set(pointTime(p), p);
  return [...byTime.entries()].sort(([a], [b]) => a - b).map(([, p]) => p);
}

function parseFrame(name: string, data: unknown): TimeseriesStreamFrame {
  const frame = JSON.parse(String(data)) as TimeseriesStreamFrame;
  if (!frame || !Array.isArray(frame.series)) {
    throw new Error(`metrics stream ${name} frame has no series array`);
  }
  return frame;
}

interface GroupRecord extends TimeseriesStreamGroup {
  key: string;
  refs: Map<string, number>;
  ids: string[];
  source: EventSourceLike | null;
  /** Held series keyed by series id, in server order. */
  series: Map<string, TimeseriesServerSeries>;
  answered: Set<string>;
  error: Error | null;
}

function buildState(group: GroupRecord): TimeseriesStreamGroupState {
  const bySource = new Map<string, TimeseriesServerSeries[]>();
  for (const s of group.series.values()) {
    const list = bySource.get(s.source) ?? [];
    list.push(s);
    bySource.set(s.source, list);
  }
  return { bySource, answered: new Set(group.answered), error: group.error };
}

/** Creates the store behind {@link TimeseriesStreamProvider}; see the module comment. */
export function createTimeseriesStream(options: TimeseriesStreamOptions): TimeseriesStream {
  const { factory, debounceMs = DEFAULT_DEBOUNCE_MS, now = Date.now } = options;
  const groups = new Map<string, GroupRecord>();
  const dirty = new Set<string>();
  const listeners = new Set<() => void>();
  let flushTimer: ReturnType<typeof setTimeout> | null = null;
  let snapshot: ReadonlyMap<string, TimeseriesStreamGroupState> = new Map();

  function notify(next: Map<string, TimeseriesStreamGroupState>): void {
    snapshot = next;
    for (const listener of Array.from(listeners)) listener();
  }

  function publish(group: GroupRecord): void {
    notify(new Map(snapshot).set(group.key, buildState(group)));
  }

  function forget(key: string): void {
    const next = new Map(snapshot);
    next.delete(key);
    notify(next);
  }

  function fail(group: GroupRecord, error: Error): void {
    group.error = error;
    publish(group);
  }

  function applySnapshot(group: GroupRecord, ids: readonly string[], frame: TimeseriesStreamFrame): void {
    const start = timeseriesWindowStart(group.range, now());
    group.series = new Map(frame.series.map((s) => [s.id, { ...s, points: trimPoints(s.points, start) }]));
    group.answered = new Set(ids);
    group.error = null;
  }

  function applyAppend(group: GroupRecord, frame: TimeseriesStreamFrame): void {
    const start = timeseriesWindowStart(group.range, now());
    const next = new Map<string, TimeseriesServerSeries>();
    for (const [id, s] of group.series) next.set(id, { ...s, points: trimPoints(s.points, start) });
    for (const s of frame.series) {
      const held = next.get(s.id);
      const points = held ? mergePoints(held.points, s.points) : s.points;
      next.set(s.id, { ...s, points: trimPoints(points, start) });
    }
    for (const id of frame.removed ?? []) next.delete(id);
    group.series = next;
  }

  function open(group: GroupRecord, ids: string[]): void {
    const url = timeseriesStreamUrl(group, ids);
    const source = factory(url);
    const current = () => group.source === source;
    const onFrame = (name: "snapshot" | "append") => (event: Event) => {
      if (!current()) return;
      try {
        const frame = parseFrame(name, (event as MessageEvent).data);
        if (name === "snapshot") applySnapshot(group, ids, frame);
        else applyAppend(group, frame);
        publish(group);
      } catch (err) {
        fail(group, err instanceof Error ? err : new Error(String(err)));
      }
    };
    source.addEventListener("snapshot", onFrame("snapshot"));
    source.addEventListener("append", onFrame("append"));
    source.addEventListener("error", (event) => {
      if (!current()) return;
      // A sub the event hub failed (the server closed it with an error, or
      // refused the subscribe) is an ErrorEvent carrying the server's message.
      // A server-sent `error` event carries {"error": msg}; a transport error
      // carries no data. A transport error that leaves the source CONNECTING
      // is a reconnect the hub (or native EventSource) re-subscribes from with
      // a fresh snapshot; one that leaves it CLOSED is a failed subscription
      // native EventSource gives no reason for.
      if (event instanceof ErrorEvent) {
        fail(group, new Error(event.message));
        return;
      }
      const data = (event as MessageEvent).data;
      if (typeof data === "string" && data !== "") {
        let message: string;
        try {
          message = String((JSON.parse(data) as { error?: unknown }).error ?? data);
        } catch {
          message = data;
        }
        fail(group, new Error(message));
        return;
      }
      if (source.readyState === CLOSED) fail(group, new Error(`metrics stream closed: ${url}`));
    });
    group.source?.close();
    group.source = source;
    group.ids = ids;
  }

  function reconcile(key: string): void {
    const group = groups.get(key);
    if (!group) return;
    const ids = [...group.refs.keys()].sort();
    if (ids.length === 0) {
      group.source?.close();
      groups.delete(key);
      forget(key);
      return;
    }
    if (ids.length === group.ids.length && ids.every((id, i) => id === group.ids[i])) return;
    // Keep what is held for ids still requested until the new snapshot
    // replaces it; an error belonged to the subscription being replaced.
    const kept = new Set(ids);
    for (const [id, s] of group.series) if (!kept.has(s.source)) group.series.delete(id);
    group.answered = new Set([...group.answered].filter((id) => kept.has(id)));
    group.error = null;
    open(group, ids);
    publish(group);
  }

  function flush(): void {
    flushTimer = null;
    const keys = [...dirty];
    dirty.clear();
    for (const key of keys) reconcile(key);
  }

  function markDirty(key: string): void {
    dirty.add(key);
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(flush, debounceMs);
  }

  return {
    register(registration) {
      const { id, ...groupFields } = registration;
      if (id === "") throw new Error("timeseries stream registration needs a metric id");
      const key = timeseriesStreamGroupKey(groupFields);
      let group = groups.get(key);
      if (!group) {
        group = {
          ...groupFields,
          key,
          refs: new Map(),
          ids: [],
          source: null,
          series: new Map(),
          answered: new Set(),
          error: null,
        };
        groups.set(key, group);
      }
      const owner = group;
      owner.refs.set(id, (owner.refs.get(id) ?? 0) + 1);
      markDirty(key);
      let registered = true;
      return () => {
        if (!registered) return;
        registered = false;
        // close() may have dropped the group already (the provider unmounting
        // before its widgets); a later registration makes a new record.
        if (groups.get(key) !== owner) return;
        const count = (owner.refs.get(id) ?? 0) - 1;
        if (count > 0) owner.refs.set(id, count);
        else owner.refs.delete(id);
        markDirty(key);
      };
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getSnapshot() {
      return snapshot;
    },
    getGroup(key) {
      return snapshot.get(key) ?? EMPTY_TIMESERIES_STREAM_GROUP;
    },
    close() {
      if (flushTimer) clearTimeout(flushTimer);
      flushTimer = null;
      dirty.clear();
      for (const group of groups.values()) group.source?.close();
      groups.clear();
      if (snapshot.size > 0) notify(new Map());
    },
  };
}

export const TimeseriesStreamContext = createContext<TimeseriesStream | null>(null);

/** The provided {@link TimeseriesStream}, or null outside a `TimeseriesStreamProvider`. */
export function useTimeseriesStream(): TimeseriesStream | null {
  return useContext(TimeseriesStreamContext);
}
