import { useCallback, useEffect, useState } from "react";
import {
  DEFAULT_COMMENT_STATUSES,
  type Comment,
  type CommentConfig,
  type CommentCreateInput,
  type CommentReplyInput,
} from "@flanksource/clicky-ui/comments";

export const COMMENTS_ROUTE = "/__playground/comments";

/** The playground is single-user and local; there is no identity to look up. */
const AUTHOR = { name: "You", kind: "user" } as const;

const DEFAULT_STATUS =
  DEFAULT_COMMENT_STATUSES.find((status) => status.unresolved)?.value ?? "open";

export const PLAYGROUND_COMMENT_CONFIG: CommentConfig = {
  statuses: DEFAULT_COMMENT_STATUSES,
};

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!(response.headers.get("content-type") ?? "").includes("application/json")) {
    throw new Error(
      "Comment persistence only exists under `vite dev` — the playground-comments middleware " +
        "is not part of the production build.",
    );
  }
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `${init?.method ?? "GET"} ${url} failed (${response.status})`);
  }
  return payload;
}

export type PlaygroundComments = {
  comments: Comment[];
  /** Surfaced as a banner — a broken backend must never look like "no comments". */
  error: string | null;
  create: (input: CommentCreateInput) => Promise<void>;
  reply: (input: CommentReplyInput) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function useComments(page: string): PlaygroundComments {
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setComments(await request<Comment[]>(`${COMMENTS_ROUTE}?page=${encodeURIComponent(page)}`));
      setError(null);
    } catch (cause) {
      setError(describeError(cause));
    }
  }, [page]);

  useEffect(() => {
    setComments([]);
    void refresh();
  }, [refresh]);

  const mutate = useCallback(
    async (run: () => Promise<unknown>) => {
      try {
        await run();
        setError(null);
      } catch (cause) {
        setError(describeError(cause));
      }
      await refresh();
    },
    [refresh],
  );

  const post = useCallback(
    (comment: Record<string, unknown>) =>
      request(COMMENTS_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ page, comment }),
      }),
    [page],
  );

  const entityUrl = useCallback(
    (id: string) =>
      `${COMMENTS_ROUTE}/${encodeURIComponent(id)}?page=${encodeURIComponent(page)}`,
    [page],
  );

  const create = useCallback(
    (input: CommentCreateInput) =>
      mutate(() =>
        post({
          body: input.body,
          author: AUTHOR,
          status: DEFAULT_STATUS,
          anchor: input.anchor ?? null,
          parentId: null,
        }),
      ),
    [mutate, post],
  );

  const reply = useCallback(
    (input: CommentReplyInput) =>
      mutate(() =>
        post({
          body: input.body,
          author: AUTHOR,
          anchor: input.anchor ?? null,
          parentId: input.parentId,
        }),
      ),
    [mutate, post],
  );

  const updateStatus = useCallback(
    (id: string, status: string) =>
      mutate(() =>
        request(entityUrl(id), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      ),
    [entityUrl, mutate],
  );

  const remove = useCallback(
    (id: string) => mutate(() => request(entityUrl(id), { method: "DELETE" })),
    [entityUrl, mutate],
  );

  return { comments, error, create, reply, updateStatus, remove };
}
