import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
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
} from "@flanksource/clicky-ui";

import { CommentOverlay } from "./comments/CommentOverlay";
import { PlaygroundCommentReview } from "./comments/PlaygroundCommentReview";
import { useResolvedCommentReview } from "./comments/useResolvedCommentReview";
import { AnnotationVisibilityProvider } from "./annotations";
import { PageActions, PageManagementDialogs } from "./editor/PageManagement";
import { usePageFolders } from "./editor/usePageFolders";
import { usePageMoveDrag } from "./editor/usePageMoveDrag";
import { useSource } from "./editor/useSource";
import { MarkdownPage } from "./markdown/MarkdownPage";
import { usePageGuidance } from "./markdown/usePageGuidance";
import {
  EmptyPlayground,
  PlaygroundBanner as Banner,
} from "./PlaygroundShellParts";
import { PlaygroundShellActions } from "./PlaygroundShellActions";

// Monaco is several megabytes and only ever needed once someone opens the
// editor, so it must not sit in the entry chunk.
const SourceEditor = lazy(() =>
  import("./editor/SourceEditor").then((module) => ({
    default: module.SourceEditor,
  })),
);
import { resolveAnchor } from "./comments/dom-anchor";
import { useFeedbackCopy } from "./comments/useFeedbackCopy";
import { type PageComment } from "./comments/useComments";
import { useDomAnchors } from "./comments/useDomAnchors";
import {
  fallbackPageSlug,
  loadPage,
  pageDescription,
  pageGroup,
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
  query: string;
  onQueryChange: (next: string) => void;
  commentsError: string | null;
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
};

function shortAnchorLabel(anchor: string): string {
  const last = anchor.split(" > ").pop() ?? anchor;
  return last === ":scope" ? "Whole page" : last;
}

export function PlaygroundShell({
  active,
  allComments,
  contentRef,
  query,
  onQueryChange,
  commentsError,
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
}: PlaygroundShellProps) {
  const ctx = useCommentContext();
  const [commentMode, setCommentMode] = useState(false);
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

  const { pins, orphans, labels } = useDomAnchors(
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
    active,
    allComments,
    query,
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

  const handlePick = useCallback(
    (anchor: string) => {
      const content = contentRef.current;
      if (!content) return;
      const element = resolveAnchor(content, anchor);
      if (element instanceof HTMLElement) {
        // Registering up front lets the rail align to a brand-new anchor that
        // has no comments yet. Clear first: re-registering a different element
        // under the same key is an error in the provider.
        ctx.registerAnchor(anchor, null);
        ctx.registerAnchor(anchor, element);
      }
      setCommentMode(false);
      ctx.focusAnchor(anchor);
    },
    [ctx],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "c" || event.metaKey || event.ctrlKey || event.altKey)
        return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      ) {
        return;
      }
      event.preventDefault();
      setCommentMode((on) => !on);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Leaving a page must not leave the picker armed on the next one.
  useEffect(() => setCommentMode(false), [active?.slug, view]);

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
  const pageGuidance = usePageGuidance(active, activeTitle);
  const railVisible =
    view === "preview" &&
    (review === "resolved" ||
      ctx.railMode !== "closed" ||
      ctx.comments.length > 0);
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
      search={
        <input
          value={query}
          onChange={(event) =>
            onQueryChange((event.target as HTMLInputElement).value)
          }
          placeholder="Filter artifacts…"
          aria-label="Filter artifacts"
          className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none focus:border-ring"
        />
      }
      actions={
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
          commentMode={commentMode}
          onToggleCommentMode={() => setCommentMode((on) => !on)}
          onCommentWholePage={() => {
            setCommentMode(false);
            ctx.focusAnchor(DOCUMENT_ANCHOR);
          }}
          feedbackCopied={feedback.copied}
          onCopyFeedback={feedback.copyFeedback}
          feedbackCopyActions={feedback.copyActions}
          pageCommentCount={ctx.comments.length}
        />
      }
      navSections={navSections}
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
      bodyHeader={
        active ? (
          <div className="flex items-baseline gap-2 text-sm">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {pageGroup(active)}
            </span>
            <span className="text-muted-foreground">›</span>
            <span className="font-medium">{pageTitle(active)}</span>
            {pageDescription(active) && (
              <span className="truncate text-xs text-muted-foreground">
                {pageDescription(active)}
              </span>
            )}
          </div>
        ) : undefined
      }
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
      <div className="flex h-full min-h-0">
        <div
          ref={attachScrollRef}
          className={cn(
            "relative min-w-0 flex-1 overflow-auto",
            commentMode && "cursor-crosshair",
          )}
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
            {view === "preview" && orphans.length > 0 && (
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
              <EmptyPlayground />
            )}
          </div>

          {view === "preview" && (
            <CommentOverlay
              active={commentMode}
              scrollRef={ctx.contentRef}
              contentRef={contentRef}
              pins={pins}
              focusedAnchor={
                ctx.railMode === "focused" ? ctx.focusedAnchor : null
              }
              onPick={handlePick}
              onFocus={ctx.focusAnchor}
            />
          )}
        </div>

        {railVisible && (
          <div className="shrink-0 overflow-y-auto border-l border-border p-density-3">
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
                threadToMarkdown={feedback.threadToMarkdown}
              />
            )}
          </div>
        )}
      </div>
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
