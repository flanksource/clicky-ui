import { useQueries } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { cn } from "../lib/utils";
import { formatUnit } from "../lib/format";
import { Modal } from "../overlay/Modal";
import { UiFullscreen } from "../icons";
import { Icon, type StaticIconComponent } from "./Icon";
import {
  TimeseriesPanel,
  type TimeseriesResponse,
  type TimeseriesSeries,
} from "./TimeseriesPanel";
import { GaugeHoverCard, type GaugeHoverRow } from "./GaugeHoverCard";
import { seriesStats } from "./gauge-stats";

/** A metric series whose latest value drives the gauge fill or its maximum. */
export interface GaugeSeries {
  /** Metric id appended to the gauge's baseUrl, e.g. "k8s.statefulset.cycle.cpu.usage". */
  id: string;
  /** Maps the latest value before display (e.g. unit scaling). Identity when omitted. */
  transform?: (value: number) => number;
}

export type TimeseriesGaugeVariant = "default" | "cell";
/** Gauge fill geometry: a half-circle arc (default) or a horizontal progress bar. */
export type TimeseriesGaugeShape = "radial" | "linear";

export interface TimeseriesGaugeProps {
  /** Common prefix; the value/max requests are `baseUrl + id`. */
  baseUrl?: string;
  /** The metric whose latest value fills the gauge. */
  value: GaugeSeries;
  /**
   * The gauge maximum. Either a metric series (its latest value, e.g. a `.limit`
   * metric) or a fixed number. When omitted, or when the resolved max is 0, the
   * gauge shows the raw value with no fill (an unbounded reading).
   */
  max?: GaugeSeries | number;
  title: string;
  /** Iconify name or static icon component shown beside the label. */
  icon?: string | StaticIconComponent;
  /** Grafana-style unit key for the readout (e.g. "bytes", "percent", "short", "ms"). */
  unit?: string;
  /** Look-back window for the expand chart, passed as ?since=; defaults to "1h". */
  range?: string;
  /** Poll interval in ms; defaults to 5000. Pass 0 to disable polling. */
  refreshMs?: number;
  /** Show an expand button that opens the value/max time-series chart in a modal. Default true. */
  expandable?: boolean;
  /**
   * Utilisation thresholds (percent of max) at which the arc turns amber then
   * red. Defaults to [75, 90].
   */
  thresholds?: [warning: number, danger: number];
  /**
   * What to print in the centre: the formatted value (default) or the
   * utilisation percentage of max (e.g. CPU usage out of its millicore limit).
   */
  centerDisplay?: "value" | "percent";
  /** Visual density/layout. `cell` is a compact inline form for table/grid cells. */
  variant?: TimeseriesGaugeVariant;
  /** Fill geometry: a radial half-gauge (default) or a horizontal progress bar. */
  shape?: TimeseriesGaugeShape;
  /** Show the title text. Icons and values remain visible when false. */
  showLabel?: boolean;
  /**
   * Wrap the gauge in a hover card summarising the metric (label + current / min /
   * max / avg / capacity over the window). Defaults to true.
   */
  hoverCard?: boolean;
  /** Override the default fetch (e.g. to route through an app's API client). */
  fetcher?: (url: string) => Promise<TimeseriesResponse>;
  className?: string;
}

const defaultFetcher = async (url: string): Promise<TimeseriesResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`metrics request failed: ${res.status}`);
  return res.json();
};

// Half-gauge SVG geometry: a 100×50 viewBox semicircle (radius 40, centre 50,50)
// swept 180°. The arc length is π·r; stroke-dashoffset reveals value/max of it.
const GAUGE_RADIUS = 40;
const GAUGE_ARC = Math.PI * GAUGE_RADIUS;
const GAUGE_PATH = `M 10 50 A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 1 90 50`;

function toneClass(pct: number, [warn, danger]: [number, number]): string {
  if (pct >= danger) return "text-red-500";
  if (pct >= warn) return "text-amber-500";
  return "text-emerald-500";
}

// toneBgClass mirrors toneClass for the linear bar's fill, which needs a
// background colour rather than the arc's stroke (currentColor) tone.
function toneBgClass(pct: number, [warn, danger]: [number, number]): string {
  if (pct >= danger) return "bg-red-500";
  if (pct >= warn) return "bg-amber-500";
  return "bg-emerald-500";
}

// GaugeArc is the half-circle SVG shared by the cell and default radial gauges;
// only the stroke width differs between the two densities.
function GaugeArc({ pct, tone, strokeWidth }: { pct: number; tone: string; strokeWidth: number }) {
  return (
    <svg viewBox="0 0 100 50" className="h-full w-full overflow-visible">
      <path d={GAUGE_PATH} fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className="text-muted" />
      <path
        d={GAUGE_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        className={tone}
        strokeDasharray={GAUGE_ARC}
        strokeDashoffset={GAUGE_ARC * (1 - pct / 100)}
      />
    </svg>
  );
}

// GaugeBar is the horizontal progress track shared by the cell and default linear
// gauges; the caller sizes it via className (e.g. "h-1.5 w-12" or "h-2 w-full").
function GaugeBar({ pct, toneBg, className }: { pct: number; toneBg: string; className?: string }) {
  return (
    <span className={cn("relative block overflow-hidden rounded-full bg-muted", className)} aria-hidden="true">
      <span
        className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-300", toneBg)}
        style={{ width: `${pct}%` }}
      />
    </span>
  );
}

function latestValue(resp: TimeseriesResponse | undefined): number | undefined {
  const points = resp?.points;
  if (!points || points.length === 0) return undefined;
  return points[points.length - 1]?.value;
}

function GaugeIcon({ icon }: { icon: string | StaticIconComponent }) {
  if (typeof icon === "string") {
    return <Icon name={icon} width={14} height={14} className="text-muted-foreground" />;
  }
  return <Icon icon={icon} width={14} height={14} className="text-muted-foreground" />;
}

/**
 * TimeseriesGauge renders a half (180°) radial gauge whose fill is the latest
 * value of a metric over its maximum (a `.limit`-style metric or a fixed number),
 * both read live from the timeseries store. The centre shows the utilisation
 * percentage, with the value/max caption below; the arc colour crosses warning
 * and danger thresholds. An expand button opens the full value/max time-series
 * chart in a modal (a `TimeseriesPanel`), so the gauge gives the at-a-glance
 * reading and the chart the trend.
 */
export function TimeseriesGauge({
  baseUrl = "",
  value,
  max,
  title,
  icon,
  unit,
  range = "1h",
  refreshMs = 5000,
  expandable = true,
  thresholds = [75, 90],
  centerDisplay = "value",
  variant = "default",
  shape = "radial",
  showLabel = true,
  hoverCard = true,
  fetcher = defaultFetcher,
  className,
}: TimeseriesGaugeProps) {
  const [expanded, setExpanded] = useState(false);

  const maxIsSeries = typeof max === "object";
  const maxSeries = maxIsSeries ? max : undefined;
  const ids = useMemo(() => {
    const list = [value.id];
    if (maxSeries) list.push(maxSeries.id);
    return list;
  }, [value.id, maxSeries]);

  const results = useQueries({
    queries: ids.map((id) => {
      const u = new URL(baseUrl + id, window.location.origin);
      if (range) u.searchParams.set("since", range);
      const requestUrl = u.pathname + u.search;
      return {
        queryKey: ["timeseries", requestUrl],
        queryFn: () => fetcher(requestUrl),
        refetchInterval: refreshMs > 0 ? refreshMs : false,
        staleTime: 0,
        retry: 0,
      };
    }),
  });

  const rawValue = latestValue(results[0]?.data);
  const hasValue = rawValue !== undefined;
  const usage = value.transform ? value.transform(rawValue ?? 0) : (rawValue ?? 0);

  let limit: number | undefined;
  if (typeof max === "number") {
    limit = max;
  } else if (maxSeries) {
    const rawMax = latestValue(results[1]?.data);
    limit = rawMax === undefined ? undefined : maxSeries.transform ? maxSeries.transform(rawMax) : rawMax;
  }

  const bounded = hasValue && limit !== undefined && limit > 0;
  const pct = bounded ? Math.min(100, Math.round((usage / (limit as number)) * 100)) : 0;
  const tone = toneClass(pct, thresholds);
  const toneBg = toneBgClass(pct, thresholds);
  const readout =
    centerDisplay === "percent"
      ? bounded
        ? `${pct}%`
        : hasValue
          ? "n/a"
          : "—"
      : hasValue
        ? formatUnit(usage, unit)
        : "—";
  const titleText = `${title}: ${readout}`;
  const canExpand = expandable && variant === "default";
  const readoutTone = bounded ? tone : "text-foreground";

  const chartSeries: TimeseriesSeries[] = useMemo(() => {
    const s: TimeseriesSeries[] = [{ id: value.id, label: "value", ...(value.transform ? { transform: value.transform } : {}) }];
    if (maxSeries) s.push({ id: maxSeries.id, label: "max", ...(maxSeries.transform ? { transform: maxSeries.transform } : {}) });
    return s;
  }, [value.id, value.transform, maxSeries]);

  // Hover card: reduce the value's points to current/min/max/avg (transformed to
  // the display unit), plus the resolved capacity. The current row is tinted by
  // its threshold tone when the reading is bounded.
  const stats = seriesStats(results[0]?.data?.points, value.transform);
  const fmt = (n: number) => formatUnit(n, unit);
  const hoverRows: GaugeHoverRow[] = hasValue
    ? [
        { label: "Current", value: fmt(usage), ...(bounded ? { tone } : {}) },
        ...(stats
          ? [
              { label: "Min", value: fmt(stats.min) },
              { label: "Max", value: fmt(stats.max) },
              { label: "Avg", value: fmt(stats.avg) },
            ]
          : []),
        ...(limit !== undefined
          ? [{ label: "Capacity", value: fmt(limit) }]
          : []),
      ]
    : [];
  const useHover = hoverCard && hoverRows.length > 0;
  const footer = `over last ${range}`;

  if (variant === "cell") {
    const cell = (
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap align-middle text-xs",
          className,
        )}
        {...(useHover ? {} : { title: titleText })}
        aria-label={useHover || !showLabel ? titleText : undefined}
        data-shape={shape}
      >
        {icon ? <GaugeIcon icon={icon} /> : null}
        {showLabel ? <span className="min-w-0 truncate text-muted-foreground">{title}</span> : null}
        {shape === "linear" ? (
          <GaugeBar pct={pct} toneBg={toneBg} className="h-1.5 w-12 shrink-0" />
        ) : (
          <span className="relative h-4 w-8 shrink-0" aria-hidden="true">
            <GaugeArc pct={pct} tone={tone} strokeWidth={10} />
          </span>
        )}
        <span className={cn("shrink-0 font-semibold tabular-nums", readoutTone)}>
          {readout}
        </span>
      </span>
    );
    return useHover ? (
      <GaugeHoverCard title={title} rows={hoverRows} footer={footer} trigger={cell} />
    ) : (
      cell
    );
  }

  const body = (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      {...(useHover ? {} : { title: !showLabel ? titleText : undefined })}
      aria-label={useHover || !showLabel ? titleText : undefined}
      data-shape={shape}
    >
      {shape === "linear" ? (
        <div className="flex w-full items-center gap-2">
          <GaugeBar pct={pct} toneBg={toneBg} className="h-2 w-full" />
          <span className="shrink-0 text-sm font-semibold text-foreground">{readout}</span>
          {canExpand && (
            <button
              type="button"
              aria-label="Expand chart"
              onClick={() => setExpanded(true)}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <Icon icon={UiFullscreen} width={12} height={12} />
            </button>
          )}
        </div>
      ) : (
        <div className="relative h-10 w-20">
          <GaugeArc pct={pct} tone={tone} strokeWidth={9} />
          <span className="absolute inset-x-0 bottom-0 text-center text-sm font-semibold text-foreground">
            {readout}
          </span>
          {canExpand && (
            <button
              type="button"
              aria-label="Expand chart"
              onClick={() => setExpanded(true)}
              className="absolute right-0 top-0 text-muted-foreground hover:text-foreground"
            >
              <Icon icon={UiFullscreen} width={12} height={12} />
            </button>
          )}
        </div>
      )}
      {icon || showLabel ? (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          {icon ? <GaugeIcon icon={icon} /> : null}
          {showLabel ? <span>{title}</span> : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      {useHover ? (
        <GaugeHoverCard
          title={title}
          rows={hoverRows}
          footer={footer}
          trigger={body}
          className="w-full justify-center"
        />
      ) : (
        body
      )}
      {canExpand && (
        <Modal open={expanded} onClose={() => setExpanded(false)} title={title} size="xl">
          <TimeseriesPanel
            title={title}
            {...(icon ? { icon } : {})}
            {...(unit ? { unit } : {})}
            baseUrl={baseUrl}
            series={chartSeries}
            range={range}
            refreshMs={refreshMs}
            expandable={false}
            fetcher={fetcher}
          />
        </Modal>
      )}
    </>
  );
}
