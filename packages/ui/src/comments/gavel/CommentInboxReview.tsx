import { useEffect, useState } from "react";
import { Button } from "../../components/button";
import { InputField } from "../../components/InputField";
import { ActionError } from "../../data/diagnostics/ActionError";
import { UiArrowLeft, UiArrowRight, UiClose, UiLock, UiRestart } from "../../icons";
import type { CommentConfig } from "../comment-types";
import { CommentInboxThread, type CommentInboxActions } from "./CommentInboxThread";
import type { InboxItem } from "./inbox-model";

export type CommentInboxReviewProps = {
  /** The resolved threads awaiting a decision, in review order. */
  queue: readonly InboxItem[];
  selectedId: string | undefined;
  config: CommentConfig;
  actions: CommentInboxActions & Required<Pick<CommentInboxActions, "onClose" | "onReopenWithFeedback">>;
  onSelect: (id: string | undefined) => void;
  /** Opens the thread where it lives. */
  onOpen: (item: InboxItem) => void;
  onExit: () => void;
};

/**
 * The resolved-review queue: a human reads each resolved thread and either
 * closes it or reopens it with feedback, then moves to the next.
 */
export function CommentInboxReview({ queue, selectedId, config, actions, onSelect, onOpen, onExit }: CommentInboxReviewProps) {
  const [pending, setPending] = useState<"close" | "reopen" | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  useEffect(() => setError(null), [selectedId]);
  const index = queue.findIndex((item) => item.thread.id === selectedId);
  const selected = index < 0 ? undefined : queue[index];
  const draft = selected ? (drafts[selected.thread.id] ?? "") : "";
  const remaining = selected ? queue.filter((item) => item !== selected) : queue;
  const next = index < 0 ? remaining[0] : (remaining[index] ?? remaining[0]);

  async function transition(action: "close" | "reopen") {
    if (!selected || pending) return;
    const feedback = draft.trim();
    if (action === "reopen" && !feedback) return;
    setPending(action);
    setError(null);
    try {
      await (action === "close" ? actions.onClose(selected) : actions.onReopenWithFeedback(selected, feedback));
      setDrafts(({ [selected.thread.id]: _done, ...rest }) => rest);
      onSelect(next?.thread.id);
    } catch (cause) {
      setError(cause);
    } finally {
      setPending(null);
    }
  }

  return (
    <aside aria-label="Resolved comment review" className="flex h-full min-h-0 w-full flex-col">
      <header className="space-y-2 border-b border-border pb-density-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Review resolved comments</h2>
            <p className="text-xs text-muted-foreground">Human approval moves resolved work to closed.</p>
          </div>
          <Button size="sm" variant="ghost" aria-label="Exit review" onClick={onExit}>
            <UiClose className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{selected ? `${index + 1} of ${queue.length}` : `${queue.length} pending`}</span>
          <div className="ml-auto flex items-center gap-1">
            <Button size="sm" variant="outline" aria-label="Previous resolved comment" disabled={index <= 0} onClick={() => onSelect(queue[index - 1]?.thread.id)}>
              <UiArrowLeft className="size-4" />
            </Button>
            <Button size="sm" variant="outline" aria-label="Next resolved comment" disabled={index < 0 || index >= queue.length - 1} onClick={() => onSelect(queue[index + 1]?.thread.id)}>
              <UiArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto py-density-3">
        {selected ? (
          <div className="space-y-density-3">
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
              <p className="font-medium text-foreground">{selected.project}</p>
              <button type="button" className="mt-0.5 max-w-full truncate font-mono text-primary hover:underline" aria-label={`Open ${selected.label}`} title={`Open ${selected.label}`} onClick={() => onOpen(selected)}>
                {selected.line === undefined ? selected.label : `${selected.label}:${selected.line}`}
              </button>
            </div>
            <CommentInboxThread item={selected} config={config} actions={actions} />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-density-4 text-center">
            <p className="text-sm font-medium">{queue.length === 0 ? "All resolved comments reviewed" : "Pick a resolved comment to review"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Closed comments stay in the inbox under the Closed status.</p>
          </div>
        )}
        {error !== null && <ActionError error={error} context={selected ? [["Project", selected.project], ["Comment", selected.thread.id]] : []} />}
      </div>

      {selected && (
        <footer className="space-y-2 border-t border-border pt-density-3">
          <label htmlFor="inbox-review-feedback" className="text-xs font-medium text-foreground">
            Comment before reopening
          </label>
          <InputField
            as="textarea"
            id="inbox-review-feedback"
            rows={3}
            value={draft}
            disabled={pending !== null}
            placeholder="Explain what still needs attention…"
            inputClassName="resize-none"
            onChange={(body) => setDrafts((current) => ({ ...current, [selected.thread.id]: body }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" disabled={pending !== null || !draft.trim()} onClick={() => void transition("reopen")}>
              <UiRestart className="size-4" />
              {pending === "reopen" ? "Reopening…" : "Comment & reopen"}
            </Button>
            <Button disabled={pending !== null} onClick={() => void transition("close")}>
              <UiLock className="size-4" />
              {pending === "close" ? "Closing…" : "Close & next"}
            </Button>
          </div>
        </footer>
      )}
    </aside>
  );
}
