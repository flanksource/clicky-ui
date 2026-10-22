import { useEffect, useRef, useState } from "react";
import { formatBytes } from "../../lib/format";
import { MetricTile } from "../diagnostics/MetricTile";
import { cpuTone } from "../diagnostics/metric-tone";
import { StackDumpView } from "../diagnostics/StackDumpView";
import { isAttemptLive } from "./attempts";
import {
  ProcessNotFoundError,
  type FetchProcessMetrics,
  type ProcessMetrics,
} from "./process-metrics";
import { formatTestDuration } from "./status";
import type { TestAttempt } from "./types";

/** How often a live attempt's process is read. */
const POLL_MS = 2000;

export type TestAttemptDetailProps = {
  attempt: TestAttempt;
  /**
   * Reads the attempt's process while it is live, every two seconds. Polling
   * stops when the attempt finishes or the fetch rejects with
   * `ProcessNotFoundError`; any other rejection is shown and polling goes on.
   */
  fetchProcessMetrics?: FetchProcessMetrics;
};

type LiveState = { metrics?: ProcessMetrics; note?: string };

/** Polls `fetchMetrics` for `pid` while `enabled`; the fetch may change identity between renders without restarting the poll. */
function useLiveProcessMetrics(
  pid: number | undefined,
  enabled: boolean,
  fetchMetrics: FetchProcessMetrics | undefined,
): { state: LiveState; polling: boolean } {
  const [state, setState] = useState<LiveState>({});
  const [polling, setPolling] = useState(false);
  const fetchRef = useRef(fetchMetrics);
  fetchRef.current = fetchMetrics;
  const active = enabled && pid !== undefined && pid > 0 && fetchMetrics !== undefined;

  useEffect(() => {
    if (!active || pid === undefined) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    setState({});
    setPolling(true);
    const read = (target: number) => {
      const current = fetchRef.current;
      if (!current) throw new Error("fetchProcessMetrics was removed while an attempt was being polled");
      return current(target);
    };
    const poll = async () => {
      try {
        const metrics = await read(pid);
        if (cancelled) return;
        setState({ metrics });
      } catch (reason) {
        if (cancelled) return;
        if (reason instanceof ProcessNotFoundError) {
          setState((prev) => ({ ...prev, note: "process exited" }));
          setPolling(false);
          return;
        }
        setState((prev) => ({ ...prev, note: reason instanceof Error ? reason.message : String(reason) }));
      }
      timer = setTimeout(poll, POLL_MS);
    };
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      setPolling(false);
    };
  }, [active, pid]);

  return { state, polling };
}

/**
 * What one attempt of a test measured: its process metrics (pid, CPU, RSS, open
 * files, duration, exit code, goroutines), read live while the attempt runs,
 * and its timeout stack trace. A pid shared by every package of a `go test`
 * batch is labelled as such, since the numbers are the batch's.
 */
export function TestAttemptDetail({ attempt, fetchProcessMetrics }: TestAttemptDetailProps) {
  const live = isAttemptLive(attempt);
  const [now, setNow] = useState(Date.now);
  useEffect(() => {
    if (!live || !attempt.started) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [live, attempt.started]);
  const duration = live && attempt.started ? Math.max(0, now - Date.parse(attempt.started)) * 1e6 : attempt.duration;
  const { state, polling } = useLiveProcessMetrics(attempt.pid, live, fetchProcessMetrics);
  const recorded: ProcessMetrics = {
    ...(attempt.pid !== undefined ? { pid: attempt.pid } : {}),
    ...(attempt.cpu_percent !== undefined ? { cpu_percent: attempt.cpu_percent } : {}),
    ...(attempt.rss !== undefined ? { rss: attempt.rss } : {}),
  };
  const shown = live && state.metrics ? state.metrics : recorded;
  const pid = shown.pid ?? attempt.pid;
  const status = live ? (state.note === "process exited" ? "exited" : shown.status ?? "running") : "exited";
  const hasAny = (pid ?? 0) > 0 || shown.cpu_percent !== undefined || shown.rss !== undefined;

  return (
    <div className="space-y-3" data-attempt-sequence={attempt.sequence}>
      <section>
        <div className="mb-1 flex items-center gap-2">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Process metrics</div>
          {polling && (
            <span
              className="size-1.5 animate-pulse rounded-full bg-blue-500"
              role="status"
              aria-label="Reading live metrics"
            />
          )}
          {attempt.shared_process && (
            <span
              className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              title="The pid, CPU and RSS belong to the go test batch this package ran in, not to the package alone"
              data-shared-process=""
            >
              shared by batch
            </span>
          )}
        </div>
        {!hasAny ? (
          <div className="text-xs italic text-muted-foreground">No metrics captured for this attempt.</div>
        ) : (
          <div className="grid grid-cols-2 gap-density-1 md:grid-cols-4">
            {pid !== undefined && pid > 0 && <MetricTile label="PID" value={String(pid)} />}
            <MetricTile label="Status" value={status} />
            <MetricTile
              label="CPU"
              value={shown.cpu_percent !== undefined ? `${shown.cpu_percent.toFixed(1)}%` : "—"}
              {...(shown.cpu_percent !== undefined
                ? { barPct: Math.min(100, shown.cpu_percent), tone: cpuTone(shown.cpu_percent) }
                : {})}
            />
            <MetricTile label="RSS" value={shown.rss !== undefined && shown.rss > 0 ? formatBytes(shown.rss) : "—"} />
            {shown.open_files !== undefined && <MetricTile label="FDs" value={String(shown.open_files)} />}
            {duration !== undefined && duration > 0 && (
              <MetricTile label="Duration" value={formatTestDuration(duration)} />
            )}
            {attempt.exit_code !== undefined && (
              <MetricTile label="Exit" value={String(attempt.exit_code)} tone={attempt.exit_code === 0 ? "success" : "danger"} />
            )}
            {attempt.goroutine_count !== undefined && (
              <MetricTile label="Goroutines" value={String(attempt.goroutine_count)} />
            )}
          </div>
        )}
        {state.note && live && <div className="mt-1 text-[11px] italic text-muted-foreground">{state.note}</div>}
      </section>
      {attempt.stack_trace && (
        <section>
          <div className="mb-1 text-[10px] uppercase tracking-wide text-muted-foreground">Stack trace</div>
          <div className="flex max-h-[32rem] min-h-0 flex-col">
            <StackDumpView text={attempt.stack_trace} />
          </div>
        </section>
      )}
    </div>
  );
}
