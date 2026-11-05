import type { ReactNode } from "react";
import { useResourceClock } from "../hooks/use-resource-clock";
import { cn } from "../lib/utils";
import { elapsedMs, formatDuration } from "../lib/format";

export interface ElapsedDurationProps {
  startedAt: string | undefined;
  finishedAt: string | undefined;
  /** Renders the elapsed milliseconds; defaults to the shared `formatDuration`. */
  format?: ((ms: number) => string) | undefined;
  /** Shown before the run has started; nothing is rendered by default. */
  fallback?: ReactNode;
  className?: string | undefined;
}

/**
 * A run's duration, derived from its timestamps because the wire carries none:
 * the span between them once finished, a once-a-second tick while it runs.
 */
export function ElapsedDuration({ startedAt, finishedAt, format = formatDuration, fallback = null, className }: ElapsedDurationProps) {
  const now = useResourceClock(!!startedAt && !finishedAt);
  const ms = elapsedMs(startedAt, finishedAt, now);
  if (ms === undefined) return <>{fallback}</>;
  return <span className={cn("tabular-nums", className)}>{format(ms)}</span>;
}
