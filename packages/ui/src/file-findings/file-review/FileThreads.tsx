import { useState, type ReactNode } from "react";
import { Icon } from "../../data/Icon";
import { CommentDraftCard } from "../../comments/CommentDraftCard";
import { CommentThread } from "../../comments/CommentThread";
import type { Comment, CommentCallbacks, CommentConfig, CommentCreateAction } from "../../comments/comment-types";
import { DOCUMENT_ANCHOR } from "../../comments/comment-types";
import { UiChevronDown, UiChevronRight } from "../../icons";
import type { FileReviewThreadOptions } from "./FileReview";

/** A thread that has no place in the text: on the whole file, or whose anchor can no longer be found. */
export type FileThreadEntry = {
  anchor: string;
  /** What the thread is on: "File", or why it is listed apart, e.g. "Outdated · Lines 5–7". */
  label: string;
  /** One line saying why, for a thread that lost its place. */
  note?: string | null;
  thread: Comment[];
};

/**
 * The file-level thread list: comments on the whole file, and threads whose
 * lines, element or text can no longer be placed. Listed here rather than
 * hidden, so nothing anyone wrote is lost when the file changes.
 */
export function FileThreads({
  entries,
  drafting,
  config,
  callbacks,
  options,
  renderRootDetails,
  composerActions,
  onCreate,
  onDiscardDraft,
}: {
  entries: readonly FileThreadEntry[];
  /** A new comment on the whole file is being written. */
  drafting: boolean;
  config: CommentConfig;
  callbacks: CommentCallbacks;
  options: FileReviewThreadOptions;
  renderRootDetails: ((comment: Comment) => ReactNode) | undefined;
  composerActions: readonly CommentCreateAction[] | undefined;
  onCreate: NonNullable<CommentCallbacks["onCreate"]>;
  onDiscardDraft: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  if (entries.length === 0 && !drafting) return null;
  return (
    <section data-file-threads="" aria-label="File comments" className="shrink-0 rounded-md border border-border bg-card">
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((value) => !value)}
        className="flex w-full items-center gap-1 px-2 py-1 text-left text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <Icon icon={collapsed ? UiChevronRight : UiChevronDown} />
        File comments · {entries.length}
      </button>
      {!collapsed && (
        <div className="max-h-72 space-y-2 overflow-y-auto border-t border-border p-2">
          {drafting && (
            <div className="rounded-lg border border-primary/50 bg-card">
              <CommentDraftCard
                label="Comment on file"
                anchor={DOCUMENT_ANCHOR}
                config={config}
                onCreate={onCreate}
                onDiscard={onDiscardDraft}
                {...(composerActions ? { createActions: composerActions } : {})}
              />
            </div>
          )}
          {entries.map(({ anchor, label, note, thread }) => (
            <div key={anchor} data-file-thread={anchor} className="rounded-lg border border-border bg-card">
              <div className="px-2 pt-2 text-[11px] text-muted-foreground">
                <span className="font-medium">{label}</span>
                {note && <span> — {note}</span>}
              </div>
              <CommentThread
                {...options}
                comments={thread}
                config={config}
                anchor={anchor}
                compact
                defaultExpanded
                hideComposer={thread.length > 0}
                composerPlaceholder="Add a comment…"
                {...callbacks}
                {...(renderRootDetails ? { renderRootDetails } : {})}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
