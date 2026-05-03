import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "./Icon";

export type GaugeTone = "neutral" | "success" | "warning" | "danger" | "info";

export type GaugeProps = {
  label: ReactNode;
  value: number;
  max?: number;
  tone?: GaugeTone;
  suffix?: string;
  icon?: string | ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
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
  icon,
  subtitle,
  meta,
  className,
}: GaugeProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const displayValue = max === 100 ? value : pct;
  return (
    <div
      className={cn(
        "flex min-h-28 w-[15.5rem] shrink-0 flex-col rounded-lg border border-border bg-card p-3",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span className="inline-flex min-w-0 items-center gap-1.5">
          {icon ? <GaugeIcon icon={icon} /> : null}
          <span className="truncate">{label}</span>
        </span>
        {meta ? <span className="shrink-0 truncate">{meta}</span> : null}
      </div>
      <span
        className={cn("mt-2 text-2xl font-semibold tabular-nums tracking-tight", toneClass[tone])}
      >
        {displayValue}
        {suffix ? <span className="ml-0.5 text-sm opacity-60">{suffix}</span> : null}
      </span>
      {subtitle ? (
        <span className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</span>
      ) : null}
    </div>
  );
}

function GaugeIcon({ icon }: { icon: string | ReactNode }) {
  if (typeof icon === "string") {
    return <Icon name={icon} width={16} height={16} className="text-muted-foreground" />;
  }

  return (
    <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
      {icon}
    </span>
  );
}
