import { Icon } from "../Icon";
import { ProgressBar, type ProgressSegment } from "../ProgressBar";
import { cn } from "../../lib/utils";
import { UiClock, UiLoader } from "../../icons";
import type { RunMeta, Test } from "./types";
import { aggregateStatusCounts, type TestOutcome } from "./status";
import { TEST_OUTCOMES } from "./marks";
import { OutcomeIcon } from "./MarkIcons";

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
  /**
   * Single-line layout for embedding in a host header (e.g. a dialog header):
   * counts + a short inline progress bar on one row, instead of the default
   * two-line right-aligned column.
   */
  compact?: boolean | undefined;
  className?: string | undefined;
};

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
  compact = false,
  className,
}: TestRunSummaryProps) {
  const t = aggregateStatusCounts(tests);
  const clock = now ?? 0;
  const end = done && endTime ? endTime : clock;
  const elapsed = startTime && end >= startTime ? `${((end - startTime) / 1000).toFixed(1)}s` : "";

  const segments: ProgressSegment[] = [
    { count: t.passed, color: "bg-green-500", label: "passed" },
    { count: t.skipped, color: "bg-yellow-400", label: "skipped" },
    { count: t.failed, color: "bg-red-500", label: "failed" },
    { count: t.warned, color: "bg-amber-400", label: "warned" },
    { count: t.timedout, color: "bg-amber-500", label: "timed out" },
    { count: t.running, color: "bg-blue-400", label: "running" },
    { count: t.pending, color: "bg-muted-foreground/40", label: "queued" },
  ];

  // Each status appears once, as its outcome mark and a count — the same
  // glyphs the tree uses, so the header reads in the tree's vocabulary.
  const chips: { n: number; label: string; outcome: TestOutcome }[] = [
    { n: t.passed, label: "passed", outcome: "passed" },
    { n: t.failed, label: "failed", outcome: "failed" },
    { n: t.warned, label: "warned", outcome: "warned" },
    { n: t.timedout, label: "timed out", outcome: "timedout" },
    { n: t.skipped, label: "skipped", outcome: "skipped" },
    { n: t.running, label: "running", outcome: "running" },
    { n: t.pending, label: "queued", outcome: "pending" },
  ];
  const chipRow = chips
    .filter((c) => c.n > 0)
    .map((c) => (
      <span
        key={c.label}
        className={cn(
          "inline-flex items-center gap-0.5 tabular-nums",
          TEST_OUTCOMES[c.outcome].className,
        )}
        aria-label={`${c.n} ${c.label}`}
        title={`${c.n} ${c.label}`}
        data-summary-outcome={c.outcome}
      >
        <OutcomeIcon outcome={c.outcome} />
        {c.n}
      </span>
    ));

  if (compact) {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground",
          className,
        )}
      >
        <span className="font-medium text-foreground">
          {t.total} {t.total === 1 ? "test" : "tests"}
          {runMeta?.kind === "rerun" ? ` · rerun #${runMeta.sequence}` : ""}
        </span>
        {chipRow}
        {elapsed && (
          <span className="inline-flex items-center gap-1">
            <Icon icon={UiClock} className="text-xs" />
            {elapsed}
          </span>
        )}
        {t.total > 0 && (
          <span className="inline-flex items-center gap-1.5">
            <ProgressBar className="w-24" segments={segments} total={t.total} height="h-1.5" />
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              {pct(t.passed, t.total)}%
            </span>
          </span>
        )}
        {!done && <Icon icon={UiLoader} className="animate-spin text-blue-500" />}
      </div>
    );
  }

  return (
    <div className={cn("flex min-w-[18rem] flex-col items-end gap-1.5", className)}>
      <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">
          {t.total} {t.total === 1 ? "test" : "tests"}
          {runMeta?.kind === "rerun" ? ` · rerun #${runMeta.sequence}` : ""}
        </span>
        {chipRow}
        {elapsed && (
          <span className="inline-flex items-center gap-1">
            <Icon icon={UiClock} className="text-xs" />
            {elapsed}
          </span>
        )}
        {!done && <Icon icon={UiLoader} className="animate-spin text-blue-500" />}
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
