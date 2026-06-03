import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "../lib/utils";
import { resolveCssColor } from "../lib/color";
import { formatUnit } from "../lib/format";
import { Modal } from "../overlay/Modal";
import { ProgressBar, type ProgressSegment } from "./ProgressBar";
import { UiFullscreen } from "../icons";
import { Icon, type StaticIconComponent } from "./Icon";
import { assignAxes, latestOf } from "./TimeseriesPanel.axes";

export { assignAxes, latestOf } from "./TimeseriesPanel.axes";
export type { AxisAssignment, AxisOrientation, AxisSpec } from "./TimeseriesPanel.axes";

export interface TimeseriesPoint {
  at: string;
  value: number;
}

export interface TimeseriesResponse {
  id: string;
  points: TimeseriesPoint[];
}

/** One metric plotted on a panel. Its request URL is `baseUrl + id`. */
export interface TimeseriesSeries {
  /** Metric id appended to the panel's baseUrl, e.g. "sqlserver.iops.read". */
  id: string;
  /** Tooltip/legend label; defaults to the id. */
  label?: string;
  /**
   * Maps each point's value before plotting — e.g. writes pass `(v) => -v` to
   * render below the zero axis. Identity when omitted.
   */
  transform?: (value: number) => number;
  /**
   * Stroke/fill override as a CSS color value (e.g. "#10b981", "var(--chart-3)")
   * or a Tailwind color class (e.g. "bg-emerald-500"); Tailwind classes are
   * resolved to a CSS value for the chart. Defaults cycle a small palette by index.
   */
  color?: string;
  /**
   * Grafana-style unit key for this series' readout/tooltip (e.g. "percent",
   * "short"). Falls back to the panel-level `unit`. Lets one panel mix units
   * (e.g. a percent series alongside a plain-count series).
   */
  unit?: string;
  /**
   * Instantaneous value for the `breakdown` variant — the size of this series'
   * bar segment and its legend readout. When omitted, the breakdown falls back
   * to the latest polled point. Ignored by the time-series variants.
   */
  current?: number;
}

export interface TimeseriesPanelProps {
  /**
   * Single-metric endpoint returning a TimeseriesResponse,
   * e.g. "/api/v1/metrics/sqlserver.cpu". Mutually exclusive with baseUrl/series.
   */
  url?: string;
  /** Common prefix for a multi-series panel; each series requests `baseUrl + series.id`. */
  baseUrl?: string;
  /** Metrics to plot on one chart. Provide together with baseUrl. */
  series?: TimeseriesSeries[];
  title: string;
  /** Iconify name or static icon component shown beside the title. */
  icon?: string | StaticIconComponent;
  /**
   * Default Grafana-style unit key for the panel (e.g. "bytes", "percent",
   * "ms", "short"); each series may override it. Unknown strings are appended
   * as a raw suffix (so "%" still works). Used for the readout, axis, and tooltip.
   */
  unit?: string;
  /** Look-back window passed as ?since=; defaults to "1h". */
  range?: string;
  /** Poll interval in ms; defaults to 5000. Pass 0 to disable polling. */
  refreshMs?: number;
  /** Chart height in px; defaults to 160. */
  height?: number;
  /**
   * "area" (overlaid, default), "line", "stacked" (areas sum vertically), or
   * "breakdown" (an instantaneous stacked bar + legend; the expand modal still
   * shows a time-series graph of the polled history).
   */
  variant?: "area" | "line" | "stacked" | "breakdown";
  /**
   * Chart variant rendered in the expand modal. Defaults to `variant` for the
   * time-series variants and to "area" for `breakdown` (which has no inline chart).
   */
  expandVariant?: "area" | "line" | "stacked";
  /**
   * Denominator for the `breakdown` bar and per-segment percentages. Defaults to
   * the sum of the series' `current` values when omitted.
   */
  total?: number;
  /** Show a header button that opens the chart larger in a modal. Default true. */
  expandable?: boolean;
  /** Override the default fetch (e.g. to route through an app's API client). */
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

/** A series with its full request URL, resolved label, color, and unit. Exported for tests. */
export interface ResolvedSeries {
  /** Stable key used as the merged-row field and recharts dataKey. */
  key: string;
  url: string;
  label: string;
  color: string;
  /** Resolved Grafana unit key: the series' own unit, else the panel default. */
  unit?: string;
  transform?: (value: number) => number;
  /** Instantaneous value used by the `breakdown` variant. */
  current?: number;
}

/** Normalises the single-url and baseUrl+series forms to one list. Exported for tests. */
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
    ...(s.current !== undefined ? { current: s.current } : {}),
  }));
}

/** One legend/bar row of the breakdown variant: resolved value, color, label, unit, percentage. */
export interface BreakdownItem {
  key: string;
  label: string;
  color: string;
  unit?: string;
  value: number;
  /** Share of `total`, clamped to 0..100. */
  percent: number;
}

/**
 * Derives the breakdown bar segments and per-item percentages from the resolved
 * series' `current` values. `total` defaults to the sum of those values; the
 * percentage is each value's share of that denominator, clamped to 0..100.
 * Latest polled point fills in for a series with no explicit `current`. Pure —
 * exported for tests.
 */
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

const defaultFetcher = async (url: string): Promise<TimeseriesResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`metrics request failed: ${res.status}`);
  return res.json();
};

function formatClock(at: string): string {
  const date = new Date(at);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * One row of the merged chart data: the timestamp in `at` plus each series'
 * value under its key. Values are absent (undefined) where a series has no
 * point at that timestamp.
 */
export interface MergedRow {
  at: string;
  [seriesKey: string]: string | number | undefined;
}

/**
 * Joins per-series point lists into rows keyed by timestamp and applies each
 * series' transform. Timestamps present in any series produce a row; missing
 * values are left undefined so recharts gaps the line rather than drawing zero.
 */
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

export function TimeseriesPanel(props: TimeseriesPanelProps) {
  const {
    title,
    icon,
    unit,
    range = "1h",
    refreshMs = 5000,
    height = 160,
    variant = "area",
    expandable = true,
    total,
    fetcher = defaultFetcher,
    className,
  } = props;
  const isBreakdown = variant === "breakdown";
  // The inline chart (non-breakdown only) and the expand modal both need a
  // time-series variant; breakdown has no inline chart and expands to "area".
  const chartVariant: ChartVariant = isBreakdown ? "area" : variant;
  const expandVariant = props.expandVariant ?? chartVariant;

  const [expanded, setExpanded] = useState(false);

  const series = useMemo(() => resolveSeries(props), [props]);
  const requestUrls = useMemo(
    () =>
      series.map((s) => {
        const u = new URL(s.url, window.location.origin);
        if (range) u.searchParams.set("since", range);
        return u.pathname + u.search;
      }),
    [series, range],
  );

  const results = useQueries({
    queries: requestUrls.map((requestUrl) => ({
      queryKey: ["timeseries", requestUrl],
      queryFn: () => fetcher(requestUrl),
      refetchInterval: refreshMs > 0 ? refreshMs : false,
      staleTime: 0,
      retry: 0,
    })),
  });

  const isError = results.some((r) => r.isError);
  const error = results.find((r) => r.isError)?.error;
  const isLoading = results.some((r) => r.isLoading) && results.every((r) => !r.data);
  const pointsBySeries = results.map((r) => r.data?.points);
  const rows = useMemo(() => mergeSeries(series, pointsBySeries), [series, pointsBySeries]);
  const hasMirrored = series.some((s) => s.transform);
  const breakdown = useMemo(
    () => (isBreakdown ? resolveBreakdown(series, rows, total) : null),
    [isBreakdown, series, rows, total],
  );

  // Breakdown renders instantly from `current`; the modal still needs polled
  // history. Other variants gate on having ≥2 points to draw a line.
  const canExpand = expandable && rows.length >= 2;

  return (
    <div className={cn("flex flex-col rounded-lg border border-border bg-card p-3", className)}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {icon ? <PanelIcon icon={icon} /> : null}
          <span className="truncate font-medium text-foreground">{title}</span>
        </span>
        <span className="inline-flex shrink-0 items-center gap-1.5">
          {breakdown ? (
            <BreakdownReadout total={breakdown.total} unit={unit} items={breakdown.items} />
          ) : (
            <LatestReadout series={series} rows={rows} />
          )}
          {canExpand ? (
            <button
              type="button"
              aria-label="Expand chart"
              onClick={() => setExpanded(true)}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon icon={UiFullscreen} width={14} height={14} />
            </button>
          ) : null}
        </span>
      </div>
      <div className="mt-2" style={breakdown ? undefined : { height }}>
        {breakdown ? (
          <BreakdownView total={breakdown.total} unit={unit} items={breakdown.items} />
        ) : isError ? (
          <PanelMessage>{(error as Error)?.message ?? "Failed to load metric"}</PanelMessage>
        ) : isLoading ? (
          <PanelMessage>Loading…</PanelMessage>
        ) : rows.length < 2 ? (
          <PanelMessage>Collecting data…</PanelMessage>
        ) : (
          <Chart rows={rows} series={series} variant={chartVariant} unit={unit} showZeroLine={hasMirrored} />
        )}
      </div>
      {!breakdown && !isError && !isLoading && rows.length >= 2 && series.length > 1 ? (
        <ChartLegend series={series} rows={rows} />
      ) : null}
      {canExpand ? (
        <Modal open={expanded} onClose={() => setExpanded(false)} title={title} size="xl">
          <div style={{ height: 360 }}>
            <Chart rows={rows} series={series} variant={expandVariant} unit={unit} showZeroLine={hasMirrored} />
          </div>
          {series.length > 1 ? <ChartLegend series={series} rows={rows} /> : null}
        </Modal>
      ) : null}
    </div>
  );
}

/**
 * Header readout for a single-series panel: the latest value, formatted with the
 * series' unit. Multi-series panels render the per-series values in {@link ChartLegend}
 * below the chart instead, so this returns null for them to avoid overlapping the title.
 */
function LatestReadout({ series, rows }: { series: ResolvedSeries[]; rows: MergedRow[] }) {
  const only = series.length === 1 ? series[0] : undefined;
  if (!only) return null;
  const v = latestOf(rows, only.key);
  if (v === undefined) return null;
  return <span className="tabular-nums">{formatUnit(Math.abs(v), only.unit)}</span>;
}

/** Wrapping color-keyed legend for the time-series variants: dot + label + latest value. */
function ChartLegend({ series, rows }: { series: ResolvedSeries[]; rows: MergedRow[] }) {
  return (
    <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {series.map((s) => {
        const v = latestOf(rows, s.key);
        return (
          <li key={s.key} className="inline-flex min-w-0 items-center gap-1.5">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: resolveCssColor(s.color) }}
              aria-hidden
            />
            <span className="truncate text-foreground">{s.label}</span>
            {v !== undefined ? (
              <span className="tabular-nums">{formatUnit(Math.abs(v), s.unit)}</span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Breakdown header readout: `used / total · pct%`, where used is the sum of segments. */
function BreakdownReadout({
  total,
  unit,
  items,
}: {
  total: number;
  unit: string | undefined;
  items: BreakdownItem[];
}) {
  const used = items.reduce((acc, it) => acc + it.value, 0);
  const pct = total > 0 ? Math.min(100, (used / total) * 100) : 0;
  return (
    <span className="font-mono tabular-nums">
      {formatUnit(used, unit)} / {formatUnit(total, unit)} · {pct.toFixed(0)}%
    </span>
  );
}

/** Instantaneous stacked bar + legend list. The expand button (in the panel header) opens the graph. */
function BreakdownView({
  total,
  unit,
  items,
}: {
  total: number;
  unit: string | undefined;
  items: BreakdownItem[];
}) {
  const segments: ProgressSegment[] = items.map((it) => ({
    count: it.value,
    color: it.color,
    label: it.label,
  }));
  return (
    <div className="flex flex-col gap-2">
      <ProgressBar segments={segments} total={total > 0 ? total : 1} height="h-3" />
      {items.length > 0 ? (
        <ul className="grid grid-cols-1 gap-y-1 text-xs">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: resolveCssColor(it.color) }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground">
                {it.label}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {formatUnit(it.value, it.unit ?? unit)}
              </span>
              <span className="w-10 text-right font-mono tabular-nums text-muted-foreground">
                {it.percent.toFixed(0)}%
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type ChartVariant = "area" | "line" | "stacked";

function Chart({
  rows,
  series,
  variant,
  unit,
  showZeroLine,
}: {
  rows: MergedRow[];
  series: ResolvedSeries[];
  variant: ChartVariant;
  unit: string | undefined;
  showZeroLine: boolean;
}) {
  const stacked = variant === "stacked";
  // Mirrored series carry negative values; show magnitudes on axis and tooltip.
  const seriesByKey = new Map(series.map((s) => [s.key, s]));
  // recharts needs a CSS color value; a series may carry a Tailwind class.
  const strokeOf = (s: ResolvedSeries) => resolveCssColor(s.color);
  // Distinct units map to a left and (when present) right axis; each series draws
  // against the axis for its unit so mixed-unit panels keep independent scales.
  const { axes: yAxes, axisOfKey } = useMemo(() => assignAxes(series), [series]);
  const axisOf = (key: string): "left" | "right" => axisOfKey.get(key) ?? "left";
  const axes = (
    <>
      <CartesianGrid strokeOpacity={0.12} vertical={false} />
      <XAxis
        dataKey="at"
        tickFormatter={formatClock}
        tick={{ fontSize: 10 }}
        stroke="currentColor"
        strokeOpacity={0.35}
        minTickGap={32}
      />
      {yAxes.map((ax) => (
        <YAxis
          key={ax.id}
          yAxisId={ax.id}
          orientation={ax.orientation}
          tick={{ fontSize: 10 }}
          stroke="currentColor"
          strokeOpacity={0.35}
          width={40}
          tickFormatter={(v: number) => formatUnit(Math.abs(v), ax.unit)}
        />
      ))}
      <Tooltip
        labelFormatter={(label) => formatClock(String(label))}
        formatter={(value, name) => {
          const s = seriesByKey.get(String(name));
          return [formatUnit(Math.abs(Number(value) || 0), s?.unit ?? unit), s?.label ?? String(name)];
        }}
        contentStyle={{ fontSize: 12 }}
      />
      {showZeroLine ? (
        <ReferenceLine yAxisId="left" y={0} stroke="currentColor" strokeOpacity={0.35} />
      ) : null}
    </>
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      {variant === "line" ? (
        <LineChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          {axes}
          {series.map((s) => (
            <Line
              key={s.key}
              yAxisId={axisOf(s.key)}
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={strokeOf(s)}
              strokeWidth={2}
              dot={false}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      ) : (
        <AreaChart data={rows} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          {axes}
          {series.map((s) => (
            <Area
              key={s.key}
              yAxisId={axisOf(s.key)}
              type="monotone"
              dataKey={s.key}
              name={s.key}
              stroke={strokeOf(s)}
              fill={strokeOf(s)}
              {...(stacked ? { stackId: `stack-${axisOf(s.key)}` } : {})}
              fillOpacity={stacked ? 0.7 : 0.12}
              strokeWidth={stacked ? 0 : 2}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}

function PanelMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      {children}
    </div>
  );
}

function PanelIcon({ icon }: { icon: string | StaticIconComponent }) {
  if (typeof icon === "string") {
    return <Icon name={icon} width={16} height={16} className="text-muted-foreground" />;
  }
  return <Icon icon={icon} width={16} height={16} className="text-muted-foreground" />;
}
