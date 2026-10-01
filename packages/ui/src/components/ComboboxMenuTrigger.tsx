import {
  useEffect,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { UiChevronDown } from "../icons";
import { Icon } from "../data/Icon";
import { cn } from "../lib/utils";

export function ComboboxMenuTrigger({
  anchorRef,
  triggerRef,
  content,
  className,
  disabled,
  open,
  listId,
  ariaLabel,
  title,
  onToggle,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  content: ReactNode;
  className: string | undefined;
  disabled: boolean | undefined;
  open: boolean;
  listId: string;
  ariaLabel: string | undefined;
  title: string | undefined;
  onToggle: () => void;
}) {
  return (
    <div ref={anchorRef} className="h-full min-w-0">
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        title={title}
        disabled={disabled}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            if (!open) onToggle();
          }
        }}
        className={cn(
          "inline-flex h-control-h w-full min-w-0 items-center gap-1.5 rounded-md border border-input bg-background px-control-px text-sm hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
          className,
        )}
      >
        {content}
        <Icon
          icon={UiChevronDown}
          className="ml-auto size-3 shrink-0 text-muted-foreground"
        />
      </button>
    </div>
  );
}

export function ComboboxMenuSearch({
  inputRef,
  value,
  ariaLabel,
  listId,
  highlighted,
  onChange,
  onKeyDown,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  ariaLabel: string | undefined;
  listId: string;
  highlighted: number;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
  useEffect(() => {
    inputRef.current?.focus();
  }, [inputRef]);
  return (
    <div className="sticky top-0 z-10 border-b border-border bg-popover p-1">
      <input
        ref={inputRef}
        type="text"
        aria-label={`Search ${ariaLabel ?? "options"}`}
        aria-controls={listId}
        aria-activedescendant={
          highlighted >= 0 ? `${listId}-${highlighted}` : undefined
        }
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search…"
        className="h-control-h w-full rounded-sm bg-transparent px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      />
    </div>
  );
}
