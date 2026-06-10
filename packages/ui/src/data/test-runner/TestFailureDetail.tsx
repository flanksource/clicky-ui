import { LogViewer } from "../LogViewer";
import { cn } from "../../lib/utils";
import type { FailureDetail, Test, TestAttempt } from "./types";
import { formatTestDuration } from "./status";

function Field({
  label,
  value,
  mono,
}: {
  label: string;
  value: string | undefined;
  mono?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <pre
        className={cn(
          "whitespace-pre-wrap break-words rounded-md bg-muted p-2 text-xs",
          mono && "font-mono",
        )}
      >
        {value}
      </pre>
    </div>
  );
}

/** Renders a structured failure (expected/actual/matcher/location/stack). */
export function TestFailureDetail({ failure }: { failure: FailureDetail }) {
  return (
    <div className="space-y-3 rounded-md border border-red-200 bg-red-50/50 p-3 dark:border-red-900 dark:bg-red-950/30">
      {failure.summary && (
        <p className="text-sm font-medium text-red-700 dark:text-red-300">{failure.summary}</p>
      )}
      <Field label="Matcher" value={failure.matcher} mono />
      <Field label="Expected" value={failure.expected} mono />
      <Field label="Actual" value={failure.actual} mono />
      <Field label="Location" value={failure.location} mono />
      {failure.stack && <LogViewer logs={failure.stack} collapsedLines={6} />}
    </div>
  );
}

/** stdout / stderr blocks, each via the collapsible LogViewer. */
export function TestOutput({ node }: { node: Test }) {
  if (!node.stdout && !node.stderr) return null;
  return (
    <div className="space-y-3">
      {node.stdout && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">stdout</div>
          <LogViewer logs={node.stdout} />
        </div>
      )}
      {node.stderr && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">stderr</div>
          <LogViewer logs={node.stderr} borderClass="border-red-300 dark:border-red-900" />
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
