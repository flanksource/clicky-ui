import { useState, type ReactNode } from "react";
import {
  Button,
  DOCUMENT_ANCHOR,
  ErrorWrapper,
  InputField,
  useCommentContext,
  type Comment,
} from "@flanksource/clicky-ui";
import { useAgentRuns } from "./agent-runs/AgentRunsProvider";
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
      renderFallback={({ report }) => (
        <PageError page={page} report={report} />
      )}
    >
      {children}
    </ErrorWrapper>
  );
}

function PageError({
  page,
  report,
}: {
  page: string;
  report: string;
}) {
  const comments = useCommentContext();
  const agents = useAgentRuns();
  const [note, setNote] = useState("");
  const [comment, setComment] = useState<Comment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const body = `Playground page: ${page}\n\n${report}${note.trim() ? `\n\n${note.trim()}` : ""}`;
  const post = async (send: boolean) => {
    setBusy(true);
    setError("");
    try {
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
      if (send && !(comment === null && agents.data?.settings.autoRun))
        await agents.start(saved);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section
      className="space-y-3 rounded-md border border-destructive/30 p-4"
      aria-label="Page error"
    >
      <h2 className="text-lg font-semibold">This playground page failed</h2>
      <p className="text-sm text-muted-foreground">
        {page}. You can still navigate, edit the source, or report this error.
      </p>
      <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words rounded bg-muted p-3 text-xs">
        {report}
      </pre>
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
        <Button disabled={busy} onClick={() => void post(true)}>
          {agents.target ? `Send to ${agents.target.label}` : "Send to agent"}
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
    </section>
  );
}
