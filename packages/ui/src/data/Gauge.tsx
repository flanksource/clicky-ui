import type { ReactNode } from "react";
import { cn } from "../lib/utils";

export type GaugeTone = "neutral" | "success" | "warning" | "danger" | "info";

export type GaugeProps = {
  label: ReactNode;
  value: number;
  max?: number;
  tone?: GaugeTone;
  suffix?: string;
  className?: string;
};

const toneClass: Record<GaugeTone, string> = {
  neutral: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
};

export function Gauge({
  label,
  value,
  max = 100,
  tone = "neutral",
  suffix = "%",
  className,
}: GaugeProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-0.5 rounded-md border border-border bg-background px-density-3 py-density-2",
        className,
      )}
    >
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={cn("text-lg font-semibold tabular-nums", toneClass[tone])}>
        {max === 100 ? value : pct}
        <span className="text-xs ml-0.5 opacity-60">{suffix}</span>
      </span>
    </div>
  );
}
