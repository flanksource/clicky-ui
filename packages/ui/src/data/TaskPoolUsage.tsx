import { cn } from "../lib/utils";
import { UiActivity, UiHourglass, UiLayers, UiListTree, UiQueue, UiStack } from "../icons";
import { TimeseriesGauge } from "./TimeseriesGauge";
import { defaultTimeseriesFetcher, latestValue, soleSeries, useTimeseriesQueries } from "./timeseries-query";
import {
  TASK_POOL_METRIC_RUN_ID,
  taskConcurrencyMetrics,
  taskMetricSeries,
  taskPoolMetrics,
} from "./task-pool-metrics";

const RANGE = "15m";
const REFRESH_MS = 2000;

function metricsBaseUrl(basePath: string | undefined): string {
  return `${basePath ?? "/api/v1"}/tasks/metrics/`;
}

export interface TaskPoolUsageProps {
  /** Base path of the clicky task API, e.g. "/api/v1". */
  basePath?: string;
  className?: string;
}

/** Live usage of the task manager's worker pool: busy workers, slots, queue and supervisors. */
export function TaskPoolUsage({ basePath, className }: TaskPoolUsageProps) {
  const baseUrl = metricsBaseUrl(basePath);
  const pool = (name: string) => taskMetricSeries(TASK_POOL_METRIC_RUN_ID, name);
  const shared = { baseUrl, unit: "short", variant: "cell", range: RANGE, refreshMs: REFRESH_MS } as const;
  return (
    <section aria-label="Worker pool" className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      <TimeseriesGauge {...shared} title="Workers busy" icon={UiActivity}
        value={pool(taskPoolMetrics.workersBusy)} max={pool(taskPoolMetrics.workersLimit)} />
      <TimeseriesGauge {...shared} title="Slots used" icon={UiLayers}
        value={pool(taskPoolMetrics.slotsUsed)} max={pool(taskPoolMetrics.slotsCapacity)} />
      <TimeseriesGauge {...shared} title="Queued" icon={UiQueue} value={pool(taskPoolMetrics.queued)} />
      <TimeseriesGauge {...shared} title="Supervisors" icon={UiListTree} value={pool(taskPoolMetrics.supervisors)} />
    </section>
  );
}

export interface TaskRunConcurrencyProps {
  basePath?: string;
  runId: string;
  className?: string;
}

/**
 * A concurrency-limited run's permits in use against its limit, and how many
 * of its tasks wait for one. Renders nothing for a run without a limit (no
 * limit series recorded).
 */
export function TaskRunConcurrency({ basePath, runId, className }: TaskRunConcurrencyProps) {
  const baseUrl = metricsBaseUrl(basePath);
  const limit = taskMetricSeries(runId, taskConcurrencyMetrics.limit);
  const [result] = useTimeseriesQueries([limit], {
    baseUrl,
    range: RANGE,
    refreshMs: REFRESH_MS,
    fetcher: defaultTimeseriesFetcher,
  });
  const { data, error } = soleSeries(limit.id, result);
  if (error) {
    return <p role="alert" className="text-xs text-destructive">Run concurrency unavailable: {error.message}</p>;
  }
  if (!((latestValue(data) ?? 0) > 0)) return null;
  const shared = { baseUrl, unit: "short", variant: "cell", range: RANGE, refreshMs: REFRESH_MS } as const;
  return (
    <section aria-label="Run concurrency" className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      <TimeseriesGauge {...shared} title="Concurrency" icon={UiStack}
        value={taskMetricSeries(runId, taskConcurrencyMetrics.running)} max={limit} />
      <TimeseriesGauge {...shared} title="Waiting for a permit" icon={UiHourglass}
        value={taskMetricSeries(runId, taskConcurrencyMetrics.waiting)} />
    </section>
  );
}
