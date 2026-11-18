import { ActionError } from "@flanksource/clicky-ui";
import { useState } from "react";
import {
  Badge,
  Button,
  CommentAuthorAvatar,
  CommentAuthorName,
  CommentMarkdown,
  DropdownMenu,
  HoverCard,
  Timestamp,
  assignTargetItems,
  resolveCommentStage,
  useCommentContext,
  useConfirm,
} from "@flanksource/clicky-ui";
import {
  UiArrowRight,
  UiCheck,
  UiLock,
  UiRestart,
  UiTrash,
  UiUserCheck,
  UiUserPlus,
} from "@flanksource/clicky-ui/icons";
import { useAgentRuns } from "../agent-runs/AgentRunsProvider";
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
  const agentRuns = useAgentRuns();
  const { config } = useCommentContext();
  const status = PLAYGROUND_COMMENT_CONFIG.statuses.find(
    (entry) => entry.value === (comment.status ?? "open"),
  );
  const captured = comment.element?.screenshot?.status === "captured";
  return (
    // One wrapping header row on desktop. On a phone the header dissolves
    // (`contents`) so the comment body sits right under author/page/status and
    // the assignment, run and action rows follow it.
    <article
      data-comment-id={comment.id}
      className="flex flex-col gap-3 p-2 md:block md:space-y-3 md:p-3"
    >
      <header className="contents md:flex md:flex-wrap md:items-center md:gap-x-3 md:gap-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 md:contents">
        <div className="flex items-center gap-2">
          <CommentAuthorAvatar author={comment.author} size="md" />
          <span className="text-sm font-medium">
            <CommentAuthorName author={comment.author} />
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
        </div>
        <div className="order-last flex flex-wrap items-center gap-x-3 gap-y-2 md:contents">
        {comment.assignee && (
          <span
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
            title={
              comment.acknowledgedAt
                ? "Acknowledged"
                : "Assigned, not yet acknowledged"
            }
          >
            <CommentAuthorAvatar author={comment.assignee} bare />
            Assigned to {comment.assignee.name}
          </span>
        )}
        {agentRuns.renderRunDetails(comment)}
        {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
          <span className="text-xs text-muted-foreground">
            Updated <Timestamp value={comment.updatedAt} format="relative" />
          </span>
        )}
        <div className="ml-auto">
          <CommentDashboardActions comment={comment} href={href} />
        </div>
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
            {...(comment.vocabularyRefs ? { vocabularyRefs: comment.vocabularyRefs } : {})}
            {...(config.vocabulary ? { vocabulary: config.vocabulary } : {})}
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
  const [error, setError] = useState<unknown>(null);
  const active =
    resolveCommentStage(PLAYGROUND_COMMENT_CONFIG, comment.status) === "active";

  async function perform(work: () => void | Promise<void>) {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await work();
    } catch (cause) {
      setError(cause);
    } finally {
      setPending(false);
    }
  }

  async function act(
    action: "resolve" | "reopen" | "close" | "delete" | "acknowledge",
  ) {
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
    await perform(async () => {
      if (action === "delete") {
        if (!callbacks.onDelete)
          throw new Error("Comment deletion is not configured");
        await callbacks.onDelete(comment.id);
      } else if (action === "close") {
        if (!callbacks.onClose)
          throw new Error("Comment closing is not configured");
        await callbacks.onClose(comment.id);
      } else if (action === "acknowledge") {
        if (!callbacks.onAcknowledge)
          throw new Error("Comment acknowledgement is not configured");
        await callbacks.onAcknowledge(comment.id);
      } else {
        if (!callbacks.onUpdateStatus)
          throw new Error("Comment status updates are not configured");
        await callbacks.onUpdateStatus(
          comment.id,
          action === "resolve" ? "resolved" : "open",
        );
      }
    });
  }

  const { onAssign } = callbacks;
  const { extraAssignItems } = useAgentRuns();
  const assignItems = assignTargetItems({
    comment,
    config: PLAYGROUND_COMMENT_CONFIG,
    extraAssignItems,
    run: (_verb, work) => void perform(work),
    ...(onAssign
      ? { onAssign: (assignee) => onAssign(comment.id, assignee) }
      : {}),
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1 [@media(pointer:coarse)]:gap-2 [@media(pointer:coarse)]:[&>*]:size-11">
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
          aria-label="Acknowledge comment"
          title="Acknowledge comment"
          disabled={pending || !active || Boolean(comment.assignee)}
          onClick={() => void act("acknowledge")}
        >
          <UiUserCheck className="size-4" />
        </Button>
        {assignItems.length > 0 &&
          (active && !pending ? (
            <DropdownMenu
              icon={UiUserPlus}
              variant="ghost"
              size="sm"
              hideChevron
              title="Assign comment"
              items={assignItems}
            />
          ) : (
            <Button
              size="sm"
              variant="ghost"
              aria-label="Assign comment"
              title="Assign comment"
              disabled
            >
              <UiUserPlus className="size-4" />
            </Button>
          ))}
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
      {error !== null && <ActionError error={error} context={[["Artifact", comment.page], ["Comment", comment.id]]} />}
      {dialog}
    </div>
  );
}
