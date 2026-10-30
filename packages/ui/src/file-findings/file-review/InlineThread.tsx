import { useEffect, type ReactNode } from "react";
import { Icon } from "../../data/Icon";
import { cn } from "../../lib/utils";
import { CommentThread } from "../../comments/CommentThread";
import type { Comment, CommentCallbacks, CommentConfig } from "../../comments/comment-types";
import { UiClose } from "../../icons";

import type { Box } from "./geometry";

const WIDTH = 340;
const GAP = 6;

/**
 * A thread shown in a box just under its highlighted text. Hovering previews
 * it; any click inside pins it so typing a reply survives the pointer leaving.
 */
export function InlineThread({
  anchor,
  label,
  boxes,
  containerWidth,
  thread,
  config,
  callbacks,
  pinned,
  onPin,
  onClose,
  onPointerEnter,
  onPointerLeave,
  seamless = false,
  renderRootDetails,
}: {
  anchor: string;
  label: string;
  boxes: readonly Box[];
  containerWidth: number;
  thread: Comment[];
  config: CommentConfig;
  /** Absent for read-only threads such as tool findings. */
  callbacks: CommentCallbacks;
  pinned: boolean;
  onPin: () => void;
  onClose: () => void;
  onPointerEnter: () => void;
  onPointerLeave: () => void;
  /** No title bar or frame: just the thread floating under its text; Escape or clicking away closes it. */
  seamless?: boolean;
  /** Extra content under a root comment, such as a finding's actions. */
  renderRootDetails?: ((comment: Comment) => ReactNode) | undefined;
}) {
  // Posting closes the composer and drops focus out of the box, so Escape listens on the window.
  useEffect(() => {
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);

  const first = boxes[0];
  const last = boxes.at(-1);
  if (!first || !last) return null;
  const width = Math.min(WIDTH, containerWidth);
  const left = Math.max(0, Math.min(first.left, containerWidth - width));
  const canAdd = Boolean(callbacks.onCreate);

  return (
    <div
      data-inline-thread={anchor}
      role="dialog"
      aria-label={`Comments on ${label}`}
      onMouseEnter={onPointerEnter}
      onMouseLeave={onPointerLeave}
      onMouseDown={onPin}
      className={cn(
        "absolute z-30 bg-card",
        seamless ? "rounded-md font-sans shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-1 ring-border/60" : "rounded-lg border shadow-lg",
        !seamless && (pinned ? "border-primary/50" : "border-border"),
      )}
      style={{ top: last.top + last.height + (seamless ? 2 : GAP), left, width }}
    >
      {!seamless && (
      <div className="flex items-center gap-1 border-b border-border px-2 py-1 text-[11px] text-muted-foreground">
        <span className="min-w-0 flex-1 truncate">{label}</span>
        {!pinned && <span>click to pin</span>}
        <button
          type="button"
          aria-label="Close comments"
          onClick={onClose}
          className="rounded p-0.5 hover:bg-muted hover:text-foreground [@media(pointer:coarse)]:min-h-11 [@media(pointer:coarse)]:min-w-11"
        >
          <Icon icon={UiClose} className="text-xs" />
        </button>
      </div>
      )}
      <div className="max-h-[360px] overflow-y-auto">
        <CommentThread
          comments={thread}
          config={config}
          anchor={anchor}
          compact
          defaultExpanded
          // Hovering only views and replies; a new root comment waits for a pin.
          hideComposer={!canAdd || (thread.length > 0 && !pinned)}
          autoFocusComposer={thread.length === 0}
          composerPlaceholder={thread.length > 0 ? "Add another comment…" : "Add a comment…"}
          {...callbacks}
          {...(renderRootDetails ? { renderRootDetails } : {})}
        />
      </div>
    </div>
  );
}
