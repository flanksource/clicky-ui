import { useQueries } from "@tanstack/react-query";
import { useMemo } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import type { GaugeSeries } from "./TimeseriesGauge";
import type { TimeseriesResponse } from "./TimeseriesPanel";
import { deriveCoreBars } from "./TimeseriesCoreBars.model";

export type TimeseriesCoreBarsVariant = "default" | "cell";
export type TimeseriesCoreBarsOrientation = "horizontal" | "vertical";

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
  /** Visual density/layout. `cell` is a compact inline form for table/grid cells. */
  variant?: TimeseriesCoreBarsVariant;
  /** Show the title text. Icons and values remain visible unless separately hidden. */
  showLabel?: boolean;
  /** Show the value/capacity caption. Icons and bars remain visible when false. */
  showValue?: boolean;
  /** Bar direction. Vertical bars fill bottom-up; horizontal bars fill left-to-right. */
  orientation?: TimeseriesCoreBarsOrientation;
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

function CoreBarsIcon({ icon }: { icon: string | StaticIconComponent }) {
  if (typeof icon === "string") {
    return (
      <Icon
        name={icon}
        width={14}
        height={14}
        className="text-muted-foreground"
      />
    );
  }
  return (
    <Icon
      icon={icon}
      width={14}
      height={14}
      className="text-muted-foreground"
    />
  );
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
  variant = "default",
  showLabel = true,
  showValue = true,
  orientation,
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
  const usage =
    rawValue === undefined
      ? undefined
      : value.transform
        ? value.transform(rawValue)
        : rawValue;

  let limit: number | undefined;
  if (typeof max === "number") {
    limit = max;
  } else if (maxSeries) {
    const rawMax = latestValue(results[1]?.data);
    limit =
      rawMax === undefined
        ? undefined
        : maxSeries.transform
          ? maxSeries.transform(rawMax)
          : rawMax;
  }

  const model = deriveCoreBars(usage, limit);
  const tone = toneClass(model.pct, thresholds);
  const caption = model.hasUsage
    ? `${formatCores(model.usageCores)} / ${model.limitCores !== undefined ? formatCores(model.limitCores) : "?"} cores`
    : "—";
  const compactCaption = model.hasUsage
    ? `${formatCores(model.usageCores)}/${model.limitCores !== undefined ? formatCores(model.limitCores) : "?"} cores`
    : "—";
  const titleText = `${title}: ${compactCaption}`;
  const isCell = variant === "cell";
  const resolvedOrientation = orientation ?? "vertical";
  const isDense = model.coreCount > 4;
  const valueText = isCell ? compactCaption : caption;
  const hiddenAccessibleText = !showLabel || !showValue ? titleText : undefined;
  const bars = (
    <span
      className={cn(
        "flex shrink-0",
        resolvedOrientation === "vertical"
          ? cn("items-end", isCell ? "h-4 gap-px" : "h-10 gap-0.5")
          : cn(
              "flex-col justify-center",
              isCell ? "h-4 w-10 gap-px" : "h-10 w-16 gap-0.5",
            ),
      )}
      aria-hidden={isCell ? "true" : undefined}
      data-orientation={resolvedOrientation}
      data-core-count={model.coreCount}
      data-core-density={isDense ? "compact" : "default"}
    >
      {model.bars.map((bar, i) => {
        const corePct = Math.round(bar.fill * 100);
        return (
          <span
            key={i}
            className={cn(
              "relative overflow-hidden bg-muted",
              resolvedOrientation === "vertical"
                ? cn(
                    "h-full",
                    isCell
                      ? isDense
                        ? "w-[3px] rounded-[2px]"
                        : "w-1.5 rounded-[2px]"
                      : isDense
                        ? "w-1 rounded-sm"
                        : "w-2 rounded-sm",
                  )
                : cn("min-h-px w-full flex-1 rounded-[2px]"),
            )}
            title={`core ${i + 1}: ${corePct}%`}
            aria-label={!isCell ? `core ${i + 1}: ${corePct}%` : undefined}
            data-fill={bar.fill}
          >
            <span
              className={cn(
                "absolute bottom-0 left-0 transition-all duration-300",
                tone,
              )}
              style={
                resolvedOrientation === "vertical"
                  ? { height: `${corePct}%`, right: 0 }
                  : { width: `${corePct}%`, top: 0 }
              }
            />
          </span>
        );
      })}
    </span>
  );
  const valueNode = showValue ? (
    <span
      className={cn(
        "shrink-0 font-semibold tabular-nums text-foreground",
        isCell ? null : "text-xs",
      )}
    >
      {valueText}
    </span>
  ) : null;
  const label =
    icon || showLabel ? (
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground",
        )}
      >
        {icon ? <CoreBarsIcon icon={icon} /> : null}
        {showLabel ? <span className="min-w-0 truncate">{title}</span> : null}
      </span>
    ) : null;

  if (isCell) {
    return (
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap align-middle text-xs",
          className,
        )}
        title={titleText}
        aria-label={hiddenAccessibleText}
      >
        {label}
        {bars}
        {valueNode}
      </span>
    );
  }

  return (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      title={hiddenAccessibleText}
      aria-label={hiddenAccessibleText}
    >
      {bars}
      {valueNode}
      {label}
    </div>
  );
}
