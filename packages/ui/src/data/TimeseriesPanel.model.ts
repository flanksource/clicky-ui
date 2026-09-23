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
  /** Tooltip/legend label; defaults to the id. */
  label?: string;
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
}

/** Normalises the single-url and baseUrl+series forms to one list. */
export function resolveSeries(props: TimeseriesPanelProps): ResolvedSeries[] {
  const base = props.baseUrl ?? "";
  const list = props.series ?? (props.url ? [{ id: props.url }] : []);
  return list.map((s, i) => ({
    key: s.id,
    url: base + s.id,
    label: s.label ?? s.id,
    color: s.color ?? paletteColor(i),
    ...(s.unit ?? props.unit ? { unit: s.unit ?? props.unit } : {}),
    ...(s.transform ? { transform: s.transform } : {}),
    ...(s.load ? { load: s.load } : {}),
    ...(s.current !== undefined ? { current: s.current } : {}),
  }));
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
