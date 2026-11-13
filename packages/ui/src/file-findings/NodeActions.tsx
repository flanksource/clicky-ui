import { Icon } from "../data/Icon";
import { UiDotsVertical, UiEllipsis } from "../icons";
import { DropdownMenu, type DropdownMenuItem } from "../overlay/DropdownMenu";
import { cn } from "../lib/utils";

/**
 * A kebab menu of a file's or folder's host actions. Clicks and keys inside it
 * (including its portaled menu, whose React events bubble here) never reach a
 * surrounding tree row, so opening it neither selects nor toggles the row.
 * `variant="row"` is a compact horizontal trigger that never makes a tree row
 * taller; the default is the header's vertical button.
 */
export function NodeActions({
  items,
  label,
  className,
  variant = "header",
}: {
  items: DropdownMenuItem[];
  label: string;
  className?: string;
  variant?: "row" | "header";
}) {
  if (items.length === 0) return null;
  return (
    <span
      className={cn("inline-flex shrink-0", className)}
      data-node-actions=""
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {variant === "row" ? (
        <DropdownMenu
          align="right"
          menuLabel={label}
          items={items}
          trigger={
            <button
              type="button"
              title={label}
              aria-label={label}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon icon={UiEllipsis} className="text-sm" />
            </button>
          }
        />
      ) : (
        <DropdownMenu
          align="right"
          icon={UiDotsVertical}
          hideChevron
          variant="ghost"
          size="sm"
          title={label}
          menuLabel={label}
          items={items}
        />
      )}
    </span>
  );
}
