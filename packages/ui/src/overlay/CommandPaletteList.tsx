import { Fragment, type RefObject } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import type { CommandGroup, CommandItem } from "./CommandPalette.model";

export type CommandPaletteListProps = {
  groups: CommandGroup[];
  /** Flattened rows, in render order — index space for `activeIndex`. */
  items: CommandItem[];
  activeIndex: number;
  listId: string;
  optionId: (item: CommandItem) => string;
  onActivate: (item: CommandItem) => void;
  onHover: (index: number) => void;
  listRef: RefObject<HTMLDivElement>;
  loading?: boolean | undefined;
  emptyState?: React.ReactNode;
  listMaxHeight: string | number;
};

/**
 * The palette's grouped listbox. Headings are `role="presentation"` so the
 * option index space stays contiguous — the same trick Combobox uses to scroll
 * by `[role="option"]` index.
 */
export function CommandPaletteList({
  groups,
  items,
  activeIndex,
  listId,
  optionId,
  onActivate,
  onHover,
  listRef,
  loading,
  emptyState,
  listMaxHeight,
}: CommandPaletteListProps) {
  // A flat cursor walked alongside the nested render so each row knows its index
  // in the flattened list without a lookup.
  let flatIndex = -1;

  return (
    <div
      ref={listRef}
      id={listId}
      role="listbox"
      aria-label="Commands"
      className="overflow-y-auto overscroll-contain py-density-1"
      style={{ maxHeight: listMaxHeight }}
    >
      {loading ? (
        <div className="px-density-3 py-density-3 text-sm text-muted-foreground">Searching…</div>
      ) : items.length === 0 ? (
        <div className="px-density-3 py-density-4 text-center text-sm text-muted-foreground">
          {emptyState ?? "No results"}
        </div>
      ) : (
        groups.map((group) => {
          const headingId = `${listId}-group-${group.id}`;
          return (
            <Fragment key={group.id}>
              <div role="group" aria-labelledby={group.heading ? headingId : undefined}>
                {group.heading && (
                  <div
                    id={headingId}
                    role="presentation"
                    className="px-density-3 pb-1 pt-density-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
                  >
                    {group.heading}
                  </div>
                )}
                {group.items.map((item) => {
                  flatIndex += 1;
                  const index = flatIndex;
                  const active = index === activeIndex;
                  return (
                    <div
                      key={item.id}
                      id={optionId(item)}
                      role="option"
                      aria-selected={active}
                      aria-disabled={item.disabled || undefined}
                      // onMouseMove, not onMouseEnter: keyboard navigation
                      // scrolls rows under a stationary cursor, and mouseenter
                      // would yank the highlight back to wherever it sits.
                      onMouseMove={() => {
                        if (!item.disabled) onHover(index);
                      }}
                      onClick={() => {
                        if (!item.disabled) onActivate(item);
                      }}
                      className={cn(
                        "mx-density-1 flex cursor-pointer items-center gap-density-2 rounded-md px-density-2 py-1.5 text-sm",
                        active && "bg-accent text-accent-foreground",
                        item.disabled && "cursor-not-allowed opacity-50",
                      )}
                    >
                      {item.icon !== undefined && (
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
                          <Icon
                            {...(typeof item.icon === "string"
                              ? { name: item.icon }
                              : { icon: item.icon })}
                          />
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        {item.label}
                        {item.description && (
                          <span className="ml-density-2 text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        )}
                      </span>
                      {item.trailing}
                      {item.shortcut && (
                        <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                          {item.shortcut}
                        </kbd>
                      )}
                    </div>
                  );
                })}
              </div>
            </Fragment>
          );
        })
      )}
    </div>
  );
}
