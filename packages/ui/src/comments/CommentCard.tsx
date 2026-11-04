import { normalizeErrorDiagnostics } from "../data/diagnostics/error-diagnostics";
import { ActionError } from "../data/diagnostics/ActionError";
import { useState, type ReactNode } from "react";
import { useCommentState } from "./comment-persistence";
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
  ReviewDecisionChip,
  RefChips,
  StatusChip,
} from "./CommentCardParts";
import { CommentMarkdown } from "./CommentMarkdown";
import { CommentPreview } from "./CommentPreview";
import { AgentIdentity } from "../data/chat/AgentIdentity";
import {
  assignmentMenuItems,
  type CommentActionRunner,
} from "./comment-assign";
import { authorDisplayName, truncatePlain } from "./comment-utils";
import {
  resolveCommentStage,
  statusForCommentStage,
} from "../lib/comment-stage";
import type { Comment, CommentAuthor, CommentConfig } from "./comment-types";

export type CommentCardProps = {
  comment: Comment;
  config: CommentConfig;
  /** Tighter padding for dense rails. */
  compact?: boolean;
  /** Render expanded on first mount. */
  defaultExpanded?: boolean;
  previewLines?: number;
  /** Keep maximized bodies independent of persisted sidebar expansion. */
  fullBody?: boolean;
  /** Custom body renderer; defaults to the lightweight CommentMarkdown. */
  renderBody?: (body: string) => ReactNode;
  /** Change this comment's status (roots only). */
  onUpdateStatus?: (status: string) => void | Promise<void>;
  /** Close an active or resolved root comment. */
  onClose?: () => void | Promise<void>;
  /** Claim an unassigned active root for the current user or agent. */
  onAcknowledge?: () => void | Promise<void>;
  /** Hand an active root to an assignee, or clear it with `null`. */
  onAssign?: (assignee: CommentAuthor | null) => void | Promise<void>;
  /**
   * Caller-owned entries appended to the "Assign…" submenu, such as a run-agent
   * action. Computed per comment so they can reflect its state.
   */
  extraAssignItems?: (comment: Comment) => DropdownMenuItem[];
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

function commentActionError(error: unknown, operation: string) {
  const diagnostics = normalizeErrorDiagnostics(error) ?? { message: String(error), context: [] };
  return { ...diagnostics, message: `${operation}: ${diagnostics.message}` };
}

/** A runner for {@link assignmentMenuItems} that shows a failure through `setError`. */
function reportingRunner(setError: (error: unknown) => void): CommentActionRunner {
  return (verb, action) => {
    setError(null);
    void (async () => {
      try {
        await action();
      } catch (cause) {
        setError(commentActionError(cause, `Couldn't ${verb} comment`));
      }
    })();
  };
}

/** The Acknowledge and Assign… entries for a root; none for replies. */
function rootAssignmentItems(
  props: CommentCardProps,
  run: CommentActionRunner,
): DropdownMenuItem[] {
  const { comment, config, onAcknowledge, onAssign, extraAssignItems } = props;
  return assignmentMenuItems({
    comment,
    config,
    run,
    ...(onAcknowledge ? { onAcknowledge } : {}),
    ...(onAssign ? { onAssign } : {}),
    ...(extraAssignItems ? { extraAssignItems } : {}),
  });
}

function CommentBody(props: CommentCardProps) {
  const {
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
  } = props;
  const [actionError, setActionError] = useState<unknown>(null);
  const isReply = Boolean(comment.parentId);
  const date = parseTimestamp(comment.createdAt);
  const resolved = statusForCommentStage(config, "resolved");
  const active = statusForCommentStage(config, "active");
  const closed = statusForCommentStage(config, "closed");
  const stage = resolveCommentStage(config, comment.status);
  const updateStatus = async (status: string) => {
    setActionError(null);
    try {
      await onUpdateStatus?.(status);
    } catch (error) {
      setActionError(commentActionError(error, "Couldn't update comment"));
    }
  };
  const close = async () => {
    setActionError(null);
    try {
      await onClose?.();
    } catch (error) {
      setActionError(commentActionError(error, "Couldn't close comment"));
    }
  };
  const copy = async () => {
    setActionError(null);
    try {
      await onCopy?.();
    } catch (error) {
      setActionError(commentActionError(error, "Couldn't copy comment"));
    }
  };
  const menuItems = actionMenuItems(isReply, {
    ...(onDelete ? { onDelete } : {}),
    statusActions: [
      ...rootAssignmentItems(props, reportingRunner(setActionError)),
      ...(stage === "active" && onUpdateStatus && resolved
        ? [
            {
              label: "Resolve",
              icon: UiCheck,
              onSelect: () => void updateStatus(resolved.value),
            },
          ]
        : []),
      ...((stage === "active" || stage === "resolved") && onClose && closed
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
              {comment.author?.kind === "agent" ? <AgentIdentity hideIcon model={comment.author.name} {...(comment.author.sessionId ? { identityId: comment.author.sessionId } : {})} /> : authorDisplayName(comment.author)}
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
              <ReviewDecisionChip decision={comment.reviewDecision} />
              <FacetBadges comment={comment} config={config} />
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {!isReply &&
            (stage === "active" || stage === "resolved") &&
            onClose &&
            closed && (
              <button
                type="button"
                aria-label="Close comment"
                title="Close comment"
                onClick={() => void close()}
                className="inline-flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:coarse)]:size-11"
              >
                <Icon icon={UiCheck} className="text-sm" />
              </button>
            )}
          {!isReply && stage === "closed" && onUpdateStatus && active && (
            <button
              type="button"
              aria-label="Reopen comment"
              title="Reopen comment"
              onClick={() => void updateStatus(active.value)}
              className="inline-flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(pointer:coarse)]:size-11"
            >
              <Icon icon={UiRestart} className="text-sm" />
            </button>
          )}
          {menuItems.length > 0 && (
            <DropdownMenu
              align="right"
              menuClassName="min-w-[150px]"
              trigger={
                <span
                  role="button"
                  tabIndex={0}
                  aria-label="Comment actions"
                  className="inline-flex items-center justify-center rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground [@media(pointer:coarse)]:size-11"
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
          {props.previewLines !== undefined ? <CommentPreview id={comment.id} lines={props.previewLines}>
            {renderBody ? renderBody(comment.body) : <CommentMarkdown text={comment.body} {...(comment.vocabularyRefs ? { vocabularyRefs: comment.vocabularyRefs } : {})} {...(config.vocabulary ? { vocabulary: config.vocabulary } : {})} />}
          </CommentPreview> : <>
          {renderBody ? (
            renderBody(comment.body)
          ) : (
            <CommentMarkdown {...(comment.vocabularyRefs ? { vocabularyRefs: comment.vocabularyRefs } : {})} text={comment.body} {...(config.vocabulary ? { vocabulary: config.vocabulary } : {})} />
          )}</>}
        </div>
      )}
      {actionError !== null && <ActionError error={actionError} context={[["Comment", comment.id], ["Anchor", comment.anchor ?? "Whole page"]]} />}
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
          className="-ml-2 rounded px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:px-3 [@media(pointer:coarse)]:text-sm"
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
  const [expanded, setExpanded] = useCommentState(`expanded:${comment.id}`, defaultExpanded ?? false);
  const [collapsedActionError, setCollapsedActionError] = useState<unknown>(null);
  const isReply = Boolean(comment.parentId);
  const body = <CommentBody {...props} />;

  async function runCollapsedAction(action: "resolve" | "close" | "reopen") {
    setCollapsedActionError(null);
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
      setCollapsedActionError(commentActionError(error, action === "close" ? "Couldn't close comment" : "Couldn't update comment"));
    }
  }

  async function copyCollapsed() {
    setCollapsedActionError(null);
    try {
      await props.onCopy?.();
    } catch (error) {
      setCollapsedActionError(commentActionError(error, "Couldn't copy comment"));
    }
  }

  if (!expanded && !props.fullBody && props.previewLines === undefined) {
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
          <span className="min-w-0 truncate text-[11px] font-semibold text-foreground">
            {authorDisplayName(comment.author)}
          </span>
          {!isReply && (
            <>
              <StatusChip comment={comment} config={config} />
              <RatingChip rating={comment.rating} />
              <ReviewDecisionChip decision={comment.reviewDecision} />
              <FacetBadges comment={comment} config={config} compact />
            </>
          )}
          <span className="min-w-0 flex-1 truncate text-[12px] text-foreground/80">
            {comment.body.trim()
              ? comment.vocabularyRefs?.length
                ? <CommentMarkdown text={comment.body} vocabularyRefs={comment.vocabularyRefs} {...(config.vocabulary ? { vocabulary: config.vocabulary } : {})} />
                : truncatePlain(comment.body)
              : comment.rating === "positive"
                ? "Positive rating"
                : comment.rating === "negative"
                  ? "Negative rating"
                  : comment.reviewDecision === "approved"
                    ? "Approved"
                    : "Empty comment"}
          </span>
          <span
            className="shrink-0"
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
                  className="rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:opacity-100 group-hover/comment:opacity-70 [@media(hover:none)]:opacity-70 [@media(pointer:coarse)]:p-2.5"
                >
                  <Icon icon={UiDotsVertical} className="text-sm" />
                </span>
              }
              items={actionMenuItems(isReply, {
                ...(props.onDelete ? { onDelete: props.onDelete } : {}),
                statusActions: [
                  ...rootAssignmentItems(
                    props,
                    reportingRunner(setCollapsedActionError),
                  ),
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
                  ...((resolveCommentStage(config, comment.status) ===
                    "active" ||
                    resolveCommentStage(config, comment.status) ===
                      "resolved") &&
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
        {collapsedActionError !== null && <ActionError error={collapsedActionError} context={[["Comment", comment.id], ["Anchor", comment.anchor ?? "Whole page"]]} />}
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
