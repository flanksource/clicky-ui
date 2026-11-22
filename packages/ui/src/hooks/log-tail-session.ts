import type { SessionState } from "../rpc/sessionTypes";

/** SessionInfo as returned by POST /profile/{name}/sessions and the `done` frame. */
export interface LogSessionInfo {
  id: string;
  profile: string;
  kind: string;
  state: SessionState;
  params?: Record<string, unknown>;
  error?: string;
  eventCount: number;
  startedAt: string;
  stoppedAt?: string;
}

export interface LogTailError {
  /** Identifies a start failure, an error while streaming, or a session that ended in failure. */
  scope: "start" | "stream" | "session";
  message: string;
  /** HTTP status when a request produced the failure. 409 is the session cap. */
  httpStatus?: number;
}

interface LogTailSessionRequest {
  basePath: string;
  profile: string;
  paramsQuery: string;
}

async function startLogTailSession({ basePath, profile, paramsQuery, signal }: LogTailSessionRequest & {
  signal: AbortSignal;
}): Promise<{ info: LogSessionInfo } | { error: LogTailError }> {
  if (typeof globalThis.EventSource === "undefined") {
    return { error: {
      scope: "start",
      message: `cannot follow ${profile}: this browser has no EventSource, and session events are served only as SSE`,
    } };
  }

  try {
    const res = await fetch(
      `${basePath}/profile/${encodeURIComponent(profile)}/sessions?follow=true${paramsQuery}`,
      { method: "POST", headers: { Accept: "application/json" }, signal },
    );
    if (signal.aborted) throw signal.reason;
    if (!res.ok) {
      const detail = (await res.text()).trim() || "no detail";
      return { error: {
        scope: "start",
        httpStatus: res.status,
        message: res.status === 409
          ? `the server is already running as many follow sessions as it allows (HTTP 409): ${detail}`
          : `could not start a follow session for ${profile} (HTTP ${res.status}): ${detail}`,
      } };
    }
    return { info: (await res.json()) as LogSessionInfo };
  } catch (cause) {
    return { error: {
      scope: "start",
      message: `could not reach ${basePath} to start a follow session for ${profile}: ${String(cause)}`,
    } };
  }
}

export function openLogTailSession({ onStart, onError, ...request }: LogTailSessionRequest & {
  onStart: (info: LogSessionInfo) => () => void;
  onError: (error: LogTailError) => void;
}): () => void {
  const aborter = new AbortController();
  let closeSource: (() => void) | undefined;
  void startLogTailSession({ ...request, signal: aborter.signal }).then(result => {
    if (aborter.signal.aborted) return;
    if ("error" in result) {
      onError(result.error);
      return;
    }
    const close = onStart(result.info);
    if (aborter.signal.aborted) close();
    else closeSource = close;
  });
  // A view session without a subscriber ends server-side.
  return () => {
    aborter.abort();
    closeSource?.();
  };
}
