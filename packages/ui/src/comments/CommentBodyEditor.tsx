import { useRef, useState } from "react";
import { Button } from "../components/button";
import { ActionError } from "../data/diagnostics/ActionError";
import { CommentEditor } from "./CommentEditor";
import type { Comment, CommentConfig } from "./comment-types";

/**
 * Edits `comment`'s body in place. Save hands the trimmed body to `onSave` and
 * closes through `onDone` once it resolves; a failed save keeps the editor and
 * the draft open with the error. An unchanged body closes without calling back.
 */
export function CommentBodyEditor({
  comment,
  config,
  onSave,
  onDone,
}: {
  comment: Pick<Comment, "id" | "body" | "anchor">;
  config: CommentConfig;
  onSave: (body: string) => void | Promise<void>;
  onDone: () => void;
}) {
  const [body, setBody] = useState(comment.body);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const savingRef = useRef(false);

  async function save() {
    const next = body.trim();
    if (!next || savingRef.current) return;
    if (next === comment.body.trim()) return onDone();
    savingRef.current = true;
    setSaving(true);
    setError(null);
    try {
      await onSave(next);
      onDone();
    } catch (cause) {
      setError(cause);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div className="space-y-1.5" aria-busy={saving}>
      <CommentEditor
        {...(config.vocabulary ? { vocabulary: config.vocabulary } : {})}
        mentionables={config.mentionables ?? []}
        autoFocus
        value={body}
        disabled={saving}
        onChange={setBody}
        onSubmit={() => void save()}
        onCancel={() => {
          if (!savingRef.current) onDone();
        }}
        data-testid="comment-edit-input"
        className="min-h-9 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-background px-2 py-1 text-[13px] outline-none focus:border-primary/40 [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:text-base"
      />
      {error !== null && <ActionError error={error} context={[["Operation", "Edit comment"], ["Comment", comment.id], ["Anchor", comment.anchor ?? "Whole page"]]} />}
      <div className="flex justify-end gap-1.5">
        <Button size="sm" variant="ghost" disabled={saving} onClick={onDone}>
          Cancel
        </Button>
        <Button size="sm" disabled={saving || !body.trim()} onClick={() => void save()}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}
