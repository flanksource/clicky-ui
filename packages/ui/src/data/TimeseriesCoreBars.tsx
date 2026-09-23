import { type StaticIconComponent } from "./Icon";
import type { GaugeSeries } from "./TimeseriesGauge";
import type { TimeseriesResponse } from "./TimeseriesPanel";
import {
  ProgressBars,
  type ProgressBarsOrientation,
  type ProgressBarsUnit,
  type ProgressBarsVariant,
} from "./ProgressBars";
import { seriesStats } from "./gauge-stats";
import { defaultTimeseriesFetcher, latestValue, useTimeseriesQueries } from "./timeseries-query";

export interface TimeseriesCoreBarsProps {
  /** Common prefix; the value/max requests are `baseUrl + id` (unless a series has `load`). */
  baseUrl?: string;
  /** The metric whose latest value (CPU millicores) fills the bars. */
  value: GaugeSeries;
  /**
   * The capacity. Either a `.limit`-style metric series (its latest value) or a
   * fixed number, in the same raw domain as `value`. Determines the number of
   * bars (one per `unit.perBar`). When omitted or 0, the bar count falls back to
   * the ceiling of the usage so an unbounded reading still renders.
   */
  max?: GaugeSeries | number;
  /** What one bar represents. Defaults to CPU cores (perBar 1000, label "cores"). */
  unit?: ProgressBarsUnit;
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
  variant?: ProgressBarsVariant;
  /** Show the title text. Icons and values remain visible unless separately hidden. */
  showLabel?: boolean;
  /** Show the value/capacity caption. Icons and bars remain visible when false. */
  showValue?: boolean;
  /**
   * Include the capacity in the caption ("2.3 / 4 cores"). Defaults to false — the
   * caption shows only the current value ("2.3 cores") since the bars already
   * convey capacity. Set true to append the "/ <capacity>".
   */
  showCapacity?: boolean;
  /** Bar direction. Vertical bars fill bottom-up; horizontal bars fill left-to-right. */
  orientation?: ProgressBarsOrientation;
  /**
   * Wrap the bars in a hover card summarising the metric (label + current / min /
   * max / avg / capacity over the window). Defaults to true.
   */
  hoverCard?: boolean;
  /** Override the default fetch (e.g. to route through an app's API client). */
  fetcher?: (url: string) => Promise<TimeseriesResponse>;
  className?: string;
}

/**
 * TimeseriesCoreBars reads usage and limit live from the timeseries store
 * (mirroring TimeseriesGauge's data plumbing) and renders them as quantised
 * utilisation bars via {@link ProgressBars}. Usage and limit flow through each
 * series' optional `transform`; the hover card summarises current/min/max/avg/
 * capacity over the look-back window.
 */
export function TimeseriesCoreBars({
  baseUrl = "",
  value,
  max,
  unit,
  title,
  icon,
  range = "1h",
  refreshMs = 5000,
  thresholds = [75, 90],
  variant = "default",
  showLabel = true,
  showValue = true,
  showCapacity = false,
  orientation,
  hoverCard = true,
  fetcher = defaultTimeseriesFetcher,
  className,
}: TimeseriesCoreBarsProps) {
  const maxSeries = typeof max === "object" ? max : undefined;
  const results = useTimeseriesQueries(maxSeries ? [value, maxSeries] : [value], {
    baseUrl,
    range,
    refreshMs,
    fetcher,
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

  const stats = seriesStats(results[0]?.data?.points, value.transform);

  return (
    <ProgressBars
      usage={usage}
      stats={stats}
      title={title}
      thresholds={thresholds}
      variant={variant}
      showLabel={showLabel}
      showValue={showValue}
      showCapacity={showCapacity}
      hoverCard={hoverCard}
      hoverFooter={`over last ${range}`}
      {...(limit !== undefined ? { max: limit } : {})}
      {...(unit !== undefined ? { unit } : {})}
      {...(icon !== undefined ? { icon } : {})}
      {...(orientation !== undefined ? { orientation } : {})}
      {...(className !== undefined ? { className } : {})}
    />
  );
}
