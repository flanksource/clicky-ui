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
  CommentSidePanel,
  DensitySwitcher,
  ThemeSwitcher,
  cn,
  useCommentContext,
  type AppShellNavSection,
} from "@flanksource/clicky-ui";
import { UiCode2, UiComment } from "@flanksource/clicky-ui/icons";

import { CommentOverlay } from "./comments/CommentOverlay";
import { NewArtifactForm } from "./editor/NewArtifactForm";
import { useSource } from "./editor/useSource";
import { buildPlaygroundNavSections } from "./navigation";

// Monaco is several megabytes and only ever needed once someone opens the
// editor, so it must not sit in the entry chunk.
const SourceEditor = lazy(() =>
  import("./editor/SourceEditor").then((module) => ({ default: module.SourceEditor })),
);
import { resolveAnchor } from "./comments/dom-anchor";
import { commentsToMarkdown } from "./comments/markdown";
import { useDomAnchors } from "./comments/useDomAnchors";
import {
  PAGES,
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
  query: string;
  onQueryChange: (next: string) => void;
  commentsError: string | null;
};

function shortAnchorLabel(anchor: string): string {
  const last = anchor.split(" > ").pop() ?? anchor;
  return last === ":scope" ? "Whole page" : last;
}

function Banner({ tone, children }: { tone: "danger" | "warning"; children: React.ReactNode }) {
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
        Create <code className="rounded bg-muted px-1">src/pages/my-idea.tsx</code> with a default
        export and it appears here — no registration step.
      </p>
    </div>
  );
}

export function PlaygroundShell({
  active,
  query,
  onQueryChange,
  commentsError,
}: PlaygroundShellProps) {
  const ctx = useCommentContext();
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [commentMode, setCommentMode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [creating, setCreating] = useState(false);
  const source = useSource(active?.slug, editing);

  const { pins, orphans, labels } = useDomAnchors(
    { scrollRef: ctx.contentRef, contentRef },
    ctx.comments,
    ctx.registerAnchor,
  );

  // Rebuilds the nav when a page's `meta` resolves and its label/group changes.
  const metaVersion = useSyncExternalStore(subscribeMeta, getMetaVersion, getMetaVersion);

  const navSections = useMemo<AppShellNavSection[]>(() => {
    return buildPlaygroundNavSections(PAGES, {
      activeSlug: active?.slug,
      query,
      metaFor: pageMeta,
    });
  }, [active?.slug, metaVersion, query]);

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
      if (event.key !== "c" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
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

  const copyFeedback = useCallback(() => {
    if (!active) return;
    void navigator.clipboard
      .writeText(commentsToMarkdown(active.slug, ctx.comments, labels))
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      });
  }, [active, ctx.comments, labels]);

  const PageComponent = active ? lazyPage(active) : null;
  const railVisible = ctx.railMode !== "closed" || ctx.comments.length > 0;
  const editorOpen = editing && active !== undefined;

  return (
    <AppShell
      brand={
        <>
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
            P
          </span>
          <span className="font-semibold tracking-tight">Clicky UI · Playground</span>
        </>
      }
      search={
        <input
          value={query}
          onChange={(event) => onQueryChange((event.target as HTMLInputElement).value)}
          placeholder="Filter artifacts…"
          aria-label="Filter artifacts"
          className="w-full rounded-md border border-border bg-muted px-3 py-1.5 text-sm outline-none focus:border-ring"
        />
      }
      actions={
        <>
          <button
            type="button"
            onClick={() => setCreating((on) => !on)}
            aria-pressed={creating}
            title="Create a new artifact"
            className={cn(
              "rounded-md border px-2 py-1.5 text-xs font-medium transition-colors",
              creating
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:text-foreground",
            )}
          >
            New
          </button>
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
            {source.dirty && <span className="size-1.5 rounded-full bg-amber-500" />}
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
          <button
            type="button"
            onClick={copyFeedback}
            disabled={ctx.comments.length === 0}
            title="Copy this page's feedback as markdown for an agent"
            className="rounded-md border border-border bg-background px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
          >
            {copied ? "Copied" : "Copy feedback"}
          </button>
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
            <SourceEditor slug={active.slug} source={source} onClose={() => setEditing(false)} />
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
            {creating && <NewArtifactForm onCancel={() => setCreating(false)} />}
            {commentsError && <Banner tone="danger">{commentsError}</Banner>}
            {orphans.length > 0 && (
              <Banner tone="warning">
                {orphans.length} comment anchor{orphans.length === 1 ? " no longer matches" : "s no longer match"}{" "}
                an element on this page. The notes are kept and listed as “Unavailable” in the rail.
              </Banner>
            )}
            {PageComponent ? (
              <Suspense fallback={<p className="text-sm text-muted-foreground">Loading…</p>}>
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
            focusedAnchor={ctx.railMode === "focused" ? ctx.focusedAnchor : null}
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
    </AppShell>
  );
}
