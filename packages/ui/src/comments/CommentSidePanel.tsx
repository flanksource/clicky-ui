import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiComment } from "../icons";
import { CommentThread } from "./CommentThread";
import { CommentThreadList } from "./CommentThreadList";
import {
  useCommentContextOptional,
  type CommentContextValue,
} from "./comment-context";
import {
  buildThreadListHandlers,
  getRoots,
  sortReplies,
  buildReplyMap,
} from "./comment-utils";
import {
  DOCUMENT_ANCHOR,
  type Comment,
  type CommentAnchor,
} from "./comment-types";

export type CommentSidePanelProps = {
  /** Explicit label per anchor key. */
  anchorLabels?: Record<CommentAnchor, string>;
  /** Fallback label formatter for anchors without an explicit label. */
  formatAnchorLabel?: (anchor: CommentAnchor) => string;
  compact?: boolean;
  /** Position the focused thread beside its registered content anchor. */
  focusedAlignment?: "flow" | "anchor";
  className?: string;
};

function defaultAnchorLabel(anchor: CommentAnchor): string {
  if (anchor === DOCUMENT_ANCHOR) return "General";
  return anchor
    .replace(/\[\d+\]/g, "")
    .replaceAll(".", " › ")
    .replaceAll("_", " ")
    .trim();
}

function useAnchorLabel(props: CommentSidePanelProps) {
  return (anchor: CommentAnchor): string =>
    props.anchorLabels?.[anchor] ??
    props.formatAnchorLabel?.(anchor) ??
    defaultAnchorLabel(anchor);
}

function LocationMeta({ label }: { label: string }) {
  return (
    <span
      data-testid="comment-location-meta"
      className="inline-flex items-center rounded-full bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground"
    >
      {label}
    </span>
  );
}

function RailToggle({
  active,
  onClick,
  children,
  testId,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-muted-foreground hover:text-foreground",
      )}
    >
      <Icon icon={UiComment} className="text-xs" />
      {children}
    </button>
  );
}

function orderedAnchors(ctx: CommentContextValue): string[] {
  return Object.keys(ctx.commentMeta).sort((a, b) => {
    if (a === DOCUMENT_ANCHOR) return -1;
    if (b === DOCUMENT_ANCHOR) return 1;
    const at = ctx.getAnchorTop(a);
    const bt = ctx.getAnchorTop(b);
    if (at == null && bt == null) return a.localeCompare(b);
    if (at == null) return 1;
    if (bt == null) return -1;
    if (at !== bt) return at - bt;
    return a.localeCompare(b);
  });
}

function orderComments(
  comments: Comment[],
  anchorOrder: Map<string, number>,
): Comment[] {
  const replyMap = buildReplyMap(comments);
  const roots = getRoots(comments).sort((a, b) => {
    const ai =
      anchorOrder.get(a.anchor ?? DOCUMENT_ANCHOR) ?? Number.MAX_SAFE_INTEGER;
    const bi =
      anchorOrder.get(b.anchor ?? DOCUMENT_ANCHOR) ?? Number.MAX_SAFE_INTEGER;
    if (ai !== bi) return ai - bi;
    if (a.createdAt !== b.createdAt)
      return a.createdAt.localeCompare(b.createdAt);
    return String(a.id).localeCompare(String(b.id));
  });
  return roots.flatMap((root) => [
    root,
    ...sortReplies(replyMap.get(root.id) ?? []),
  ]);
}

function AllComments({
  ctx,
  label,
}: {
  ctx: CommentContextValue;
  label: (a: CommentAnchor) => string;
}) {
  const ordered = useMemo(() => {
    const anchorOrder = new Map(orderedAnchors(ctx).map((a, i) => [a, i]));
    return orderComments(ctx.comments, anchorOrder);
  }, [ctx]);
  const handlers = buildThreadListHandlers(ordered, ctx.config, ctx.callbacks);

  function activateThread(
    event: MouseEvent<HTMLDivElement>,
    anchor: CommentAnchor,
  ) {
    const target = event.target as Element;
    if (
      target.closest(
        'button, a, input, textarea, select, [contenteditable="true"]',
      )
    )
      return;
    const roleButton = target.closest('[role="button"]');
    if (roleButton && roleButton !== target.closest("[data-comment-kind]"))
      return;
    if (anchor !== DOCUMENT_ANCHOR) {
      const found = ctx.scrollToAnchor(anchor, {
        behavior: "smooth",
        block: "start",
        offset: 12,
      });
      if (!found) return;
    }
    ctx.focusAnchor(anchor);
  }

  if (ordered.length === 0) {
    return (
      <p className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        No comments yet.
      </p>
    );
  }

  return (
    <div
      data-testid="comment-all-rail"
      className="space-y-3 overflow-y-auto pr-1"
    >
      <CommentThreadList
        comments={ordered}
        config={ctx.config}
        compact
        renderRootMeta={(c) => {
          const anchor = c.anchor ?? DOCUMENT_ANCHOR;
          const available =
            anchor === DOCUMENT_ANCHOR || ctx.getAnchorTop(anchor) != null;
          return (
            <LocationMeta
              label={`${label(anchor)}${available ? "" : " · Unavailable"}`}
            />
          );
        }}
        getThreadProps={(c) => ({
          "data-testid": "comment-feed-item",
          onMouseEnter: () =>
            ctx.setHighlightAnchor(c.anchor ?? DOCUMENT_ANCHOR),
          onMouseLeave: () => ctx.setHighlightAnchor(null),
          onClick: (event) =>
            activateThread(event, c.anchor ?? DOCUMENT_ANCHOR),
        })}
        {...handlers}
      />
    </div>
  );
}

function FocusedComments({
  ctx,
  anchor,
  label,
  compact,
}: {
  ctx: CommentContextValue;
  anchor: CommentAnchor;
  label: string;
  compact?: boolean;
}) {
  const comments = ctx.comments.filter(
    (c) => (c.anchor ?? DOCUMENT_ANCHOR) === anchor,
  );
  const hasComments = comments.length > 0;
  return (
    <div className="space-y-3" data-comment-anchor={anchor}>
      <LocationMeta
        label={
          anchor === DOCUMENT_ANCHOR
            ? "Document-level comment"
            : `Attached to ${label}`
        }
      />
      <CommentThread
        comments={comments}
        config={ctx.config}
        anchor={anchor}
        compact={compact ?? false}
        autoFocusComposer={!hasComments}
        defaultExpandedRoots={hasComments}
        composerPlaceholder={
          hasComments ? "Add another top-level comment…" : "Add a comment…"
        }
        {...ctx.callbacks}
      />
    </div>
  );
}

/**
 * A controlled comment rail driven by {@link CommentProvider}. Shows a focused
 * thread for the active anchor, the full document feed in anchor order, or a
 * toggle when collapsed. Renders nothing outside a provider or when empty.
 */
export function CommentSidePanel(props: CommentSidePanelProps) {
  const ctx = useCommentContextOptional();
  const label = useAnchorLabel(props);
  const railRef = useRef<HTMLElement>(null);
  const focusedRef = useRef<HTMLDivElement>(null);
  const [focusedOffset, setFocusedOffset] = useState<number | null>(null);
  const focusedAnchor = ctx?.railMode === "focused" ? ctx.focusedAnchor : null;

  useEffect(() => {
    if (!ctx || props.focusedAlignment !== "anchor" || !focusedAnchor) {
      setFocusedOffset(null);
      return;
    }
    const content = ctx.contentRef.current;
    const rail = railRef.current;
    const focused = focusedRef.current;
    if (!content || !rail || !focused) return;

    const update = () => {
      const anchorTop = ctx.getAnchorTop(focusedAnchor);
      if (anchorTop == null) {
        setFocusedOffset(null);
        return;
      }
      const desiredTop = anchorTop + content.getBoundingClientRect().top;
      const currentOffset = Number.parseFloat(focused.style.top) || 0;
      const nextOffset =
        currentOffset + desiredTop - focused.getBoundingClientRect().top;
      setFocusedOffset(Math.max(0, nextOffset));
    };
    update();
    content.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(update);
    observer?.observe(content);
    observer?.observe(rail);
    return () => {
      content.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      observer?.disconnect();
    };
  }, [ctx, focusedAnchor, props.focusedAlignment]);

  if (!ctx) return null;

  const total = Object.values(ctx.commentCounts).reduce((a, b) => a + b, 0);
  if (ctx.railMode === "closed" && total === 0) return null;

  return (
    <aside
      ref={railRef}
      data-testid="comment-side-panel"
      className={cn("relative w-[320px] space-y-3", props.className)}
    >
      {ctx.railMode === "all" ? (
        <>
          <div className="flex items-center gap-2">
            <RailToggle active onClick={ctx.openCommentList}>
              All comments ({total})
            </RailToggle>
            <button
              type="button"
              onClick={ctx.closeRail}
              className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Close
            </button>
          </div>
          <AllComments ctx={ctx} label={label} />
        </>
      ) : ctx.railMode === "focused" && ctx.focusedAnchor ? (
        <div
          ref={focusedRef}
          data-testid="comment-focused-rail"
          className="relative space-y-3"
          style={focusedOffset == null ? undefined : { top: focusedOffset }}
        >
          <div className="flex items-center gap-2">
            {total > 0 && (
              <RailToggle
                onClick={ctx.openCommentList}
                testId="comment-open-all"
              >
                All comments ({total})
              </RailToggle>
            )}
            <button
              type="button"
              onClick={ctx.closeRail}
              className="ml-auto rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Hide
            </button>
          </div>
          <FocusedComments
            ctx={ctx}
            anchor={ctx.focusedAnchor}
            label={label(ctx.focusedAnchor)}
            {...(props.compact !== undefined ? { compact: props.compact } : {})}
          />
        </div>
      ) : (
        <RailToggle onClick={ctx.openCommentList} testId="comment-open-all">
          Open comments ({total})
        </RailToggle>
      )}
    </aside>
  );
}
