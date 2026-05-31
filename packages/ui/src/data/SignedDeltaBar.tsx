import { cn } from "../lib/utils";

export type SignedDeltaBarProps = {
  /** Signed value to visualize. Negative grows left, positive grows right. */
  value: number;
  /** Magnitude (in `value` units) that maps to a full half-bar. Larger values clamp. */
  max?: number;
  /**
   * When false the bar renders muted, signalling the delta is not meaningful
   * (e.g. below a statistical-significance threshold).
   */
  significant?: boolean;
  /**
   * Treat positive values as the "bad" direction (red) and negative as "good"
   * (green). Benchmarks pass `true` — a positive runtime delta is a regression.
   * Defaults to `false`, where positive is green and negative is red.
   */
  positiveIsBad?: boolean;
  /** Formats the trailing label. Defaults to a signed two-decimal percentage. */
  format?: (value: number) => string;
  /** Height utility class, e.g. `h-4`. */
  height?: string;
  /** Classes applied to the root. */
  className?: string;
};

function defaultFormat(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

export function SignedDeltaBar({
  value,
  max = 50,
  significant = true,
  positiveIsBad = false,
  format = defaultFormat,
  height = "h-4",
  className,
}: SignedDeltaBarProps) {
  const clamped = Math.max(-max, Math.min(max, value));
  const halfWidthPct = (Math.abs(clamped) / max) * 50;

  const isBad = significant && (positiveIsBad ? value > 0 : value < 0);
  const isGood = significant && (positiveIsBad ? value < 0 : value > 0);
  const barColor = isBad ? "bg-red-500" : isGood ? "bg-green-500" : "bg-muted-foreground/40";
  const textColor = isBad
    ? "text-red-600 dark:text-red-400"
    : isGood
      ? "text-green-600 dark:text-green-400"
      : "text-muted-foreground";

  return (
    <div className={cn("flex items-center gap-2 w-full", className)}>
      <div
        className={cn("relative flex-1 min-w-[80px] bg-muted rounded overflow-hidden", height)}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={-max}
        aria-valuemax={max}
      >
        <div className="absolute inset-y-0 left-1/2 w-px bg-border" />
        <div
          className={cn("absolute inset-y-0", barColor)}
          style={
            value >= 0
              ? { left: "50%", width: `${halfWidthPct}%` }
              : { right: "50%", width: `${halfWidthPct}%` }
          }
        />
      </div>
      <span
        className={cn(
          "text-xs tabular-nums w-16 text-right",
          textColor,
          significant && "font-semibold",
        )}
      >
        {format(value)}
      </span>
    </div>
  );
}
