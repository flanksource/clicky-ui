import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import type { GaugeSeries } from "./TimeseriesGauge";
import type { TimeseriesResponse } from "./TimeseriesPanel";

export interface TimeseriesCoreBarsProps {
  /** Common prefix; the value/max requests are `baseUrl + id`. */
  baseUrl?: string;
  /** The metric whose latest value (CPU millicores) fills the bars. */
  value: GaugeSeries;
  /**
   * The CPU capacity. Either a `.limit`-style metric series (its latest value in
   * millicores) or a fixed number of millicores. Determines the number of bars
   * (one per core). When omitted or 0, the bar count falls back to the ceiling of
   * the usage in cores so an unbounded reading still renders.
   */
  max?: GaugeSeries | number;
  title: string;
  /** Iconify name or static icon component shown beside the label. */
  icon?: string | StaticIconComponent;
  /** Look-back window passed as ?since=; defaults to "1h". */
  range?: string;
  /** Poll interval in ms; defaults to 5000. Pass 0 to disable polling. */
  refreshMs?: number;
  /**
   * Utilisation thresholds (percent of capacity) at which the fill turns amber
   * then red. Defaults to [75, 90].
   */
  thresholds?: [warning: number, danger: number];
  /** Override the default fetch (e.g. to route through an app's API client). */
  fetcher?: (url: string) => Promise<TimeseriesResponse>;
  className?: string;
}

const defaultFetcher = async (url: string): Promise<TimeseriesResponse> => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`metrics request failed: ${res.status}`);
  return res.json();
};

function latestValue(resp: TimeseriesResponse | undefined): number | undefined {
  const points = resp?.points;
  if (!points || points.length === 0) return undefined;
  return points[points.length - 1]?.value;
}

function toneClass(pct: number, [warn, danger]: [number, number]): string {
  if (pct >= danger) return "bg-red-500";
  if (pct >= warn) return "bg-amber-500";
  return "bg-emerald-500";
}

export interface CoreBar {
  /** Fraction of this core that is in use, in [0, 1]. */
  fill: number;
}

export interface CoreBarsModel {
  /** Whether a usage reading was available. */
  hasUsage: boolean;
  /** Usage expressed in cores (millicores / 1000). */
  usageCores: number;
  /** Capacity in cores; undefined when no limit was resolved. */
  limitCores?: number;
  /** Number of bars rendered (one per core). */
  coreCount: number;
  /** Utilisation percentage of capacity; 0 when unbounded. */
  pct: number;
  /** Per-core fill fractions, left to right. */
  bars: CoreBar[];
}

const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

// deriveCoreBars turns the latest usage/limit millicore readings into a per-core
// bar model: one bar per core (ceil of the limit), filled left to right by usage
// so the bar straddling the usage boundary is partially filled and the remainder
// stays empty. When the limit is missing or 0 the bar count falls back to the
// ceiling of the usage so an unbounded reading still renders sensibly.
export function deriveCoreBars(
  usageMilli: number | undefined,
  limitMilli: number | undefined,
): CoreBarsModel {
  const hasUsage = usageMilli !== undefined;
  const usageCores = (usageMilli ?? 0) / 1000;
  const hasLimit = limitMilli !== undefined && limitMilli > 0;
  const limitCores = hasLimit ? (limitMilli as number) / 1000 : undefined;

  const coreCount = Math.max(
    1,
    Math.ceil(hasLimit ? (limitCores as number) : usageCores),
  );
  const pct = hasLimit
    ? Math.min(100, Math.round((usageCores / (limitCores as number)) * 100))
    : 0;

  const bars: CoreBar[] = Array.from({ length: coreCount }, (_, i) => ({
    fill: clamp01(usageCores - i),
  }));

  // limitCores is an optional field under exactOptionalPropertyTypes — only set
  // the key when a limit resolved, rather than assigning an explicit undefined.
  return {
    hasUsage,
    usageCores,
    coreCount,
    pct,
    bars,
    ...(limitCores !== undefined && { limitCores }),
  };
}

function CoreBarsIcon({ icon }: { icon: string | StaticIconComponent }) {
  if (typeof icon === "string") {
    return <Icon name={icon} width={14} height={14} className="text-muted-foreground" />;
  }
  return <Icon icon={icon} width={14} height={14} className="text-muted-foreground" />;
}

function formatCores(cores: number): string {
  return Number.isInteger(cores) ? String(cores) : cores.toFixed(1);
}

/**
 * TimeseriesCoreBars renders CPU utilisation as a row of vertical bars — one bar
 * per core (the ceiling of the CPU limit) — filled left to right by the latest
 * usage. The bar that straddles the usage boundary is partially filled ("blocked
 * out") to show the fractional core in use, and the trailing bars stay empty to
 * show headroom. Both usage and limit are read live from the timeseries store,
 * mirroring TimeseriesGauge's data plumbing; the bar colour crosses warning and
 * danger thresholds. A "<used> / <cores>" caption sits below with the icon+title.
 */
export function TimeseriesCoreBars({
  baseUrl = "",
  value,
  max,
  title,
  icon,
  range = "1h",
  refreshMs = 5000,
  thresholds = [75, 90],
  fetcher = defaultFetcher,
  className,
}: TimeseriesCoreBarsProps) {
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
  const usage = rawValue === undefined ? undefined : value.transform ? value.transform(rawValue) : rawValue;

  let limit: number | undefined;
  if (typeof max === "number") {
    limit = max;
  } else if (maxSeries) {
    const rawMax = latestValue(results[1]?.data);
    limit = rawMax === undefined ? undefined : maxSeries.transform ? maxSeries.transform(rawMax) : rawMax;
  }

  const model = deriveCoreBars(usage, limit);
  const tone = toneClass(model.pct, thresholds);
  const caption = model.hasUsage
    ? `${formatCores(model.usageCores)} / ${model.limitCores !== undefined ? formatCores(model.limitCores) : "?"} cores`
    : "—";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="flex h-10 items-end gap-0.5">
        {model.bars.map((bar, i) => {
          const corePct = Math.round(bar.fill * 100);
          return (
            <div
              key={i}
              className="relative h-full w-2 overflow-hidden rounded-sm bg-muted"
              title={`core ${i + 1}: ${corePct}%`}
              aria-label={`core ${i + 1}: ${corePct}%`}
              data-fill={bar.fill}
            >
              <div
                className={cn("absolute inset-x-0 bottom-0 transition-all duration-300", tone)}
                style={{ height: `${corePct}%` }}
              />
            </div>
          );
        })}
      </div>
      <span className="text-xs font-semibold text-foreground">{caption}</span>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon ? <CoreBarsIcon icon={icon} /> : null}
        <span>{title}</span>
      </div>
    </div>
  );
}
