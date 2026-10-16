import type { GaugeTone } from "../Gauge";
import { cn } from "../../lib/utils";

export type MetricTileProps = {
  label: string;
  value: string;
  /** Fill of the bar under the value, 0-100; omit for no bar. */
  barPct?: number;
  /** Colours the value and the bar. Defaults to neutral. */
  tone?: GaugeTone;
  className?: string;
};

const toneBar: Record<GaugeTone, string> = {
  neutral: "bg-muted-foreground/40",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
};

const toneText: Record<GaugeTone, string> = {
  neutral: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

/** A compact labelled value with an optional tone bar, for process and attempt metrics. */
export function MetricTile({ label, value, barPct, tone = "neutral", className }: MetricTileProps) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-0.5 rounded-md border border-border bg-background px-density-2 py-1",
        className,
      )}
      data-metric={label}
    >
      <span className="text-[9px] uppercase leading-none tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("truncate text-xs font-semibold tabular-nums", toneText[tone])}>{value}</span>
      {barPct !== undefined && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full transition-all duration-300", toneBar[tone])}
            style={{ width: `${barPct}%` }}
            data-metric-bar=""
          />
        </div>
      )}
    </div>
  );
}
