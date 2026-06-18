import { isValidElement, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon, type StaticIconComponent } from "./Icon";

export type GaugeTone = "neutral" | "success" | "warning" | "danger" | "info";
export type GaugeVariant = "default" | "cell";

export type GaugeProps = {
  label: ReactNode;
  value: number;
  max?: number;
  tone?: GaugeTone;
  suffix?: string;
  icon?: string | StaticIconComponent | ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  /** Visual density/layout. `cell` is a compact inline form for table/grid cells. */
  variant?: GaugeVariant;
  /** Show the text label. Icons and values remain visible when false. */
  showLabel?: boolean;
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
  variant = "default",
  showLabel = true,
  className,
}: GaugeProps) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const displayValue = max === 100 ? value : pct;
  const labelText =
    typeof label === "string" || typeof label === "number" ? String(label) : undefined;
  const valueNode = (
    <span className={cn("font-semibold tabular-nums", toneClass[tone])}>
      {displayValue}
      {suffix ? <span className="ml-0.5 text-[0.85em] opacity-60">{suffix}</span> : null}
    </span>
  );

  if (variant === "cell") {
    return (
      <span
        className={cn(
          "inline-flex min-w-0 items-center gap-1.5 whitespace-nowrap align-middle text-xs",
          className,
        )}
        title={labelText}
        aria-label={!showLabel ? labelText : undefined}
      >
        {icon ? <GaugeIcon icon={icon} /> : null}
        {showLabel ? (
          <span className="min-w-0 truncate text-muted-foreground">{label}</span>
        ) : null}
        {valueNode}
        {meta ? <span className="shrink-0 truncate text-muted-foreground">{meta}</span> : null}
      </span>
    );
  }

  const showHeader = icon || showLabel || meta;

  return (
    <div
      className={cn(
        "flex min-h-28 w-[15.5rem] shrink-0 flex-col rounded-lg border border-border bg-card p-3",
        className,
      )}
      title={!showLabel ? labelText : undefined}
      aria-label={!showLabel ? labelText : undefined}
    >
      {showHeader ? (
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            {icon ? <GaugeIcon icon={icon} /> : null}
            {showLabel ? <span className="truncate">{label}</span> : null}
          </span>
          {meta ? <span className="shrink-0 truncate">{meta}</span> : null}
        </div>
      ) : null}
      <span
        className={cn(
          showHeader && "mt-2",
          "text-2xl font-semibold tabular-nums tracking-tight",
          toneClass[tone],
        )}
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

function GaugeIcon({ icon }: { icon: string | StaticIconComponent | ReactNode }) {
  if (typeof icon === "string") {
    return <Icon name={icon} width={16} height={16} className="text-muted-foreground" />;
  }
  if (isValidElement(icon)) {
    return (
      <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground [&>svg]:h-4 [&>svg]:w-4">
        {icon}
      </span>
    );
  }

  return (
    <Icon
      icon={icon as StaticIconComponent}
      width={16}
      height={16}
      className="text-muted-foreground"
    />
  );
}
