import type { GaugeSeries } from "./TimeseriesGauge";

// Worker-pool gauges recorded by clicky's task manager (task/pool_metrics.go)
// into the task metric store, served at {basePath}/tasks/metrics/{id} and its
// stream. The names mirror the Go Metric* constants.

/** Run id the pool-wide gauges are recorded under ("pool:workers-busy", …). */
export const TASK_POOL_METRIC_RUN_ID = "pool";

export const taskPoolMetrics = {
  workersBusy: "workers-busy",
  workersBackground: "workers-background",
  workersLimit: "workers-limit",
  slotsUsed: "slots-used",
  slotsCapacity: "slots-capacity",
  queued: "queued",
  supervisors: "supervisors",
} as const;

/** Gauges recorded under a concurrency-limited run's own id. */
export const taskConcurrencyMetrics = {
  running: "concurrency-running",
  limit: "concurrency-limit",
  waiting: "concurrency-waiting",
} as const;

/** The gauge series for one task metric; ids are path-encoded like every task metric. */
export function taskMetricSeries(runId: string, name: string): GaugeSeries {
  return { id: encodeURIComponent(`${runId}:${name}`) };
}
