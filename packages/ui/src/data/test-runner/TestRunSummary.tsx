import { Icon } from "../Icon";
import { ProgressBar, type ProgressSegment } from "../ProgressBar";
import { cn } from "../../lib/utils";
import { UiCheck, UiClock, UiLoader } from "../../icons";
import type { RunMeta, Test } from "./types";
import { sumNonTaskTests, type StatusCounts } from "./status";

export type TestRunSummaryProps = {
  tests: Test[];
  /** Run start, epoch ms (host-provided). */
  startTime?: number | null | undefined;
  /** Run end, epoch ms; falls back to `now` while running. */
  endTime?: number | null | undefined;
  done: boolean;
  /** Injected clock (epoch ms) so the component stays pure. */
  now?: number | undefined;
  runMeta?: RunMeta | undefined;
  className?: string | undefined;
};

function totals(tests: Test[]): StatusCounts {
  return tests.reduce(
    (acc, t) => {
      const s = sumNonTaskTests(t);
      (Object.keys(acc) as (keyof StatusCounts)[]).forEach((k) => (acc[k] += s[k]));
      return acc;
    },
    { total: 0, passed: 0, failed: 0, warned: 0, skipped: 0, pending: 0, running: 0, timedout: 0 },
  );
}

function pct(part: number, total: number): number {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

/**
 * Header summary: per-status counts, elapsed time, a stacked progress bar, and
 * pass/fail/pending gauge cards. Pure — elapsed time comes from injected `now`.
 */
export function TestRunSummary({
  tests,
  startTime,
  endTime,
  done,
  now,
  runMeta,
  className,
}: TestRunSummaryProps) {
  const t = totals(tests);
  const clock = now ?? 0;
  const end = done && endTime ? endTime : clock;
  const elapsed = startTime && end >= startTime ? `${((end - startTime) / 1000).toFixed(1)}s` : "";

  const segments: ProgressSegment[] = [
    { count: t.passed, color: "bg-green-500", label: "passed" },
    { count: t.skipped, color: "bg-yellow-400", label: "skipped" },
    { count: t.failed, color: "bg-red-500", label: "failed" },
    { count: t.timedout, color: "bg-amber-500", label: "timed out" },
    { count: t.running, color: "bg-blue-400", label: "running" },
    { count: t.pending, color: "bg-muted-foreground/40", label: "queued" },
  ];

  // Each status appears once, as a coloured count chip — no separate gauge-card
  // row repeating the same numbers as percentages.
  const chips: { n: number; label: string; tone: string }[] = [
    { n: t.passed, label: "passed", tone: "text-green-600 dark:text-green-400" },
    { n: t.failed, label: "failed", tone: "text-red-600 dark:text-red-400" },
    { n: t.timedout, label: "timed out", tone: "text-amber-600 dark:text-amber-400" },
    { n: t.skipped, label: "skipped", tone: "text-yellow-700 dark:text-yellow-500" },
    { n: t.running, label: "running", tone: "text-blue-600 dark:text-blue-400" },
    { n: t.pending, label: "queued", tone: "text-muted-foreground" },
  ];

  return (
    <div className={cn("flex min-w-[18rem] flex-col items-end gap-1.5", className)}>
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {t.total} tests
          {runMeta?.kind === "rerun" ? ` · rerun #${runMeta.sequence}` : ""}
        </span>
        {chips
          .filter((c) => c.n > 0)
          .map((c) => (
            <span key={c.label} className={c.tone}>
              {c.n} {c.label}
            </span>
          ))}
        {elapsed && (
          <span className="inline-flex items-center gap-1">
            <Icon icon={UiClock} className="text-xs" />
            {elapsed}
          </span>
        )}
        {done ? (
          <Icon icon={UiCheck} className="text-green-600 dark:text-green-400" />
        ) : (
          <Icon icon={UiLoader} className="animate-spin text-blue-500" />
        )}
      </div>

      {t.total > 0 && (
        <div className="flex w-72 items-center gap-2">
          <ProgressBar className="flex-1" segments={segments} total={t.total} height="h-2" />
          <span className="shrink-0 text-xs font-medium text-green-600 dark:text-green-400">
            {pct(t.passed, t.total)}%
          </span>
        </div>
      )}
    </div>
  );
}
