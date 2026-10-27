import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  DEFAULT_COMMENT_STATUSES,
  DOCUMENT_ANCHOR,
  type Comment,
  type CommentAuthor,
  type CommentConfig,
  type CommentCreateInput,
  type CommentRating,
  type CommentReplyInput,
} from "@flanksource/clicky-ui/comments";
import { normalizeErrorDiagnostics, type ErrorDiagnostics } from "@flanksource/clicky-ui";

import type { AgentSessionRuntime } from "../../plugins/agent-session-store";
import type {
  CommentElementCaptureContext,
  CommentElementContext,
  CommentScreenshotCapture,
} from "../../plugins/comments-model";
import type {
  StoredComment,
  StoredPromptRun,
} from "../../plugins/comments-store";
import { overlayLabel, resolveAnchor } from "./dom-anchor";
import { captureElementContext, captureElementHtml } from "./element-context";
import { captureScreenshot } from "./screenshot";

export const COMMENTS_ROUTE = "/__playground/comments";

/** The playground is single-user and local; there is no identity to look up. */
export const PLAYGROUND_COMMENT_AUTHOR = {
  name: "You",
  kind: "user",
} as const;

/**
 * Who a thread can be handed to. Agent names match the `author.name` the
 * copied instructions tell each agent to use, so an agent acknowledging its own
 * hand-off is recognised as the assignee rather than as a competing claim.
 */
export const PLAYGROUND_ASSIGNEES: NonNullable<CommentConfig["assignees"]> = [
  { id: "you", name: PLAYGROUND_COMMENT_AUTHOR.name, kind: "user" },
  { id: "claude", name: "Claude", kind: "agent" },
  { id: "codex", name: "Codex", kind: "agent" },
];

export const PLAYGROUND_COMMENT_CONFIG: CommentConfig = {
  statuses: DEFAULT_COMMENT_STATUSES,
  assignees: PLAYGROUND_ASSIGNEES,
};

/** A comment as the API returns it: tagged with the page it was left on. */
export type PlaygroundComment = Comment & {
  element?: CommentElementContext;
  promptRun?: StoredPromptRun;
  lint?: StoredComment["lint"];
};
export type PageComment = PlaygroundComment & { page: string };

/**
 * The root an anchor's locators are computed against. Dialog anchors get none:
 * their element lives in a portal outside the artifact and is usually closed
 * when the page is reloaded, so only the anchor itself can find it.
 */
function locatorRoot(
  anchor: string,
  content: Element | null,
): { root?: Element } {
  return content && overlayLabel(anchor) === null ? { root: content } : {};
}

function describeError(cause: unknown): string {
  return cause instanceof Error ? cause.message : String(cause);
}

export async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (
    !(response.headers.get("content-type") ?? "").includes("application/json")
  ) {
    throw new Error(
      "The playground comments API returned a non-JSON response. Run the playground with vite dev or vite preview.",
    );
  }
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    const fallback = `${init?.method ?? "GET"} ${url} failed (${response.status})`;
    throw new ApiError(
      response.status,
      normalizeErrorDiagnostics(payload, fallback) ?? { message: fallback, context: [] },
    );
  }
  return payload;
}

/** A failed playground API call, keeping the server's error envelope (hint, context, details) for display. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly diagnostics: ErrorDiagnostics,
  ) {
    super(diagnostics.message);
  }
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
  loading: boolean;
  /** Surfaced as a banner — a broken backend must never look like "no comments". */
  error: string | null;
  create: (input: CommentCreateInput, actionId?: string) => Promise<void>;
  /** Captures an element's source, HTML and locators as the comments store them. */
  captureSelection: (
    anchor: string,
    target: Element,
  ) => Promise<CommentElementCaptureContext>;
  prepareSelection: (
    anchor: string,
    target: Element,
    screenshot?: Promise<CommentScreenshotCapture>,
  ) => void;
  reply: (input: CommentReplyInput) => Promise<void>;
  updateStatus: (id: string, status: string) => Promise<void>;
  /** Claim a thread for the current user. */
  acknowledge: (id: string) => Promise<void>;
  /** Hand a thread to `assignee`, or clear the hand-off with `null`. */
  assign: (id: string, assignee: CommentAuthor | null) => Promise<void>;
  close: (id: string) => Promise<void>;
  /**
   * Send a thread to the shared agent session. `runtime` is required only when
   * no session is live, in which case it starts one.
   */
  runAgent: (id: string, runtime?: AgentSessionRuntime) => Promise<void>;
  commentAndReopen: (id: string, body: string) => Promise<void>;
  updateRating: (id: string, rating: CommentRating) => Promise<void>;
  remove: (id: string) => Promise<void>;
};

export function useComments(
  page: string,
  contentRef: RefObject<HTMLDivElement | null>,
  options: {
    enabled?: boolean;
    poll?: boolean;
    capture?: (
      input: CommentCreateInput,
      actionId: string,
    ) => Promise<CommentElementCaptureContext>;
  } = {},
): PlaygroundComments {
  const captureRef = useRef(options.capture);
  captureRef.current = options.capture;
  const enabled = options.enabled !== false;
  const pageRef = useRef(page);
  pageRef.current = page;
  const [comments, setComments] = useState<PlaygroundComment[]>([]);
  const [allComments, setAllComments] = useState<PageComment[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const preparedSelection = useRef<{
    page: string;
    anchor: string;
    target: Element;
    context: Promise<PromiseSettledResult<CommentElementContext>>;
    screenshot?: Promise<CommentScreenshotCapture>;
  } | null>(null);

  const captureSelection = useCallback(
    (anchor: string, target: Element) =>
      captureElementContext(target, {
        fallbackSource: `apps/playground/src/pages/${page}.tsx`,
        ...locatorRoot(anchor, contentRef.current),
      }),
    [contentRef, page],
  );

  const prepareSelection = useCallback(
    (
      anchor: string,
      target: Element,
      screenshot?: Promise<CommentScreenshotCapture>,
    ) => {
      preparedSelection.current = {
        page,
        anchor,
        target,
        context: captureSelection(anchor, target).then(
          (value) => ({ status: "fulfilled" as const, value }),
          (reason: unknown) => ({ status: "rejected" as const, reason }),
        ),
        ...(screenshot ? { screenshot } : {}),
      };
    },
    [captureSelection, page],
  );

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const [pageComments, everyComment] = await Promise.all([
        page === "" ? Promise.resolve([]) : fetchComments({ page }),
        fetchComments(),
      ]);
      if (pageRef.current !== page) return;
      setComments(pageComments);
      setAllComments(everyComment);
      setError(null);
    } catch (cause) {
      if (pageRef.current !== page) return;
      setError(describeError(cause));
    } finally {
      if (pageRef.current === page) setLoading(false);
    }
  }, [page, enabled]);

  useEffect(() => {
    setComments([]);
    preparedSelection.current = null;
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !options.poll) return;
    const update = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(update, 5000);
    window.addEventListener("focus", update);
    return () => {
      clearInterval(timer);
      window.removeEventListener("focus", update);
    };
  }, [enabled, options.poll, refresh]);

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
    (input: CommentCreateInput, actionId = "plain") =>
      mutate(
        async () => {
          if (actionId !== "plain" && actionId !== "screenshot") {
            throw new Error(
              `Unknown comment create action ${JSON.stringify(actionId)}`,
            );
          }
          if (captureRef.current) {
            const element = await captureRef.current(input, actionId);
            await post(COMMENTS_ROUTE, {
              page,
              body: input.body,
              author: PLAYGROUND_COMMENT_AUTHOR,
              anchor: input.anchor ?? null,
              ...(input.rating ? { rating: input.rating } : {}),
              element,
            });
            return;
          }
          const anchor = input.anchor ?? null;
          const content = contentRef.current;
          if (!content) {
            throw new Error(
              "Playground content is not mounted for comment capture",
            );
          }
          const prepared =
            preparedSelection.current?.page === page &&
            preparedSelection.current.anchor === anchor
              ? preparedSelection.current
              : null;
          // A dialog may close between picking an element and posting; the
          // prepared selection captured its context while it was still open.
          const target =
            anchor === null || anchor === DOCUMENT_ANCHOR
              ? content
              : (resolveAnchor(content, anchor) ?? prepared?.target);
          if (!target) {
            throw new Error(
              `Comment anchor ${JSON.stringify(anchor)} no longer matches an element`,
            );
          }
          const screenshot =
            actionId === "screenshot"
              ? (prepared?.screenshot ?? captureScreenshot(target))
              : null;
          const context = prepared
            ? prepared.context.then((result) => {
                if (result.status === "rejected") throw result.reason;
                return result.value;
              })
            : anchor === null || anchor === DOCUMENT_ANCHOR
              ? Promise.resolve({
                  source: `apps/playground/src/pages/${page}.tsx`,
                  html: captureElementHtml(target),
                })
              : captureElementContext(target, {
                  fallbackSource: `apps/playground/src/pages/${page}.tsx`,
                  ...locatorRoot(anchor, content),
                });
          const capturedContext = await context;
          const capturedScreenshot = await screenshot;
          const element: CommentElementCaptureContext = {
            ...capturedContext,
            ...(capturedScreenshot ? { screenshot: capturedScreenshot } : {}),
          };

          let expectedSource: string | undefined;
          if (input.reviewDecision) {
            const response = await fetch(`/__playground/sources?slug=${encodeURIComponent(page)}`);
            const payload = await response.json() as { source?: string; error?: string };
            if (!response.ok || typeof payload.source !== "string") throw new Error(payload.error ?? "Could not read review source");
            expectedSource = payload.source;
          }
          await post(COMMENTS_ROUTE, {
            page,
            body: input.body,
            author: PLAYGROUND_COMMENT_AUTHOR,
            anchor,
            ...(input.rating ? { rating: input.rating } : {}),
            ...(input.reviewDecision
              ? { reviewDecision: input.reviewDecision }
              : {}),
            element,
            ...(expectedSource === undefined ? {} : { expectedSource }),
          });
          if (input.reviewDecision) window.location.reload();
          if (preparedSelection.current === prepared) {
            preparedSelection.current = null;
          }
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
          throw new Error(
            `Status ${JSON.stringify(status)} cannot be set directly; use acknowledge, assign, resolve or reopen`,
          );
        },
        { rethrow: true },
      ),
    [mutate, post],
  );

  const acknowledge = useCallback(
    (id: string) =>
      mutate(
        () =>
          post(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}/acknowledge`, {
            author: PLAYGROUND_COMMENT_AUTHOR,
          }),
        { rethrow: true },
      ),
    [mutate, post],
  );

  const assign = useCallback(
    (id: string, assignee: CommentAuthor | null) =>
      mutate(
        () =>
          post(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}/assign`, {
            author: PLAYGROUND_COMMENT_AUTHOR,
            assignee:
              assignee === null
                ? null
                : {
                    name: assignee.name,
                    ...(assignee.kind ? { kind: assignee.kind } : {}),
                  },
          }),
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

  const runAgent = useCallback(
    (id: string, runtime?: AgentSessionRuntime) =>
      mutate(
        () =>
          post(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}/agent-run`, {
            author: PLAYGROUND_COMMENT_AUTHOR,
            ...(runtime ? { runtime } : {}),
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
      mutate(
        () => request(`${COMMENTS_ROUTE}/${encodeURIComponent(id)}`, {
          method: "DELETE",
        }),
        { rethrow: true },
      ),
    [mutate],
  );

  return {
    comments,
    allComments,
    loading,
    error,
    create,
    captureSelection,
    prepareSelection,
    reply,
    updateStatus,
    acknowledge,
    assign,
    close,
    runAgent,
    commentAndReopen,
    updateRating,
    remove,
  };
}
