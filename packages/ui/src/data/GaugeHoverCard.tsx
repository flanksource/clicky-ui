import { Fragment, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { HoverCard, type HoverCardPlacement } from "../overlay/HoverCard";

export interface GaugeHoverRow {
  /** Row label, e.g. "Current", "Min", "Capacity". */
  label: string;
  /** Pre-formatted value (already unit-scaled by the caller). */
  value: string;
  /** Optional text-tone class for the value (e.g. a threshold colour). */
  tone?: string;
}

export interface GaugeHoverCardProps {
  /** Card heading — the metric label. */
  title: string;
  /** Stat rows (current/min/max/…) rendered as a definition list. */
  rows: GaugeHoverRow[];
  /** Optional footer note, e.g. the look-back window. */
  footer?: ReactNode;
  /** The gauge visual that opens the card on hover/focus. */
  trigger: ReactNode;
  placement?: HoverCardPlacement;
  /** Classes for the HoverCard trigger wrapper (e.g. to keep a block gauge centred). */
  className?: string;
}

// GaugeHoverCard wraps a gauge's visual in a HoverCard whose body lists the
// metric's label and its current/min/max/avg/capacity readings. Shared by
// TimeseriesGauge and TimeseriesCoreBars so both surface the same hover summary.
export function GaugeHoverCard({
  title,
  rows,
  footer,
  trigger,
  placement = "top",
  className,
}: GaugeHoverCardProps) {
  return (
    <HoverCard
      placement={placement}
      delay={150}
      trigger={trigger}
      cardClassName="min-w-[9rem]"
      {...(className ? { className } : {})}
    >
      <div className="flex flex-col gap-1 text-[11px]">
        <div className="font-medium text-foreground">{title}</div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 tabular-nums">
          {rows.map((r) => (
            <Fragment key={r.label}>
              <dt className="text-muted-foreground">{r.label}</dt>
              <dd className={cn("text-right font-medium text-foreground", r.tone)}>
                {r.value}
              </dd>
            </Fragment>
          ))}
        </dl>
        {footer ? (
          <div className="mt-0.5 text-[10px] text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </HoverCard>
  );
}
