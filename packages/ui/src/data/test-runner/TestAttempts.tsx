import { cn } from "../../lib/utils";
import { formatTestDuration } from "./status";
import type { TestAttempt } from "./types";

export function TestAttempts({ attempts }: { attempts: TestAttempt[] }) {
  if (attempts.length === 0) return null;
  return (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        Attempts ({attempts.length})
      </div>
      <ul className="divide-y divide-border rounded-md border border-border text-xs">
        {attempts.map((attempt) => (
          <li key={attempt.sequence} className="flex items-center justify-between gap-2 px-2 py-1">
            <span
              className={cn(
                "font-medium",
                attempt.failed || attempt.timed_out
                  ? "text-red-600 dark:text-red-400"
                  : attempt.passed
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground",
              )}
            >
              #{attempt.sequence} {attempt.run_kind ?? ""}
            </span>
            <span className="truncate text-muted-foreground">{attempt.message}</span>
            {attempt.duration ? (
              <span className="shrink-0 text-muted-foreground">
                {formatTestDuration(attempt.duration)}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
