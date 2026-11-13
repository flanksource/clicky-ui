import { Icon } from "../../data/Icon";
import { cn } from "../../lib/utils";
import { CommentDraftCard } from "../../comments/CommentDraftCard";
import type { CommentCallbacks, CommentConfig, CommentCreateAction } from "../../comments/comment-types";
import { UiComment } from "../../icons";

const PILL = { width: 104, height: 28 };
const CARD_WIDTH = 320;
/** Room a card needs above the selection to open upward, out of the way of the text. */
const CARD_ROOM = 190;
const GAP = 6;

export type CommentDraftPosition = {
  /** Selection top and bottom, relative to the document origin. */
  top: number;
  bottom: number;
  /** Horizontal centre of the pill: the selection's middle, or the pointer for a right-click. */
  left: number;
};

/**
 * The floating Comment pill over a selection. Clicking it morphs the pill in
 * place into a composer card, rather than adding a card to the sidebar; the
 * thread only joins the sidebar or inline view once it is posted.
 */
export function CommentDraft({
  anchor,
  label,
  position,
  containerWidth,
  expanded,
  config,
  onCreate,
  onExpand,
  onClose,
  createActions,
}: {
  anchor: string;
  label: string;
  position: CommentDraftPosition;
  containerWidth: number;
  expanded: boolean;
  config: CommentConfig;
  onCreate: NonNullable<CommentCallbacks["onCreate"]>;
  onExpand: () => void;
  onClose: () => void;
  /** Post variants beside the default Post; the picked id reaches `onCreate`. */
  createActions?: readonly CommentCreateAction[] | undefined;
}) {

  const pillTop = position.top - PILL.height - 8;
  const up = position.top >= CARD_ROOM;
  const width = Math.min(CARD_WIDTH, containerWidth);
  const cardLeft = Math.max(width / 2, Math.min(position.left, containerWidth - width / 2));
  const style = expanded
    ? { top: up ? pillTop + PILL.height : position.bottom + GAP, left: cardLeft, width, transform: `translate(-50%, ${up ? "-100%" : "0"})` }
    : { top: pillTop, left: position.left, width: PILL.width, transform: "translate(-50%, 0)" };

  return (
    <div
      data-comment-draft={anchor}
      role={expanded ? "dialog" : undefined}
      aria-label={expanded ? `New comment on ${label}` : undefined}
      onMouseDown={(event) => !expanded && event.preventDefault()}
      className={cn(
        "absolute z-30 overflow-hidden border bg-card shadow-md transition-[top,left,width,transform,border-radius,box-shadow] duration-200 ease-out",
        expanded ? "rounded-lg border-primary/50 shadow-lg" : "rounded-full border-border",
      )}
      style={style}
    >
      {expanded ? (
        <CommentDraftCard
          label={label}
          config={config}
          anchor={anchor}
          onCreate={onCreate}
          onDiscard={onClose}
          {...(createActions ? { createActions } : {})}
        />
      ) : (
        <button
          type="button"
          onClick={onExpand}
          className="inline-flex w-full items-center justify-center gap-1 px-2.5 text-xs font-medium hover:bg-muted"
          style={{ height: PILL.height }}
        >
          <Icon icon={UiComment} className="text-sm" />
          Comment
        </button>
      )}
    </div>
  );
}
