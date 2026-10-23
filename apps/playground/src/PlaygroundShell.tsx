import {
  Suspense,
  lazy,
  useCallback,
  useState,
  type ComponentType,
  type LazyExoticComponent,
  type RefObject,
} from "react";
import {
  AppShell,
  CommentSidePanel,
  DOCUMENT_ANCHOR,
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
import { PlaygroundShellActions } from "./PlaygroundShellActions";
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
import { useFeedbackCopy } from "./comments/useFeedbackCopy";
import {
  type PageComment,
  type PlaygroundComments,
} from "./comments/useComments";
import { useDomAnchors } from "./comments/useDomAnchors";
import { overlayLabel } from "./comments/dom-anchor";
import {
  fallbackPageSlug,
  loadPage,
  pageMeta,
  pageTitle,
  pages,
  type PageEntry,
} from "./registry";
import type { AnnotationVisibility, PlaygroundView } from "./route";
import {
  usePlaygroundNavigation,
  type PageActionState,
} from "./usePlaygroundNavigation";

const lazyPageCache = new Map<string, LazyExoticComponent<ComponentType>>();

function lazyPage(entry: PageEntry): LazyExoticComponent<ComponentType> {
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
};

function shortAnchorLabel(anchor: string): string {
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
}: PlaygroundShellProps) {
  const ctx = useCommentContext();
  const [sidebar, setSidebar] = useSidebarState();
  const activity = usePageActivity();
  const [editing, setEditing] = useState(false);
  const [pageAction, setPageAction] = useState<PageActionState | null>(null);
  const source = useSource(active?.slug, editing);
  const pageFolders = usePageFolders();
  const filesystemActionsDisabled = !import.meta.env.DEV || source.dirty;
  const filesystemActionsDisabledReason = !import.meta.env.DEV
    ? "Page filesystem actions are only available under vite dev"
    : source.dirty
      ? "Save or revert the source before changing pages"
      : undefined;

  const { pins, overlayPins, orphans, labels } = useDomAnchors(
    { scrollRef: ctx.contentRef, contentRef },
    view === "preview" ? ctx.comments : [],
    ctx.registerAnchor,
  );

  const pageMove = usePageMoveDrag({
    disabled: filesystemActionsDisabled,
    activeSlug: active?.slug,
    onNavigate,
  });

  const navSections = usePlaygroundNavigation({
    activeSlug: active?.slug,
    allComments,
    query: sidebar.query,
    onQueryChange: (query) => setSidebar({ query }),
    sort: sidebar.sort,
    filters: sidebar.filters,
    updates: activity.updates,
    loading: commentsLoading,
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
    enabled: view === "preview" && Boolean(active),
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
  });

  const feedback = useFeedbackCopy({ active, comments: ctx.comments, labels });
  const { queue: reviewQueue, selectItem: selectReviewItem } =
    useResolvedCommentReview({
      allComments,
      activeSlug: active?.slug,
      selectedId: selectedCommentId,
      active: review === "resolved",
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
      comments: allComments.filter((comment) =>
        inFolder.some((entry) => entry.slug === comment.page),
      ).length,
    };
  };

  const PageComponent = active ? lazyPage(active) : null;
  const activeTitle = active ? pageTitle(active) : "";
  const activeMeta = active ? pageMeta(active) : undefined;
  const pageGuidance = usePageGuidance(active, activeTitle);
  const railVisible =
    Boolean(active) && view === "preview" &&
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
  const editorOpen = editing && active !== undefined;
  const actionPage = pageAction?.page ?? active;

  return (
    <AppShell
      brand={
        <>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            P
          </span>
          <span className="font-semibold tracking-tight">
            Clicky UI · Playground
          </span>
        </>
      }
      sidebarHeader={<PlaygroundSidebarControls state={sidebar} onChange={setSidebar} error={activity.error} />}
      sidebarWidth={300}
      actions={
        <>
          {activeMeta?.appShellActions}
          <PlaygroundShellActions
            view={view}
            annotations={annotations}
            copyDisabled={pageGuidance.markdown === null}
            pageMarkdownCopied={pageGuidance.copied}
            onViewChange={onViewChange}
            onAnnotationsChange={onAnnotationsChange}
            onCopyPage={() => void pageGuidance.copyPage()}
            filesystemActionsDisabled={filesystemActionsDisabled}
            {...(filesystemActionsDisabledReason
              ? { filesystemActionsDisabledReason }
              : {})}
            onNewPage={(action) => setPageAction({ action })}
            active={Boolean(active)}
            editing={editing}
            sourceDirty={source.dirty}
            onToggleEditing={() => setEditing((on) => !on)}
            reviewActive={review === "resolved"}
            reviewCount={reviewQueue.length}
            onToggleReview={() =>
              review === "resolved"
                ? onReviewExit()
                : selectReviewItem(
                    reviewQueue.find(
                      (comment) => comment.page === active?.slug,
                    ) ?? reviewQueue[0],
                  )
            }
            onCommentWholePage={() => {
              ctx.focusAnchor(DOCUMENT_ANCHOR);
            }}
            feedbackCopied={feedback.copied}
            onCopyFeedback={feedback.copyFeedback}
            feedbackCopyActions={feedback.copyActions}
            pageCommentCount={ctx.comments.length}
          />
        </>
      }
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
              view === "preview" && annotations === "visible" && Boolean(active)
            }
            sourceDirty={source.dirty}
            contentRef={contentRef}
            scrollRef={ctx.contentRef}
          >
            <div ref={contentRef} className="min-w-0 p-density-4">
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
              {view === "preview" && annotations === "visible" && orphans.length > 0 && (
                <Banner tone="warning">
                  {orphans.length} comment anchor
                  {orphans.length === 1
                    ? " no longer matches"
                    : "s no longer match"}{" "}
                  an element on this page. The notes are kept and listed as
                  “Unavailable” in the rail.
                </Banner>
              )}
              {view === "markdown" ? (
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
            className="relative max-h-60 shrink-0 overflow-y-auto border-t border-border bg-background p-density-3 md:max-h-none md:border-l md:border-t-0"
            {...(railOverDialog ? { style: { zIndex: floatingZIndex } } : {})}
          >
            {review === "resolved" ? (
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
                focusedAlignment="anchor"
                anchorLabels={labels}
                formatAnchorLabel={shortAnchorLabel}
                compact
                createActions={[
                  { id: "plain", label: "Post comment" },
                  { id: "screenshot", label: "Post with screenshot" },
                ]}
                threadToMarkdown={feedback.threadToMarkdown}
                renderRootDetails={(comment) => (
                  <CommentCapture comment={comment} />
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
          actionPage
            ? allComments.filter((comment) => comment.page === actionPage.slug)
                .length
            : 0
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
