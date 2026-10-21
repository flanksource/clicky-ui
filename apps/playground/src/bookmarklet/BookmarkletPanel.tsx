import { useEffect, useRef, useState } from "react";
import {
  Button,
  CommentProvider,
  CommentSidePanel,
  DensityProvider,
  ThemeProvider,
  useCommentContext,
  type CommentScrollOptions,
} from "@flanksource/clicky-ui";
import { CommentCapture } from "../comments/CommentCapture";
import {
  PLAYGROUND_COMMENT_CONFIG,
  request,
  useComments,
  type PageComment,
} from "../comments/useComments";
import { commentsToMarkdown } from "../comments/markdown";
import { tallyAnchors } from "../comments/useDomAnchors";
import { PlaygroundCommentReview } from "../comments/PlaygroundCommentReview";
import {
  EXTERNAL_PAGES_ROUTE,
  externalUrl,
  type ExternalPage,
  type HostState,
  type AnchorState,
} from "./model";
import { sendToHost, useHostBridge } from "./useHostBridge";

type PageSession = { page: ExternalPage; state: HostState };

export function BookmarkletPanel() {
  const bridge = useHostBridge();
  const [sessions, setSessions] = useState<Record<string, PageSession>>({});
  const [active, setActive] = useState<string>();
  const [candidates, setCandidates] = useState<ExternalPage[]>([]);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [retry, setRetry] = useState(0);
  const stateRef = useRef(bridge.state);
  stateRef.current = bridge.state;

  async function associate(state: HostState, mergeInto?: string) {
    setPending(true);
    setError("");
    try {
      const { page } = await request<{ page: ExternalPage }>(
        EXTERNAL_PAGES_ROUTE,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: state.url,
            title: state.title,
            ...(mergeInto ? { mergeInto } : {}),
          }),
        },
      );
      if (stateRef.current?.url !== state.url) return;
      setSessions((current) => ({
        ...current,
        [page.id]: { page, state: stateRef.current ?? state },
      }));
      setActive(page.id);
      setCandidates([]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    const state = bridge.state;
    if (!state) return;
    let cancelled = false;
    setActive(undefined);
    setCandidates([]);
    setError("");
    void request<{ page: ExternalPage | null; candidates: ExternalPage[] }>(
      `${EXTERNAL_PAGES_ROUTE}?url=${encodeURIComponent(state.url)}`,
    )
      .then(async (result) => {
        if (cancelled) return;
        if (result.page) {
          const page = result.page;
          setSessions((current) => ({
            ...current,
            [page.id]: { page, state: stateRef.current ?? state },
          }));
          setActive(page.id);
        } else if (result.candidates.length) setCandidates(result.candidates);
        else await associate(state);
      })
      .catch((cause: unknown) => {
        if (!cancelled)
          setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => {
      cancelled = true;
    };
  }, [bridge.state?.url, retry]);

  useEffect(() => {
    if (!active || !bridge.state) return;
    setSessions((current) => {
      const previous = current[active];
      return previous
        ? { ...current, [active]: { ...previous, state: bridge.state! } }
        : current;
    });
  }, [active, bridge.state]);

  return (
    <ThemeProvider>
      <DensityProvider>
        <main className="flex h-dvh min-h-0 flex-col bg-background text-foreground">
          <header className="flex items-center gap-2 border-b border-border p-3">
            <h1
              className="min-w-0 flex-1 truncate text-sm font-semibold"
              title={bridge.state?.url}
            >
              Playground comments
            </h1>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => sendToHost({ type: "close" })}
            >
              Close
            </Button>
          </header>
          {(error || bridge.error) && (
            <div
              role="alert"
              className="space-y-2 p-3 text-sm text-destructive"
            >
              {error || bridge.error}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRetry((value) => value + 1)}
              >
                Retry
              </Button>
            </div>
          )}
          {candidates.length > 0 && (
            <section className="space-y-3 p-3 text-sm">
              <h2 className="font-semibold">Different query parameters</h2>
              <p className="break-all text-xs text-muted-foreground">
                {bridge.state?.url}
              </p>
              <p>
                Merge this URL into an existing comment set, or start a new set.
                This choice is remembered.
              </p>
              {candidates.map((page) => (
                <div
                  key={page.id}
                  className="space-y-1 rounded-md border border-border p-2"
                >
                  <p className="font-medium">{page.title}</p>
                  <p className="break-all text-xs text-muted-foreground">
                    {page.urls.join("\n")}
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() => {
                      if (bridge.state) void associate(bridge.state, page.id);
                    }}
                  >
                    Merge
                  </Button>
                </div>
              ))}
              <Button
                size="sm"
                disabled={pending}
                onClick={() => {
                  if (bridge.state) void associate(bridge.state);
                }}
              >
                New comment set
              </Button>
            </section>
          )}
          {!active && !candidates.length && !error && !bridge.error && (
            <p role="status" className="p-3 text-sm">
              Connecting to this page…
            </p>
          )}
          {Object.values(sessions).map((value) => (
            <div
              key={value.page.id}
              className={
                active === value.page.id
                  ? "min-h-0 flex-1 overflow-y-auto p-3"
                  : "hidden"
              }
            >
              <SessionRail
                {...value}
                visible={active === value.page.id}
                anchors={bridge.anchors}
                {...(bridge.focus ? { focus: bridge.focus } : {})}
              />
            </div>
          ))}
        </main>
      </DensityProvider>
    </ThemeProvider>
  );
}

function SessionRail({
  page,
  state,
  visible,
  anchors,
  focus,
}: PageSession & { visible: boolean; anchors: AnchorState[]; focus?: string }) {
  const content = useRef<HTMLDivElement>(null);
  const comments = useComments(page.id, content, {
    enabled: visible,
    poll: true,
    capture: async (input) => {
      if (
        !visible ||
        !state.selection ||
        input.anchor !== state.selection.anchor ||
        externalUrl(state.selection.element.pageUrl ?? "").url !==
          externalUrl(state.url).url
      ) {
        throw new Error(
          "Select an element or Comment on page on the current URL before posting this draft",
        );
      }
      return state.selection.element;
    },
  });
  const navigate = (anchor: string, options: CommentScrollOptions) => {
    if (!anchors.some((value) => value.anchor === anchor && value.available))
      return false;
    sendToHost({ type: "scroll", anchor, ...options });
    return true;
  };
  return (
    <CommentProvider
      comments={comments.comments}
      config={PLAYGROUND_COMMENT_CONFIG}
      initialRailMode="all"
      onCreate={comments.create}
      onReply={comments.reply}
      onUpdateStatus={comments.updateStatus}
      onClose={comments.close}
      onDelete={comments.remove}
      onUpdateRating={comments.updateRating}
      onScrollToAnchor={navigate}
      getAnchorTop={(anchor) =>
        anchors.find((value) => value.anchor === anchor && value.available)
          ?.top ?? null
      }
    >
      {comments.error && (
        <p role="alert" className="text-sm text-destructive">
          {comments.error}
        </p>
      )}
      <RailContents
        page={page}
        state={state}
        visible={visible}
        anchors={anchors}
        comments={comments.allComments.filter(
          (value) => value.page === page.id,
        )}
        onReopen={comments.commentAndReopen}
        {...(focus ? { focus } : {})}
      />
    </CommentProvider>
  );
}

function RailContents({
  page,
  state,
  visible,
  anchors,
  focus,
  comments,
  onReopen,
}: PageSession & {
  visible: boolean;
  anchors: AnchorState[];
  focus?: string;
  comments: PageComment[];
  onReopen: (id: string, body: string) => Promise<void>;
}) {
  const ctx = useCommentContext();
  const [review, setReview] = useState(false);
  const [selected, setSelected] = useState<string>();
  const labels = Object.fromEntries(
    anchors.map((value) => [value.anchor, value.label]),
  );
  if (state.selection) labels[state.selection.anchor] = state.selection.label;
  const pins = JSON.stringify(
    tallyAnchors(ctx.comments).map((value) => value.anchor),
  );
  useEffect(() => {
    if (visible)
      sendToHost({ type: "pins", anchors: JSON.parse(pins) as string[] });
  }, [visible, pins, state]);
  useEffect(() => {
    if (visible && state.selection) ctx.focusAnchor(state.selection.anchor);
  }, [visible, state.selection, ctx.focusAnchor]);
  useEffect(() => {
    if (visible && focus) ctx.focusAnchor(focus);
  }, [visible, focus, ctx.focusAnchor]);
  useEffect(() => {
    if (visible)
      sendToHost({
        type: "highlight",
        anchor: ctx.highlightAnchor ?? ctx.focusedAnchor,
      });
  }, [visible, ctx.highlightAnchor, ctx.focusedAnchor]);
  const markdown = (
    thread: readonly import("@flanksource/clicky-ui").Comment[],
  ) =>
    commentsToMarkdown([{ page: page.id, comments: [...thread] }], {
      labels,
      pageUrl: () => state.url,
      pagePath: () => state.url,
      screenshotUrl: (url) => new URL(url, location.origin).href,
      commentActionUrls: (id) => ({
        reply: `${location.origin}/__playground/comments/${encodeURIComponent(id)}/replies`,
        resolve: `${location.origin}/__playground/comments/${encodeURIComponent(id)}/resolve`,
      }),
    });
  const queue = comments.filter(
    (comment) => !comment.parentId && comment.status === "resolved",
  );
  useEffect(() => {
    if (!queue.some((value) => value.id === selected))
      setSelected(queue[0]?.id);
  }, [comments, selected]);
  return (
    <>
      <p className="mb-3 break-all text-xs text-muted-foreground">
        {state.url}
      </p>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => sendToHost({ type: "pick" })}
        >
          Select element
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => sendToHost({ type: "pick", screenshot: true })}
        >
          Select with screenshot
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => sendToHost({ type: "page" })}
        >
          Comment on page
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={!queue.length}
          onClick={() => setReview((value) => !value)}
        >
          Review resolved ({queue.length})
        </Button>
      </div>
      {review ? (
        <PlaygroundCommentReview
          allComments={comments}
          selectedId={selected}
          config={ctx.config}
          anchorLabels={labels}
          formatAnchorLabel={(anchor) => anchor}
          threadToMarkdown={markdown}
          onSelect={(item) => {
            setSelected(item?.id);
            if (item?.anchor) ctx.scrollToAnchor(item.anchor);
          }}
          onClose={async (id) => {
            if (!ctx.callbacks.onClose)
              throw new Error("Closing is not configured");
            await ctx.callbacks.onClose(id);
          }}
          onCommentAndReopen={onReopen}
          onReply={async (parent, body) => {
            if (!ctx.callbacks.onReply)
              throw new Error("Replies are not configured");
            await ctx.callbacks.onReply({ parentId: parent.id, body });
          }}
          onExit={() => setReview(false)}
        />
      ) : (
        <CommentSidePanel
          compact
          focusedAlignment="flow"
          className="!w-full"
          anchorLabels={labels}
          formatAnchorLabel={(anchor) => anchor}
          createActions={[
            {
              id: "plain",
              label: state.selection?.element.screenshot
                ? "Post with screenshot"
                : "Post comment",
            },
          ]}
          renderRootDetails={(comment) => <CommentCapture comment={comment} />}
          threadToMarkdown={markdown}
        />
      )}
      {anchors.some((anchor) => !anchor.available) && (
        <p role="status" className="mt-3 text-xs text-muted-foreground">
          Some anchors are unavailable. Their comments are retained.
        </p>
      )}
    </>
  );
}
