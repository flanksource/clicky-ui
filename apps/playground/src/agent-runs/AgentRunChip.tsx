import { useState } from "react";
import { Badge, type Comment } from "@flanksource/clicky-ui";
import { AgentSendFailure } from "./AgentSendFailure";
import { RuntimeIdentity } from "./RuntimeIdentity";
import type { AgentTarget, AgentSession } from "./agent-runs-api";

type AgentRun = NonNullable<Comment["agentRun"]>;

const STATE_LABEL: Record<AgentRun["state"], string> = {
  queued: "queued",
  sent: "sent",
  done: "done",
  error: "failed",
};

function runTone(state: AgentRun["state"]) {
  return state === "error" ? "danger" : state === "done" ? "success" : "info";
}

/**
 * The "sent to agent session" chip under a comment. A failed hand-off opens
 * its error details; otherwise a playground session opens its panel, and a
 * captain target (not one of the playground's sessions) is a plain label.
 */
export function AgentRunChip({ comment, onOpen, onRetry, managedSessions = [] }: { comment: Comment; onOpen: (sessionId?: string) => void; onRetry: (target?: AgentTarget) => Promise<void>; managedSessions?: AgentSession[] }) {
  const [showFailure, setShowFailure] = useState(false);
  const run = comment.agentRun;
  if (!run) return null;
  const session = managedSessions.find(entry => entry.sessionId === run.sessionId);
  const where = run.target
    ? `Sent to ${run.target.label}${run.target.channel ? ` via ${run.target.channel}` : ""}`
    : "Sent to agent session";
  const badge = (
    <Badge tone={runTone(run.state)} variant="soft" clickToCopy={false} className="max-w-full overflow-hidden [&>span]:truncate">
      {session && <RuntimeIdentity runtime={session.runtime} />}
      {run.state === "error" ? "Send failed" : `${where} · ${STATE_LABEL[run.state]}`}
    </Badge>
  );
  const buttonClass = "inline-flex max-w-full items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (run.state === "error") {
    return (
      <>
        <button type="button" onClick={() => setShowFailure(true)} title="Show why the hand-off failed" className={buttonClass}>
          {badge}
        </button>
        {showFailure && (
          <AgentSendFailure
            managedSessions={managedSessions}
            comment={comment}
            error={run.error ?? "The hand-off failed without recording an error."}
            onRetry={onRetry}
            onClose={() => setShowFailure(false)}
            onOpen={onOpen}
          />
        )}
      </>
    );
  }
  if (run.target) {
    return (
      <span title={where} className="inline-flex items-center">
        {badge}
      </span>
    );
  }
  return (
    <button type="button" onClick={() => onOpen(run.sessionId)} title="Open the agent session" className={buttonClass}>
      {badge}
    </button>
  );
}
