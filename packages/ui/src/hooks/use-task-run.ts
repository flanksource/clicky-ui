import { useEffect, useRef, useState } from "react";
import {
  allGroupsTerminal,
  type TaskRunMeta,
  type TaskSnapshot,
} from "../data/TaskSnapshot";
import { taskQueryKeys } from "../data/task-query-keys";

// use-task-run / use-task-runs are the generic clicky-ui task clients. They are
// SSE-first: they subscribe to clicky's SSEHandler (event: task / event: done)
// and fall back to polling the JSON endpoints only when EventSource is
// unavailable. They speak only TaskSnapshot / TaskRunMeta — no app concepts.

export interface TaskTransportOptions {
  /** Base path of the clicky task API, e.g. "/api/v1". */
  basePath?: string | undefined;
  /** Disable the subscription entirely (e.g. before an id is known). */
  enabled?: boolean | undefined;
  /** Poll interval (ms) for the fallback / runs listing. */
  pollMs?: number | undefined;
  /** Force the polling transport even when EventSource exists (mainly tests). */
  forcePoll?: boolean | undefined;
}

const DEFAULT_BASE = "/api/v1";
const DEFAULT_POLL_MS = 2_000;

function streamUrl(base: string, query: string): string {
  return `${base}/tasks/stream${query ? `?${query}` : ""}`;
}

function hasEventSource(): boolean {
  return typeof globalThis !== "undefined" && typeof globalThis.EventSource !== "undefined";
}

export interface UseTaskRunResult {
  snapshots: TaskSnapshot[];
  status: string;
  isComplete: boolean;
}

export interface UseTaskRunOptions extends TaskTransportOptions {
  /** Stable run id to follow (drill-down). Mutually exclusive with kind. */
  id?: string | undefined;
  /** Follow every run of a kind. */
  kind?: string | undefined;
}

// useTaskRun follows one run (by id) or a kind, SSE-first. It accumulates the
// latest snapshot per task/group id and reports completion once every group is
// terminal.
export function useTaskRun(options: UseTaskRunOptions = {}): UseTaskRunResult {
  const {
    id,
    kind,
    basePath = DEFAULT_BASE,
    enabled = true,
    pollMs = DEFAULT_POLL_MS,
    forcePoll = false,
  } = options;

  const [byId, setById] = useState<Record<string, TaskSnapshot>>({});
  const [status, setStatus] = useState("idle");
  const [isComplete, setIsComplete] = useState(false);
  // Reset accumulator whenever the subscription target changes.
  const targetKey = `${id ?? ""}|${kind ?? ""}|${enabled}`;
  const prevKey = useRef(targetKey);
  if (prevKey.current !== targetKey) {
    prevKey.current = targetKey;
  }

  useEffect(() => {
    if (!enabled || (!id && !kind)) {
      return;
    }
    setById({});
    setIsComplete(false);

    const params = new URLSearchParams();
    if (id) params.set("tasks", id);
    if (kind) params.set("kind", kind);
    const query = params.toString();

    const merge = (incoming: TaskSnapshot[]) => {
      setById((prev) => {
        const next = { ...prev };
        for (const snap of incoming) next[snap.id] = { ...next[snap.id], ...snap };
        return next;
      });
    };

    const mergeOutput = (delta: {
      id: string;
      stream: "stdout" | "stderr";
      data: string;
      reset?: boolean;
      truncated?: boolean;
    }) => {
      setById((prev) => {
        const snapshot = prev[delta.id];
        if (!snapshot) return prev;
        const value = delta.reset ? delta.data : `${snapshot[delta.stream] ?? ""}${delta.data}`;
        const truncatedField = delta.stream === "stdout" ? "stdoutTruncated" : "stderrTruncated";
        return {
          ...prev,
          [delta.id]: {
            ...snapshot,
            [delta.stream]: value,
            [truncatedField]: delta.truncated ?? snapshot[truncatedField],
          },
        };
      });
    };

    // Polling fallback transport.
    if (forcePoll || !hasEventSource()) {
      let stopped = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const tick = async () => {
        try {
          const res = await fetch(`${basePath}/tasks/${encodeURIComponent(id ?? "")}`, {
            headers: { Accept: "application/json" },
          });
          if (res.ok) {
            const snaps = (await res.json()) as TaskSnapshot[];
            merge(snaps);
            setStatus("polling");
            if (allGroupsTerminal(snaps)) {
              setIsComplete(true);
              return; // stop polling
            }
          }
        } catch {
          setStatus("connection lost — retrying");
        }
        if (!stopped) timer = setTimeout(tick, pollMs);
      };
      void tick();
      return () => {
        stopped = true;
        if (timer) clearTimeout(timer);
      };
    }

    // SSE transport (default).
    const es = new EventSource(streamUrl(basePath, query));
    setStatus("connected");
    es.addEventListener("task", (e) => {
      try {
        merge([JSON.parse((e as MessageEvent).data) as TaskSnapshot]);
      } catch {
        /* ignore malformed frame */
      }
    });
    es.addEventListener("output", (e) => {
      try {
        mergeOutput(JSON.parse((e as MessageEvent).data) as Parameters<typeof mergeOutput>[0]);
      } catch {
        /* ignore malformed frame */
      }
    });
    es.addEventListener("done", () => {
      setStatus("complete");
      setIsComplete(true);
      es.close();
    });
    es.onerror = () => setStatus("connection lost — retrying");
    return () => es.close();
  }, [id, kind, basePath, enabled, pollMs, forcePoll]);

  return { snapshots: Object.values(byId), status, isComplete };
}

export interface UseTaskRunsOptions extends TaskTransportOptions {
  kind?: string | undefined;
  status?: string | undefined;
  /** Label equality filters (k=v). */
  labels?: Record<string, string> | undefined;
}

/** The identity of the listing request that produced a given `runs` array. */
export type TaskRunsKey = ReturnType<typeof taskQueryKeys.runs>;

export interface UseTaskRunsResult {
  runs: TaskRunMeta[];
  status: string;
  /**
   * Query key of the request that actually produced `runs`, or null before the
   * first frame arrives. Changing `kind`/`status`/`labels` re-subscribes but
   * keeps the previous listing on screen until the new transport delivers, so
   * this key lags `taskQueryKeys.runs(options)` during that window. A consumer
   * mirroring `runs` into a cache must compare the two and skip the write while
   * they differ, or it publishes rows that do not match the requested filters.
   */
  runsKey: TaskRunsKey | null;
}

// useTaskRuns lists all runs (TaskRunMeta) for the manager view. It is SSE-first:
// it subscribes to clicky's runs stream (event: runs carrying the full listing)
// and falls back to polling the JSON runs endpoint only when EventSource is
// unavailable or forced off. The listing has no completion terminal of its own —
// a manager view stays subscribed to observe new and changing runs.
export function useTaskRuns(options: UseTaskRunsOptions = {}): UseTaskRunsResult {
  const {
    kind,
    status: statusFilter,
    labels,
    basePath = DEFAULT_BASE,
    enabled = true,
    pollMs = DEFAULT_POLL_MS,
    forcePoll = false,
  } = options;

  // Runs are stored together with the key of the request that delivered them, so
  // a stale listing can never be mistaken for the current filters' result.
  const [received, setReceived] = useState<{
    key: TaskRunsKey | null;
    runs: TaskRunMeta[];
  }>({ key: null, runs: [] });
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!enabled) return;

    const params = new URLSearchParams();
    if (kind) params.set("kind", kind);
    if (statusFilter) params.set("status", statusFilter);
    for (const [k, v] of Object.entries(labels ?? {})) params.append("label", `${k}=${v}`);
    const query = params.toString();
    const requestKey = taskQueryKeys.runs({ basePath, kind, status: statusFilter, labels });
    const receive = (next: TaskRunMeta[]) => setReceived({ key: requestKey, runs: next });

    // Polling fallback transport.
    if (forcePoll || !hasEventSource()) {
      let stopped = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const tick = async () => {
        try {
          const res = await fetch(`${basePath}/tasks${query ? `?${query}` : ""}`, {
            headers: { Accept: "application/json" },
          });
          if (res.ok) {
            receive((await res.json()) as TaskRunMeta[]);
            setStatus("polling");
          }
        } catch {
          setStatus("connection lost — retrying");
        }
        if (!stopped) timer = setTimeout(tick, pollMs);
      };
      void tick();
      return () => {
        stopped = true;
        if (timer) clearTimeout(timer);
      };
    }

    // SSE transport (default).
    const es = new EventSource(`${basePath}/tasks/runs/stream${query ? `?${query}` : ""}`);
    setStatus("connected");
    es.addEventListener("runs", (e) => {
      try {
        receive(JSON.parse((e as MessageEvent).data) as TaskRunMeta[]);
      } catch {
        /* ignore malformed frame */
      }
    });
    es.onerror = () => setStatus("connection lost — retrying");
    return () => es.close();
  }, [kind, statusFilter, JSON.stringify(labels ?? {}), basePath, enabled, pollMs, forcePoll]);

  return { runs: received.runs, status, runsKey: received.key };
}
