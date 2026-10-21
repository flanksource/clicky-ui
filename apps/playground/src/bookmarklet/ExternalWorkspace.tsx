import {
  AppShell,
  Button,
  CommentSidePanel,
  useCommentContext,
} from "@flanksource/clicky-ui";
import { BookmarkletInstall } from "./BookmarkletInstall";
import { PlaygroundAgentInstructions } from "../PlaygroundAgentInstructions";
import { useExternalCatalog } from "./external-catalog";
import { ExternalPreview } from "./ExternalPreview";
import { CommentCapture } from "../comments/CommentCapture";
import { PlaygroundCommentReview } from "../comments/PlaygroundCommentReview";
import { useFeedbackCopy } from "../comments/useFeedbackCopy";
import { resolvedReviewQueue } from "../comments/PlaygroundCommentReview";
import type { PageComment } from "../comments/useComments";

export function ExternalWorkspace({
  id,
  comments,
  error,
  review,
  selectedId,
  navigate,
  onReopen,
}: {
  id: string;
  comments: PageComment[];
  error: string | null;
  review: boolean;
  selectedId?: string;
  navigate: (page: string, comment?: string) => void;
  onReopen: (id: string, body: string) => Promise<void>;
}) {
  const catalog = useExternalCatalog();
  const page = catalog.pages.find((entry) => entry.id === id);
  const ctx = useCommentContext();
  const feedback = useFeedbackCopy({
    active: undefined,
    external: page,
    comments: ctx.comments,
    labels: {},
  });
  const queue = resolvedReviewQueue(comments);
  const selected = queue.find((entry) => entry.id === selectedId) ?? queue[0];
  return (
    <AppShell
      brand="Playground · External pages"
      contentClassName="overflow-hidden"
      contentWidth="full"
      actions={
        <>
          <PlaygroundAgentInstructions />
          <BookmarkletInstall />
          <Button
            size="sm"
            variant="outline"
            disabled={!page || !ctx.comments.length}
            onClick={feedback.copyFeedback}
          >
            {feedback.copied ? "Copied" : "Copy feedback"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={!queue.length}
            onClick={() =>
              navigate(selected?.page ?? id, review ? undefined : selected?.id)
            }
          >
            Review resolved ({queue.length})
          </Button>
        </>
      }
      navSections={[
        {
          label: "Playground",
          items: [
            { key: "welcome", label: "Artifact pages", to: "?page=welcome" },
          ],
        },
        {
          label: "External pages",
          items: catalog.pages.map((entry) => ({
            key: entry.id,
            label: entry.title,
            active: entry.id === id,
            to: `?page=${encodeURIComponent(entry.id)}`,
          })),
        },
      ]}
    >
      <div className="flex h-full min-h-0 flex-col overflow-auto lg:flex-row lg:overflow-hidden">
        <section className="flex min-h-[60dvh] min-w-0 flex-1 shrink-0 flex-col gap-4 overflow-auto p-4 lg:min-h-0">
          <h1 className="text-lg font-semibold">
            {page?.title ?? "External page"}
          </h1>
          {(error || catalog.error || feedback.copyError) && (
            <p role="alert" className="text-destructive">
              {error || catalog.error || feedback.copyError}
            </p>
          )}
          {!page &&
            (catalog.loaded ? (
              <p role="alert" className="text-destructive">
                External comment set {id} was not found in the catalog.
              </p>
            ) : (
              <p role="status">Loading external-page metadata…</p>
            ))}
          <p className="text-sm text-muted-foreground">
            Preview the original page beside its saved feedback. Open the
            original page and activate the bookmarklet to add comments or
            inspect live anchors.
          </p>
          {page?.urls.map((url) => (
            <a
              className="block break-all text-sm text-primary underline"
              href={url}
              key={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {url}
            </a>
          ))}
          {page?.urls[0] && (
            <ExternalPreview
              key={`${page.id}:${page.urls[0]}`}
              page={page.id}
              url={page.urls[0]}
              title={page.title}
            />
          )}
          <details className="shrink-0">
            <summary className="cursor-pointer text-sm font-medium">
              Saved captures
            </summary>
            <div className="max-h-80 space-y-4 overflow-auto pt-3">
              {ctx.comments
                .filter((comment) => !comment.parentId)
                .map((comment) => (
                  <div
                    key={comment.id}
                    className="rounded-md border border-border p-3"
                  >
                    <p className="mb-2 text-sm font-medium">{comment.body}</p>
                    <CommentCapture comment={comment} />
                  </div>
                ))}
            </div>
          </details>
        </section>
        <aside
          className="max-h-[40dvh] min-h-0 shrink-0 overflow-y-auto border-t border-border p-3 lg:max-h-none lg:w-[420px] lg:border-l lg:border-t-0"
          aria-label="External page feedback"
        >
          {review ? (
            <PlaygroundCommentReview
              allComments={comments}
              selectedId={selected?.id}
              config={ctx.config}
              anchorLabels={{}}
              formatAnchorLabel={(anchor) => anchor}
              threadToMarkdown={feedback.threadToMarkdown}
              onSelect={(item) => {
                if (item) navigate(item.page, item.id);
              }}
              onClose={async (commentId) => {
                if (!ctx.callbacks.onClose)
                  throw new Error("Closing is not configured");
                await ctx.callbacks.onClose(commentId);
              }}
              onCommentAndReopen={onReopen}
              onReply={async (parent, body) => {
                if (!ctx.callbacks.onReply)
                  throw new Error("Replies are not configured");
                await ctx.callbacks.onReply({ parentId: parent.id, body });
              }}
              onExit={() => navigate(id)}
            />
          ) : (
            <CommentSidePanel
              compact
              focusedAlignment="flow"
              className="!w-full"
              formatAnchorLabel={(anchor) => anchor}
              threadToMarkdown={feedback.threadToMarkdown}
              renderRootDetails={(comment) => (
                <CommentCapture comment={comment} />
              )}
            />
          )}
        </aside>
      </div>
    </AppShell>
  );
}
