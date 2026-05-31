import { cn } from "../lib/utils";

export type ProgressSegment = {
  /** Numeric amount represented by this segment. */
  count: number;
  /** Tailwind/background class applied to this segment. */
  color: string;
  /** Label used in the tooltip. */
  label: string;
};

export type ProgressBarProps = {
  /** Segments rendered in order from left to right. */
  segments: ProgressSegment[];
  /** Total value used to calculate segment percentages. */
  total: number;
  /** Height utility class, e.g. `h-2`. */
  height?: string;
  /** Classes applied to the progressbar root. */
  className?: string;
};

export function ProgressBar({ segments, total, height = "h-2", className }: ProgressBarProps) {
  if (total === 0) return null;

  const tooltip = segments
    .filter((s) => s.count > 0)
    .map((s) => `${s.count} ${s.label}`)
    .join(", ");

  return (
    <div
      className={cn("w-full bg-muted rounded-full flex overflow-hidden", height, className)}
      title={tooltip}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={segments.reduce((acc, s) => acc + s.count, 0)}
    >
      {segments.map((seg, i) => {
        if (seg.count === 0) return null;
        const pct = (seg.count / total) * 100;
        return (
          <div
            key={i}
            className={cn(seg.color, height, "transition-all duration-300")}
            style={{ width: `${pct}%` }}
            title={`${seg.count} ${seg.label}`}
          />
        );
      })}
    </div>
  );
}
