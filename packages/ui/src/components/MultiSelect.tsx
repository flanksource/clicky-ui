import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiChevronDown, UiChevronUp } from "@flanksource/icons/ui";

export type MultiSelectOption = {
  /** Stable option value written into the selected value array. */
  value: string;
  /** Visible option label in the menu and trigger summary. */
  label: ReactNode;
  /** Prevents selecting this option while still showing it in the menu. */
  disabled?: boolean;
  /** Optional browser tooltip for truncated or explanatory labels. */
  title?: string;
};

export type MultiSelectProps = {
  /** Available options, rendered in the order provided. */
  options: MultiSelectOption[];
  /** Controlled selected option values. */
  value: string[];
  /** Called with the complete next value array after each toggle. */
  onChange: (next: string[]) => void;
  /** Trigger text when nothing is selected. Also labels the menu. */
  placeholder?: string;
  /** Disables opening and changing selections. */
  disabled?: boolean;
  /** Classes applied to the root wrapper. */
  className?: string;
  /** Classes applied to the trigger button. */
  triggerClassName?: string;
  /** Classes applied to the popover menu. */
  menuClassName?: string;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options",
  disabled,
  className,
  triggerClassName,
  menuClassName,
}: MultiSelectProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = useMemo(() => {
    const selectedOptions = options.filter((option) =>
      value.includes(option.value),
    );
    const labels = selectedOptions
      .map((option) => option.label)
      .filter((label): label is string => typeof label === "string");

    if (selectedOptions.length === 0) return placeholder;
    if (labels.length === 0) return `${selectedOptions.length} selected`;
    if (labels.length <= 2) return labels.join(", ");
    return `${labels.length} selected`;
  }, [options, placeholder, value]);

  function toggleOption(nextValue: string) {
    if (value.includes(nextValue)) {
      onChange(value.filter((current) => current !== nextValue));
      return;
    }
    onChange([...value, nextValue]);
  }

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <Button
        ref={triggerRef}
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        aria-label={`${placeholder} filter`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "w-fit max-w-[15rem] min-w-0 shrink-0 justify-between gap-3 text-left font-normal",
          triggerClassName,
          value.length === 0 && "text-muted-foreground",
        )}
      >
        <span className="truncate">{selected}</span>
        <Icon
          icon={open ? UiChevronUp : UiChevronDown}
          className="text-muted-foreground"
        />
      </Button>
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute left-0 top-[calc(100%+0.375rem)] z-50 min-w-[14rem] max-w-[20rem] rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5",
            menuClassName,
          )}
        >
          <div className="mb-1 flex items-center justify-between gap-2 px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <span>{placeholder}</span>
            <button
              type="button"
              className="text-[10px] text-primary disabled:text-muted-foreground"
              onClick={() => onChange([])}
              disabled={value.length === 0}
            >
              Clear all
            </button>
          </div>
          <div className="max-h-64 overflow-auto">
            {options.map((option) => {
              const checked = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent",
                    option.disabled && "cursor-not-allowed opacity-50",
                  )}
                >
                  <input
                    type="checkbox"
                    role="menuitemcheckbox"
                    className="size-4 rounded border border-input"
                    checked={checked}
                    disabled={option.disabled}
                    onChange={() => toggleOption(option.value)}
                  />
                  <span className="min-w-0 truncate">{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
