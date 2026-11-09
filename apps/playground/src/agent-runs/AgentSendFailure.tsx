import { useState } from "react";
import { Button, ErrorDetails, Modal, SplitButton, type Comment } from "@flanksource/clicky-ui";
import type { AgentTarget, AgentSession } from "./agent-runs-api";
import { useSendTargets } from "./useSendTargets";

export function AgentSendFailure({ comment, error, targetLabel, onRetry, onClose, onOpen, managedSessions = [] }: {
  managedSessions?: AgentSession[];
  comment: Comment;
  error: string;
  targetLabel?: string;
  onRetry: (target?: AgentTarget) => Promise<void>;
  onClose: () => void;
  onOpen: (sessionId?: string) => void;
}) {
  const [sending, setSending] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);
  const [retryTarget, setRetryTarget] = useState<AgentTarget>();
  const run = comment.agentRun;
  const target = retryTarget ? retryTarget.kind !== "playground" ? retryTarget.label : "Playground agent" : targetLabel ?? run?.target?.label ?? "Configured agent session";
  const detail = retryError ?? error;
  const reason = /failed \(exit \d+\): ([^\r\n]+)$/.exec(detail)?.[1] ?? detail;

  const retry = async (next?: AgentTarget) => {
    setSending(true);
    setRetryError(null);
    if (next) setRetryTarget(next);
    const destination = next ?? retryTarget;
    try {
      if (destination) await onRetry(destination);
      else await onRetry();
      onClose();
    } catch (cause) {
      setRetryError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setSending(false);
    }
  };
  const { items: targets, error: sessionsError, loading: sessionsLoading } = useSendTargets({ managedSessions, onSelect: next => void retry(next) });

  return (
    <Modal
      open
      onClose={onClose}
      title="Could not send thread"
      size="lg"
      footer={
        <div className="flex flex-wrap justify-end gap-2">
          {!run?.target && run?.sessionId && (
            <Button variant="outline" onClick={() => onOpen(run.sessionId)}>Open session</Button>
          )}
          <Button variant="outline" onClick={onClose}>Close</Button>
          <SplitButton label={sending ? "Sending…" : "Retry send"} loading={sending} disabled={sending} onClick={() => void retry()} title="Send to another target" items={targets} menuClassName="max-h-72 max-w-[calc(100vw-2rem)] overflow-auto" />
        </div>
      }
    >
      <div className="min-w-0 space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Send comments to</p>
          <p className="break-words text-sm font-medium">{target}</p>
        </div>
        {retryError && <p role="alert" className="text-sm text-destructive">Retry failed. See technical details for the latest error.</p>}
        {sessionsError && <p role="alert" className="text-xs text-destructive">{sessionsError}</p>}
        {sessionsLoading && <p role="status" className="text-xs text-muted-foreground">Loading Captain sessions…</p>}
        <ErrorDetails
          key={detail}
          title="Technical details"
          diagnostics={{
            message: reason.length <= 240 && !/[\r\n]/.test(reason)
              ? reason
              : "The thread could not be sent. Retry the send, or choose another agent session.",
            context: [
              ["Thread", comment.id],
              ["Target", target],
              ...(run?.sessionId ? [["Session", run.sessionId] as [string, string]] : []),
              ...(run?.requestedAt ? [["Requested", run.requestedAt] as [string, string]] : []),
              ...(run?.target?.channel ? [["Channel", run.target.channel] as [string, string]] : []),
            ],
            details: [{ label: "Delivery error", value: detail }],
          }}
        />
      </div>
    </Modal>
  );
}
