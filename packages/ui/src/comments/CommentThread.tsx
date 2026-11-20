import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import type { DropdownMenuItem } from "../overlay/DropdownMenu";
import { CommentComposer } from "./CommentComposer";
import { CommentThreadList } from "./CommentThreadList";
import type { CommentDetailOptions } from "./comment-detail";
import { buildThreadListHandlers } from "./comment-utils";
import { CommentProposalContext, useProposalCallbacks } from "./proposal-context";
import type {
  Comment,
  CommentAnchor,
  CommentCallbacks,
  CommentConfig,
  CommentCreateAction,
} from "./comment-types";

export type CommentThreadProps = CommentCallbacks & CommentDetailOptions & {
  /** Comments for this thread (typically pre-filtered to one anchor). */
  comments: Comment[];
  config: CommentConfig;
  /** Anchor stamped onto created comments. */
  anchor?: CommentAnchor | null;
  compact?: boolean;
  /** Auto-open and focus the composer on mount. */
  autoFocusComposer?: boolean;
  /** Expand each thread immediately (roots and their replies), exposing actions such as Reply. */
  defaultExpanded?: boolean;
  /** Label for creating a separate root comment. */
  composerPlaceholder?: string;
  /** Hide the composer (read-only thread). */
  hideComposer?: boolean;
  createActions?: readonly CommentCreateAction[];
  renderRootMeta?: (comment: Comment) => ReactNode;
  renderRootDetails?: (comment: Comment) => ReactNode;
  renderBody?: (body: string) => ReactNode;
  threadToMarkdown?: (thread: readonly Comment[]) => string;
  /** Caller-owned entries appended to each root's "Assign…" submenu. */
  extraAssignItems?: (comment: Comment) => DropdownMenuItem[];
};

/**
 * Top-level controlled comment thread: a threaded list plus a mention-aware
 * composer. Owns no data — it renders `comments` and forwards every mutation to
 * the supplied callbacks, translating list-level events (checklist index, reply
 * target) into the callback contract.
 */
export function CommentThread({
  comments,
  config,
  anchor,
  compact = false,
  autoFocusComposer = false,
  defaultExpanded = false,
  previewLines,
  detailTabs,
  renderMaximizedActions,
  onMaximizedChange,
  composerPlaceholder,
  hideComposer = false,
  createActions,
  renderRootMeta,
  renderRootDetails,
  renderBody,
  threadToMarkdown,
  extraAssignItems,
  onCreate,
  onReply,
  onUpdateStatus,
  onClose,
  onAcknowledge,
  onAssign,
  onDelete,
  onEdit,
  onEditReply,
  onDeleteReply,
  onCreateTodo,
  onChecklistToggle,
  onMention,
  onApplyProposal,
  onRejectProposal,
  onRequestRevision,
  loadProposalDiff,
}: CommentThreadProps) {
  const proposalCallbacks = useProposalCallbacks({
    ...(onApplyProposal ? { onApplyProposal } : {}),
    ...(onRejectProposal ? { onRejectProposal } : {}),
    ...(onRequestRevision ? { onRequestRevision } : {}),
    ...(loadProposalDiff ? { loadProposalDiff } : {}),
  });
  const listHandlers = buildThreadListHandlers(comments, config, {
    ...(onUpdateStatus ? { onUpdateStatus } : {}),
    ...(onClose ? { onClose } : {}),
    ...(onAcknowledge ? { onAcknowledge } : {}),
    ...(onAssign ? { onAssign } : {}),
    ...(onDelete ? { onDelete } : {}),
    ...(onEdit ? { onEdit } : {}),
    ...(onEditReply ? { onEditReply } : {}),
    ...(onDeleteReply ? { onDeleteReply } : {}),
    ...(onCreateTodo ? { onCreateTodo } : {}),
    ...(onChecklistToggle ? { onChecklistToggle } : {}),
    ...(onReply ? { onReply } : {}),
    ...(onMention ? { onMention } : {}),
  });

  const thread = (
    <div className={cn(compact && "p-2")}>
      <CommentThreadList
        comments={comments}
        config={config}
        compact={compact}
        defaultExpanded={defaultExpanded}
        {...(previewLines !== undefined ? { previewLines } : {})}
        {...(detailTabs ? { detailTabs } : {})}
        {...(renderMaximizedActions ? { renderMaximizedActions } : {})}
        {...(onMaximizedChange ? { onMaximizedChange } : {})}
        {...(renderRootMeta ? { renderRootMeta } : {})}
        {...(renderRootDetails ? { renderRootDetails } : {})}
        {...(renderBody ? { renderBody } : {})}
        {...(threadToMarkdown ? { threadToMarkdown } : {})}
        {...(extraAssignItems ? { extraAssignItems } : {})}
        {...listHandlers}
      />
      {!hideComposer && onCreate && (
        <div className="pt-1">
          <CommentComposer
            config={config}
            anchor={anchor ?? null}
            autoFocus={autoFocusComposer}
            {...(composerPlaceholder
              ? { placeholder: composerPlaceholder }
              : {})}
            onCreate={onCreate}
            {...(createActions ? { createActions } : {})}
            {...(onMention ? { onMention } : {})}
          />
        </div>
      )}
    </div>
  );
  // With none of its own, a thread inherits an enclosing provider's callbacks.
  return proposalCallbacks ? (
    <CommentProposalContext.Provider value={proposalCallbacks}>
      {thread}
    </CommentProposalContext.Provider>
  ) : (
    thread
  );
}
