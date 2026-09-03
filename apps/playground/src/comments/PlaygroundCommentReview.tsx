import { useState } from "react";
import {
  Button,
  CommentThreadList,
  InputField,
  type Comment,
  type CommentAnchor,
  type CommentConfig,
} from "@flanksource/clicky-ui";
import {
  UiArrowLeft,
  UiArrowRight,
  UiClose,
  UiLock,
  UiRestart,
} from "@flanksource/clicky-ui/icons";

import { findPage, pageTitle, pages } from "../registry";
import type { PageComment } from "./useComments";

export type ResolvedReviewItem = PageComment & { parentId?: null };

export function resolvedReviewQueue(
  comments: PageComment[],
): ResolvedReviewItem[] {
  const pageOrder = new Map(pages().map((page, index) => [page.slug, index]));
  return comments
    .filter(
      (comment): comment is ResolvedReviewItem =>
        !comment.parentId && comment.status === "resolved",
    )
    .sort((left, right) => {
      const pageDifference =
        (pageOrder.get(left.page) ?? Number.MAX_SAFE_INTEGER) -
        (pageOrder.get(right.page) ?? Number.MAX_SAFE_INTEGER);
      if (pageDifference !== 0) return pageDifference;
      if (left.createdAt !== right.createdAt) {
        return left.createdAt.localeCompare(right.createdAt);
      }
      return left.id.localeCompare(right.id);
    });
}

export type PlaygroundCommentReviewProps = {
  allComments: PageComment[];
  selectedId: string | undefined;
  config: CommentConfig;
  anchorLabels: Record<CommentAnchor, string>;
  formatAnchorLabel: (anchor: CommentAnchor) => string;
  threadToMarkdown?: (thread: readonly Comment[]) => string;
  onSelect: (item: ResolvedReviewItem | undefined) => void;
  onClose: (id: string) => Promise<void>;
  onCommentAndReopen: (id: string, body: string) => Promise<void>;
  onReply: (parent: Comment, body: string) => Promise<void>;
  onExit: () => void;
};

export function PlaygroundCommentReview({
  allComments,
  selectedId,
  config,
  anchorLabels,
  formatAnchorLabel,
  threadToMarkdown,
  onSelect,
  onClose,
  onCommentAndReopen,
  onReply,
  onExit,
}: PlaygroundCommentReviewProps) {
  const [pending, setPending] = useState<"close" | "reopen" | null>(null);
  const [error, setError] = useState("");
  const [reopenDrafts, setReopenDrafts] = useState<Record<string, string>>({});
  const queue = resolvedReviewQueue(allComments);
  const index = queue.findIndex((comment) => comment.id === selectedId);
  const selected = index < 0 ? undefined : queue[index];
  const reopenDraft = selected ? (reopenDrafts[selected.id] ?? "") : "";
  const replies = selected
    ? allComments.filter((comment) => comment.parentId === selected.id)
    : [];
  const remaining = selected
    ? queue.filter((comment) => comment.id !== selected.id)
    : queue;
  const nextAfterAction =
    index < 0 ? remaining[0] : (remaining[index] ?? remaining[0]);

  async function transition(action: "close" | "reopen") {
    if (!selected || pending) return;
    const body = reopenDraft.trim();
    if (action === "reopen" && !body) return;
    setPending(action);
    setError("");
    try {
      await (action === "close"
        ? onClose(selected.id)
        : onCommentAndReopen(selected.id, body));
      setReopenDrafts((current) => {
        const { [selected.id]: _completed, ...remainingDrafts } = current;
        return remainingDrafts;
      });
      onSelect(nextAfterAction);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPending(null);
    }
  }

  return (
    <aside
      aria-label="Resolved comment review"
      className="flex h-full w-[380px] flex-col"
    >
      <header className="space-y-2 border-b border-border pb-density-3">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-semibold">Review resolved comments</h2>
            <p className="text-xs text-muted-foreground">
              Human approval moves resolved work to closed.
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Exit review"
            onClick={onExit}
          >
            <UiClose className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            {selected
              ? `${index + 1} of ${queue.length}`
              : `${queue.length} pending`}
          </span>
          <div className="ml-auto flex items-center gap-1">
            <Button
              size="sm"
              variant="outline"
              aria-label="Previous resolved comment"
              disabled={index <= 0}
              onClick={() => onSelect(queue[index - 1])}
            >
              <UiArrowLeft className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              aria-label="Next resolved comment"
              disabled={index < 0 || index >= queue.length - 1}
              onClick={() => onSelect(queue[index + 1])}
            >
              <UiArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto py-density-3">
        {selected ? (
          <div className="space-y-density-3">
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
              <p className="font-medium text-foreground">
                {findPage(selected.page)
                  ? pageTitle(findPage(selected.page)!)
                  : selected.page}
              </p>
              <p
                className="mt-0.5 truncate text-muted-foreground"
                title={selected.anchor ?? "Whole page"}
              >
                {selected.anchor
                  ? (anchorLabels[selected.anchor] ??
                    formatAnchorLabel(selected.anchor))
                  : "Whole page"}
              </p>
            </div>
            <CommentThreadList
              comments={[selected, ...replies]}
              config={config}
              compact
              defaultExpanded
              onReply={onReply}
              {...(threadToMarkdown ? { threadToMarkdown } : {})}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-density-4 text-center">
            <p className="text-sm font-medium">
              All resolved comments reviewed
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Closed comments remain available in the comment rail.
            </p>
          </div>
        )}
        {error && (
          <p role="alert" className="mt-3 text-xs text-destructive">
            {error}
          </p>
        )}
      </div>

      {selected && (
        <footer className="space-y-2 border-t border-border pt-density-3">
          <label
            htmlFor="resolved-review-comment"
            className="text-xs font-medium text-foreground"
          >
            Comment before reopening
          </label>
          <InputField
            as="textarea"
            id="resolved-review-comment"
            rows={3}
            value={reopenDraft}
            disabled={pending !== null}
            placeholder="Explain what still needs attention…"
            inputClassName="resize-none"
            onChange={(body) =>
              setReopenDrafts((current) => ({
                ...current,
                [selected.id]: body,
              }))
            }
          />
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              disabled={pending !== null || !reopenDraft.trim()}
              onClick={() => void transition("reopen")}
            >
              <UiRestart className="size-4" />
              {pending === "reopen" ? "Reopening…" : "Comment & reopen"}
            </Button>
            <Button
              disabled={pending !== null}
              onClick={() => void transition("close")}
            >
              <UiLock className="size-4" />
              {pending === "close" ? "Closing…" : "Close & next"}
            </Button>
          </div>
        </footer>
      )}
    </aside>
  );
}
