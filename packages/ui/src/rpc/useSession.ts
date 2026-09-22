import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import type { OperationsApiClient } from "./useOperations";
import {
  isSessionTerminal,
  parseSessionInfo,
  sessionDurationParam,
  type SessionInfo,
} from "./sessionTypes";
import { stripTrailingSlashes } from "../lib/string";

// useSession reads one commons-db query session for a session page and drives
// its control routes. It polls rather than subscribing: SessionInfo changes a
// few times a minute (state, heartbeat, eventCount), and the events a page
// renders ride their own record-results stream, so a 2s refetch is enough —
// and it stops the moment the session reaches a state nothing can leave.

export const SESSION_POLL_MS = 2_000;

export type SessionAction = "stop" | "extend" | "restart";

export type UseSessionOptions = {
  /** The host's API client; its base URL, headers and credentials apply to every request. */
  client: OperationsApiClient;
  /** Where the sessions API is mounted. Defaults to "/api/v1". */
  basePath?: string;
  /** Refetch interval while the session is active. Defaults to SESSION_POLL_MS. */
  pollMs?: number;
};

export type UseSessionResult = {
  session: SessionInfo | undefined;
  /** The last read's failure, including a response that broke the SessionInfo contract. Polling stops on it. */
  error: unknown;
  isLoading: boolean;
  refetch: () => Promise<unknown>;
  /** The control request in flight, if any. */
  pendingAction: SessionAction | null;
  /**
   * The last control request's failure, undefined once the next action starts.
   * The action's promise still rejects with it; a host that renders this
   * (SessionHeader's `actionError`) need not catch it again.
   */
  actionError: unknown;
  /** POST {basePath}/sessions/{id}/stop; resolves with the session as the server reports it afterwards. */
  stop: () => Promise<SessionInfo>;
  /** POST {basePath}/sessions/{id}/extend?duration=<ms>ms. */
  extend: (durationMs: number) => Promise<SessionInfo>;
  /** POST {basePath}/sessions/{id}/restart?duration=<ms>ms; resolves with the NEW session. */
  restart: (options: { durationMs: number }) => Promise<SessionInfo>;
};

const DEFAULT_BASE_PATH = "/api/v1";

type ActionRequest = { action: SessionAction; durationMs?: number };

function sessionPath(basePath: string, id: string, action?: SessionAction, durationMs?: number) {
  const path = `${stripTrailingSlashes(basePath)}/sessions/${encodeURIComponent(id)}`;
  if (!action) return path;
  if (action === "stop") return `${path}/stop`;
  if (durationMs === undefined) throw new Error(`session ${action} requires a duration`);
  return `${path}/${action}?duration=${sessionDurationParam(durationMs)}`;
}

async function requestSession(
  client: OperationsApiClient,
  path: string,
  method: "GET" | "POST",
): Promise<SessionInfo> {
  const response = await client.executeCommand(path, method, {});
  if (!response.success) {
    throw new Error(
      `${method} ${path} failed: ${response.error || response.stderr || response.stdout || `exit ${response.exit_code}`}`,
    );
  }
  return parseSessionInfo(response.parsed, `${method} ${path}`);
}

export function useSession(id: string, options: UseSessionOptions): UseSessionResult {
  const { client, basePath = DEFAULT_BASE_PATH, pollMs = SESSION_POLL_MS } = options;
  if (!id) throw new Error("useSession requires a session id");
  const queryClient = useQueryClient();
  const queryKey = ["commons-db-session", basePath, id];

  const query = useQuery<SessionInfo>({
    queryKey,
    queryFn: () => requestSession(client, sessionPath(basePath, id), "GET"),
    refetchInterval: (current) => {
      if (current.state.status === "error") return false;
      const state = current.state.data?.state;
      return state !== undefined && isSessionTerminal(state) ? false : pollMs;
    },
  });

  const [actionError, setActionError] = useState<unknown>(undefined);

  const mutation = useMutation<SessionInfo, unknown, ActionRequest>({
    // A poll already in flight read the session before this action; landing
    // after the action's answer, it would put back the old state or stopAt.
    onMutate: () => queryClient.cancelQueries({ queryKey }),
    mutationFn: ({ action, durationMs }) =>
      requestSession(client, sessionPath(basePath, id, action, durationMs), "POST"),
    onSuccess: (next, { action }) => {
      // A restart answers with the session it created; this id only gains a
      // `restartedAs` entry, which the next read derives.
      if (action === "restart") {
        void queryClient.invalidateQueries({ queryKey });
        return;
      }
      queryClient.setQueryData(queryKey, next);
    },
  });

  const { mutateAsync } = mutation;
  const run = useCallback(
    async (request: ActionRequest) => {
      setActionError(undefined);
      try {
        // Validated before the mutation so a bad duration never reaches the wire.
        sessionPath(basePath, id, request.action, request.durationMs);
        return await mutateAsync(request);
      } catch (cause) {
        setActionError(cause);
        throw cause;
      }
    },
    [basePath, id, mutateAsync],
  );

  return {
    session: query.data,
    error: query.error ?? undefined,
    isLoading: query.isLoading,
    refetch: query.refetch,
    pendingAction: mutation.isPending ? (mutation.variables?.action ?? null) : null,
    actionError,
    stop: useCallback(() => run({ action: "stop" }), [run]),
    extend: useCallback((durationMs: number) => run({ action: "extend", durationMs }), [run]),
    restart: useCallback(
      ({ durationMs }: { durationMs: number }) => run({ action: "restart", durationMs }),
      [run],
    ),
  };
}
