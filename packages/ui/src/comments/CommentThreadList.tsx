import { useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/button";
import { CommentCard } from "./CommentCard";
import { buildReplyMap, getRoots, sortReplies } from "./comment-utils";
import type { Comment, CommentConfig } from "./comment-types";

export type CommentThreadListProps = {
  comments: Comment[];
  config: CommentConfig;
  compact?: boolean;
  /** Extra content rendered above each root card (e.g. an anchor label). */
  renderRootMeta?: (comment: Comment) => ReactNode;
  /** Props merged onto each thread wrapper (e.g. for scroll anchoring). */
  getThreadProps?: (comment: Comment) => HTMLAttributes<HTMLDivElement>;
  /** Custom body renderer forwarded to each card. */
  renderBody?: (body: string) => ReactNode;
  onUpdateStatus?: (id: string, status: string) => void;
  onChecklistToggle?: (id: string, index: number) => void;
  onDelete?: (id: string) => void;
  /** Submit a reply to `parent`. Presence enables the inline reply affordance. */
  onReply?: (parent: Comment, body: string) => void | Promise<void>;
};

function ReplyInput({
  onSubmit,
  onCancel,
}: {
  onSubmit: (body: string) => void | Promise<void>;
  onCancel: () => void;
}) {
  const [body, setBody] = useState("");
  async function send() {
    if (!body.trim()) return;
    await onSubmit(body.trim());
    setBody("");
  }
  return (
    <div className="ml-6 flex gap-1.5 py-1">
      <input
        autoFocus
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            void send();
          }
          if (e.key === "Escape") onCancel();
        }}
        placeholder="Write a reply…"
        data-testid="comment-reply-input"
        className="h-7 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary/40"
      />
      <Button
        size="sm"
        className="h-7 text-xs"
        disabled={!body.trim()}
        onClick={() => void send()}
      >
        Send
      </Button>
    </div>
  );
}

/**
 * Renders a list of threaded comments: each root with its sorted replies and an
 * optional inline reply box. Fully controlled — mutations route through the
 * id-keyed callbacks.
 */
export function CommentThreadList({
  comments,
  config,
  compact = false,
  renderRootMeta,
  getThreadProps,
  renderBody,
  onUpdateStatus,
  onChecklistToggle,
  onDelete,
  onReply,
}: CommentThreadListProps) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const roots = getRoots(comments);
  const replyMap = buildReplyMap(comments);

  if (roots.length === 0) return null;

  function cardHandlers(id: string) {
    return {
      ...(onUpdateStatus
        ? { onUpdateStatus: (status: string) => onUpdateStatus(id, status) }
        : {}),
      ...(onChecklistToggle
        ? { onChecklistToggle: (index: number) => onChecklistToggle(id, index) }
        : {}),
      ...(onDelete ? { onDelete: () => onDelete(id) } : {}),
    };
  }

  return (
    <div className="space-y-2">
      {roots.map((root) => {
        const replies = sortReplies(replyMap.get(root.id) ?? []);
        const threadProps = getThreadProps?.(root) ?? {};
        return (
          <div
            key={root.id}
            data-testid="comment-thread-block"
            data-comment-id={root.id}
            {...threadProps}
            className={cn("space-y-1.5 p-1", threadProps.className)}
          >
            {renderRootMeta ? (
              <div className="px-1">{renderRootMeta(root)}</div>
            ) : null}
            <CommentCard
              comment={root}
              config={config}
              compact={compact}
              {...(renderBody ? { renderBody } : {})}
              {...cardHandlers(root.id)}
              {...(onReply ? { onReply: () => setReplyingTo(root.id) } : {})}
            />
            {replies.length > 0 && (
              <div className="space-y-1.5">
                {replies.map((reply) => (
                  <CommentCard
                    key={reply.id}
                    comment={reply}
                    config={config}
                    compact={compact}
                    {...(renderBody ? { renderBody } : {})}
                    {...cardHandlers(reply.id)}
                  />
                ))}
              </div>
            )}
            {onReply && replyingTo === root.id && (
              <ReplyInput
                onCancel={() => setReplyingTo(null)}
                onSubmit={async (body) => {
                  await onReply(root, body);
                  setReplyingTo(null);
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
