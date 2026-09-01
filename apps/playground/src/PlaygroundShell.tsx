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
  DensitySwitcher,
  DOCUMENT_ANCHOR,
  SplitButton,
  ThemeSwitcher,
  cn,
  useCommentContext,
} from "@flanksource/clicky-ui";
import {
  UiCode2,
  UiComment,
  UiFileText,
} from "@flanksource/clicky-ui/icons";

import { CommentOverlay } from "./comments/CommentOverlay";
import { AnnotationVisibilityProvider } from "./annotations";
import {
  NewPageMenu,
  PageActions,
  PageManagementDialogs,
} from "./editor/PageManagement";
import { usePageFolders } from "./editor/usePageFolders";
import { useSource } from "./editor/useSource";
import { MarkdownPage } from "./markdown/MarkdownPage";
import { usePageGuidance } from "./markdown/usePageGuidance";
import { PlaygroundViewActions } from "./PlaygroundViewActions";

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
  PAGES,
  fallbackPageSlug,
  loadPage,
  pageDescription,
  pageGroup,
  pageTitle,
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
  contentRef: RefObject<HTMLDivElement>;
  query: string;
  onQueryChange: (next: string) => void;
  commentsError: string | null;
  view: PlaygroundView;
  annotations: AnnotationVisibility;
  pageHref: (slug: string) => string;
  onViewChange: (view: PlaygroundView) => void;
  onAnnotationsChange: (annotations: AnnotationVisibility) => void;
  onNavigate: (slug?: string) => void;
};

function shortAnchorLabel(anchor: string): string {
  const last = anchor.split(" > ").pop() ?? anchor;
  return last === ":scope" ? "Whole page" : last;
}

function Banner({
  tone,
  children,
}: {
  tone: "danger" | "warning";
  children: React.ReactNode;
}) {
  return (
    <div
      role="status"
      className={cn(
        "mb-density-3 rounded-md border px-3 py-2 text-xs",
        tone === "danger"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-amber-500/40 bg-amber-500/10 text-amber-700 [[data-theme=dark]_&]:text-amber-300",
      )}
    >
      {children}
    </div>
  );
}

function EmptyPages() {
  return (
    <div className="mx-auto max-w-prose space-y-density-3 p-density-4 text-sm">
      <h1 className="text-lg font-semibold">No artifacts yet</h1>
      <p className="text-muted-foreground">
        Create{" "}
        <code className="rounded bg-muted px-1">src/pages/my-idea.tsx</code>{" "}
        with a default export and it appears here — no registration step.
      </p>
    </div>
  );
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
  pageHref,
  onViewChange,
  onAnnotationsChange,
  onNavigate,
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

  const navSections = usePlaygroundNavigation({
    active,
    allComments,
    query,
    folders: pageFolders.folders,
    pageHref,
    actionsDisabled: filesystemActionsDisabled,
    disabledReason: filesystemActionsDisabledReason,
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

  const PageComponent = active ? lazyPage(active) : null;
  const activeTitle = active ? pageTitle(active) : "";
  const pageGuidance = usePageGuidance(active, activeTitle);
  const railVisible =
    view === "preview" && (ctx.railMode !== "closed" || ctx.comments.length > 0);
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
        <>
          <PlaygroundViewActions
            view={view}
            annotations={annotations}
            copyDisabled={pageGuidance.markdown === null}
            copied={pageGuidance.copied}
            onViewChange={onViewChange}
            onAnnotationsChange={onAnnotationsChange}
            onCopy={() => void pageGuidance.copyPage()}
          />
          <NewPageMenu
            disabled={filesystemActionsDisabled}
            disabledReason={filesystemActionsDisabledReason}
            onSelect={(action) => setPageAction({ action })}
          />
          <button
            type="button"
            onClick={() => setEditing((on) => !on)}
            aria-pressed={editing}
            disabled={!active}
            title="Edit this artifact's source"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors disabled:opacity-40",
              editing
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <UiCode2 className="size-3.5" />
            Edit
            {source.dirty && (
              <span className="size-1.5 rounded-full bg-amber-500" />
            )}
          </button>
          {view === "preview" && (
            <SplitButton
              label={commentMode ? "Pick an element…" : "Comment"}
              icon={UiComment}
              onClick={() => setCommentMode((on) => !on)}
              items={[
                {
                  label: "Comment on whole page",
                  icon: UiFileText,
                  onSelect: () => {
                    setCommentMode(false);
                    ctx.focusAnchor(DOCUMENT_ANCHOR);
                  },
                },
              ]}
              variant={commentMode ? "default" : "outline"}
              size="sm"
              title="Choose comment scope"
            />
          )}
          <SplitButton
            label={feedback.copied ? "Copied" : "Copy feedback"}
            onClick={feedback.copyFeedback}
            items={feedback.copyActions}
            variant="outline"
            size="sm"
            // Only the primary half depends on this page having notes — the
            // cross-page actions stay reachable from an empty artifact.
            primaryDisabled={ctx.comments.length === 0}
            title="More copy actions"
          />
          <ThemeSwitcher />
          <DensitySwitcher />
        </>
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
              <EmptyPages />
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
            <CommentSidePanel
              focusedAlignment="anchor"
              anchorLabels={labels}
              formatAnchorLabel={shortAnchorLabel}
              compact
            />
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
        onClose={() => setPageAction(null)}
        onFolderCreated={pageFolders.add}
        onNavigate={onNavigate}
        fallbackAfterDelete={(deletedSlug) =>
          deletedSlug === active?.slug
            ? fallbackPageSlug(PAGES, deletedSlug)
            : active?.slug
        }
      />
    </AppShell>
  );
}
