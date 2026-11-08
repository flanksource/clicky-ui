import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { CommentDraftCard } from "../../comments/CommentDraftCard";
import { CommentThread } from "../../comments/CommentThread";
import type { Comment, CommentCallbacks, CommentConfig, CommentCreateAction } from "../../comments/comment-types";
import type { FileReviewThreadOptions } from "./FileReview";

/** A people's thread placed on lines of the file being edited. */
export type EditThreadEntry = { anchor: string; label: string; startLine: number; thread: Comment[] };

/**
 * The threads beside the Monaco editor in Edit mode: one card per placed
 * thread, in line order, and the composer for a range just selected. Picking a
 * gutter marker focuses its card; a card's click moves the editor to its lines.
 */
export function EditThreads({
  entries,
  draft,
  focused,
  config,
  callbacks,
  options,
  renderRootDetails,
  composerActions,
  onFocus,
  onCreate,
  onDiscardDraft,
}: {
  entries: readonly EditThreadEntry[];
  draft: { anchor: string; label: string } | null;
  focused: string | null;
  config: CommentConfig;
  callbacks: CommentCallbacks;
  options: FileReviewThreadOptions;
  renderRootDetails: ((comment: Comment) => ReactNode) | undefined;
  composerActions: readonly CommentCreateAction[] | undefined;
  onFocus: (entry: EditThreadEntry) => void;
  onCreate: NonNullable<CommentCallbacks["onCreate"]>;
  onDiscardDraft: () => void;
}) {
  const rail = useRef<HTMLElement>(null);
  useEffect(() => {
    const cards = rail.current?.querySelectorAll<HTMLElement>("[data-card-anchor]") ?? [];
    // jsdom has no scrollIntoView; every browser does.
    [...cards].find((card) => card.dataset.cardAnchor === focused)?.scrollIntoView?.({ block: "nearest" });
  }, [focused]);
  if (entries.length === 0 && !draft) return null;
  return (
    <aside ref={rail} data-edit-threads="" aria-label="Comments on the source" className="w-80 shrink-0 space-y-2 overflow-y-auto border-l border-border p-2">
      {draft && (
        <div data-comment-draft={draft.anchor} className="rounded-lg border border-primary/50 bg-card shadow-lg">
          <CommentDraftCard
            label={draft.label}
            anchor={draft.anchor}
            config={config}
            onCreate={onCreate}
            onDiscard={onDiscardDraft}
            {...(composerActions ? { createActions: composerActions } : {})}
          />
        </div>
      )}
      {entries.map((entry) => (
        <div
          key={entry.anchor}
          data-card-anchor={entry.anchor}
          onClick={() => onFocus(entry)}
          className={cn("rounded-lg border bg-card", entry.anchor === focused ? "border-primary/50 shadow-lg" : "border-border shadow-sm")}
        >
          <div className="truncate px-2 pt-2 text-[11px] text-muted-foreground">{entry.label}</div>
          <CommentThread
            {...options}
            comments={entry.thread}
            config={config}
            anchor={entry.anchor}
            compact
            defaultExpanded={entry.anchor === focused}
            hideComposer={entry.thread.length > 0}
            composerPlaceholder="Add a comment…"
            {...callbacks}
            {...(renderRootDetails ? { renderRootDetails } : {})}
          />
        </div>
      ))}
    </aside>
  );
}
