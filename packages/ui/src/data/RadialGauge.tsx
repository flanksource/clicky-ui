import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import type { GaugeTone } from "./Gauge";

export type RadialGaugeProps = {
  /** Current value. Clamped to [0, max]. */
  value: number;
  /** Value that fills the ring completely. */
  max?: number;
  /** Outer diameter in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  thickness?: number;
  /** Arc color. Defaults to neutral. */
  tone?: GaugeTone;
  /** Content rendered centered inside the ring (icon, number, …). */
  center?: ReactNode;
  /** Text rendered to the right of the ring. */
  label?: ReactNode;
  /** Native tooltip / accessible title. */
  title?: string;
  /** Classes applied to the root flex row. */
  className?: string;
};

const arcToneClass: Record<GaugeTone, string> = {
  neutral: "text-foreground",
  success: "text-green-500",
  warning: "text-yellow-500",
  danger: "text-red-500",
  info: "text-blue-500",
};

export function RadialGauge({
  value,
  max = 100,
  size = 28,
  thickness = 3,
  tone = "neutral",
  center,
  label,
  title,
  className,
}: RadialGaugeProps) {
  const clamped = Math.max(0, Math.min(max, value));
  const pct = max > 0 ? clamped / max : 0;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <span
      className={cn("inline-flex items-center gap-1.5", className)}
      title={title}
      role="meter"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            className="text-muted-foreground/20"
            stroke="currentColor"
            fill="none"
            strokeWidth={thickness}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className={cn("transition-[stroke-dashoffset] duration-500", arcToneClass[tone])}
            stroke="currentColor"
            fill="none"
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        {center != null && (
          <span className="absolute inset-0 flex items-center justify-center">{center}</span>
        )}
      </span>
      {label != null && <span className="text-xs text-muted-foreground">{label}</span>}
    </span>
  );
}
