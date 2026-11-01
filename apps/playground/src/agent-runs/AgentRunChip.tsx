import { useState } from "react";
import { Badge, Button, ErrorDetails, Modal, type Comment } from "@flanksource/clicky-ui";

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

function failureContext(run: AgentRun, where: string): Array<[string, string]> {
  return [
    ["Target", run.target?.label ?? where],
    ...(run.target?.channel ? [["Channel", run.target.channel] as [string, string]] : []),
    ...(run.sessionId ? [["Session", run.sessionId] as [string, string]] : []),
    ["Requested", run.requestedAt],
  ];
}

/**
 * The "sent to agent session" chip under a comment. A failed hand-off opens
 * its error details; otherwise a playground session opens its panel, and a
 * captain target (not one of the playground's sessions) is a plain label.
 */
export function AgentRunChip({ comment, onOpen }: { comment: Comment; onOpen: (sessionId?: string) => void }) {
  const [showFailure, setShowFailure] = useState(false);
  const run = comment.agentRun;
  if (!run) return null;
  const where = run.target
    ? `Sent to ${run.target.label}${run.target.channel ? ` via ${run.target.channel}` : ""}`
    : "Sent to agent session";
  const badge = (
    <Badge tone={runTone(run.state)} variant="soft" clickToCopy={false}>
      {where} · {STATE_LABEL[run.state]}
    </Badge>
  );
  const buttonClass = "inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  if (run.state === "error") {
    return (
      <>
        <button type="button" onClick={() => setShowFailure(true)} title="Show why the hand-off failed" className={buttonClass}>
          {badge}
        </button>
        <Modal
          open={showFailure}
          onClose={() => setShowFailure(false)}
          title="Agent run failed"
          size="lg"
          footer={
            !run.target && (
              <Button variant="outline" onClick={() => onOpen(run.sessionId)}>
                Open session
              </Button>
            )
          }
        >
          <ErrorDetails
            title={where}
            diagnostics={{
              message: run.error ?? "The hand-off failed without recording an error.",
              context: failureContext(run, where),
            }}
          />
        </Modal>
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
