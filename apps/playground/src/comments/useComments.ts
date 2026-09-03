import { useCallback, useEffect, useState, type RefObject } from "react";
import {
  DEFAULT_COMMENT_STATUSES,
  DOCUMENT_ANCHOR,
  type Comment,
  type CommentConfig,
  type CommentCreateInput,
  type CommentRating,
  type CommentReplyInput,
} from "@flanksource/clicky-ui/comments";

import type {
  CommentElementCaptureContext,
  CommentElementContext,
} from "../../plugins/comments-model";
import { resolveAnchor } from "./dom-anchor";
import { captureElementContext, captureElementHtml } from "./element-context";
import { captureScreenshot } from "./screenshot";

export const COMMENTS_ROUTE = "/__playground/comments";

/** The playground is single-user and local; there is no identity to look up. */
export const PLAYGROUND_COMMENT_AUTHOR = {
  name: "You",
  kind: "user",
} as const;

export const PLAYGROUND_COMMENT_CONFIG: CommentConfig = {
  statuses: DEFAULT_COMMENT_STATUSES,
};

/** A comment as the API returns it: tagged with the page it was left on. */
export type PlaygroundComment = Comment & {
  element?: CommentElementContext;
};
export type PageComment = PlaygroundComment & { page: string };

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (
    !(response.headers.get("content-type") ?? "").includes("application/json")
  ) {
    throw new Error(
      "Comment persistence only exists under `vite dev` — the playground-comments middleware " +
        "is not part of the production build.",
    );
  }
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(
      payload.error ??
        `${init?.method ?? "GET"} ${url} failed (${response.status})`,
    );
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
  comments: PlaygroundComment[];
  allComments: PageComment[];
  /** Surfaced as a banner — a broken backend must never look like "no comments". */
  error: string | null;
  create: (input: CommentCreateInput) => Promise<void>;
  reply: (input: CommentReplyInput) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  close: (id: string) => Promise<void>;
  commentAndReopen: (id: string, body: string) => Promise<void>;
  updateRating: (id: string, rating: CommentRating) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function useComments(
  page: string,
  contentRef: RefObject<HTMLDivElement | null>,
): PlaygroundComments {
  const [comments, setComments] = useState<PlaygroundComment[]>([]);
  const [allComments, setAllComments] = useState<PageComment[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [pageComments, everyComment] = await Promise.all([
        fetchComments({ page }),
        fetchComments(),
      ]);
      setComments(pageComments);
      setAllComments(everyComment);
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
    async (
      run: () => Promise<unknown>,
      options: { rethrow?: boolean } = {},
    ) => {
      try {
        await run();
        setError(null);
      } catch (cause) {
        setError(describeError(cause));
        if (options.rethrow) throw cause;
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
      mutate(
        async () => {
          const anchor = input.anchor ?? null;
          const content = contentRef.current;
          if (!content) {
            throw new Error(
              "Playground content is not mounted for comment capture",
            );
          }
          const target =
            anchor === null || anchor === DOCUMENT_ANCHOR
              ? content
              : resolveAnchor(content, anchor);
          if (!target) {
            throw new Error(
              `Comment anchor ${JSON.stringify(anchor)} no longer matches an element`,
            );
          }

          // Start capture while the submit click still supplies browser activation.
          const screenshot = captureScreenshot(target);
          const context =
            anchor === null || anchor === DOCUMENT_ANCHOR
              ? Promise.resolve({
                  source: `apps/playground/src/pages/${page}.tsx`,
                  html: captureElementHtml(target),
                })
              : captureElementContext(target);
          const [capturedContext, capturedScreenshot] = await Promise.all([
            context,
            screenshot,
          ]);
          const element: CommentElementCaptureContext = {
            ...capturedContext,
            screenshot: capturedScreenshot,
          };

          await post(COMMENTS_ROUTE, {
            page,
            body: input.body,
            author: PLAYGROUND_COMMENT_AUTHOR,
            anchor,
            ...(input.rating ? { rating: input.rating } : {}),
            element,
          });
        },
        { rethrow: true },
      ),
    [contentRef, mutate, page, post],
  );

  const reply = useCallback(
    (input: CommentReplyInput) =>
      mutate(() =>
        post(
          `${COMMENTS_ROUTE}/${encodeURIComponent(input.parentId)}/replies`,
          {
            body: input.body,
            author: PLAYGROUND_COMMENT_AUTHOR,
          },
        ),
      ),
    [mutate, post],
  );

  const updateStatus = useCallback(
    (id: string, status: string) =>
      mutate(
        () => {
          if (status === "resolved") {
            return post(
              `${COMMENTS_ROUTE}/${encodeURIComponent(id)}/resolve`,
              {},
            );
          }
          if (status === "open") {
            return post(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}/reopen`, {
              author: PLAYGROUND_COMMENT_AUTHOR,
            });
          }
          return request(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          });
        },
        { rethrow: true },
      ),
    [mutate, post],
  );

  const close = useCallback(
    (id: string) =>
      mutate(
        () =>
          post(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}/close`, {
            author: PLAYGROUND_COMMENT_AUTHOR,
          }),
        { rethrow: true },
      ),
    [mutate, post],
  );

  const commentAndReopen = useCallback(
    (id: string, body: string) =>
      mutate(
        () =>
          post(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}/reopen`, {
            author: PLAYGROUND_COMMENT_AUTHOR,
            body,
          }),
        { rethrow: true },
      ),
    [mutate, post],
  );

  const updateRating = useCallback(
    (id: string, rating: CommentRating) =>
      mutate(() =>
        request(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rating }),
        }),
      ),
    [mutate],
  );

  const remove = useCallback(
    (id: string) =>
      mutate(() =>
        request(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}`, {
          method: "DELETE",
        }),
      ),
    [mutate],
  );

  return {
    comments,
    allComments,
    error,
    create,
    reply,
    updateStatus,
    close,
    commentAndReopen,
    updateRating,
    remove,
  };
}
