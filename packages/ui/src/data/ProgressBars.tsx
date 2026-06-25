import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";
import { deriveProgressBars } from "./ProgressBars.model";
import { GaugeHoverCard, type GaugeHoverRow } from "./GaugeHoverCard";

export type ProgressBarsVariant = "default" | "cell";
export type ProgressBarsOrientation = "horizontal" | "vertical";

/**
 * Describes what one bar represents, letting the same component render CPU cores,
 * memory gigabytes, or any other quantised capacity. Defaults model CPU cores.
 */
export interface ProgressBarsUnit {
  /** Raw value that fills one bar, in the domain of `usage`/`max`. Default 1000 (millicores → 1 core). */
  perBar?: number;
  /** Caption/tooltip suffix naming the unit, plural. Default "cores". */
  label?: string;
  /** Per-bar hover tooltip noun, singular. Default "core". */
  barLabel?: string;
  /** Format a bar-unit count for the caption. Default: integers as-is, else 1 decimal. */
  format?: (units: number) => string;
}

/** Summary statistics for the hover card, in the same domain as `usage`/`max`. */
export interface ProgressBarsStats {
  /** Smallest value over the window. */
  min: number;
  /** Largest value over the window. */
  max: number;
  /** Mean value over the window. */
  avg: number;
}

export interface ProgressBarsProps {
  /** Usage that fills the bars, in the raw domain (e.g. CPU millicores). */
  usage: number | undefined;
  /**
   * The capacity, in the same raw domain as `usage`. Determines the number of
   * bars (one per `unit.perBar`). When omitted or 0, the bar count falls back to
   * the ceiling of the usage so an unbounded reading still renders.
   */
  max?: number;
  /** What one bar represents. Defaults to CPU cores (perBar 1000, label "cores"). */
  unit?: ProgressBarsUnit;
  title: string;
  /** Iconify name or static icon component shown beside the label. */
  icon?: string | StaticIconComponent;
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
   * Summary stats for the hover card's Min/Max/Avg rows, in the SAME raw domain as
   * `usage`/`max` (NOT divided by perBar). Pass null to omit those rows.
   */
  stats?: ProgressBarsStats | null;
  /**
   * Wrap the bars in a hover card summarising the metric (label + current / min /
   * max / avg / capacity). Defaults to true.
   */
  hoverCard?: boolean;
  /** Footer note in the hover card, e.g. the look-back window ("over last 1h"). */
  hoverFooter?: ReactNode;
  className?: string;
}

function toneClass(pct: number, [warn, danger]: [number, number]): string {
  if (pct >= danger) return "bg-red-500";
  if (pct >= warn) return "bg-amber-500";
  return "bg-emerald-500";
}

function ProgressBarsIcon({ icon }: { icon: string | StaticIconComponent }) {
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

function defaultFormatUnits(units: number): string {
  return Number.isInteger(units) ? String(units) : units.toFixed(1);
}

/**
 * ProgressBars renders quantised utilisation as a row of bars — one bar per unit
 * of capacity (the ceiling of the limit) — filled left to right by the usage. The
 * bar that straddles the usage boundary is partially filled ("blocked out") to
 * show the fractional unit in use, and the trailing bars stay empty to show
 * headroom; the bar colour crosses warning and danger thresholds. A "<used> /
 * <capacity>" caption sits below with the icon+title. It is purely presentational
 * — pass plain `usage`/`max` numbers (TimeseriesCoreBars wraps it with live data).
 */
export function ProgressBars({
  usage,
  max,
  unit,
  title,
  icon,
  thresholds = [75, 90],
  variant = "default",
  showLabel = true,
  showValue = true,
  showCapacity = false,
  orientation,
  stats,
  hoverCard = true,
  hoverFooter,
  className,
}: ProgressBarsProps) {
  const perBar = unit?.perBar ?? 1000;
  const unitLabel = unit?.label ?? "cores";
  const barLabel = unit?.barLabel ?? "core";
  const formatUnits = unit?.format ?? defaultFormatUnits;

  const model = deriveProgressBars(usage, max, perBar);
  const tone = toneClass(model.pct, thresholds);
  const usageText = formatUnits(model.usageUnits);
  const capacityText =
    model.limitUnits !== undefined ? formatUnits(model.limitUnits) : "?";
  const caption = !model.hasUsage
    ? "—"
    : showCapacity
      ? `${usageText} / ${capacityText} ${unitLabel}`
      : `${usageText} ${unitLabel}`;
  const compactCaption = !model.hasUsage
    ? "—"
    : showCapacity
      ? `${usageText}/${capacityText} ${unitLabel}`
      : `${usageText} ${unitLabel}`;
  const titleText = `${title}: ${compactCaption}`;
  const isCell = variant === "cell";

  // Hover card: surface current/min/max/avg/capacity in bar-units (stats are in
  // the raw domain, so divide by perBar) so they read in the same unit as the
  // caption. A bounded reading colours the current row by its threshold.
  const pctTone =
    model.limitUnits === undefined
      ? undefined
      : model.pct >= thresholds[1]
        ? "text-red-500"
        : model.pct >= thresholds[0]
          ? "text-amber-500"
          : "text-emerald-500";
  const fmt = (n: number) => `${formatUnits(n)} ${unitLabel}`;
  const hoverRows: GaugeHoverRow[] = model.hasUsage
    ? [
        { label: "Current", value: fmt(model.usageUnits), ...(pctTone ? { tone: pctTone } : {}) },
        ...(stats
          ? [
              { label: "Min", value: fmt(stats.min / perBar) },
              { label: "Max", value: fmt(stats.max / perBar) },
              { label: "Avg", value: fmt(stats.avg / perBar) },
            ]
          : []),
        ...(model.limitUnits !== undefined
          ? [{ label: "Capacity", value: fmt(model.limitUnits) }]
          : []),
      ]
    : [];

  const resolvedOrientation = orientation ?? "vertical";
  const isDense = model.barCount > 4;
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
      data-bar-count={model.barCount}
      data-bar-density={isDense ? "compact" : "default"}
    >
      {model.bars.map((bar, i) => {
        const barPct = Math.round(bar.fill * 100);
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
            title={`${barLabel} ${i + 1}: ${barPct}%`}
            aria-label={!isCell ? `${barLabel} ${i + 1}: ${barPct}%` : undefined}
            data-fill={bar.fill}
          >
            <span
              className={cn(
                "absolute bottom-0 left-0 transition-all duration-300",
                tone,
              )}
              style={
                resolvedOrientation === "vertical"
                  ? { height: `${barPct}%`, right: 0 }
                  : { width: `${barPct}%`, top: 0 }
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
        {icon ? <ProgressBarsIcon icon={icon} /> : null}
        {showLabel ? <span className="min-w-0 truncate">{title}</span> : null}
      </span>
    ) : null;

  const useHover = hoverCard && hoverRows.length > 0;

  if (isCell) {
    const cell = (
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap align-middle text-xs",
          className,
        )}
        {...(useHover ? {} : { title: titleText })}
        aria-label={useHover ? titleText : hiddenAccessibleText}
      >
        {label}
        {bars}
        {valueNode}
      </span>
    );
    return useHover ? (
      <GaugeHoverCard title={title} rows={hoverRows} footer={hoverFooter} trigger={cell} />
    ) : (
      cell
    );
  }

  const block = (
    <div
      className={cn("flex flex-col items-center gap-1", className)}
      {...(useHover ? {} : { title: hiddenAccessibleText })}
      aria-label={useHover ? titleText : hiddenAccessibleText}
    >
      {bars}
      {valueNode}
      {label}
    </div>
  );
  return useHover ? (
    <GaugeHoverCard
      title={title}
      rows={hoverRows}
      footer={hoverFooter}
      trigger={block}
      className="w-full justify-center"
    />
  ) : (
    block
  );
}
