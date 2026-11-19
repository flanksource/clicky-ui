import { cn } from "../lib/utils";
import { UiActivity, UiChevronDown, UiHourglass, UiLayers, UiListTree, UiQueue, UiStack } from "../icons";
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
  /** DOM id, so a TaskPoolSummary can name these gauges in aria-controls. */
  id?: string;
  className?: string;
}

/** Live usage of the task manager's worker pool: busy workers, slots, queue and supervisors. */
export function TaskPoolUsage({ basePath, id, className }: TaskPoolUsageProps) {
  const baseUrl = metricsBaseUrl(basePath);
  const pool = (name: string) => taskMetricSeries(TASK_POOL_METRIC_RUN_ID, name);
  const shared = { baseUrl, unit: "short", variant: "cell", range: RANGE, refreshMs: REFRESH_MS } as const;
  return (
    <section {...(id ? { id } : {})} aria-label="Worker pool" className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      <TimeseriesGauge {...shared} title="Workers busy" icon={UiActivity}
        value={pool(taskPoolMetrics.workersBusy)} max={pool(taskPoolMetrics.workersLimit)} />
      <TimeseriesGauge {...shared} title="Slots used" icon={UiLayers}
        value={pool(taskPoolMetrics.slotsUsed)} max={pool(taskPoolMetrics.slotsCapacity)} />
      <TimeseriesGauge {...shared} title="Queued" icon={UiQueue} value={pool(taskPoolMetrics.queued)} />
      <TimeseriesGauge {...shared} title="Supervisors" icon={UiListTree} value={pool(taskPoolMetrics.supervisors)} />
    </section>
  );
}

export interface TaskPoolSummaryProps {
  /** Base path of the clicky task API, e.g. "/api/v1". */
  basePath?: string;
  /** Whether the gauges this summary stands in for are showing. */
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  /** Id of the element holding the gauges, for aria-controls. */
  controls?: string;
  className?: string;
}

const SUMMARY_SOURCES = [
  taskPoolMetrics.workersBusy,
  taskPoolMetrics.slotsUsed,
  taskPoolMetrics.queued,
  taskPoolMetrics.supervisors,
].map((name) => taskMetricSeries(TASK_POOL_METRIC_RUN_ID, name));

function countOf(value: number, singular: string, plural = `${singular}s`): string {
  return `${value} ${value === 1 ? singular : plural}`;
}

/**
 * The pool gauges folded into one tappable line — "1 busy · 1 slot · 0 queued
 * · 0 supervisors" — for a toolbar row on a phone, where four gauges would
 * spend a screen's worth of height on four small numbers.
 */
export function TaskPoolSummary({ basePath, expanded, onExpandedChange, controls, className }: TaskPoolSummaryProps) {
  const results = useTimeseriesQueries(SUMMARY_SOURCES, {
    baseUrl: metricsBaseUrl(basePath),
    range: RANGE,
    refreshMs: REFRESH_MS,
    fetcher: defaultTimeseriesFetcher,
  });
  const readings = SUMMARY_SOURCES.map((source, index) => soleSeries(source.id, results[index]));
  const error = readings.find((reading) => reading.error)?.error;
  const values = readings.map((reading) => latestValue(reading.data));
  const [busy, slots, queued, supervisors] = values;
  const loaded = busy !== undefined && slots !== undefined && queued !== undefined && supervisors !== undefined;
  const text = error
    ? `metrics unavailable: ${error.message}`
    : loaded
      ? [`${busy} busy`, countOf(slots, "slot"), `${queued} queued`, countOf(supervisors, "supervisor")].join(" · ")
      : "loading";
  // The line shows the zero-valued queue and supervisor counts only in its
  // name and tooltip: on a phone toolbar they would crowd out the two
  // numbers that are moving.
  const shown = error || !loaded
    ? text
    : [`${busy} busy`, countOf(slots, "slot"), ...(queued > 0 ? [`${queued} queued`] : []), ...(supervisors > 0 ? [countOf(supervisors, "supervisor")] : [])].join(" · ");
  return (
    <button
      type="button"
      aria-expanded={expanded}
      {...(controls ? { "aria-controls": controls } : {})}
      aria-label={`Worker pool: ${text}`}
      title={`Worker pool: ${text}`}
      onClick={() => onExpandedChange(!expanded)}
      className={cn(
        "inline-flex min-w-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs tabular-nums hover:bg-accent",
        error ? "text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      <UiActivity aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">{shown}</span>
      <UiChevronDown aria-hidden className={cn("size-3 shrink-0 transition-transform", expanded && "rotate-180")} />
    </button>
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
