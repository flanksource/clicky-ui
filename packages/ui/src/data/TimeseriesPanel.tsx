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
import {
  mergeSeries,
  resolveBreakdown,
  resolveSeries,
  type BreakdownItem,
  type MergedRow,
  type ResolvedSeries,
  type TimeseriesPanelProps,
  type TimeseriesResponse,
} from "./TimeseriesPanel.model";

export type { AxisAssignment, AxisOrientation, AxisSpec } from "./TimeseriesPanel.axes";
export type {
  BreakdownItem,
  MergedRow,
  ResolvedSeries,
  TimeseriesPanelProps,
  TimeseriesPoint,
  TimeseriesResponse,
  TimeseriesSeries,
} from "./TimeseriesPanel.model";

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
