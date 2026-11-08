import { useCallback, useEffect, useMemo } from "react";
import { VocabularyStatus } from "../vocabularies/VocabularyStatus";
import { VocabularyGenerationHost } from "../vocabularies/config";
import {
  type AppShellNavDrag,
  Button,
  CommentSidePanel,
  Workspace,
  useCommentContext,
  type WorkspacePaneSpec,
} from "@flanksource/clicky-ui";
import { BookmarkletInstall } from "./BookmarkletInstall";
import { PlaygroundAgentInstructions } from "../PlaygroundAgentInstructions";
import { useAgentRuns } from "../agent-runs/AgentRunsProvider";
import { AgentSessionButton } from "../agent-runs/AgentSessionButton";
import { PlaygroundPreferences } from "../PlaygroundPreferences";
import { useExternalCatalog } from "./external-catalog";
import { ExternalPreview } from "./ExternalPreview";
import { CommentCapture } from "../comments/CommentCapture";
import { PlaygroundCommentReview } from "../comments/PlaygroundCommentReview";
import { useFeedbackCopy } from "../comments/useFeedbackCopy";
import { resolvedReviewQueue } from "../comments/PlaygroundCommentReview";
import type { PageComment } from "../comments/useComments";
import { findPage } from "../registry";
import { useSidebarState } from "../sidebar-state";
import { mergeActivity, usePageActivity } from "../sidebar-activity";
import { PlaygroundSidebarControls } from "../PlaygroundSidebarControls";
import { PlaygroundNotifications } from "../PlaygroundNotifications";
import { useRepositoryNavigation } from "../documents/useRepositoryNavigation";
import { WORKSPACE_STORAGE_KEY, explorerPane, useExplorerLayoutDefaults } from "../navigation/ExplorerPane";
import { useNavigationTree } from "../navigation/useNavigationTree";
import type { NavigationMenuDeps } from "../navigation/menus";
import { useRecentSection } from "../recent-navigation";

// Module-level so the identities stay stable across renders and don't rebuild the nav sections.
const EXTERNAL_PAGE_DRAG: AppShellNavDrag = {
  canDrag: () => false,
  onDrop: () => { throw new Error("Page dragging is unavailable from an external page"); },
};
const rejectExternalPageAction: NavigationMenuDeps["setPageAction"] = () => {
  throw new Error("Source actions are unavailable from an external page");
};

export function ExternalWorkspace({
  id,
  pageHref,
  comments,
  commentsLoading,
  error,
  review,
  selectedId,
  navigate,
  onReopen,
}: {
  id: string;
  pageHref: (slug: string) => string;
  comments: PageComment[];
  commentsLoading: boolean;
  error: string | null;
  review: boolean;
  selectedId?: string;
  navigate: (page: string, comment?: string, review?: boolean) => void;
  onReopen: (id: string, body: string) => Promise<void>;
}) {
  const catalog = useExternalCatalog();
  const [sidebar, setSidebar] = useSidebarState();
  const activity = usePageActivity();
  const activityMap = useMemo(() => mergeActivity(activity.feedback, activity.updates), [activity.feedback, activity.updates]);
  const onQueryChange = useCallback((query: string) => setSidebar({ query }, { replace: true }), [setSidebar]);
  const layoutDefaults = useExplorerLayoutDefaults();
  const repositoryNavigation = useRepositoryNavigation({ activeSlug: id, pageHref });
  const navigationMenu = useMemo<NavigationMenuDeps>(
    () => ({
      actionsDisabled: true,
      disabledReason: "Open an artifact page to manage its source",
      setPageAction: rejectExternalPageAction,
      pageFor: findPage,
      repository: repositoryNavigation.actions,
    }),
    [repositoryNavigation.actions],
  );
  const tree = useNavigationTree({ activeSlug: id, sidebar, onQueryChange, pageHref, drag: EXTERNAL_PAGE_DRAG, menu: navigationMenu });
  const { recent, metadataError } = useRecentSection({ activeSlug: id, activity: activityMap, query: sidebar.query, filters: sidebar.filters, pageHref, loading: activity.loading });
  const page = catalog.pages.find((entry) => entry.id === id);
  const ctx = useCommentContext();
  const agentRuns = useAgentRuns();
  const feedback = useFeedbackCopy({
    active: undefined,
    external: page,
    comments: ctx.comments,
    labels: {},
  });
  const queue = resolvedReviewQueue(comments);
  const selected = queue.find((entry) => entry.id === selectedId) ?? queue[0];
  useEffect(() => {
    if (review && !commentsLoading && !error && selected && (selected.page !== id || selected.id !== selectedId)) {
      navigate(selected.page, selected.id);
    }
  }, [review, commentsLoading, error, selected, id, selectedId, navigate]);
  const headerActions = (
    <>
      <VocabularyStatus problemsError={tree.problemsError} />
      <PlaygroundAgentInstructions />
      <AgentSessionButton />
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
        disabled={!Object.values(activity.feedback).some((page) => page.resolvedCount > 0)}
        onClick={() =>
          navigate(id, undefined, !review)
        }
      >
        Review resolved ({Object.values(activity.feedback).reduce((count, page) => count + page.resolvedCount, 0)})
      </Button>
      <PlaygroundNotifications recent={recent} />
      <PlaygroundPreferences sourceDirty={false} />
    </>
  );
  const panes: WorkspacePaneSpec[] = [
    explorerPane({
      title: "Playground · External pages",
      header: (
        <>
          {repositoryNavigation.controls}
          <PlaygroundSidebarControls state={sidebar} onChange={setSidebar} olderCount={tree.olderCount} commentsError={activity.commentsError} updatesError={activity.updatesError} />
          {metadataError !== null && <p role="alert" className="py-density-1 text-xs text-destructive">{metadataError}</p>}
        </>
      ),
      error: tree.error,
      section: tree.section,
      commentsHref: pageHref(""),
      commentsActive: false,
    }),
    {
      id: "page",
      label: "External page",
      location: "center",
      collapsible: false,
      slots: { headerTrailing: headerActions },
      contentClassName: "overflow-hidden",
      content: (
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
          {review && (commentsLoading || error) ? <p role="status">{error ?? "Loading resolved feedback…"}</p> : review ? (
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
              extraAssignItems={agentRuns.extraAssignItems}
              renderRootDetails={(comment) => (
                <>
                  <CommentCapture comment={comment} />
                  {agentRuns.renderRunDetails(comment)}
                </>
              )}
            />
          )}
        </aside>
      </div>
      ),
    },
  ];
  return (
    <>
      <VocabularyGenerationHost />
      <Workspace className="h-dvh" panes={panes} storageKey={WORKSPACE_STORAGE_KEY} defaultValue={layoutDefaults} />
      {repositoryNavigation.dialogs}
    </>
  );
}
