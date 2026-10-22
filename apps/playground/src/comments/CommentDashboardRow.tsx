import { useState } from "react";
import {
  Badge,
  Button,
  CommentAuthorAvatar,
  CommentMarkdown,
  HoverCard,
  Timestamp,
  useCommentContext,
  useConfirm,
} from "@flanksource/clicky-ui";
import {
  UiArrowRight,
  UiCheck,
  UiLock,
  UiRestart,
  UiTrash,
} from "@flanksource/clicky-ui/icons";
import { PLAYGROUND_COMMENT_CONFIG, type PageComment } from "./useComments";
import type { Comment } from "@flanksource/clicky-ui/comments";
import { CroppedScreenshot } from "./CroppedScreenshot";
import { CommentMiniThread } from "./CommentMiniThread";

function CommentScreenshot({ comment }: { comment: PageComment }) {
  const screenshot = comment.element?.screenshot;
  if (screenshot?.status !== "captured")
    return <span className="text-xs text-muted-foreground">No screenshot</span>;
  return (
    <HoverCard
      className="w-full"
      placement="right"
      arrow={false}
      cardClassName="max-w-[calc(100vw-2rem)] p-2"
      trigger={
        <a
          href={screenshot.url}
          target="_blank"
          rel="noreferrer"
          aria-label="View full screenshot"
          className="block min-w-0 w-full"
        >
          <CroppedScreenshot
            src={screenshot.url}
            alt="Comment screenshot"
            className="h-48 w-full rounded-md border border-border bg-muted/30 object-contain"
          />
        </a>
      }
    >
      <CroppedScreenshot
        src={screenshot.url}
        alt="Expanded comment screenshot"
        className="h-auto max-h-[70vh] w-[800px] max-w-full rounded object-contain"
      />
    </HoverCard>
  );
}

export function CommentDashboardEntry({
  comment,
  title,
  href,
  replies,
}: {
  comment: PageComment;
  title: string;
  href: string;
  replies: Comment[];
}) {
  const status = PLAYGROUND_COMMENT_CONFIG.statuses.find(
    (entry) => entry.value === (comment.status ?? "open"),
  );
  const captured = comment.element?.screenshot?.status === "captured";
  return (
    <article data-comment-id={comment.id} className="space-y-3 p-2 md:p-3">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2">
          <CommentAuthorAvatar author={comment.author} size="md" />
          <span className="text-sm font-medium">
            {comment.author?.name ?? "Anonymous"}
          </span>
          <Timestamp
            value={comment.createdAt}
            format="relative"
            className="text-xs"
          />
        </div>
        <a
          href={href}
          title={comment.page}
          className="min-w-0 max-w-72 truncate text-sm text-primary hover:underline"
        >
          {title}
        </a>
        <Badge
          tone={
            status?.tone === "default" ? "neutral" : (status?.tone ?? "neutral")
          }
          variant="soft"
          clickToCopy={false}
        >
          {status?.label ?? comment.status}
        </Badge>
        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
          <span className="text-xs text-muted-foreground">
            Updated <Timestamp value={comment.updatedAt} format="relative" />
          </span>
        )}
        <div className="ml-auto">
          <CommentDashboardActions comment={comment} href={href} />
        </div>
      </header>
      <div
        className={
          captured
            ? "grid items-start gap-4 md:grid-cols-[20rem_minmax(0,1fr)]"
            : "min-w-0"
        }
      >
        {captured && <CommentScreenshot comment={comment} />}
        <div className="min-w-0 space-y-2 whitespace-normal">
          <CommentMarkdown
            text={comment.body}
            className="text-sm leading-relaxed"
          />
          {comment.element?.componentName && (
            <p className="text-xs text-muted-foreground">
              {comment.element.componentName}
            </p>
          )}
          <CommentMiniThread replies={replies} />
        </div>
      </div>
    </article>
  );
}

export function CommentDashboardActions({
  comment,
  href,
}: {
  comment: PageComment;
  href: string;
}) {
  const { callbacks } = useCommentContext();
  const { confirm, dialog } = useConfirm();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active =
    comment.status === undefined ||
    comment.status === "open" ||
    comment.status === "in_progress";

  async function act(action: "resolve" | "reopen" | "close" | "delete") {
    if (pending) return;
    if (
      action === "delete" &&
      !(await confirm({
        title: "Delete comment?",
        message:
          "This permanently deletes the thread, its replies, and captured screenshot.",
        confirmLabel: "Delete",
        variant: "destructive",
      }))
    )
      return;
    setPending(true);
    setError(null);
    try {
      if (action === "delete") {
        if (!callbacks.onDelete)
          throw new Error("Comment deletion is not configured");
        await callbacks.onDelete(comment.id);
      } else if (action === "close") {
        if (!callbacks.onClose)
          throw new Error("Comment closing is not configured");
        await callbacks.onClose(comment.id);
      } else {
        if (!callbacks.onUpdateStatus)
          throw new Error("Comment status updates are not configured");
        await callbacks.onUpdateStatus(
          comment.id,
          action === "resolve" ? "resolved" : "open",
        );
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-1">
        <a
          href={href}
          aria-label="Open comment page"
          title="Open comment page"
          className="inline-flex size-8 items-center justify-center rounded hover:bg-muted"
        >
          <UiArrowRight className="size-4" />
        </a>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Reopen comment"
          title="Reopen comment"
          disabled={pending || active}
          onClick={() => void act("reopen")}
        >
          <UiRestart className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Resolve comment"
          title="Resolve comment"
          disabled={pending || !active}
          onClick={() => void act("resolve")}
        >
          <UiCheck className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Close comment"
          title="Close comment"
          disabled={pending || comment.status === "closed"}
          onClick={() => void act("close")}
        >
          <UiLock className="size-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          aria-label="Delete comment"
          title="Delete comment"
          disabled={pending}
          onClick={() => void act("delete")}
        >
          <UiTrash className="size-4 text-destructive" />
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="max-w-48 whitespace-normal text-xs text-destructive"
        >
          {error}
        </p>
      )}
      {dialog}
    </div>
  );
}
