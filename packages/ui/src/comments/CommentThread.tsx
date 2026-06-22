import { type ReactNode } from "react";
import { cn } from "../lib/utils";
import { CommentComposer } from "./CommentComposer";
import { CommentThreadList } from "./CommentThreadList";
import { buildThreadListHandlers } from "./comment-utils";
import type {
  Comment,
  CommentAnchor,
  CommentCallbacks,
  CommentConfig,
} from "./comment-types";

export type CommentThreadProps = CommentCallbacks & {
  /** Comments for this thread (typically pre-filtered to one anchor). */
  comments: Comment[];
  config: CommentConfig;
  /** Anchor stamped onto created comments. */
  anchor?: CommentAnchor | null;
  compact?: boolean;
  /** Auto-open and focus the composer on mount. */
  autoFocusComposer?: boolean;
  /** Hide the composer (read-only thread). */
  hideComposer?: boolean;
  renderRootMeta?: (comment: Comment) => ReactNode;
  renderBody?: (body: string) => ReactNode;
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
  hideComposer = false,
  renderRootMeta,
  renderBody,
  onCreate,
  onReply,
  onUpdateStatus,
  onDelete,
  onChecklistToggle,
  onMention,
}: CommentThreadProps) {
  const listHandlers = buildThreadListHandlers(comments, config, {
    ...(onUpdateStatus ? { onUpdateStatus } : {}),
    ...(onDelete ? { onDelete } : {}),
    ...(onChecklistToggle ? { onChecklistToggle } : {}),
    ...(onReply ? { onReply } : {}),
    ...(onMention ? { onMention } : {}),
  });

  return (
    <div className={cn(compact && "p-2")}>
      <CommentThreadList
        comments={comments}
        config={config}
        compact={compact}
        {...(renderRootMeta ? { renderRootMeta } : {})}
        {...(renderBody ? { renderBody } : {})}
        {...listHandlers}
      />
      {!hideComposer && onCreate && (
        <div className="pt-1">
          <CommentComposer
            config={config}
            anchor={anchor ?? null}
            autoFocus={autoFocusComposer}
            onCreate={onCreate}
            {...(onMention ? { onMention } : {})}
          />
        </div>
      )}
    </div>
  );
}
