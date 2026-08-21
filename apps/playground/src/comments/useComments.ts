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

/** A comment as the API returns it: tagged with the page it was left on. */
export type PageComment = Comment & { page: string };

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

/**
 * One-shot listing across every page. Used by the toolbar's cross-page copy
 * actions, which need pages the provider has never loaded — deliberately not a
 * hook, so a copy never adds provider state.
 */
export async function fetchComments(
  filter: { page?: string; unresolved?: boolean } = {},
): Promise<PageComment[]> {
  const params = new URLSearchParams();
  if (filter.page !== undefined) params.set("page", filter.page);
  if (filter.unresolved) params.set("unresolved", "true");

  const query = params.toString();
  const { comments } = await request<{ comments: PageComment[] }>(
    query === "" ? COMMENTS_ROUTE : `${COMMENTS_ROUTE}?${query}`,
  );
  return comments;
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
      setComments(await fetchComments({ page }));
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
    (url: string, payload: Record<string, unknown>) =>
      request(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    [],
  );

  const create = useCallback(
    (input: CommentCreateInput) =>
      mutate(() =>
        post(COMMENTS_ROUTE, {
          page,
          body: input.body,
          author: AUTHOR,
          status: DEFAULT_STATUS,
          anchor: input.anchor ?? null,
        }),
      ),
    [mutate, page, post],
  );

  const reply = useCallback(
    (input: CommentReplyInput) =>
      mutate(() =>
        post(`${COMMENTS_ROUTE}/${encodeURIComponent(input.parentId)}/replies`, {
          body: input.body,
          author: AUTHOR,
        }),
      ),
    [mutate, post],
  );

  const updateStatus = useCallback(
    (id: string, status: string) =>
      mutate(() =>
        request(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      ),
    [mutate],
  );

  const remove = useCallback(
    (id: string) =>
      mutate(() => request(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}`, { method: "DELETE" })),
    [mutate],
  );

  return { comments, error, create, reply, updateStatus, remove };
}
