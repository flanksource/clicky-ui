import { UiClock } from "../icons";
import { HoverCard, type HoverCardPlacement } from "../overlay/HoverCard";
import {
  formatServerTimingDuration,
  serverTimingCounterSummary,
  serverTimingMetricLabel,
  type ServerTimingMetric,
} from "./server-timing";

export interface ServerTimingBadgeProps {
  metrics?: readonly ServerTimingMetric[];
  placement?: HoverCardPlacement;
  className?: string;
}

export function ServerTimingBadge({
  metrics,
  placement = "bottom",
  className,
}: ServerTimingBadgeProps) {
  const total = metrics?.find((metric) => metric.name === "total");
  if (!total) return null;
  const phases = metrics?.filter((metric) => metric.name !== "total") ?? [];
  const slowest = Math.max(1, ...phases.map((phase) => phase.duration));

  return (
    <HoverCard
      placement={placement}
      arrow={false}
      trigger={
        <button
          type="button"
          aria-label="Show server timing"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-xs tabular-nums text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <UiClock className="h-3.5 w-3.5" />
          {formatServerTimingDuration(total.duration)}
        </button>
      }
      cardClassName="w-64 whitespace-normal p-2.5"
      className={className}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-4 text-xs font-medium">
          <span className="text-foreground">Server timing</span>
          <span className="tabular-nums text-muted-foreground">
            {formatServerTimingDuration(total.duration)}
          </span>
        </div>
        {phases.length === 0 ? (
          <div className="text-[11px] text-muted-foreground">No phase breakdown.</div>
        ) : (
          <ul className="space-y-2">
            {phases.map((phase, index) => {
              const counterSummary = serverTimingCounterSummary(phase);
              return (
                <li key={`${phase.name}-${index}`}>
                  <div className="flex items-center justify-between gap-4 text-[11px]">
                    <span className="text-muted-foreground">
                      {serverTimingMetricLabel(phase)}
                    </span>
                    <span className="shrink-0 tabular-nums text-foreground">
                      {formatServerTimingDuration(phase.duration)}
                    </span>
                  </div>
                  {counterSummary ? (
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {counterSummary}
                    </div>
                  ) : null}
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary/70"
                      style={{
                        width:
                          phase.duration === 0
                            ? "0%"
                            : `${Math.max((phase.duration / slowest) * 100, 4)}%`,
                      }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </HoverCard>
  );
}
