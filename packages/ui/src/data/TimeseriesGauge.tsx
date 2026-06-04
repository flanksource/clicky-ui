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

/** A metric series whose latest value drives the gauge fill or its maximum. */
export interface GaugeSeries {
  /** Metric id appended to the gauge's baseUrl, e.g. "k8s.statefulset.cycle.cpu.usage". */
  id: string;
  /** Maps the latest value before display (e.g. unit scaling). Identity when omitted. */
  transform?: (value: number) => number;
}

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

  const chartSeries: TimeseriesSeries[] = useMemo(() => {
    const s: TimeseriesSeries[] = [{ id: value.id, label: "value", ...(value.transform ? { transform: value.transform } : {}) }];
    if (maxSeries) s.push({ id: maxSeries.id, label: "max", ...(maxSeries.transform ? { transform: maxSeries.transform } : {}) });
    return s;
  }, [value.id, value.transform, maxSeries]);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative h-10 w-20">
        <svg viewBox="0 0 100 50" className="h-full w-full overflow-visible">
          <path d={GAUGE_PATH} fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="round" className="text-muted" />
          <path
            d={GAUGE_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth={9}
            strokeLinecap="round"
            className={tone}
            strokeDasharray={GAUGE_ARC}
            strokeDashoffset={GAUGE_ARC * (1 - pct / 100)}
          />
        </svg>
        <span className="absolute inset-x-0 bottom-0 text-center text-sm font-semibold text-foreground">
          {centerDisplay === "percent"
            ? bounded
              ? `${pct}%`
              : hasValue
                ? "n/a"
                : "—"
            : hasValue
              ? formatUnit(usage, unit)
              : "—"}
        </span>
        {expandable && (
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
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon ? <GaugeIcon icon={icon} /> : null}
        <span>{title}</span>
      </div>

      {expandable && (
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
    </div>
  );
}
