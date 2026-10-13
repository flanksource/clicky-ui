import { LogViewer } from "../LogViewer";
import { cn } from "../../lib/utils";
import { Expectation } from "./Expectation";
import type { FailureDetail, Test, TestAttempt } from "./types";
import { formatTestDuration } from "./status";

/** Renders a structured failure: its summary, the expectation, and the stack. */
export function TestFailureDetail({ failure }: { failure: FailureDetail }) {
  const hasExpectation = !!(
    failure.matcher ||
    failure.expected ||
    failure.actual ||
    failure.location
  );
  return (
    <div className="space-y-2">
      {failure.summary && (
        <p className="text-sm font-medium text-red-700 dark:text-red-300">{failure.summary}</p>
      )}
      {hasExpectation && (
        <Expectation
          check={failure.matcher}
          expected={failure.expected || undefined}
          actual={failure.actual || undefined}
          location={failure.location}
        />
      )}
      {failure.stack && <LogViewer logs={failure.stack} collapsedLines={6} />}
    </div>
  );
}

// A quarter of the detail pane, which TestDetailPanel makes a size container.
const OUTPUT_MAX_HEIGHT = "25cqh";

/** stdout / stderr as terminal blocks, each scrolling within a quarter of the detail pane. */
export function TestOutput({ node }: { node: Test }) {
  if (!node.stdout && !node.stderr) return null;
  return (
    <div className="space-y-3">
      {node.stdout && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">stdout</div>
          <LogViewer logs={node.stdout} variant="terminal" maxHeight={OUTPUT_MAX_HEIGHT} />
        </div>
      )}
      {node.stderr && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">stderr</div>
          <LogViewer
            logs={node.stderr}
            variant="terminal"
            maxHeight={OUTPUT_MAX_HEIGHT}
            borderClass="border-red-500/70"
          />
        </div>
      )}
    </div>
  );
}

function attemptTone(a: TestAttempt): string {
  if (a.failed || a.timed_out) return "text-red-600 dark:text-red-400";
  if (a.passed) return "text-green-600 dark:text-green-400";
  return "text-muted-foreground";
}

/** Prior attempts list for flaky/reran tests. */
export function TestAttempts({ attempts }: { attempts: TestAttempt[] }) {
  if (attempts.length === 0) return null;
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        Attempts ({attempts.length})
      </div>
      <ul className="divide-y divide-border rounded-md border border-border text-xs">
        {attempts.map((a) => (
          <li key={a.sequence} className="flex items-center justify-between gap-2 px-2 py-1">
            <span className={cn("font-medium", attemptTone(a))}>
              #{a.sequence} {a.run_kind ?? ""}
            </span>
            <span className="truncate text-muted-foreground">{a.message}</span>
            {a.duration ? (
              <span className="shrink-0 text-muted-foreground">{formatTestDuration(a.duration)}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
