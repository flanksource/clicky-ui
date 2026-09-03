import { useState, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import {
  parseTimestamp,
  formatRelativeTime,
} from "../data/cells/timestamp-format";
import {
  UiCheck,
  UiCopy,
  UiDotsVertical,
  UiFullscreen,
  UiLock,
  UiRestart,
  UiTrash,
} from "../icons";
import { CommentAuthorAvatar } from "./CommentAuthor";
import {
  ChecklistChips,
  FacetBadges,
  RatingChip,
  RefChips,
  StatusChip,
} from "./CommentCardParts";
import { CommentMarkdown } from "./CommentMarkdown";
import { authorDisplayName, truncatePlain } from "./comment-utils";
import {
  resolveCommentStage,
  statusForCommentStage,
} from "../lib/comment-stage";
import type { Comment, CommentConfig } from "./comment-types";

export type CommentCardProps = {
  comment: Comment;
  config: CommentConfig;
  /** Tighter padding for dense rails. */
  compact?: boolean;
  /** Render expanded on first mount. */
  defaultExpanded?: boolean;
  /** Custom body renderer; defaults to the lightweight CommentMarkdown. */
  renderBody?: (body: string) => ReactNode;
  /** Change this comment's status (roots only). */
  onUpdateStatus?: (status: string) => void | Promise<void>;
  /** Close a resolved root comment. */
  onClose?: () => void | Promise<void>;
  /** Delete this comment. */
  onDelete?: () => void;
  /** Copy this comment's whole thread in the caller's canonical format. */
  onCopy?: () => void | Promise<void>;
  /** Begin a reply to this comment. */
  onReply?: () => void;
  /** Advance the checklist item at `index` to its next status. */
  onChecklistToggle?: (index: number) => void;
  /**
   * Open this card's thread in a larger view. Owned by the caller because a
   * card knows only itself, while maximizing shows the root and its replies.
   * Omit to drop the action (e.g. inside an already-maximized thread).
   */
  onMaximize?: () => void;
};

function actionMenuItems(
  isReply: boolean,
  opts: {
    onDelete?: () => void;
    statusActions?: DropdownMenuItem[];
    onCopy?: () => void;
    onMaximize?: () => void;
  },
): DropdownMenuItem[] {
  const items: DropdownMenuItem[] = [];
  if (opts.onDelete) {
    items.push({ label: "Delete", icon: UiTrash, onSelect: opts.onDelete });
  }
  if (!isReply) items.push(...(opts.statusActions ?? []));
  if (opts.onCopy) {
    items.push({ label: "Copy", icon: UiCopy, onSelect: opts.onCopy });
  }
  if (opts.onMaximize) {
    items.push({
      label: "Maximise",
      icon: UiFullscreen,
      onSelect: opts.onMaximize,
    });
  }
  return items;
}

function CommentBody({
  comment,
  config,
  renderBody,
  onUpdateStatus,
  onClose,
  onDelete,
  onCopy,
  onReply,
  onChecklistToggle,
  onMaximize,
}: CommentCardProps) {
  const [actionError, setActionError] = useState("");
  const isReply = Boolean(comment.parentId);
  const date = parseTimestamp(comment.createdAt);
  const resolved = statusForCommentStage(config, "resolved");
  const active = statusForCommentStage(config, "active");
  const closed = statusForCommentStage(config, "closed");
  const stage = resolveCommentStage(config, comment.status);
  const updateStatus = async (status: string) => {
    setActionError("");
    try {
      await onUpdateStatus?.(status);
    } catch (error) {
      setActionError(
        `Couldn't update comment: ${error instanceof Error ? error.message : "Unexpected error"}`,
      );
    }
  };
  const close = async () => {
    setActionError("");
    try {
      await onClose?.();
    } catch (error) {
      setActionError(
        `Couldn't close comment: ${error instanceof Error ? error.message : "Unexpected error"}`,
      );
    }
  };
  const copy = async () => {
    setActionError("");
    try {
      await onCopy?.();
    } catch (error) {
      setActionError(
        `Couldn't copy comment: ${error instanceof Error ? error.message : "Unexpected error"}`,
      );
    }
  };
  const menuItems = actionMenuItems(isReply, {
    ...(onDelete ? { onDelete } : {}),
    statusActions: [
      ...(stage === "active" && onUpdateStatus && resolved
        ? [
            {
              label: "Resolve",
              icon: UiCheck,
              onSelect: () => void updateStatus(resolved.value),
            },
          ]
        : []),
      ...(stage === "resolved" && onClose && closed
        ? [
            {
              label: "Close",
              icon: UiLock,
              onSelect: () => void close(),
            },
          ]
        : []),
      ...((stage === "resolved" || stage === "closed") &&
      onUpdateStatus &&
      active
        ? [
            {
              label: "Reopen",
              icon: UiRestart,
              onSelect: () => void updateStatus(active.value),
            },
          ]
        : []),
    ],
    ...(onCopy ? { onCopy: () => void copy() } : {}),
    ...(onMaximize ? { onMaximize } : {}),
  });

  return (
    <div className="space-y-2.5">
      <div className="flex items-start gap-2.5">
        <CommentAuthorAvatar author={comment.author} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-1.5">
            <span className="truncate text-xs font-semibold text-foreground">
              {authorDisplayName(comment.author)}
            </span>
            {date && (
              <span
                title={date.toLocaleString()}
                className="shrink-0 text-[10px] text-muted-foreground"
              >
                {formatRelativeTime(date)}
              </span>
            )}
          </div>
          {!isReply && (
            <div className="mt-1 flex flex-wrap gap-1">
              <StatusChip comment={comment} config={config} />
              <RatingChip rating={comment.rating} />
              <FacetBadges comment={comment} config={config} />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {menuItems.length > 0 && (
            <DropdownMenu
              align="right"
              menuClassName="min-w-[150px]"
              trigger={
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Comment actions"
                  className="inline-flex rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon icon={UiDotsVertical} className="text-sm" />
                </span>
              }
              items={menuItems}
            />
          )}
        </div>
      </div>
      {comment.body.trim() && (
        <div className="text-[13px] leading-5 text-foreground">
          {renderBody ? (
            renderBody(comment.body)
          ) : (
            <CommentMarkdown text={comment.body} />
          )}
        </div>
      )}
      {actionError && (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-xs text-destructive"
        >
          {actionError}
        </div>
      )}
      {!isReply && (
        <ChecklistChips
          comment={comment}
          {...(onChecklistToggle ? { onChecklistToggle } : {})}
        />
      )}
      {!isReply && <RefChips comment={comment} />}
      {onReply && (
        <button
          type="button"
          onClick={onReply}
          className="-ml-2 rounded px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          Reply
        </button>
      )}
    </div>
  );
}

/**
 * A single comment, collapsible between a compact one-line preview and a full
 * card. Offers a Maximise action when `onMaximize` is supplied — the owner
 * enlarges the whole thread. Fully controlled — all mutations are delegated to
 * the supplied callbacks.
 */
export function CommentCard(props: CommentCardProps) {
  const { comment, config, compact, defaultExpanded } = props;
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);
  const [collapsedActionError, setCollapsedActionError] = useState("");
  const isReply = Boolean(comment.parentId);
  const body = <CommentBody {...props} />;

  async function runCollapsedAction(action: "resolve" | "close" | "reopen") {
    setCollapsedActionError("");
    try {
      if (action === "close") {
        await props.onClose?.();
        return;
      }
      const next = statusForCommentStage(
        config,
        action === "resolve" ? "resolved" : "active",
      );
      if (next) await props.onUpdateStatus?.(next.value);
    } catch (error) {
      setCollapsedActionError(
        `${action === "close" ? "Couldn't close comment" : "Couldn't update comment"}: ${error instanceof Error ? error.message : "Unexpected error"}`,
      );
    }
  }

  async function copyCollapsed() {
    setCollapsedActionError("");
    try {
      await props.onCopy?.();
    } catch (error) {
      setCollapsedActionError(
        `Couldn't copy comment: ${error instanceof Error ? error.message : "Unexpected error"}`,
      );
    }
  }

  if (!expanded) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpanded(true);
            }
          }}
          data-testid="comment-card"
          data-comment-kind={isReply ? "reply" : "root"}
          data-comment-id={comment.id}
          className={cn(
            "group/comment flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors hover:bg-muted/50",
            !isReply && "border border-border bg-background shadow-sm",
            isReply && "ml-4 border-l-2 border-l-border bg-muted/30",
          )}
        >
          <CommentAuthorAvatar author={comment.author} bare />
          <span className="shrink-0 text-[11px] font-semibold text-foreground">
            {authorDisplayName(comment.author)}
          </span>
          {!isReply && (
            <>
              <StatusChip comment={comment} config={config} />
              <RatingChip rating={comment.rating} />
              <FacetBadges comment={comment} config={config} compact />
            </>
          )}
          <span className="min-w-0 flex-1 truncate text-[12px] text-foreground/80">
            {comment.body.trim()
              ? truncatePlain(comment.body)
              : comment.rating === "positive"
                ? "Positive rating"
                : comment.rating === "negative"
                  ? "Negative rating"
                  : "Empty comment"}
          </span>
          <span
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <DropdownMenu
              align="right"
              trigger={
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Comment actions"
                  className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:opacity-100 group-hover/comment:opacity-70"
                >
                  <Icon icon={UiDotsVertical} className="text-sm" />
                </span>
              }
              items={actionMenuItems(isReply, {
                ...(props.onDelete ? { onDelete: props.onDelete } : {}),
                statusActions: [
                  ...(resolveCommentStage(config, comment.status) ===
                    "active" &&
                  props.onUpdateStatus &&
                  statusForCommentStage(config, "resolved")
                    ? [
                        {
                          label: "Resolve",
                          icon: UiCheck,
                          onSelect: () => void runCollapsedAction("resolve"),
                        },
                      ]
                    : []),
                  ...(resolveCommentStage(config, comment.status) ===
                    "resolved" &&
                  props.onClose &&
                  statusForCommentStage(config, "closed")
                    ? [
                        {
                          label: "Close",
                          icon: UiLock,
                          onSelect: () => void runCollapsedAction("close"),
                        },
                      ]
                    : []),
                  ...((resolveCommentStage(config, comment.status) ===
                    "resolved" ||
                    resolveCommentStage(config, comment.status) === "closed") &&
                  props.onUpdateStatus &&
                  statusForCommentStage(config, "active")
                    ? [
                        {
                          label: "Reopen",
                          icon: UiRestart,
                          onSelect: () => void runCollapsedAction("reopen"),
                        },
                      ]
                    : []),
                ],
                ...(props.onCopy ? { onCopy: () => void copyCollapsed() } : {}),
                ...(props.onMaximize ? { onMaximize: props.onMaximize } : {}),
              })}
            />
          </span>
        </div>
        {collapsedActionError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-xs text-destructive"
          >
            {collapsedActionError}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div
        data-testid="comment-card"
        data-comment-kind={isReply ? "reply" : "root"}
        data-comment-id={comment.id}
        className={cn(
          "group/comment rounded-xl bg-background px-3.5 py-3 text-xs",
          !isReply &&
            "border border-border/80 shadow-sm transition-shadow hover:shadow-md",
          compact && "px-2.5 py-2.5",
          isReply && "ml-4 border-l-2 border-l-border bg-muted/20 shadow-none",
        )}
      >
        {body}
      </div>
    </>
  );
}
