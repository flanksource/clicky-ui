import { cn } from "../lib/utils";

export type ProgressSegment = {
  count: number;
  color: string;
  label: string;
};

export type ProgressBarProps = {
  segments: ProgressSegment[];
  total: number;
  height?: string;
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
