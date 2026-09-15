import type { ReactNode } from "react";
import { UiCheck, UiChevronDown } from "../../icons";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  type DropdownMenuItem,
} from "../../overlay/DropdownMenu";
import { Icon } from "../Icon";

export const SEGMENT_CAPTION_CLASS = "truncate text-xs font-semibold text-foreground";
export const SEGMENT_KEY_CLASS =
  "text-[11px] font-semibold uppercase leading-none tracking-wide text-muted-foreground";

// One trigger in the segmented runtime bar: a dropdown whose button carries the
// segment's current value. `min-w-0` on the root lets a segment shrink past its
// content — without it the flex item's automatic minimum size is its max-content
// width, so a row of segments overflows a narrow container instead of ellipsing
// its captions.
export function RuntimeSegment({
  items,
  menuLabel,
  title,
  header,
  disabled = false,
  className,
  children,
}: {
  items: DropdownMenuItem[];
  menuLabel: string;
  title: string;
  header?: ReactNode;
  disabled?: boolean;
  className?: string | undefined;
  children: ReactNode;
}) {
  return (
    <DropdownMenu
      align="left"
      menuLabel={menuLabel}
      items={items}
      {...(header ? { header } : {})}
      menuClassName="min-w-56 max-w-80"
      className={cn(
        "min-w-0 border-l border-border first:border-l-0 [&>span]:min-w-0 [&>span]:w-full",
        className,
      )}
      trigger={
        <button
          type="button"
          disabled={disabled}
          title={title}
          className="inline-flex h-full w-full min-w-0 items-center gap-1.5 px-density-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [[aria-expanded=true]_&]:bg-muted"
        >
          {children}
          <Icon
            icon={UiChevronDown}
            className="size-3 shrink-0 text-muted-foreground/70"
          />
        </button>
      }
    />
  );
}

export function SegmentItemLabel({
  text,
  hint,
  selected,
  stacked = false,
}: {
  text: string;
  hint?: string | undefined;
  selected: boolean;
  stacked?: boolean | undefined;
}) {
  return (
    <>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate", selected && "font-semibold")}>
          {text}
        </span>
        {hint && stacked && (
          <span className="block whitespace-normal text-[11px] leading-4 text-muted-foreground">
            {hint}
          </span>
        )}
      </span>
      {hint && !stacked && (
        <span className="shrink-0 text-[11px] text-muted-foreground">
          {hint}
        </span>
      )}
      <Icon
        icon={UiCheck}
        className={cn(
          "size-3.5 shrink-0 text-primary",
          !selected && "invisible",
        )}
      />
    </>
  );
}
