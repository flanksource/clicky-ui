import { useState, type ReactNode } from "react";
import {
  Button,
  DOCUMENT_ANCHOR,
  ErrorDetails,
  ErrorWrapper,
  InputField,
  SplitButton,
  useCommentContext,
  type Comment,
  type ErrorDiagnostics,
} from "@flanksource/clicky-ui";
import { useAgentRuns } from "./agent-runs/AgentRunsProvider";
import type { AgentTarget } from "./agent-runs/agent-runs-api";
import { useSendTargets } from "./agent-runs/useSendTargets";
import {
  COMMENTS_ROUTE,
  PLAYGROUND_COMMENT_AUTHOR,
  request,
} from "./comments/useComments";

export function PageErrorBoundary({
  page,
  children,
}: {
  page: string;
  children: ReactNode;
}) {
  return (
    <ErrorWrapper
      key={page}
      renderFallback={({ report, diagnostics }) => (
        <PageError page={page} report={report} diagnostics={diagnostics} />
      )}
    >
      {children}
    </ErrorWrapper>
  );
}

function PageError({
  page,
  report,
  diagnostics,
}: {
  page: string;
  report: string;
  diagnostics: ErrorDiagnostics;
}) {
  const comments = useCommentContext();
  const agents = useAgentRuns();
  const [note, setNote] = useState("");
  const [comment, setComment] = useState<Comment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const body = `Playground page: ${page}\n\n${report}${note.trim() ? `\n\n${note.trim()}` : ""}`;
  const post = async (send: boolean, target?: AgentTarget) => {
    setBusy(true);
    setError("");
    // Auto-run delivers a new comment as it is posted, so the page must already point at the chosen session.
    const autoRun = comment === null && agents.data?.settings.autoRun === true;
    try {
      if (send && target && autoRun) await agents.setTarget(target);
      const saved =
        comment ??
        (await request<Comment>(COMMENTS_ROUTE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            page,
            body,
            anchor: DOCUMENT_ANCHOR,
            author: PLAYGROUND_COMMENT_AUTHOR,
            element: { source: `apps/playground/src/pages/${page}.tsx` },
          }),
        }));
      setComment(saved);
      window.dispatchEvent(new Event("playground-feedback-updated"));
      comments.focusAnchor(DOCUMENT_ANCHOR);
      if (send && !autoRun) await agents.start(saved, target);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };
  const targets = useSendTargets({
    managedSessions: agents.data?.sessions ?? [],
    onSelect: (target) => void post(true, target),
  });
  return (
    <section
      className="space-y-3 rounded-md border border-destructive/30 p-4"
      aria-label="Page error"
    >
      <h2 className="text-lg font-semibold">This playground page failed</h2>
      <p className="text-sm text-muted-foreground">
        {page}. You can still navigate, edit the source, or report this error.
      </p>
      <ErrorDetails diagnostics={diagnostics} />
      <InputField
        as="textarea"
        aria-label="Error comment"
        placeholder="Add context about what you were doing…"
        value={note}
        onChange={setNote}
        disabled={comment !== null || busy}
      />
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => window.location.reload()}>
          Reload page
        </Button>
        <Button
          variant="outline"
          disabled={busy || comment !== null}
          onClick={() => void post(false)}
        >
          {comment ? "Error comment posted" : "Comment on error"}
        </Button>
        <SplitButton
          label={agents.target ? `Send to ${agents.target.label}` : "Send to agent"}
          onClick={() => void post(true)}
          items={targets.items}
          disabled={busy}
          loading={busy}
          title="Send to another target"
          menuClassName="max-h-72 max-w-[calc(100vw-2rem)] overflow-auto"
        />
      </div>
      {targets.error && (
        <p role="alert" className="text-xs text-destructive">
          {targets.error}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
