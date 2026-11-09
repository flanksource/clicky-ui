import { ActionError } from "../data/diagnostics/ActionError";
import { useId, useRef, useState } from "react";
import { Button } from "../components/button";
import { CommentEditor } from "./CommentEditor";
import { useCommentState } from "./comment-persistence";
import type { CommentConfig } from "./comment-types";

export function CommentReplyInput({ parentId, config, onSubmit, onCancel, pinned = false }: {
  parentId: string;
  config: CommentConfig;
  onSubmit: (body: string) => void | Promise<void>;
  onCancel: () => void;
  pinned?: boolean;
}) {
  const id = useId();
  const [body, setBody] = useCommentState(`draft:reply:${parentId}:body`, "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const submittingRef = useRef(false);
  async function send() {
    if (!body.trim() || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(body.trim());
      setBody("");
    } catch (cause) {
      setError(cause);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }
  return (
    <div className="space-y-1.5" aria-busy={submitting} data-comment-reply-bar={pinned || undefined}>
      {pinned && <label id={id} className="block text-xs font-medium">Reply to thread</label>}
      <div className="flex items-end gap-2 py-1">
        <div className="min-w-0 flex-1">
        <CommentEditor
          {...(config.vocabulary ? { vocabulary: config.vocabulary } : {})}
          mentionables={config.mentionables ?? []}
          autoFocus={!pinned}
          value={body}
          disabled={submitting}
          onChange={setBody}
          onSubmit={() => void send()}
          {...(!pinned ? { onCancel } : {})}
          placeholder="Write a reply…"
          {...(pinned ? { "aria-describedby": id } : {})}
          data-testid="comment-reply-input"
          className="min-h-9 max-h-32 min-w-0 flex-1 overflow-y-auto rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary/40 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:text-base"
        />
        </div>
        <Button size="sm" disabled={submitting || !body.trim()} onClick={() => void send()}>
          {submitting ? "Sending…" : "Send"}
        </Button>
      </div>
      {error !== null && <ActionError error={error} context={[["Operation", "Send reply"], ["Thread", parentId]]} />}
    </div>
  );
}
