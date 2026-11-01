import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type RefObject,
} from "react";
import {
  AppShell,
  CommentSidePanel,
  DOCUMENT_ANCHOR,
  cn,
  useCommentContext,
  useFloatingZIndex,
} from "@flanksource/clicky-ui";
import { UiComment } from "@flanksource/clicky-ui/icons";
import { CommentDashboard } from "./comments/CommentDashboard";

import {
  CommentOverlay,
  DialogCommentOverlay,
} from "./comments/CommentOverlay";
import { useReactGrabComments } from "./comments/useReactGrabComments";
import { CommentCapture } from "./comments/CommentCapture";
import { PlaygroundCommentReview } from "./comments/PlaygroundCommentReview";
import { useResolvedCommentReview } from "./comments/useResolvedCommentReview";
import { AnnotationVisibilityProvider } from "./annotations";
import { PageActions, PageManagementDialogs } from "./editor/PageManagement";
import { usePageFolders } from "./editor/usePageFolders";
import { usePageMoveDrag } from "./editor/usePageMoveDrag";
import { useSource } from "./editor/useSource";
import { MarkdownPage } from "./markdown/MarkdownPage";
import { usePageGuidance } from "./markdown/usePageGuidance";
import { PlaygroundBanner as Banner } from "./PlaygroundShellParts";
import { PlaygroundBodyHeader } from "./PlaygroundBodyHeader";
import {
  PlaygroundMobileActions,
  PlaygroundShellActions,
  type PlaygroundShellActionsProps,
} from "./PlaygroundShellActions";
import { ReviewProvider } from "./review/ReviewProvider";
import { PlaygroundSidebarControls } from "./PlaygroundSidebarControls";
import { useSidebarState } from "./sidebar-state";
import { usePageActivity } from "./sidebar-activity";

// Monaco is several megabytes and only ever needed once someone opens the
// editor, so it must not sit in the entry chunk.
const SourceEditor = lazy(() =>
  import("./editor/SourceEditor").then((module) => ({
    default: module.SourceEditor,
  })),
);
// Same for a markdown page: its source view is a Monaco editor.
const MarkdownDocumentPage = lazy(() =>
  import("./markdown-doc/MarkdownDocumentPage").then((module) => ({
    default: module.MarkdownDocumentPage,
  })),
);
import { useFeedbackCopy } from "./comments/useFeedbackCopy";
import { useAgentRuns } from "./agent-runs/AgentRunsProvider";
import { usePromptRuns } from "./prompt-runs/PromptRunsProvider";
import {
  type PageComment,
  type PlaygroundComments,
} from "./comments/useComments";
import { useDomAnchors } from "./comments/useDomAnchors";
import { overlayLabel } from "./comments/dom-anchor";
import { describeMarkdown, parseMarkdownAnchor } from "./comments/markdown-anchor";
import { screenshotCaptureSupported } from "./comments/screenshot";
import {
  fallbackPageSlug,
  loadPage,
  pageMeta,
  pageTitle,
  pages,
  type ComponentPageEntry,
  type PageEntry,
} from "./registry";
import type { AnnotationVisibility, PlaygroundView } from "./route";
import {
  usePlaygroundNavigation,
  type PageActionState,
} from "./usePlaygroundNavigation";

const lazyPageCache = new Map<string, LazyExoticComponent<ComponentType>>();

function lazyPage(entry: ComponentPageEntry): LazyExoticComponent<ComponentType> {
  const existing = lazyPageCache.get(entry.slug);
  if (existing) return existing;

  const created = lazy(() => loadPage(entry));
  lazyPageCache.set(entry.slug, created);
  return created;
}

export type PlaygroundShellProps = {
  active: PageEntry | undefined;
  allComments: PageComment[];
  contentRef: RefObject<HTMLDivElement | null>;
  commentsError: string | null;
  commentsLoading: boolean;
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  showRejected: boolean;
  onShowRejectedChange: (show: boolean) => void;
  review?: "resolved";
  selectedCommentId?: string;
  pageHref: (slug: string) => string;
  onViewChange: (view: PlaygroundView) => void;
  onAnnotationsChange: (annotations: AnnotationVisibility) => void;
  onNavigate: (slug?: string) => void;
  onReviewNavigate: (page: string, comment?: string) => void;
  onReviewExit: () => void;
  onCommentAndReopen: (id: string, body: string) => Promise<void>;
  onPrepareCommentSelection: PlaygroundComments["prepareSelection"];
  onCaptureSelection: PlaygroundComments["captureSelection"];
};

function shortAnchorLabel(anchor: string): string {
  const markdown = parseMarkdownAnchor(anchor);
  if (markdown) return describeMarkdown(markdown);
  const last = anchor.split(" > ").pop() ?? anchor;
  return last === ":scope" ? "Whole page" : last;
}

export function PlaygroundShell({
  active,
  allComments,
  contentRef,
  commentsError,
  commentsLoading,
  view,
  annotations,
  showRejected,
  onShowRejectedChange,
  review,
  selectedCommentId,
  pageHref,
  onViewChange,
  onAnnotationsChange,
  onNavigate,
  onReviewNavigate,
  onReviewExit,
  onCommentAndReopen,
  onPrepareCommentSelection,
  onCaptureSelection,
}: PlaygroundShellProps) {
  const ctx = useCommentContext();
  const agentRuns = useAgentRuns();
  const { openPrompt } = usePromptRuns();
  const [sidebar, setSidebar] = useSidebarState();
  const activity = usePageActivity();
  const [editing, setEditing] = useState(false);
  const [pageAction, setPageAction] = useState<PageActionState | null>(null);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const markdownPage = active?.kind === "markdown";
  // A markdown page is always its own editor, so its source is always loaded.
  const source = useSource(active?.slug, editing || markdownPage);
  const pageFolders = usePageFolders();
  const filesystemActionsDisabled = !import.meta.env.DEV || source.dirty || activity.loading || activity.error !== null;
  const filesystemActionsDisabledReason = !import.meta.env.DEV
    ? "Page filesystem actions are only available under vite dev"
    : source.dirty
      ? "Save or revert the source before changing pages"
      : activity.error ?? (activity.loading ? "Loading feedback counts…" : undefined);

  // The provider's comments are typed without the element context the
  // locators live in; the same page's comments from the API carry it.
  const pageComments = useMemo(
    () =>
      view === "preview" && active && !markdownPage
        ? allComments.filter((comment) => comment.page === active.slug)
        : [],
    [active, allComments, view, markdownPage],
  );
  const { pins, overlayPins, orphans, labels } = useDomAnchors(
    { scrollRef: ctx.contentRef, contentRef },
    pageComments,
    ctx.registerAnchor,
  );
  const unresolvedOrphans = orphans.filter((orphan) => orphan.unresolved).length;

  const pageMove = usePageMoveDrag({
    disabled: filesystemActionsDisabled,
    activeSlug: active?.slug,
    onNavigate,
  });

  const navSections = usePlaygroundNavigation({
    activeSlug: active?.slug,
    feedback: activity.feedback,
    age: sidebar.age,
    query: sidebar.query,
    onQueryChange: (query) => setSidebar({ query }),
    sort: sidebar.sort,
    filters: sidebar.filters,
    updates: activity.updates,
    loading: commentsLoading || activity.loading,
    folders: pageFolders.folders,
    pageHref,
    actionsDisabled: filesystemActionsDisabled,
    disabledReason: filesystemActionsDisabledReason,
    drag: pageMove.drag,
    setPageAction,
  });

  // `contentRef` comes from the provider as a read-only RefObject; a callback
  // ref is the only way to attach it without fighting the React 18/19 ref types.
  const attachScrollRef = useCallback(
    (node: HTMLDivElement | null) => {
      (ctx.contentRef as { current: HTMLDivElement | null }).current = node;
    },
    [ctx.contentRef],
  );

  useReactGrabComments({
    contentRef,
    enabled: view === "preview" && Boolean(active) && !markdownPage,
    onSelect: ({ anchor, element, screenshot }) => {
      if (!(element instanceof HTMLElement)) {
        throw new Error(
          "React Grab comment selection requires an HTML element",
        );
      }
      onPrepareCommentSelection(anchor, element, screenshot);
      ctx.registerAnchor(anchor, null);
      ctx.registerAnchor(anchor, element);
      ctx.focusAnchor(anchor);
    },
    onPrompt: ({ anchor, element }) => {
      if (!active) {
        throw new Error("Prompt… needs an open playground page");
      }
      openPrompt({
        page: active.slug,
        anchor,
        element: onCaptureSelection(anchor, element),
      });
    },
  });

  const feedback = useFeedbackCopy({ active, comments: ctx.comments, labels });
  const { selectItem: selectReviewItem } =
    useResolvedCommentReview({
      allComments,
      activeSlug: active?.slug,
      selectedId: selectedCommentId,
      active: review === "resolved" && !commentsLoading,
      pinsVersion: pins.length,
      context: ctx,
      onNavigate: onReviewNavigate,
    });

  const folderImpact = (folder: string) => {
    const inFolder = pages().filter((entry) =>
      entry.slug.startsWith(`${folder}/`),
    );
    return {
      pages: inFolder.length,
      comments: inFolder.reduce((count, entry) => count + (activity.feedback[entry.slug]?.commentCount ?? 0), 0),
    };
  };

  const PageComponent = active?.kind === "component" ? lazyPage(active) : null;
  const activeTitle = active ? pageTitle(active) : "";
  const activeMeta = active ? pageMeta(active) : undefined;
  const pageGuidance = usePageGuidance(active, activeTitle);
  const railVisible =
    Boolean(active) && view === "preview" &&
    // A markdown page shows its own threads; only the resolved-review queue needs the rail there.
    (!markdownPage || review === "resolved") &&
    (annotations === "visible" || review === "resolved") &&
    (review === "resolved" ||
      ctx.railMode !== "closed" ||
      ctx.comments.length > 0);
  // Commenting inside a portaled dialog: lift the rail over the modal backdrop
  // so its composer can be clicked without closing the dialog.
  const floatingZIndex = useFloatingZIndex();
  const railOverDialog =
    ctx.railMode === "focused" &&
    ctx.focusedAnchor !== null &&
    overlayLabel(ctx.focusedAnchor) !== null;
  const editorOpen = editing && active?.kind === "component";
  // source and problems are markdown-page views; a .tsx page's source is its
  // Edit editor, so such a link opens that instead.
  const unsupportedView = active?.kind === "component" && (view === "source" || view === "problems");
  useEffect(() => {
    if (!unsupportedView) return;
    setEditing(true);
    onViewChange("preview");
  }, [unsupportedView, onViewChange]);
  const actionPage = pageAction?.page ?? active;
  const shellActionProps: PlaygroundShellActionsProps = {
    view,
    annotations,
    showRejected,
    onShowRejectedChange,
    copyDisabled: pageGuidance.markdown === null,
    pageMarkdownCopied: pageGuidance.copied,
    onViewChange,
    onAnnotationsChange,
    onCopyPage: () => void pageGuidance.copyPage(),
    filesystemActionsDisabled,
    ...(filesystemActionsDisabledReason
      ? { filesystemActionsDisabledReason }
      : {}),
    onNewPage: (action) => setPageAction({ action }),
    active: Boolean(active),
    markdownPage,
    editing,
    sourceDirty: source.dirty,
    onToggleEditing: () => setEditing((on) => !on),
    reviewActive: review === "resolved",
    reviewCount: Object.values(activity.feedback).reduce((count, page) => count + page.resolvedCount, 0),
    onToggleReview: () => review === "resolved" ? onReviewExit() : onReviewNavigate(active?.slug ?? ""),
    onCommentWholePage: () => ctx.focusAnchor(DOCUMENT_ANCHOR),
    feedbackCopied: feedback.copied,
    onCopyFeedback: feedback.copyFeedback,
    feedbackCopyActions: feedback.copyActions,
    pageCommentCount: ctx.comments.length,
  };

  return (
    <AppShell
      brand={
        <>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            P
          </span>
          <span className="truncate font-semibold tracking-tight">
            Clicky UI · Playground
          </span>
        </>
      }
      sidebarHeader={<PlaygroundSidebarControls activeSlug={active?.slug} activity={activity} state={sidebar} onChange={setSidebar} error={activity.error} />}
      sidebarWidth={300}
      actions={
        <>
          {activeMeta?.appShellActions}
          <PlaygroundShellActions {...shellActionProps} />
        </>
      }
      mobileActions={
        <PlaygroundMobileActions
          {...shellActionProps}
          moreOpen={moreActionsOpen}
          onToggleMore={() => setMoreActionsOpen((open) => !open)}
        />
      }
      {...(moreActionsOpen
        ? {
            toolbar: (
              <>
                {activeMeta?.appShellActions}
                <PlaygroundShellActions {...shellActionProps} overflow />
              </>
            ),
          }
        : {})}
      toolbarClassName="@3xl/app-shell:hidden [@media(pointer:coarse)]:[&_button]:min-h-11 [@media(pointer:coarse)]:[&_button]:min-w-11"
      navSections={[{ items: [{ key: "comments", label: "Comments", icon: UiComment, to: pageHref(""), active: !active }] }, ...navSections]}
      collapsedStorageKey="playground:sidebar:collapsed"
      contentClassName="overflow-hidden"
      contentWidth="full"
      bodySplit={45}
      bodySidebar={
        editorOpen ? (
          <Suspense
            fallback={
              <p className="border-r border-border p-density-3 text-xs text-muted-foreground">
                Loading editor…
              </p>
            }
          >
            <SourceEditor
              slug={active.slug}
              source={source}
              onClose={() => setEditing(false)}
            />
          </Suspense>
        ) : undefined
      }
      bodyHeader={active ? <PlaygroundBodyHeader active={active} /> : undefined}
      bodyActions={
        active ? (
          <PageActions
            disabled={filesystemActionsDisabled}
            disabledReason={filesystemActionsDisabledReason}
            onSelect={(action) => setPageAction({ action, page: active })}
          />
        ) : undefined
      }
    >
      {!active ? <CommentDashboard comments={allComments} loading={commentsLoading} error={commentsError} pageHref={pageHref} /> : <div className="flex h-full min-h-0 flex-col md:flex-row">
        <div
          ref={attachScrollRef}
          className="relative min-w-0 flex-1 overflow-auto"
        >
          <ReviewProvider
            page={active?.slug ?? ""}
            active={
              view === "preview" && annotations === "visible" && Boolean(active) && !markdownPage
            }
            sourceDirty={source.dirty}
            contentRef={contentRef}
            scrollRef={ctx.contentRef}
          >
            <div ref={contentRef} data-review-content data-show-rejected={showRejected} className={cn("min-w-0 p-density-4", markdownPage && "h-full")}>
              {pageFolders.error && (
                <Banner tone="danger">{pageFolders.error}</Banner>
              )}
              {pageMove.error && (
                <Banner tone="danger">
                  The page was not moved — {pageMove.error}
                </Banner>
              )}
              {commentsError && <Banner tone="danger">{commentsError}</Banner>}
              {feedback.copyError && (
                <Banner tone="danger">
                  Nothing was copied — {feedback.copyError}
                </Banner>
              )}
              {pageGuidance.copyError && (
                <Banner tone="danger">
                  Page Markdown was not copied — {pageGuidance.copyError}
                </Banner>
              )}
              {view === "preview" && annotations === "visible" && unresolvedOrphans > 0 && (
                <Banner tone="warning">
                  {unresolvedOrphans} open comment
                  {unresolvedOrphans === 1
                    ? " no longer matches"
                    : "s no longer match"}{" "}
                  an element on this page. The notes are kept and listed as
                  “Unavailable” in the rail.
                </Banner>
              )}
              {active.kind === "markdown" ? (
                view === "markdown" ? (
                  <Banner tone="danger">
                    view=markdown is the guidance export of a .tsx page; a
                    markdown page has view=preview (rendered), view=source and
                    view=problems.
                  </Banner>
                ) : (
                  <Suspense
                    fallback={
                      <p className="text-sm text-muted-foreground">Loading…</p>
                    }
                  >
                    <MarkdownDocumentPage
                      slug={active.slug}
                      view={view}
                      onViewChange={onViewChange}
                      source={source}
                      annotations={annotations}
                      onLint={(file) => {
                        if (!contentRef.current) {
                          throw new Error("Lint needs the playground content mounted");
                        }
                        openPrompt({
                          page: active.slug,
                          anchor: DOCUMENT_ANCHOR,
                          element: onCaptureSelection(DOCUMENT_ANCHOR, contentRef.current),
                          files: [file],
                        });
                      }}
                    />
                  </Suspense>
                )
              ) : unsupportedView ? (
                null
              ) : view === "markdown" ? (
                <MarkdownPage
                  markdown={pageGuidance.markdown}
                  error={pageGuidance.loadError}
                />
              ) : PageComponent ? (
                <Suspense
                  fallback={
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  }
                >
                  <AnnotationVisibilityProvider value={annotations}>
                    <PageComponent />
                  </AnnotationVisibilityProvider>
                </Suspense>
              ) : (
                null
              )}
            </div>

            {view === "preview" && annotations === "visible" && (
              <>
                <CommentOverlay
                  pins={pins}
                  focusedAnchor={
                    ctx.railMode === "focused" ? ctx.focusedAnchor : null
                  }
                  onFocus={ctx.focusAnchor}
                />
                <DialogCommentOverlay
                  pins={overlayPins}
                  focusedAnchor={
                    ctx.railMode === "focused" ? ctx.focusedAnchor : null
                  }
                  onFocus={ctx.focusAnchor}
                />
              </>
            )}
          </ReviewProvider>
        </div>

        {railVisible && (
          <div
            data-comment-rail
            // Stacked under the artifact on a phone: tall enough for a focused
            // thread and its composer, with room under it for the fixed
            // react-grab toolbar so it never covers the rail's controls.
            className="relative max-h-[max(15rem,45dvh)] shrink-0 overflow-y-auto border-t border-border bg-background p-density-3 pb-16 md:max-h-none md:border-l md:border-t-0 md:pb-density-3"
            {...(railOverDialog ? { style: { zIndex: floatingZIndex } } : {})}
          >
            {review === "resolved" && (commentsLoading || commentsError) ? <p role="status">{commentsError ?? "Loading resolved feedback…"}</p> : review === "resolved" ? (
              <PlaygroundCommentReview
                allComments={allComments}
                selectedId={selectedCommentId}
                config={ctx.config}
                anchorLabels={labels}
                formatAnchorLabel={shortAnchorLabel}
                threadToMarkdown={feedback.threadToMarkdown}
                onSelect={selectReviewItem}
                onClose={async (id) => {
                  if (!ctx.callbacks.onClose) {
                    throw new Error("Comment closing is not configured");
                  }
                  await ctx.callbacks.onClose(id);
                }}
                onCommentAndReopen={onCommentAndReopen}
                onReply={async (parent, body) => {
                  if (!ctx.callbacks.onReply) {
                    throw new Error("Comment replies are not configured");
                  }
                  await ctx.callbacks.onReply({
                    parentId: parent.id,
                    body,
                    ...(parent.anchor !== undefined
                      ? { anchor: parent.anchor }
                      : {}),
                  });
                }}
                onExit={onReviewExit}
              />
            ) : (
              <CommentSidePanel
                className="w-full md:w-[320px]"
                focusedAlignment="anchor"
                anchorLabels={labels}
                formatAnchorLabel={shortAnchorLabel}
                compact
                createActions={[
                  { id: "plain", label: "Post comment" },
                  ...(screenshotCaptureSupported()
                    ? [{ id: "screenshot", label: "Post with screenshot" }]
                    : []),
                ]}
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
          </div>
        )}
      </div>}
      <PageManagementDialogs
        action={pageAction?.action ?? null}
        active={actionPage}
        {...(pageAction?.initialFolder
          ? { initialFolder: pageAction.initialFolder }
          : {})}
        folders={pageFolders.folders}
        commentCount={
          actionPage ? activity.feedback[actionPage.slug]?.commentCount ?? 0 : 0
        }
        {...(pageAction?.initialFolder
          ? { folderImpact: folderImpact(pageAction.initialFolder) }
          : {})}
        onClose={() => setPageAction(null)}
        onFolderCreated={pageFolders.add}
        onFolderDeleted={pageFolders.remove}
        onNavigate={onNavigate}
        fallbackAfterDelete={({ slug, folder }) => {
          const activeSlug = active?.slug;
          const gone =
            slug === activeSlug ||
            (folder !== undefined && activeSlug?.startsWith(`${folder}/`));
          return gone ? fallbackPageSlug(pages(), activeSlug) : activeSlug;
        }}
      />
    </AppShell>
  );
}
