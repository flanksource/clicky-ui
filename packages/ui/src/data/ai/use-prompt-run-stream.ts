import { useEffect, useRef, useState } from "react";
import { useEventSourceFactory } from "../../hooks/event-source";
import type { SessionUIMessage } from "./SessionViewer.unified";

// Follows one Captain prompt run (`PromptRunHandler`):
//   GET {baseUrl}/api/captain/prompt/runs/{runId}/stream (SSE)
//     `run`   → {sessionId}: the session to tail, once Captain records one
//     `entry` → one transcript message; replayed from the start on reconnect
//     `done`  → the run's summary (success or failure)
//     `error` → with data, the run's failed summary; without, a dropped
//               connection the browser reconnects from (the server replays
//               the run) — unless Captain has forgotten the run, which only
//               the snapshot route can tell.
//   GET {baseUrl}/api/captain/prompt/runs/{runId} → snapshot (404 once forgotten)

/** The terminal summary Captain publishes with `done` and server `error` frames. */
export interface PromptRunSummary {
  sessionId?: string;
  success: boolean;
  error?: string;
  structuredOutput?: unknown;
}

export interface PromptRunStreamOptions {
  /** Prefix for the Captain routes; defaults to same-origin. */
  baseUrl?: string;
  /** Fires once, with the run's summary, when the run reaches a terminal frame. */
  onDone?: (summary: PromptRunSummary) => void;
}

export type PromptRunStreamStatus = "idle" | "running" | "succeeded" | "failed";

export interface PromptRunStreamState {
  status: PromptRunStreamStatus;
  sessionId?: string;
  summary?: PromptRunSummary;
  error?: string;
  /** The run's transcript as it streams, whether or not Captain records a session. */
  entries: SessionUIMessage[];
}

const IDLE: PromptRunStreamState = { status: "idle", entries: [] };
const RUNNING: PromptRunStreamState = { status: "running", entries: [] };

// upsertEntry replaces a replayed or updated message by id, so a reconnect's
// replay does not duplicate the transcript.
function upsertEntry(entries: SessionUIMessage[], entry: SessionUIMessage): SessionUIMessage[] {
  const index = entry.id ? entries.findIndex((existing) => existing.id === entry.id) : -1;
  if (index < 0) return [...entries, entry];
  const next = entries.slice();
  next[index] = entry;
  return next;
}

function frameData<T>(event: Event): T {
  return JSON.parse((event as MessageEvent<string>).data) as T;
}

/**
 * Follows a Captain prompt run by id: `idle` without one, `running` (with the
 * session id from the `run` frame) until a terminal frame, then `succeeded` or
 * `failed`. Callbacks are held in a ref, so passing a fresh `onDone` each render
 * does not reopen the stream.
 */
export function usePromptRunStream(
  runId: string | undefined,
  options: PromptRunStreamOptions = {},
): PromptRunStreamState {
  const { baseUrl = "", onDone } = options;
  const openStream = useEventSourceFactory();
  const [tracked, setTracked] = useState<{ runId: string; state: PromptRunStreamState } | undefined>();
  const callbacks = useRef({ onDone });
  callbacks.current = { onDone };
  const openRef = useRef(openStream);
  openRef.current = openStream;

  useEffect(() => {
    if (!runId) return;
    let stale = false;
    const runPath = `${baseUrl}/api/captain/prompt/runs/${encodeURIComponent(runId)}`;
    const stream = openRef.current(`${runPath}/stream`);
    const update = (next: (current: PromptRunStreamState) => PromptRunStreamState) => {
      if (stale) return;
      setTracked((tracked) => ({ runId, state: next(tracked?.runId === runId ? tracked.state : RUNNING) }));
    };
    const finish = (summary: PromptRunSummary, fallbackError = "The prompt run failed.") => {
      stream.close();
      update((current) => {
        const base = { entries: current.entries, ...(summary.sessionId ? { sessionId: summary.sessionId } : current.sessionId ? { sessionId: current.sessionId } : {}), summary };
        return summary.success
          ? { status: "succeeded", ...base }
          : { status: "failed", ...base, error: summary.error || fallbackError };
      });
      callbacks.current.onDone?.(summary);
    };

    stream.addEventListener("run", (event) => {
      const { sessionId } = frameData<{ sessionId?: string }>(event);
      if (sessionId) update((current) => ({ ...current, sessionId }));
    });
    stream.addEventListener("entry", (event) => {
      const entry = frameData<SessionUIMessage>(event);
      update((current) => ({ ...current, entries: upsertEntry(current.entries, entry) }));
    });
    stream.addEventListener("done", (event) => {
      finish(frameData<PromptRunSummary>(event), "The prompt run did not succeed.");
    });
    stream.addEventListener("error", (event) => {
      const data = (event as MessageEvent<string | undefined>).data;
      if (data) {
        // Only the server's terminal `error` frame carries a summary; it is a failure by definition.
        finish({ ...JSON.parse(data), success: false } as PromptRunSummary);
        return;
      }
      fetch(runPath)
        .then((response) => {
          if (response.status !== 404 || stale) return;
          finish({ success: false, error: "Captain no longer knows this prompt run; check its result before retrying." });
        })
        .catch((error: unknown) => {
          // The stream is already reconnecting; an unreachable snapshot route only means the server is still down.
          console.warn(`prompt run ${runId}: snapshot probe after a dropped stream failed`, error);
        });
    });
    return () => {
      stale = true;
      stream.close();
    };
  }, [runId, baseUrl]);

  if (!runId) return IDLE;
  return tracked?.runId === runId ? tracked.state : RUNNING;
}
