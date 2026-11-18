import { useState, type ReactNode } from "react";
import { Icon } from "../../data/Icon";
import { CommentDraftCard } from "../../comments/CommentDraftCard";
import { CommentThread } from "../../comments/CommentThread";
import type { Comment, CommentCallbacks, CommentConfig, CommentCreateAction } from "../../comments/comment-types";
import { DOCUMENT_ANCHOR } from "../../comments/comment-types";
import { getRoots } from "../../comments/comment-utils";
import { DriftBadge, ReanchorButton, type Retarget } from "../../comments/DriftList";
import type { DriftState } from "../../comments/anchoring/drift";
import { UiChevronDown, UiChevronRight } from "../../icons";
import type { FileReviewThreadOptions } from "./FileReview";

/** A thread that has no place in the text: on the whole file, or whose anchor can no longer be found. */
export type FileThreadEntry = {
  anchor: string;
  /** What the thread is on: "File", or why it is listed apart, e.g. "Outdated · Lines 5–7". */
  label: string;
  /** Set for a thread whose anchor drifted: outdated, ambiguous, moved or orphaned. Absent for a whole-file thread. */
  drift?: DriftState;
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
  retarget,
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
  retarget: Retarget | undefined;
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
              <FileDraftCard config={config} composerActions={composerActions} onCreate={onCreate} onDiscard={onDiscardDraft} />
            </div>
          )}
          {entries.map((entry) => (
            <div key={entry.anchor} data-file-thread={entry.anchor} className="rounded-lg border border-border bg-card">
              <FileThreadCard entry={entry} config={config} callbacks={callbacks} options={options} renderRootDetails={renderRootDetails} retarget={retarget} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** The composer for a new comment on the whole file, as a card's content. */
export function FileDraftCard({
  config,
  composerActions,
  onCreate,
  onDiscard,
}: {
  config: CommentConfig;
  composerActions: readonly CommentCreateAction[] | undefined;
  onCreate: NonNullable<CommentCallbacks["onCreate"]>;
  onDiscard: () => void;
}) {
  return (
    <CommentDraftCard
      label="Comment on file"
      anchor={DOCUMENT_ANCHOR}
      config={config}
      onCreate={onCreate}
      onDiscard={onDiscard}
      {...(composerActions ? { createActions: composerActions } : {})}
    />
  );
}

/**
 * One file-level thread as a card's content: what it is on (and why it is not
 * placed in the text), then the thread. The caller supplies the card frame, so
 * the same thread reads alike in this list and in a comment rail.
 */
export function FileThreadCard({
  entry: { anchor, label, drift, note, thread },
  config,
  callbacks,
  options,
  renderRootDetails,
  retarget,
  defaultExpanded = true,
}: {
  entry: FileThreadEntry;
  config: CommentConfig;
  callbacks: CommentCallbacks;
  options: FileReviewThreadOptions;
  renderRootDetails: ((comment: Comment) => ReactNode) | undefined;
  /** Offers Re-anchor on a thread in drift. */
  retarget?: Retarget | undefined;
  defaultExpanded?: boolean;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-2 pt-2 text-[11px] text-muted-foreground">
        {drift && <DriftBadge state={drift} />}
        <span className="font-medium">{label}</span>
        {note && <span className="min-w-0 flex-1"> — {note}</span>}
        {drift && retarget && <ReanchorButton item={{ ids: getRoots(thread).map((root) => root.id), anchor, label, drift: { state: drift } }} retarget={retarget} />}
      </div>
      <CommentThread
        {...options}
        comments={thread}
        config={config}
        anchor={anchor}
        compact
        defaultExpanded={defaultExpanded}
        hideComposer={thread.length > 0}
        composerPlaceholder="Add a comment…"
        {...callbacks}
        {...(renderRootDetails ? { renderRootDetails } : {})}
      />
    </>
  );
}
