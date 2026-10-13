import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useEventSourceFactory,
  type EventSourceFactory,
  type EventSourceLike,
} from "../../hooks/event-source";
import type { SessionCollectionInput } from "./SessionInspector.collection-types";
import type {
  SessionUIMessage,
  UnifiedSessionInput,
} from "./SessionViewer.unified";

// SessionInspector.remote loads a session from a URL and follows it live,
// asking only for the transcript's tail. The contract (captain
// `SessionHandler`):
//   GET {src}?tail=N  Accept: application/json → one UnifiedSessionInput with
//              the newest N messages, and `window` (the full counts) when older
//              ones were left out; a non-2xx body is `{error, …}` JSON or plain
//              text, surfaced verbatim.
//   GET {src}?before=<id>&limit=N → the N messages ahead of <id>: one page of
//              history, loaded on demand (`loadOlder`) and prepended.
//   GET {src}?follow=1&after=<id> (SSE) → `entry` frames for the messages
//              after <id> and every later change (one SessionUIMessage, upserted
//              by id), `state` frames ({revision, lifecycleStatus,
//              activityState, facets}), `error` frames ({error}) and `: ping`
//              comments. The server closes the stream once the session is
//              terminal.
// A `state` frame with a higher revision means aggregate facets (plan,
// approvals, files, …) changed, so the tail is refetched and merged into the
// messages already held; entries streamed while it was in flight stay merged
// on top. `facets` is an opaque
// fingerprint of the non-message session facets (plan, todos, files, approval
// requests): the first frame's value is the baseline (no refetch from it
// alone), and any later frame whose `facets` differs from the last one seen
// also triggers a refetch, independently of `revision`.

export const TERMINAL_SESSION_LIFECYCLES = [
  "succeeded",
  "partial",
  "failed",
  "cancelled",
  "interrupted",
  "completed",
] as const;

export function isTerminalSessionLifecycle(status: string | undefined) {
  return (
    status !== undefined &&
    (TERMINAL_SESSION_LIFECYCLES as readonly string[]).includes(status)
  );
}

/** Messages asked for by the first read and by each page of history. */
export const DEFAULT_SESSION_PAGE_SIZE = 100;

export interface RemoteSessionOptions {
  /** Force (`true`) or suppress (`false`) the live stream. By default a
   *  session follows only while it reports a non-terminal `lifecycleStatus`;
   *  a session that reports none is not followed. */
  follow?: boolean;
  /** Messages per read: the first read's `tail` and each history page's
   *  `limit`. Defaults to DEFAULT_SESSION_PAGE_SIZE. */
  pageSize?: number;
}

export interface RemoteSessionState {
  session?: UnifiedSessionInput;
  error?: string;
  loading: boolean;
  /** Older messages exist that `loadOlder` has not fetched yet. */
  hasOlder?: boolean;
  /** A `loadOlder` page is in flight. */
  loadingOlder?: boolean;
}

/** The payload of a follow stream's `state` frame. */
export interface SessionFollowState {
  revision: number;
  lifecycleStatus: string;
  activityState: string;
  /** Opaque fingerprint of non-message session facets (plan, todos, files,
   *  approval requests). Always sent by captain — see the module doc above
   *  for how it's used to decide whether to refetch. */
  facets: string;
}

export interface RemoteSessionHandle {
  /** Settles with the first fetched session, or rejects with the load error
   *  (which `onChange` has already reported as `error`). */
  loaded: Promise<UnifiedSessionInput>;
  /** Fetches the page of history before the oldest message held and
   *  prepends it; a no-op while one is in flight or nothing older remains. */
  loadOlder: () => Promise<void>;
  close: () => void;
}

/** `src` with `params` set in its query (replacing any of the same name),
 *  keeping any fragment last. */
export function sessionUrl(src: string, params: Record<string, string | number>) {
  const hashAt = src.indexOf("#");
  const base = hashAt === -1 ? src : src.slice(0, hashAt);
  const hash = hashAt === -1 ? "" : src.slice(hashAt);
  const queryAt = base.indexOf("?");
  const query = new URLSearchParams(queryAt === -1 ? "" : base.slice(queryAt + 1));
  for (const [name, value] of Object.entries(params)) query.set(name, String(value));
  return `${queryAt === -1 ? base : base.slice(0, queryAt)}?${query}${hash}`;
}

export async function fetchRemoteSession(
  src: string,
  signal?: AbortSignal,
): Promise<UnifiedSessionInput> {
  const response = await fetch(src, {
    headers: { Accept: "application/json" },
    ...(signal ? { signal } : {}),
  });
  const body = await response.text();
  if (!response.ok) {
    throw new Error(
      `Failed to load session ${src} (HTTP ${response.status}): ${errorDetail(body)}`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch (cause) {
    throw new Error(
      `Session ${src} returned invalid JSON (${String(cause)}): ${body.slice(0, 200)}`,
    );
  }
  if (!isRecord(parsed)) {
    throw new Error(
      `Session ${src} returned ${Array.isArray(parsed) ? "an array" : String(parsed)}, expected a session object`,
    );
  }
  return parsed as UnifiedSessionInput;
}

/** Upserts messages by id: a known id is replaced in place, a new one appended.
 *  Placeholders stand in for a transcript that does not exist yet; the first
 *  real message replaces them all, since its ids never match theirs. */
export function mergeSessionMessages(
  base: readonly SessionUIMessage[] | undefined,
  incoming: readonly SessionUIMessage[],
): SessionUIMessage[] {
  const real = incoming.some((message) => !message.placeholder);
  const merged = (base ?? []).filter((message) => !(real && message.placeholder));
  for (const message of incoming) {
    const index = merged.findIndex((existing) => existing.id === message.id);
    if (index === -1) merged.push(message);
    else merged[index] = message;
  }
  return merged;
}

/** Fetches `src`, then follows it when wanted, reporting every change through
 *  `onChange`. Nothing is reported after `close()`. */
export function openRemoteSession(
  src: string,
  {
    follow,
    pageSize = DEFAULT_SESSION_PAGE_SIZE,
    eventSourceFactory,
    onChange,
  }: RemoteSessionOptions & {
    eventSourceFactory: EventSourceFactory;
    onChange: (state: RemoteSessionState) => void;
  },
): RemoteSessionHandle {
  let url = sessionUrl(src, { follow: 1 });
  let olderPage: Promise<void> | undefined;
  let pageError: string | undefined;
  const aborter = new AbortController();
  const streamed = new Map<string, { message: SessionUIMessage; seq: number }>();
  let closed = false;
  let source: EventSourceLike | undefined;
  let state: RemoteSessionState = { loading: true };
  let revision: number | undefined;
  let facets: string | undefined;
  let seq = 0;
  let generation = 0;

  const emit = (next: RemoteSessionState) => {
    if (closed) return;
    state = next;
    onChange(next);
  };
  const stopFollowing = () => {
    source?.close();
    source = undefined;
  };
  const fail = (message: string) => {
    stopFollowing();
    emit({ ...state, loading: false, error: message });
  };

  // Reads the tail and merges it into the messages already held — older pages
  // and streamed entries — so a refetch never drops history the reader loaded.
  const refresh = async () => {
    const current = ++generation;
    const startedAt = seq;
    const fetched = await fetchRemoteSession(sessionUrl(src, { tail: pageSize }), aborter.signal);
    if (closed || current !== generation) return undefined;
    const fetchedIds = new Set(fetched.messages?.map((message) => message.id));
    const keep = [...streamed.values()]
      .filter((entry) => entry.seq > startedAt || !fetchedIds.has(entry.message.id))
      .map((entry) => entry.message);
    const held = mergeSessionMessages(state.session?.messages, fetched.messages ?? []);
    const session = {
      ...fetched,
      messages: mergeSessionMessages(held, keep),
    };
    if (typeof fetched.revision === "number") {
      revision = Math.max(revision ?? fetched.revision, fetched.revision);
    }
    const hasOlder =
      state.session === undefined
        ? (fetched.window?.messages ?? 0) > (fetched.messages?.length ?? 0)
        : state.hasOlder;
    emit({ ...state, session, loading: false, hasOlder: hasOlder ?? false });
    return session;
  };

  const loadOlder = (): Promise<void> => {
    const oldest = state.session?.messages?.[0]?.id;
    if (closed || olderPage || !state.hasOlder || !oldest) return olderPage ?? Promise.resolve();
    emit({ ...state, loadingOlder: true });
    olderPage = fetchRemoteSession(sessionUrl(src, { before: oldest, limit: pageSize }), aborter.signal)
      .then((page) => {
        const older = page.messages ?? [];
        // A page that loads clears the alert a failed page raised, never a
        // stream's terminal error.
        const { error, ...rest } = state;
        const session = state.session!;
        emit({
          ...rest,
          ...(error !== undefined && error !== pageError ? { error } : {}),
          loadingOlder: false,
          hasOlder: older.length === pageSize,
          session: { ...session, messages: mergeSessionMessages(older, session.messages ?? []) },
        });
        pageError = undefined;
      })
      .catch((reason: unknown) => {
        if (closed) return;
        pageError = errorMessage(reason);
        emit({ ...state, loadingOlder: false, error: pageError });
      })
      .finally(() => {
        olderPage = undefined;
      });
    return olderPage;
  };

  const readFrame = (event: Event): unknown => {
    try {
      return JSON.parse((event as MessageEvent).data as string);
    } catch (cause) {
      fail(`Unparseable ${event.type} frame from ${url}: ${String(cause)}`);
      return undefined;
    }
  };

  const onEntry = (event: Event) => {
    const message = readFrame(event);
    if (message === undefined) return;
    if (!isRecord(message) || typeof message.id !== "string" || !message.id) {
      fail(`Entry frame from ${url} has no message id: ${String((event as MessageEvent).data)}`);
      return;
    }
    const entry = message as unknown as SessionUIMessage;
    streamed.set(message.id, { message: entry, seq: ++seq });
    const session = state.session!;
    emit({
      ...state,
      session: { ...session, messages: mergeSessionMessages(session.messages, [entry]) },
    });
  };

  const onState = (event: Event) => {
    const frame = readFrame(event);
    if (frame === undefined) return;
    if (
      !isRecord(frame) ||
      typeof frame.revision !== "number" ||
      typeof frame.lifecycleStatus !== "string" ||
      typeof frame.facets !== "string"
    ) {
      fail(`State frame from ${url} lacks a numeric revision, a lifecycleStatus, and facets: ${String((event as MessageEvent).data)}`);
      return;
    }
    const next = frame as unknown as SessionFollowState;
    emit({
      ...state,
      session: {
        ...state.session,
        lifecycleStatus: next.lifecycleStatus,
        ...(typeof next.activityState === "string" ? { activityState: next.activityState } : {}),
      },
    });
    const revisionIncreased = revision === undefined || next.revision > revision;
    // The first state frame's facets is the baseline: it never triggers a
    // refetch by itself, only a higher revision does (as before facets
    // existed). Any later frame whose facets differ from the last one seen
    // does trigger a refetch, independently of revision.
    const facetsChanged = facets !== undefined && next.facets !== facets;
    facets = next.facets;
    if (revisionIncreased) revision = next.revision;
    if (revisionIncreased || facetsChanged) {
      refresh().catch((reason: unknown) => {
        if (!closed) fail(errorMessage(reason));
      });
    }
    if (isTerminalSessionLifecycle(next.lifecycleStatus)) stopFollowing();
  };

  // Resumes after the newest real message held, so the server replays only
  // what came later; a placeholder is no position in the transcript, so a
  // reader holding only placeholders follows from the start. A reconnect
  // reuses this URL; replayed entries upsert by id.
  const startFollowing = () => {
    const newest = state.session?.messages?.filter((message) => !message.placeholder).at(-1)?.id;
    url = sessionUrl(src, newest ? { follow: 1, after: newest } : { follow: 1 });
    const es = eventSourceFactory(url);
    source = es;
    let received = false;
    const onError = (event: Event) => {
      const data = (event as MessageEvent).data;
      if (typeof data === "string") {
        const frame = readFrame(event);
        if (frame === undefined) return;
        const reported = isRecord(frame) && typeof frame.error === "string" ? frame.error : data;
        fail(`Session stream ${url} reported an error: ${reported}`);
        return;
      }
      // After data has arrived, a dropped connection reconnects on its own and
      // the server replays; entries upsert by id, so the replay is idempotent.
      if (received && es.readyState !== 2) return;
      fail(
        received
          ? `Lost the session stream ${url}`
          : `Could not connect to the session stream ${url}`,
      );
    };
    es.addEventListener("entry", (event) => {
      received = true;
      onEntry(event);
    });
    es.addEventListener("state", (event) => {
      received = true;
      onState(event);
    });
    es.addEventListener("error", onError);
  };

  const loaded = refresh().then(
    (session) => {
      if (!session) throw new Error(`Session ${src} was closed before it loaded`);
      const lifecycle = session.lifecycleStatus;
      const wanted =
        follow ?? (lifecycle !== undefined && !isTerminalSessionLifecycle(lifecycle));
      if (wanted && !closed) startFollowing();
      return session;
    },
    (reason: unknown) => {
      if (!closed) fail(errorMessage(reason));
      throw reason;
    },
  );

  return {
    loaded,
    loadOlder,
    close: () => {
      closed = true;
      aborter.abort();
      stopFollowing();
    },
  };
}

const IDLE: RemoteSessionState = { loading: false };
const LOADING: RemoteSessionState = { loading: true };

export interface RemoteSessionView extends RemoteSessionState {
  /** See RemoteSessionHandle.loadOlder; a no-op before the session loads. */
  loadOlder: () => Promise<void>;
}

/** Loads `src` (undefined loads nothing) and follows it on demand; see
 *  `RemoteSessionOptions`. Changing `src`, `follow` or `pageSize`, or
 *  unmounting, closes the previous stream. */
export function useRemoteSession(
  src: string | undefined,
  { follow, pageSize }: RemoteSessionOptions = {},
): RemoteSessionView {
  const eventSourceFactory = useEventSourceFactory();
  const factoryRef = useRef(eventSourceFactory);
  factoryRef.current = eventSourceFactory;
  const handleRef = useRef<RemoteSessionHandle>(undefined);
  const [snapshot, setSnapshot] = useState<{
    src: string;
    state: RemoteSessionState;
  }>();

  useEffect(() => {
    if (src === undefined) return undefined;
    setSnapshot({ src, state: LOADING });
    const handle = openRemoteSession(src, {
      ...(follow === undefined ? {} : { follow }),
      ...(pageSize === undefined ? {} : { pageSize }),
      eventSourceFactory: factoryRef.current,
      onChange: (state) => setSnapshot({ src, state }),
    });
    handleRef.current = handle;
    // A load failure already reached the state through onChange as `error`.
    handle.loaded.catch(() => undefined);
    return () => {
      handle.close();
      if (handleRef.current === handle) handleRef.current = undefined;
    };
  }, [src, follow, pageSize]);

  const loadOlder = useCallback(() => handleRef.current?.loadOlder() ?? Promise.resolve(), []);
  const state = src === undefined ? IDLE : snapshot?.src === src ? snapshot.state : LOADING;
  return useMemo(() => ({ ...state, loadOlder }), [state, loadOlder]);
}

/** What a host learns about a `src`-backed inspector's load. `error` carries
 *  the server's message (a 404 body's `error` field or plain text) or the
 *  follow stream's terminal error frame. */
export type SessionInspectorLoadState =
  | { status: "loading" | "ready" }
  | { status: "error"; error: Error };

/** Reports `state` to `onChange` whenever its status or error changes; never
 *  when `enabled` is false (in-memory sessions have no load to report). */
export function useReportLoadState({
  state,
  enabled,
  onChange,
}: {
  state: RemoteSessionState;
  enabled: boolean;
  onChange: ((state: SessionInspectorLoadState) => void) | undefined;
}) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const { loading, error } = state;
  useEffect(() => {
    if (!enabled) return;
    onChangeRef.current?.(
      error !== undefined
        ? { status: "error", error: new Error(error) }
        : { status: loading ? "loading" : "ready" },
    );
  }, [enabled, loading, error]);
}

export interface RemoteCollectionState {
  /** The collection with its current item's session loaded, once it is. */
  collection?: SessionCollectionInput;
  error?: string;
  loading: boolean;
}

/** Loads the current item of a collection when it carries only `src`, so the
 *  hierarchy (which requires a loaded current session) can render. */
export function useRemoteCollection(
  collection: SessionCollectionInput | undefined,
  options: RemoteSessionOptions = {},
): RemoteCollectionState {
  const current = collection?.sessions.find(
    (item) => item.id === collection.currentSessionId,
  );
  const src = current && !current.session ? current.src : undefined;
  const remote = useRemoteSession(src, options);
  return useMemo(() => {
    if (!collection) return IDLE;
    if (src === undefined || !current) return { collection, loading: false };
    const status = {
      loading: remote.loading,
      ...(remote.error ? { error: remote.error } : {}),
    };
    if (!remote.session) return status;
    const session = remote.session;
    return {
      ...status,
      collection: {
        ...collection,
        sessions: collection.sessions.map((item) =>
          item === current ? { ...item, session } : item,
        ),
      },
    };
  }, [collection, current, src, remote]);
}

function errorDetail(body: string) {
  const text = body.trim();
  if (!text) return "empty response body";
  try {
    const parsed: unknown = JSON.parse(text);
    if (isRecord(parsed) && typeof parsed.error === "string") return parsed.error;
  } catch {
    // Not JSON: the text itself is the detail.
  }
  return text;
}

function errorMessage(reason: unknown) {
  return reason instanceof Error ? reason.message : String(reason);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
