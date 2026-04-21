import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "./button";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";

export type MultiSelectOption = {
  value: string;
  label: ReactNode;
  disabled?: boolean;
};

export type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
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
    const selectedOptions = options.filter((option) => value.includes(option.value));
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
          name={open ? "codicon:chevron-up" : "codicon:chevron-down"}
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
