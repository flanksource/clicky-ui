import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import type { SizeToken } from "../lib/size";
import { Icon } from "../data/Icon";
import { UiChevronDown, UiChevronUp, UiCopy, UiTrash } from "../icons";
import { controlHeightClass } from "./json-schema-form-size";

// The per-row action cluster shared by every editable-list surface: AccordionList
// and the JsonSchemaForm array displays. Each action is offered ONLY when its
// handler is supplied, which is how a list opts into reorder without opting into
// delete — there is no separate flag to keep in sync with the callback.
export interface ItemActionsProps {
  /** Names the item in every action's accessible label ("Move Routes up"). */
  label: string;
  /** This row's position, used for the reorder targets and the end-disabling. */
  index: number;
  /** Total rows, so the last row's "down" disables itself. */
  count: number;
  /**
   * Offers both reorder buttons, called with the destination index. The button
   * at either end of the list renders disabled rather than missing, so the
   * cluster keeps a constant width down a long list.
   */
  onMove?: (to: number) => void;
  /** Offers the duplicate button. */
  onDuplicate?: () => void;
  /** Offers the remove button. */
  onRemove?: () => void;
  /** Consumer actions, rendered before the built-in ones. */
  leading?: ReactNode;
  /**
   * Reveal on row hover / focus-within. Defaults to true, which requires
   * `group` on the row container — a long list is then not a wall of
   * permanently dim icons, while keyboard users still see the actions the
   * moment they arrive. Pass false for a row that must always show them.
   */
  reveal?: boolean;
  size?: SizeToken;
  className?: string;
}

export function ItemActions({
  label,
  index,
  count,
  onMove,
  onDuplicate,
  onRemove,
  leading,
  reveal = true,
  size = "md",
  className,
}: ItemActionsProps) {
  const action = cn(
    "inline-flex aspect-square items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-30",
    controlHeightClass[size],
  );
  return (
    <div
      className={cn(
        "ml-auto flex shrink-0 items-center gap-0.5",
        reveal &&
          "opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100",
        className,
      )}
    >
      {leading}
      {onMove && (
        <>
          <button
            type="button"
            aria-label={`Move ${label} up`}
            disabled={index === 0}
            className={action}
            onClick={() => onMove(index - 1)}
          >
            <Icon icon={UiChevronUp} className="text-sm" />
          </button>
          <button
            type="button"
            aria-label={`Move ${label} down`}
            disabled={index >= count - 1}
            className={action}
            onClick={() => onMove(index + 1)}
          >
            <Icon icon={UiChevronDown} className="text-sm" />
          </button>
        </>
      )}
      {onDuplicate && (
        <button
          type="button"
          aria-label={`Duplicate ${label}`}
          className={action}
          onClick={onDuplicate}
        >
          <Icon icon={UiCopy} className="text-sm" />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          className={cn(action, "hover:bg-destructive/10 hover:text-destructive")}
          onClick={onRemove}
          data-item-index={index}
        >
          <Icon icon={UiTrash} className="text-sm" />
        </button>
      )}
    </div>
  );
}
