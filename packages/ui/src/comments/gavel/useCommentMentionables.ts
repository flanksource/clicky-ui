import { useCallback, useEffect, useRef, useState } from "react";
import type { CommentMentionable } from "../comment-types";
import type { GavelCommentsClient } from "./client";

function describe(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

/**
 * What a comment on `target` can be addressed to with `@name`, as gavel resolves
 * it for the target: its comment agent rule, the runtime families and the
 * sessions in its scope. Feed `mentionables` to the composer; gavel parses the
 * `@` token itself when the comment is created or replied to.
 */
export function useCommentMentionables(options: { client: GavelCommentsClient; target: string | undefined }) {
  const { client, target } = options;
  const [mentionables, setMentionables] = useState<CommentMentionable[]>([]);
  const [loading, setLoading] = useState(target !== undefined);
  const [error, setError] = useState<string | null>(null);
  const targetRef = useRef(target);
  targetRef.current = target;

  const refresh = useCallback(async () => {
    const asked = targetRef.current;
    if (asked === undefined) return;
    try {
      const list = await client.mentionables(asked);
      if (targetRef.current !== asked) return;
      setMentionables(list);
      setError(null);
    } catch (cause) {
      if (targetRef.current === asked) setError(describe(cause));
    } finally {
      if (targetRef.current === asked) setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    setMentionables([]);
    setLoading(target !== undefined);
    void refresh();
  }, [refresh, target]);

  return { mentionables, loading, error, refresh };
}
