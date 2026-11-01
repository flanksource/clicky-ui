import type { StaticIconComponent } from "./Icon";
import { latestOf } from "./TimeseriesPanel.axes";

export interface TimeseriesPoint {
  at: string;
  value: number;
}

export interface TimeseriesResponse {
  id: string;
  points: TimeseriesPoint[];
}

/**
 * One series as the metrics stream serves it. `source` is the id a panel
 * requested; one requested id can expand into several series (a profile
 * grouped by pod, say), each with its own `id` (`<source>#<labels>`) and
 * `labels`. For a plain metric id, `id === source`.
 */
export interface TimeseriesServerSeries {
  id: string;
  source: string;
  label?: string;
  labels?: Record<string, string>;
  /** A `formatUnit` key, used when the panel series names no unit. */
  unit?: string;
  points: TimeseriesPoint[];
}

/** What a {@link SeriesLoader} receives from the widget polling it. */
export interface SeriesLoadContext {
  /** The widget's look-back window, e.g. "1h". */
  range: string;
  /** Aborted when the query is cancelled, e.g. the widget unmounts mid-request. */
  signal: AbortSignal;
}

/**
 * Loads a series directly, instead of the widget requesting `baseUrl + id`
 * through its `fetcher`. Called again whenever the range changes and on every
 * poll.
 */
export type SeriesLoader = (ctx: SeriesLoadContext) => Promise<TimeseriesResponse>;

/**
 * One metric plotted on a panel. Its request URL is `baseUrl + id`, unless a
 * `load` function supplies the data.
 */
export interface TimeseriesSeries {
  /**
   * Metric id appended to the panel's baseUrl, e.g. "sqlserver.iops.read".
   * With `load`, the id is the series' cache identity instead: loaded series
   * are cached under `["timeseries", "load", id, range]`, so it must be unique
   * per data source (two series sharing an id share one cached response).
   */
  id: string;
  /** Loads the series' points; when set, `baseUrl` and `fetcher` are not used. */
  load?: SeriesLoader;
  /** Tooltip/legend label; defaults to the `labels` values, then the id. */
  label?: string;
  /** The series' label set, e.g. `{ pod: "api" }`; its values label the series when `label` is unset. */
  labels?: Record<string, string>;
  /**
   * The requested id this series was expanded from, when one id answers with
   * several series (see {@link TimeseriesServerSeries}). Unset on requested series.
   */
  source?: string;
  /**
   * Maps each point's value before plotting, e.g. writes pass `(v) => -v` to
   * render below the zero axis. Identity when omitted.
   */
  transform?: (value: number) => number;
  /**
   * Stroke/fill override as a CSS color value or a Tailwind color class.
   * Defaults cycle a small palette by index.
   */
  color?: string;
  /**
   * Grafana-style unit key for this series' readout/tooltip. Falls back to the
   * panel-level `unit`.
   */
  unit?: string;
  /**
   * Instantaneous value for the `breakdown` variant. When omitted, the
   * breakdown falls back to the latest polled point.
   */
  current?: number;
}

/** A horizontal marker line at a fixed value, e.g. a static capacity. */
export interface TimeseriesReferenceLine {
  value: number;
  /** Legend label, e.g. "capacity". */
  label: string;
  /** CSS color value or Tailwind color class; defaults to the muted foreground. */
  color?: string;
  /** Grafana-style unit key for the legend value; falls back to the panel `unit`. */
  unit?: string;
}

export interface TimeseriesPanelProps {
  url?: string;
  baseUrl?: string;
  series?: TimeseriesSeries[];
  title: string;
  icon?: string | StaticIconComponent;
  unit?: string;
  range?: string;
  refreshMs?: number;
  height?: number;
  variant?: "area" | "line" | "stacked" | "breakdown";
  expandVariant?: "area" | "line" | "stacked";
  total?: number;
  /** Flat lines drawn across the time-series chart, e.g. a fixed capacity. */
  referenceLines?: TimeseriesReferenceLine[];
  expandable?: boolean;
  fetcher?: (url: string) => Promise<TimeseriesResponse>;
  className?: string;
}

const SERIES_PALETTE = [
  "var(--chart-1, #3b82f6)",
  "var(--chart-2, #ef4444)",
  "var(--chart-3, #10b981)",
  "var(--chart-4, #f59e0b)",
] as const;

function paletteColor(index: number): string {
  return SERIES_PALETTE[index % SERIES_PALETTE.length] ?? SERIES_PALETTE[0];
}

/** A series with its full request URL, resolved label, color, and unit. */
export interface ResolvedSeries {
  key: string;
  url: string;
  label: string;
  color: string;
  unit?: string;
  transform?: (value: number) => number;
  load?: SeriesLoader;
  current?: number;
  labels?: Record<string, string>;
  /** The requested id an expanded series came from; unset on requested series. */
  source?: string;
}

/** The label-set values in key order, e.g. `{ pod: "api", ns: "x" }` → "x, api". */
function labelValues(labels: Record<string, string> | undefined): string | undefined {
  if (!labels) return undefined;
  const values = Object.keys(labels)
    .sort()
    .map((key) => labels[key]);
  return values.length > 0 ? values.join(", ") : undefined;
}

function requestedSeries(props: TimeseriesPanelProps): TimeseriesSeries[] {
  return props.series ?? (props.url ? [{ id: props.url }] : []);
}

function resolveEntry(
  s: TimeseriesSeries,
  index: number,
  props: TimeseriesPanelProps,
  servedUnit?: string,
): ResolvedSeries {
  const unit = s.unit ?? servedUnit ?? props.unit;
  return {
    key: s.id,
    url: (props.baseUrl ?? "") + s.id,
    label: s.label ?? labelValues(s.labels) ?? s.id,
    color: s.color ?? paletteColor(index),
    ...(unit ? { unit } : {}),
    ...(s.transform ? { transform: s.transform } : {}),
    ...(s.load ? { load: s.load } : {}),
    ...(s.current !== undefined ? { current: s.current } : {}),
    ...(s.labels ? { labels: s.labels } : {}),
    ...(s.source ? { source: s.source } : {}),
  };
}

/** Normalises the single-url and baseUrl+series forms to one list. */
export function resolveSeries(props: TimeseriesPanelProps): ResolvedSeries[] {
  return requestedSeries(props).map((s, i) => resolveEntry(s, i, props));
}

/** The series a panel plots, index-aligned with each one's points (undefined while loading). */
export interface DisplaySeries {
  series: ResolvedSeries[];
  points: (TimeseriesPoint[] | undefined)[];
}

/**
 * Resolves what a panel plots from what its requested series were answered
 * with (`served`, index-aligned with the requested series; undefined while a
 * series is loading). A requested id answered by its own series alone keeps
 * the panel's label, color and `current`; an id that expanded into several
 * series plots each one, labelled by its `label` or label values. A series
 * without a unit of its own takes the served unit, then the panel `unit`.
 */
export function expandServedSeries(
  props: TimeseriesPanelProps,
  served: readonly (readonly TimeseriesServerSeries[] | undefined)[],
): DisplaySeries {
  const series: ResolvedSeries[] = [];
  const points: (TimeseriesPoint[] | undefined)[] = [];
  requestedSeries(props).forEach((requested, i) => {
    const answer = served[i];
    const [first] = answer ?? [];
    if (!answer || !first || (answer.length === 1 && first.id === requested.id)) {
      series.push(resolveEntry(requested, series.length, props, first?.unit));
      points.push(answer ? (first?.points ?? []) : undefined);
      return;
    }
    for (const s of answer) {
      const expanded: TimeseriesSeries = {
        id: s.id,
        source: requested.id,
        ...(s.label ? { label: s.label } : {}),
        ...(s.labels ? { labels: s.labels } : {}),
        ...(requested.unit ? { unit: requested.unit } : {}),
        ...(requested.transform ? { transform: requested.transform } : {}),
      };
      series.push(resolveEntry(expanded, series.length, props, s.unit));
      points.push(s.points);
    }
  });
  return { series, points };
}

/** One legend/bar row of the breakdown variant. */
export interface BreakdownItem {
  key: string;
  label: string;
  color: string;
  unit?: string;
  value: number;
  percent: number;
}

/**
 * One row of the merged chart data: the timestamp in `at` plus each series'
 * value under its key.
 */
export interface MergedRow {
  at: string;
  [seriesKey: string]: string | number | undefined;
}

export function resolveBreakdown(
  series: ResolvedSeries[],
  rows: MergedRow[],
  total?: number,
): { items: BreakdownItem[]; total: number } {
  const withValue = series.map((s) => ({ s, value: s.current ?? latestOf(rows, s.key) ?? 0 }));
  const denom = total ?? withValue.reduce((acc, w) => acc + w.value, 0);
  const items = withValue.map(({ s, value }) => ({
    key: s.key,
    label: s.label,
    color: s.color,
    ...(s.unit ? { unit: s.unit } : {}),
    value,
    percent: denom > 0 ? Math.min(100, Math.max(0, (value / denom) * 100)) : 0,
  }));
  return { items, total: denom };
}

export function mergeSeries(
  series: ResolvedSeries[],
  pointsBySeries: (TimeseriesPoint[] | undefined)[],
): MergedRow[] {
  const rows = new Map<string, MergedRow>();
  series.forEach((s, i) => {
    for (const p of pointsBySeries[i] ?? []) {
      const row = rows.get(p.at) ?? { at: p.at };
      row[s.key] = s.transform ? s.transform(p.value) : p.value;
      rows.set(p.at, row);
    }
  });
  return [...rows.values()].sort((a, b) => a.at.localeCompare(b.at));
}
