import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  AppShell,
  Badge,
  CommentSidePanel,
  DensitySwitcher,
  SplitButton,
  ThemeSwitcher,
  cn,
  useCommentContext,
  type AppShellNavSection,
  type DropdownMenuItem,
} from "@flanksource/clicky-ui";
import {
  UiCode2,
  UiComment,
  UiFilePlus,
  UiFolder,
  UiPencilSimpleLine,
  UiTrash,
} from "@flanksource/clicky-ui/icons";

import { CommentOverlay } from "./comments/CommentOverlay";
import {
  NewPageMenu,
  PageActions,
  PageManagementDialogs,
  type PageAction,
} from "./editor/PageManagement";
import { usePageFolders } from "./editor/usePageFolders";
import { useSource } from "./editor/useSource";
import { buildPlaygroundNavSections } from "./navigation";

// Monaco is several megabytes and only ever needed once someone opens the
// editor, so it must not sit in the entry chunk.
const SourceEditor = lazy(() =>
  import("./editor/SourceEditor").then((module) => ({
    default: module.SourceEditor,
  })),
);
import { resolveAnchor } from "./comments/dom-anchor";
import { writeClipboard } from "./comments/clipboard";
import { countOpenCommentsByPage } from "./comments/counts";
import {
  commentsForFolder,
  commentsToMarkdown,
  groupByPage,
  type CommentPageSection,
} from "./comments/markdown";
import {
  fetchComments,
  PLAYGROUND_COMMENT_CONFIG,
  type PageComment,
} from "./comments/useComments";
import { useDomAnchors } from "./comments/useDomAnchors";
import {
  PAGES,
  fallbackPageSlug,
  folderForPage,
  getMetaVersion,
  lazyPage,
  pageDescription,
  pageGroup,
  pageMeta,
  pageTitle,
  subscribeMeta,
  type PageEntry,
} from "./registry";

export type PlaygroundShellProps = {
  active: PageEntry | undefined;
  allComments: PageComment[];
  query: string;
  onQueryChange: (next: string) => void;
  commentsError: string | null;
};

type PageActionState = {
  action: PageAction;
  page?: PageEntry;
  initialFolder?: string;
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
  query,
  onQueryChange,
  commentsError,
}: PlaygroundShellProps) {
  const ctx = useCommentContext();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [commentMode, setCommentMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
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
    ctx.comments,
    ctx.registerAnchor,
  );

  // Rebuilds the nav when a page's `meta` resolves and its label/group changes.
  const metaVersion = useSyncExternalStore(
    subscribeMeta,
    getMetaVersion,
    getMetaVersion,
  );

  const openCommentCounts = useMemo(() => {
    return countOpenCommentsByPage(allComments, PLAYGROUND_COMMENT_CONFIG);
  }, [allComments]);

  const navSections = useMemo<AppShellNavSection[]>(() => {
    return buildPlaygroundNavSections(PAGES, pageFolders.folders, {
      activeSlug: active?.slug,
      query,
      metaFor: pageMeta,
      badgeFor: (entry) => {
        const count = openCommentCounts.get(entry.slug) ?? 0;
        return count > 0 ? (
          <Badge
            clickToCopy={false}
            count={count}
            size="xxs"
            tone="info"
            variant="soft"
          />
        ) : null;
      },
      folderBadgeFor: (_folder, pages) => {
        const count = pages.reduce(
          (total, page) => total + (openCommentCounts.get(page.slug) ?? 0),
          0,
        );
        return count > 0 ? (
          <Badge
            clickToCopy={false}
            count={count}
            size="xxs"
            tone="info"
            variant="soft"
          />
        ) : null;
      },
      contextMenuForPage: (entry) => [
        {
          label: "Rename",
          group: "Page",
          icon: UiPencilSimpleLine,
          disabled: filesystemActionsDisabled,
          ...(filesystemActionsDisabledReason
            ? { title: filesystemActionsDisabledReason }
            : {}),
          onSelect: () => setPageAction({ action: "rename", page: entry }),
        },
        {
          label: "Move",
          icon: UiFolder,
          disabled: filesystemActionsDisabled,
          ...(filesystemActionsDisabledReason
            ? { title: filesystemActionsDisabledReason }
            : {}),
          onSelect: () => setPageAction({ action: "move", page: entry }),
        },
        {
          label: "Delete",
          icon: UiTrash,
          disabled: filesystemActionsDisabled,
          ...(filesystemActionsDisabledReason
            ? { title: filesystemActionsDisabledReason }
            : {}),
          onSelect: () => setPageAction({ action: "delete", page: entry }),
        },
      ],
      contextMenuForFolder: (folder) => [
        {
          label: "New page",
          group: "Folder",
          icon: UiFilePlus,
          disabled: filesystemActionsDisabled,
          ...(filesystemActionsDisabledReason
            ? { title: filesystemActionsDisabledReason }
            : {}),
          onSelect: () =>
            setPageAction({ action: "new-page", initialFolder: folder }),
        },
        {
          label: "New folder",
          icon: UiFolder,
          disabled: filesystemActionsDisabled,
          ...(filesystemActionsDisabledReason
            ? { title: filesystemActionsDisabledReason }
            : {}),
          onSelect: () =>
            setPageAction({ action: "new-folder", initialFolder: folder }),
        },
      ],
    });
  }, [
    active?.slug,
    filesystemActionsDisabled,
    filesystemActionsDisabledReason,
    metaVersion,
    openCommentCounts,
    pageFolders.folders,
    query,
  ]);

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
  useEffect(() => setCommentMode(false), [active?.slug]);

  /**
   * Every copy action funnels through here so a failed fetch or a refused
   * clipboard surfaces as a banner instead of looking like "there was nothing
   * to copy". `labels` only describe the live page; other pages fall back to
   * their raw anchors.
   */
  const copyMarkdown = useCallback(
    async (
      load: () => CommentPageSection[] | Promise<CommentPageSection[]>,
    ) => {
      try {
        // The dropdown actions fetch before they have anything to copy, and in
        // Safari and Firefox the click's transient user activation is already
        // spent by the time that await resolves — `writeText` would then be
        // refused. `write` accepts a *pending* blob, so the clipboard is
        // claimed inside the activation and filled once the fetch lands.
        await writeClipboard(
          Promise.resolve(load()).then((sections) =>
            commentsToMarkdown(sections, {
              labels,
              pageUrl: (page) => {
                const url = new URL(window.location.origin);
                url.searchParams.set("page", page);
                return url.href;
              },
              pagePath: (page) => `apps/playground/src/pages/${page}.tsx`,
            }),
          ),
        );
        setCopyError(null);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      } catch (cause) {
        setCopyError(cause instanceof Error ? cause.message : String(cause));
      }
    },
    [labels],
  );

  const copyFeedback = useCallback(() => {
    if (!active) return;
    void copyMarkdown(() => [{ page: active.slug, comments: ctx.comments }]);
  }, [active, copyMarkdown, ctx.comments]);

  const activeFolder = active ? folderForPage(active.slug, PAGES) : undefined;
  const activeFolderLabel = activeFolder
    ?.split("/")
    .map((part) => part.replace(/[-_]+/g, " "))
    .join(" / ");

  // The dropdown actions re-read from the backend rather than filtering the
  // provider's list: only the server knows the pages this session never opened.
  const copyActions = useMemo<DropdownMenuItem[]>(
    () => [
      {
        label: "Copy open comments (this page)",
        title: "Unresolved notes on the page you are looking at",
        disabled: active === undefined,
        onSelect: () => {
          if (!active) return;
          void copyMarkdown(async () => [
            {
              page: active.slug,
              comments: await fetchComments({
                page: active.slug,
                unresolved: true,
              }),
            },
          ]);
        },
      },
      ...(activeFolder && activeFolderLabel
        ? [
            {
              label: "Copy all comments (this folder)",
              title: `Every note under ${activeFolderLabel}, resolved ones included`,
              onSelect: () =>
                void copyMarkdown(async () =>
                  commentsForFolder(await fetchComments(), activeFolder),
                ),
            },
          ]
        : []),
      {
        label: "Copy all open comments",
        title: "Unresolved notes from every artifact page",
        onSelect: () =>
          void copyMarkdown(async () =>
            groupByPage(await fetchComments({ unresolved: true })),
          ),
      },
      {
        label: "Copy all comments",
        title: "Every note from every artifact page, resolved ones included",
        onSelect: () =>
          void copyMarkdown(async () => groupByPage(await fetchComments())),
      },
    ],
    [active, activeFolder, activeFolderLabel, copyMarkdown],
  );

  const PageComponent = active ? lazyPage(active) : null;
  const railVisible = ctx.railMode !== "closed" || ctx.comments.length > 0;
  const editorOpen = editing && active !== undefined;
  const navigatePage = useCallback((slug?: string) => {
    const url = new URL(window.location.href);
    if (slug) url.searchParams.set("page", slug);
    else url.searchParams.delete("page");
    window.location.href = url.href;
  }, []);
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
          <button
            type="button"
            onClick={() => setCommentMode((on) => !on)}
            aria-pressed={commentMode}
            title="Comment on an element (c)"
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
              commentMode
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            <UiComment className="size-3.5" />
            {commentMode ? "Pick an element…" : "Comment"}
          </button>
          <SplitButton
            label={copied ? "Copied" : "Copy feedback"}
            onClick={copyFeedback}
            items={copyActions}
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
            {copyError && (
              <Banner tone="danger">Nothing was copied — {copyError}</Banner>
            )}
            {orphans.length > 0 && (
              <Banner tone="warning">
                {orphans.length} comment anchor
                {orphans.length === 1
                  ? " no longer matches"
                  : "s no longer match"}{" "}
                an element on this page. The notes are kept and listed as
                “Unavailable” in the rail.
              </Banner>
            )}
            {PageComponent ? (
              <Suspense
                fallback={
                  <p className="text-sm text-muted-foreground">Loading…</p>
                }
              >
                <PageComponent />
              </Suspense>
            ) : (
              <EmptyPages />
            )}
          </div>

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
        onNavigate={navigatePage}
        fallbackAfterDelete={(deletedSlug) =>
          deletedSlug === active?.slug
            ? fallbackPageSlug(PAGES, deletedSlug)
            : active?.slug
        }
      />
    </AppShell>
  );
}
