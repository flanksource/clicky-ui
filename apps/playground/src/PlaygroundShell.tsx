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
  CommentSidePanel,
  CommentRail,
  DOCUMENT_ANCHOR,
  Workspace,
  cn,
  useCommentContext,
  useFloatingZIndex,
  useMediaQuery,
  type WorkspacePaneSpec,
} from "@flanksource/clicky-ui";
import { CommentDraftPopover } from "@flanksource/clicky-ui/comments";
import { CommentDashboard } from "./comments/CommentDashboard";
import { PageErrorBoundary } from "./PageErrorBoundary";
import { LIVE_SERVER } from "./live-server";

import {
  CommentOverlay,
  DialogCommentOverlay,
} from "./comments/CommentOverlay";
import { useReactGrabComments } from "./comments/useReactGrabComments";
import { useReactGrabStyle } from "./visual-edit/useReactGrabStyle";
import { useEditableSelection } from "./visual-edit/useEditableSelection";
import type { EditableRoot } from "./visual-edit/editable-dom";
import { styleEditBody } from "./visual-edit/style-edit-comment";
import type { StyleChangeRequest } from "./visual-edit/SvgStylePanel";
import type { StoredStyleEdit } from "../plugins/comments-store";
import { useCommentDetails } from "./comments/useCommentDetails";
import { PlaygroundCommentReview } from "./comments/PlaygroundCommentReview";
import { useResolvedCommentReview } from "./comments/useResolvedCommentReview";
import { AnnotationVisibilityProvider } from "./annotations";
import { PageActions, PageManagementDialogs } from "./editor/PageManagement";
import { usePageFolders } from "./editor/usePageFolders";
import { usePageMoveDrag } from "./editor/usePageMoveDrag";
import { fileSourceTarget, useSource } from "./editor/useSource";
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
import { mergeActivity, usePageActivity } from "./sidebar-activity";
import { useRepositoryNavigation } from "./documents/useRepositoryNavigation";
import { WORKSPACE_STORAGE_KEY, explorerPane, useExplorerLayoutDefaults } from "./navigation/ExplorerPane";
import { useNavigationTree } from "./navigation/useNavigationTree";
import type { NavigationMenuDeps, PageActionState } from "./navigation/menus";
import { useRecentSection } from "./recent-navigation";

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
const RepositoryDocumentPage = lazy(() => import("./documents/RepositoryDocumentPage").then((module) => ({ default: module.RepositoryDocumentPage })));
const VisualEditOverlay = lazy(() => import("./visual-edit/VisualEditOverlay").then((module) => ({ default: module.VisualEditOverlay })));
const SvgStylePanel = lazy(() => import("./visual-edit/SvgStylePanel").then((module) => ({ default: module.SvgStylePanel })));
const RepositoryFolderPage = lazy(() => import("./documents/RepositoryFolderPage").then((module) => ({ default: module.RepositoryFolderPage })));
import { useFeedbackCopy } from "./comments/useFeedbackCopy";
import { useAgentRuns } from "./agent-runs/AgentRunsProvider";
import { RunningSessionBars } from "./agent-runs/RunningSessionBars";
import { usePromptRuns } from "./prompt-runs/PromptRunsProvider";
import {
  type PageComment,
  type PlaygroundCommentCreateInput,
  type PlaygroundComments,
} from "./comments/useComments";
import { useDomAnchors } from "./comments/useDomAnchors";
import { commentAnchor, describeElement, overlayLabel } from "./comments/dom-anchor";
import { describeMarkdown, parseMarkdownAnchor } from "./comments/markdown-anchor";
import { screenshotCaptureSupported } from "./comments/screenshot";
import {
  fallbackPageSlug,
  findPage,
  loadPage,
  pageMeta,
  pageTitle,
  pages,
  type ComponentPageEntry,
  type PageEntry,
} from "./registry";
import type { AnnotationVisibility, PlaygroundView } from "./route";

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

/** What the Source pane edits: the page itself, or one of its helper modules (path relative to `src/pages`). */
type EditTarget = { kind: "page" } | { kind: "file"; file: string; line?: number };

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
  const detailTabs = useCommentDetails();
  const phone = useMediaQuery("(max-width: 767px)");
  const { openPrompt } = usePromptRuns();
  const [sidebar, setSidebar] = useSidebarState();
  const activity = usePageActivity();
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const editing = editTarget !== null;
  // A helper file belongs to the page that imports it; another page closes it.
  useEffect(() => { setEditTarget((target) => (target?.kind === "file" ? null : target)); }, [active?.slug]);
  // Design mode writes the same files Monaco edits, so the two never run together.
  const [designing, setDesigning] = useState(false);
  useEffect(() => { setDesigning(false); }, [active?.slug]);
  const [pageAction, setPageAction] = useState<PageActionState | null>(null);
  const [moreActionsOpen, setMoreActionsOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState<{ page: string; anchor: string; element: Element } | null>(null);
  const activeDraft = commentDraft?.page === active?.slug && view === "preview" && annotations === "visible" ? commentDraft : null;
  useEffect(() => { setCommentDraft(null); }, [active?.slug, view, annotations]);
  const markdownPage = active?.kind === "markdown";
  const folderPage = active?.kind === "folder";
  const repositoryDocument = active?.slug.startsWith("document:") === true;
  const repositoryNavigation = useRepositoryNavigation({ activeSlug: active?.slug, pageHref });
  // A markdown page is always its own editor, so its source is always loaded.
  const editFile = editTarget?.kind === "file" && active?.kind === "component" ? editTarget : undefined;
  const source = useSource(editFile ? fileSourceTarget(editFile.file) : active?.slug, !folderPage && (editing || markdownPage));
  const visualEnabled = LIVE_SERVER && view === "preview" && active?.kind === "component" && !editing && !source.dirty;
  const visualSelection = useEditableSelection({ page: active?.slug, enabled: visualEnabled });
  const visualPending = visualSelection.pending;
  const styleTarget = visualSelection.selected?.node.kind === "svg" ? visualSelection.selected : null;
  const pageFolders = usePageFolders();
  const activityMap = useMemo(() => mergeActivity(activity.feedback, activity.updates), [activity.feedback, activity.updates]);
  const onQueryChange = useCallback((query: string) => setSidebar({ query }, { replace: true }), [setSidebar]);
  const sourceBusy = source.dirty || visualPending;
  const filesystemActionsDisabled = !LIVE_SERVER || sourceBusy || !activity.updatesReady;
  const filesystemActionsDisabledReason = !LIVE_SERVER
    ? "Page filesystem actions require a live playground server"
    : source.dirty
      ? "Save or revert the source before changing pages"
      : visualPending
        ? "Finish the visual edit before changing pages"
      : !activity.updatesReady
        ? activity.updatesError ?? "Loading page update dates…"
        : undefined;

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

  const navigationMenu = useMemo<NavigationMenuDeps>(
    () => ({
      actionsDisabled: filesystemActionsDisabled,
      disabledReason: filesystemActionsDisabledReason,
      setPageAction,
      pageFor: findPage,
      repository: repositoryNavigation.actions,
    }),
    [filesystemActionsDisabled, filesystemActionsDisabledReason, repositoryNavigation.actions],
  );
  const tree = useNavigationTree({
    activeSlug: active?.slug,
    sidebar,
    onQueryChange,
    pageHref,
    drag: pageMove.drag,
    menu: navigationMenu,
  });
  const { recent, metadataError } = useRecentSection({
    activeSlug: active?.slug,
    activity: activityMap,
    query: sidebar.query,
    filters: sidebar.filters,
    pageHref,
    loading: activity.loading,
  });
  const layoutDefaults = useExplorerLayoutDefaults();

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
    enabled: view === "preview" && Boolean(active) && !markdownPage && !folderPage,
    onSelect: ({ anchor, element, screenshot }) => {
      onPrepareCommentSelection(anchor, element, screenshot);
      ctx.registerAnchor(anchor, null);
      ctx.registerAnchor(anchor, element);
      if (!active) throw new Error("Comment selection needs an open page");
      setCommentDraft({ page: active.slug, anchor, element });
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

  const selectVisualTarget = useCallback((target: EditableRoot | null) => {
    visualSelection.select(target);
    if (visualEnabled && !visualPending) setDesigning(true);
  }, [visualSelection.select, visualEnabled, visualPending]);
  useReactGrabStyle({ contentRef, onSelectTarget: selectVisualTarget, onBeforeCssEdit: visualSelection.beginCssEdit });
  const requestStyleChange = useCallback(async (styleEdit: StoredStyleEdit): Promise<StyleChangeRequest> => {
    const content = contentRef.current;
    const element = styleTarget?.node.element;
    if (!element || !content) throw new Error("Request change needs the styled element mounted on the page");
    const anchor = commentAnchor(element, content);
    if (anchor === null) throw new Error(`The styled <${element.localName}> cannot be anchored to a comment`);
    if (!ctx.callbacks.onCreate) throw new Error("Comment creation is not configured");
    onPrepareCommentSelection(anchor, element);
    ctx.registerAnchor(anchor, null);
    ctx.registerAnchor(anchor, element);
    const input: PlaygroundCommentCreateInput = { body: styleEditBody(styleEdit), anchor, styleEdit };
    await ctx.callbacks.onCreate(input);
    return { onFocusThread: () => ctx.focusAnchor(anchor) };
  }, [contentRef, ctx, onPrepareCommentSelection, styleTarget]);

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
  // The same element across shell re-renders (polling, pending flags) lets React bail out at the
  // page boundary, so the artifact re-renders only for its own state and contexts — which also
  // keeps Design mode's live prop overrides on screen.
  const pageElement = useMemo(
    () => PageComponent && (
      <AnnotationVisibilityProvider value={annotations}>
        <PageComponent />
      </AnnotationVisibilityProvider>
    ),
    [PageComponent, annotations],
  );
  const activeTitle = active ? pageTitle(active) : "";
  const activeMeta = active ? pageMeta(active) : undefined;
  const pageGuidance = usePageGuidance(active, activeTitle);
  const railVisible =
    Boolean(active) && !folderPage && view === "preview" &&
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
    setEditTarget({ kind: "page" });
    onViewChange("preview");
  }, [unsupportedView, onViewChange]);
  const actionPage = pageAction?.page ?? active;
  const pageActions = active && !repositoryDocument && !folderPage ? (
    <PageActions
      disabled={filesystemActionsDisabled}
      disabledReason={filesystemActionsDisabledReason}
      onSelect={(action) => setPageAction({ action, page: active })}
    />
  ) : undefined;
  const shellActionProps: PlaygroundShellActionsProps = {
    recent,
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
    active: Boolean(active) && !folderPage,
    markdownPage,
    editing,
    sourceDirty: sourceBusy,
    onToggleEditing: () => {
      setDesigning(false);
      setEditTarget((target) => (target ? null : { kind: "page" }));
    },
    ...(visualPending ? { editingDisabledReason: "Finish the visual edit before opening the editor" } : {}),
    designing,
    onToggleDesign: () => {
      setEditTarget(null);
      setDesigning((on) => !on);
    },
    ...(!LIVE_SERVER
      ? { designDisabledReason: "Design mode writes source through a live playground server" }
      : source.dirty
        ? { designDisabledReason: "Save or revert the source before Design mode" }
        : visualPending
          ? { designDisabledReason: "Finish the visual edit before leaving Design mode" }
          : {}),
    reviewActive: review === "resolved",
    reviewCount: Object.values(activity.feedback).reduce((count, page) => count + page.resolvedCount, 0),
    onToggleReview: () => review === "resolved" ? onReviewExit() : onReviewNavigate(active?.slug ?? ""),
    onCommentWholePage: () => { setCommentDraft(null); ctx.focusAnchor(DOCUMENT_ANCHOR); },
    feedbackCopied: feedback.copied,
    onCopyFeedback: feedback.copyFeedback,
    feedbackCopyActions: feedback.copyActions,
    pageCommentCount: ctx.comments.length,
    problemsError: tree.problemsError,
  };

  // Below the workspace's stacking width the header keeps only the compact cluster; the rest
  // moves into the "More actions" row at the top of the page.
  const headerActions = (
    <>
      <div className="hidden flex-wrap items-center justify-end gap-1.5 @3xl/workspace:flex">
        {activeMeta?.appShellActions}
        <PlaygroundShellActions {...shellActionProps} />
        {pageActions}
      </div>
      <div className="flex items-center gap-1 @3xl/workspace:hidden">
        <PlaygroundMobileActions
          {...shellActionProps}
          moreOpen={moreActionsOpen}
          onToggleMore={() => setMoreActionsOpen((open) => !open)}
        />
      </div>
    </>
  );
  const moreActionsRow = moreActionsOpen && (
    <div
      data-playground-more-actions=""
      className="flex shrink-0 flex-wrap items-center gap-1.5 border-b border-border bg-muted/30 p-density-2 @3xl/workspace:hidden [@media(pointer:coarse)]:[&_button]:min-h-11 [@media(pointer:coarse)]:[&_button]:min-w-11"
    >
      {activeMeta?.appShellActions}
      <PlaygroundShellActions {...shellActionProps} overflow />
      {pageActions}
    </div>
  );
  const pageContent = (
    <div className="flex h-full min-h-0 flex-col">
      {moreActionsRow}
      {!active ? <div className="min-h-0 flex-1 overflow-auto"><CommentDashboard comments={allComments} loading={commentsLoading} error={commentsError} pageHref={pageHref} /></div> : <div className="flex min-h-0 flex-1 flex-col">
        <RunningSessionBars key={active.slug} page={active.slug} />
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <div
          ref={attachScrollRef}
          className="relative min-w-0 flex-1 overflow-auto"
        >
          <ReviewProvider
            page={active?.slug ?? ""}
            active={
              view === "preview" && annotations === "visible" && Boolean(active) && !markdownPage && !folderPage
            }
            sourceDirty={sourceBusy}
            contentRef={contentRef}
            scrollRef={ctx.contentRef}
          >
            <div ref={contentRef} data-review-content data-show-rejected={showRejected} className={cn("min-w-0 p-density-4", (markdownPage || folderPage) && "h-full")}>
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
              <PageErrorBoundary page={active.slug}>
              {active.kind === "folder" ? (
                <Suspense fallback={<p role="status">Loading folder problems…</p>}>
                  <RepositoryFolderPage key={active.slug} id={active.slug} onNavigate={onNavigate} />
                </Suspense>
              ) : active.kind === "markdown" ? (
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
                    {repositoryDocument ? <RepositoryDocumentPage slug={active.slug} view={view} onViewChange={onViewChange} source={source} annotations={annotations} onLint={(file, promptId) => {
                      if (!contentRef.current) throw new Error("AI review needs the document mounted");
                      openPrompt({ page: active.slug, anchor: DOCUMENT_ANCHOR, element: onCaptureSelection(DOCUMENT_ANCHOR, contentRef.current), files: [file], ...(promptId ? { promptId } : {}) });
                    }} /> : <MarkdownDocumentPage
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
                    />}
                  </Suspense>
                )
              ) : unsupportedView ? (
                null
              ) : view === "markdown" ? (
                <MarkdownPage
                  markdown={pageGuidance.markdown}
                  error={pageGuidance.loadError}
                />
              ) : pageElement ? (
                <Suspense
                  fallback={
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  }
                >
                  {pageElement}
                </Suspense>
              ) : (
                null
              )}
              </PageErrorBoundary>
            </div>

            {!designing && visualSelection.notice && <div role="status" className="p-2 text-sm">{visualSelection.notice}</div>}
            {designing && visualEnabled && active.kind === "component" && (
              <Suspense fallback={null}>
                <VisualEditOverlay
                  root={contentRef.current}
                  page={active.slug}
                  onPendingChange={visualSelection.onFacetPendingChange}
                  selected={visualSelection.selected?.node.element ?? null}
                  pending={visualPending}
                  selectionNotice={visualSelection.notice}
                  onSelect={selectVisualTarget}
                  onOpenSource={({ file, line }) => {
                    setDesigning(false);
                    visualSelection.close();
                    setEditTarget({ kind: "file", file, line });
                  }}
                />
              </Suspense>
            )}
            {visualEnabled && styleTarget?.node.element.isConnected && active.kind === "component" && contentRef.current && (
              <Suspense fallback={null}>
                <SvgStylePanel
                  key={styleTarget.key}
                  element={styleTarget.node.element}
                  root={contentRef.current}
                  page={active.slug}
                  requestStyleChange={requestStyleChange}
                  onPendingChange={visualSelection.onSvgPendingChange}
                  onClose={visualSelection.close}
                  onOpenSource={({ file, line }) => {
                    visualSelection.close();
                    setDesigning(false);
                    setEditTarget({ kind: "file", file, line });
                  }}
                />
              </Suspense>
            )}
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
          <CommentRail
            stacked={phone}
            // Stacked under the artifact on a phone: tall enough for a focused
            // thread and its composer, with room under it for the fixed
            // react-grab toolbar so it never covers the rail's controls.
            className="max-h-[max(15rem,45dvh)] md:max-h-none"
            {...(railOverDialog ? { style: { zIndex: floatingZIndex } } : {})}
          >
            <div className="p-density-3 pb-16 md:pb-density-3">
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
                hideComposer={Boolean(activeDraft)}
                className="w-full"
                previewLines={3}
                detailTabs={detailTabs}
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
                renderRootDetails={agentRuns.renderRunDetails}
              />
            )}
            </div>
          </CommentRail>
        )}
        </div>
      </div>}
      {activeDraft && <CommentDraftPopover
        key={activeDraft.anchor}
        reference={activeDraft.element}
        anchor={activeDraft.anchor}
        label={labels[activeDraft.anchor] ?? describeElement(activeDraft.element)}
        config={ctx.config}
        {...(ctx.callbacks.onMention ? { onMention: ctx.callbacks.onMention } : {})}
        onDiscard={() => setCommentDraft(null)}
        createActions={[{ id: "plain", label: "Post comment" }, ...(screenshotCaptureSupported() ? [{ id: "screenshot", label: "Post with screenshot" }] : [])]}
        onCreate={async (input, action) => {
          if (!ctx.callbacks.onCreate) throw new Error("Comment creation is not configured");
          await ctx.callbacks.onCreate(input, action);
          setCommentDraft(current => current === activeDraft ? null : current);
          ctx.focusAnchor(activeDraft.anchor);
        }}
      />}
    </div>
  );

  const panes: WorkspacePaneSpec[] = [
    explorerPane({
      title: "Clicky UI · Playground",
      header: (
        <>
          {repositoryNavigation.controls}
          <PlaygroundSidebarControls state={sidebar} onChange={setSidebar} olderCount={tree.olderCount} commentsError={activity.commentsError} updatesError={activity.updatesError} />
          {metadataError && <p role="alert" className="py-density-1 text-xs text-destructive">{metadataError}</p>}
        </>
      ),
      error: tree.error,
      section: tree.section,
      commentsHref: pageHref(""),
      commentsActive: !active,
    }),
    {
      id: "page",
      label: active ? <PlaygroundBodyHeader active={active} /> : "Comments",
      location: "center",
      collapsible: false,
      slots: { headerTrailing: headerActions },
      contentClassName: "overflow-hidden",
      content: pageContent,
    },
    ...(editorOpen
      ? [
          {
            id: "editor",
            label: "Source",
            location: "right" as const,
            collapsible: false,
            width: 560,
            minWidth: 320,
            maxWidth: 1400,
            contentClassName: "overflow-hidden",
            content: (
              <Suspense
                fallback={
                  <p className="p-density-3 text-xs text-muted-foreground">
                    Loading editor…
                  </p>
                }
              >
                <SourceEditor
                  file={editFile ? `src/pages/${editFile.file}` : `src/pages/${active.slug}.tsx`}
                  source={source}
                  revealLine={editFile?.line}
                  onClose={() => setEditTarget(null)}
                />
              </Suspense>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <Workspace className="h-dvh" panes={panes} storageKey={WORKSPACE_STORAGE_KEY} defaultValue={layoutDefaults} />
      {repositoryNavigation.dialogs}
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
    </>
  );
}
