import { cn } from "../lib/utils";
import { SessionTailLine } from "./ai/SessionTail.line";
import type { TailLatest } from "./ai/SessionTail.model";
import { SessionContextMeter } from "./ai/SessionViewer.header";
import type { SessionMetadataSummary } from "./ai/SessionViewer.model";
import type { TaskSessionSummary } from "./TaskSnapshot";

const actionsLabel = (count: number) => `${count} ${count === 1 ? "action" : "actions"}`;

/** The meter reads a free percentage; a count past the window is fully used. A
 *  window of zero tokens is unknown, and the line shows no gauge for it. */
function contextMetadata({ context }: TaskSessionSummary): SessionMetadataSummary {
  if (!context) return {};
  const used = Math.min(100, Math.max(0, Math.round((context.usedTokens / context.windowTokens) * 100)));
  return { context: { usedTokens: context.usedTokens, windowTokens: context.windowTokens, freePercent: 100 - used } };
}

function tailLatest({ latest }: TaskSessionSummary): TailLatest | undefined {
  return latest && { kind: latest.kind, text: latest.text, ...(latest.tool ? { tool: latest.tool } : {}) };
}

/**
 * The "/context" line of a session a task drives — model, context-window
 * gauge, action count and the newest tool call or text — drawn straight from
 * the summary the server computed. It reads and follows nothing.
 */
export function SessionSummaryLine({ summary, className }: { summary: TaskSessionSummary; className?: string }) {
  return (
    <div
      data-testid="session-task-summary"
      {...(summary.activity ? { "data-activity": summary.activity } : {})}
      className={cn("flex min-w-0 items-center gap-2 text-xs text-muted-foreground", className)}
    >
      {summary.model && (
        <span
          title={summary.model}
          className="max-w-40 shrink-0 truncate rounded-full border border-border px-1.5 py-0 text-[10px] font-medium text-foreground"
        >
          {summary.model}
        </span>
      )}
      {summary.context && summary.context.windowTokens > 0 && (
        <span className="inline-flex size-6 shrink-0 items-center justify-center">
          <span className="inline-flex scale-[0.66]">
            <SessionContextMeter metadata={contextMetadata(summary)} mode="gauge" className="p-0" />
          </span>
        </span>
      )}
      <span className="shrink-0 tabular-nums">{actionsLabel(summary.actions)}</span>
      <div className="min-w-0 flex-1">
        <SessionTailLine latest={tailLatest(summary)} />
      </div>
    </div>
  );
}
