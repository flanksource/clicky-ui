import { useEffect, useState } from "react";
import { Badge, formatDuration } from "@flanksource/clicky-ui";
import type { BuildLogEntry } from "./build-log.ts";

const elapsed = (ms: number) => `+${(ms / 1000).toFixed(2)}s`;

/** A timed page-load log; while `live`, the running step's duration ticks from `startedAt` (epoch ms of the first step). */
export function BuildLog({ entries, live, startedAt, className = "" }: { entries: BuildLogEntry[]; live: boolean; startedAt?: number; className?: string }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(timer);
  }, [live]);
  return <ol role="log" aria-live="polite" aria-label="Build log" className={`space-y-0.5 font-mono text-xs ${className}`}>
    {entries.map((entry, index) => {
      const running = entry.durationMs === null && live && startedAt !== undefined;
      const duration = entry.durationMs ?? (running ? Math.max(0, now - startedAt - entry.offsetMs) : null);
      return <li key={index} className={`grid grid-cols-[4.5rem_5.5rem_1fr_auto] items-baseline gap-2 ${entry.error ? "text-destructive" : ""}`}>
        <span className="tabular-nums text-muted-foreground">{elapsed(entry.offsetMs)}</span>
        <span><Badge>{entry.source}</Badge></span>
        <span className="min-w-0 break-words">{entry.label}{entry.error ? `: ${entry.error}` : ""}</span>
        <span className="tabular-nums text-muted-foreground">{duration === null ? "" : running ? `${formatDuration(duration)}…` : formatDuration(duration)}</span>
      </li>;
    })}
  </ol>;
}
