import { cn } from "../../lib/utils";
import { sparklinePoints } from "./process-tree";

export type SparklineProps = {
  /** Values in order; at least two are needed to draw a line. */
  values: number[];
  /** Accessible description of what the line plots. */
  label: string;
  width?: number;
  height?: number;
  /** Stretch to the width of the container instead of the fixed pixel width. */
  fill?: boolean;
  /** Classes applied to the svg; the stroke follows the text colour. */
  className?: string;
};

/** A dependency-free inline SVG line, scaled so the largest value touches the top. */
export function Sparkline({ values, label, width = 64, height = 16, fill = false, className }: SparklineProps) {
  const points = sparklinePoints(values, width, height);
  if (!points) return null;
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      {...(fill ? { preserveAspectRatio: "none" } : { width, height })}
      className={cn(fill ? "w-full" : "shrink-0", "overflow-visible text-primary", className)}
      style={fill ? { height } : undefined}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinejoin="round"
        {...(fill ? { vectorEffect: "non-scaling-stroke" } : {})}
      />
    </svg>
  );
}

export type LabeledSparklineProps = {
  /** What the line plots, for example "CPU %". */
  label: string;
  values: number[];
  /** Formats a value for the max label and the single-sample text. */
  format: (value: number) => string;
  className?: string;
};

/**
 * A sparkline in a labelled tile: the label and the series maximum above the
 * line, "No samples" for none and "<value> (1 sample)" for one, since a line
 * needs two points.
 */
export function LabeledSparkline({ label, values, format, className }: LabeledSparklineProps) {
  const max = Math.max(...values, 0);
  const only = values[0];
  return (
    <div className={cn("rounded-lg border border-border bg-muted/50 px-2.5 py-density-2", className)} data-sparkline={label}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
        <span>{label}</span>
        <span>{values.length > 0 ? `max ${format(max)}` : ""}</span>
      </div>
      {values.length < 2 ? (
        <div className="mt-1 text-[11px] text-muted-foreground">
          {only === undefined ? "No samples" : `${format(only)} (1 sample)`}
        </div>
      ) : (
        <Sparkline fill values={values} label={`${label} over time`} width={160} height={36} className="mt-1" />
      )}
    </div>
  );
}
