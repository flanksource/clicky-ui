import { useState } from "react";
import { Button, CommentCard, useCommentContext } from "@flanksource/clicky-ui";
import { sortReplies, type Comment } from "@flanksource/clicky-ui/comments";

export function CommentMiniThread({ root, replies }: { root: Comment; replies: Comment[] }) {
  const { config, callbacks: { onEditReply } } = useCommentContext();
  const editReply = config.canEditThread?.(root) === false ? undefined : onEditReply;
  const [expanded, setExpanded] = useState(false);
  if (replies.length === 0) return null;
  const sorted = sortReplies(replies);
  const visible = expanded ? sorted : sorted.slice(-2);
  return (
    <section
      aria-label="Comment replies"
      className="space-y-1 border-t border-border/60 pt-2"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          {replies.length} {replies.length === 1 ? "reply" : "replies"}
        </span>
        {replies.length > 2 && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded
              ? "Show latest replies"
              : `Show ${replies.length - 2} earlier ${replies.length === 3 ? "reply" : "replies"}`}
          </Button>
        )}
      </div>
      {visible.map((reply) => (
        <CommentCard
          key={reply.id}
          comment={reply}
          config={config}
          compact
          {...(editReply ? { onEdit: (body) => editReply(root.id, reply.id, body) } : {})}
        />
      ))}
    </section>
  );
}
