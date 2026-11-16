import type { GavelCommentsClient } from "./client";

/*
 * Following a scope's event feed (`/api/v1/comments/events`): the cursor that
 * remembers where a visit stopped, and the reconnecting reader the comment
 * hooks share. Gavel's feed carries no head sequence, so a cursor that is
 * ahead of the server (after a database reset) cannot be detected from the
 * stream; the cursor is therefore keyed by server and scope, never shared
 * between servers.
 */

const DEFAULT_RECONNECT_MS = 3000;
const DEFAULT_DEBOUNCE_MS = 200;

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/** Where the event cursor is remembered between visits, so a reload does not replay the scope's whole history. */
export type CursorStore = {
  get: (key: string) => number;
  set: (key: string, sequence: number) => void;
};

/** The cursor key for one server's scope: a sequence from one gavel means nothing to another. */
export function cursorKeyOf(client: Pick<GavelCommentsClient, "baseUrl" | "scope">): string {
  return `gavel.events.${client.baseUrl}.${client.scope}`;
}

/** Storage a private window or blocked site data refuses with one of these; any other failure is a real one. */
const STORAGE_UNAVAILABLE = ["SecurityError", "QuotaExceededError"];

function unavailable(cause: unknown): boolean {
  return cause instanceof DOMException && STORAGE_UNAVAILABLE.includes(cause.name);
}

/**
 * The browser's localStorage. Storage that is unavailable (a private window,
 * blocked site data, a full quota) only costs the cursor: the stream then
 * starts from the beginning, which is correct, just slower. A stored value
 * that is not a sequence number is corruption and throws, naming the key.
 */
export const localStorageCursor: CursorStore = {
  get: (key) => {
    let stored: string | null;
    try {
      stored = window.localStorage.getItem(key);
    } catch (cause) {
      if (unavailable(cause)) return 0;
      throw cause;
    }
    if (stored === null) return 0;
    const sequence = Number(stored);
    if (!/^\d+$/.test(stored) || !Number.isSafeInteger(sequence)) throw new Error(`The stored event cursor ${key} is ${JSON.stringify(stored)}, not a sequence number; remove it from localStorage to replay the scope's events`);
    return sequence;
  },
  set: (key, sequence) => {
    try {
      window.localStorage.setItem(key, String(sequence));
    } catch (cause) {
      if (!unavailable(cause)) throw cause;
    }
  },
};

export type CommentEventsWatch = {
  client: Pick<GavelCommentsClient, "baseUrl" | "scope" | "streamEvents">;
  cursor?: CursorStore | undefined;
  /** Wait before reopening a closed event stream. */
  reconnectMs?: number | undefined;
  /** Wait that coalesces a burst of events into one `onChange`. */
  debounceMs?: number | undefined;
  /** An event arrived: the host reloads what it lists. */
  onChange: () => void;
  /** Whether live updates are working: a message when they stopped, `null` once the stream is open. A broken feed must never look like an idle one. */
  onStatus: (stopped: string | null) => void;
};

/** Follows the scope's events from the stored cursor, reconnecting until the returned function stops it. */
export function watchCommentEvents(watch: CommentEventsWatch): () => void {
  const { client, onChange, onStatus } = watch;
  const controller = new AbortController();
  const cursor = watch.cursor ?? localStorageCursor;
  const key = cursorKeyOf(client);
  const reconnectMs = watch.reconnectMs ?? DEFAULT_RECONNECT_MS;
  const debounceMs = watch.debounceMs ?? DEFAULT_DEBOUNCE_MS;
  let after: number;
  try {
    after = cursor.get(key);
  } catch (cause) {
    onStatus(`Live updates did not start: ${describe(cause)}`);
    return () => undefined;
  }
  let timer: number | undefined;
  const scheduled = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(onChange, debounceMs);
  };
  void (async () => {
    while (!controller.signal.aborted) {
      try {
        await client.streamEvents({
          after,
          signal: controller.signal,
          onOpen: () => onStatus(null),
          onEvent: (event) => {
            after = event.sequence;
            cursor.set(key, after);
            scheduled();
          },
        });
      } catch (cause) {
        if (controller.signal.aborted) return;
        onStatus(`Live updates stopped: ${describe(cause)}`);
      }
      await new Promise((resolve) => window.setTimeout(resolve, reconnectMs));
    }
  })();
  return () => {
    controller.abort();
    window.clearTimeout(timer);
  };
}
