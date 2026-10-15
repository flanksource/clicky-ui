import { cn } from "../../lib/utils";
import { sparklinePoints } from "./process-tree";

export type SparklineProps = {
  /** Values in order; at least two are needed to draw a line. */
  values: number[];
  /** Accessible description of what the line plots. */
  label: string;
  width?: number;
  height?: number;
  /** Classes applied to the svg; the stroke follows the text colour. */
  className?: string;
};

/** A dependency-free inline SVG line, scaled so the largest value touches the top. */
export function Sparkline({ values, label, width = 64, height = 16, className }: SparklineProps) {
  const points = sparklinePoints(values, width, height);
  if (!points) return null;
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("shrink-0 overflow-visible text-primary", className)}
    >
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth={1.25} strokeLinejoin="round" />
    </svg>
  );
}
