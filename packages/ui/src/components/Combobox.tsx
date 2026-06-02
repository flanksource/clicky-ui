import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiChevronDown } from "../icons";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type ComboboxProps = {
  /** Available options, rendered in the order provided. */
  options: ComboboxOption[];
  /** Controlled selected value. */
  value: string;
  /** Called when the selected value changes (from list or freeform input). */
  onChange: (value: string) => void;
  /** Ghost text when no value is set. */
  placeholder?: string;
  /** Disables the input. */
  disabled?: boolean;
  /** HTML id for the input element. */
  id?: string;
  /** Classes applied to the root wrapper. */
  className?: string;
  /** Shows a loading indicator when options are being fetched. */
  loading?: boolean;
  /** Called when a key is pressed in the input. */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  id,
  className,
  loading,
  onKeyDown: onKeyDownProp,
}: ComboboxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlighted, setHighlighted] = useState(-1);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filtered = useMemo(() => {
    const q = inputValue.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, inputValue]);

  useEffect(() => {
    setHighlighted(-1);
  }, [filtered.length]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        commitAndClose();
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  });

  function commitAndClose() {
    const trimmed = inputValue.trim();
    if (trimmed !== value) onChange(trimmed);
    setOpen(false);
    setHighlighted(-1);
  }

  function selectOption(opt: ComboboxOption) {
    onChange(opt.value);
    setInputValue(opt.value);
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.focus();
  }

  function scrollToHighlighted(index: number) {
    const list = listRef.current;
    if (!list) return;
    const item = list.children[index] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const next = highlighted < filtered.length - 1 ? highlighted + 1 : 0;
      setHighlighted(next);
      scrollToHighlighted(next);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return;
      const next = highlighted > 0 ? highlighted - 1 : filtered.length - 1;
      setHighlighted(next);
      scrollToHighlighted(next);
    } else if (e.key === "Enter") {
      if (open && highlighted >= 0 && filtered[highlighted] && !filtered[highlighted].disabled) {
        e.preventDefault();
        selectOption(filtered[highlighted]);
        return;
      }
      commitAndClose();
      onKeyDownProp?.(e);
    } else if (e.key === "Escape") {
      if (open) {
        e.preventDefault();
        setInputValue(value);
        setOpen(false);
        setHighlighted(-1);
      }
    } else {
      onKeyDownProp?.(e);
    }
  }

  const listId = id ? `${id}-listbox` : undefined;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className={cn(
            "h-control-h w-full rounded-md border border-input bg-background px-control-px pr-8 text-sm text-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        />
        {loading ? (
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
            <svg className="h-3.5 w-3.5 animate-spin text-muted-foreground" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="2" opacity="0.25" />
              <path d="M14.5 8a6.5 6.5 0 0 0-6.5-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          <button
            type="button"
            tabIndex={-1}
            disabled={disabled}
            aria-label="Toggle options"
            onClick={() => {
              setOpen((v) => !v);
              inputRef.current?.focus();
            }}
            className="pointer-events-auto absolute right-0 flex h-full items-center px-2 text-muted-foreground"
          >
            <Icon icon={UiChevronDown} className="text-xs" />
          </button>
        )}
      </div>
      {open && (
        <div
          id={listId}
          ref={listRef}
          role="listbox"
          className="absolute left-0 top-[calc(100%+0.25rem)] z-50 w-full min-w-[10rem] max-h-64 overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
        >
          {loading && filtered.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">Loading…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">No results</div>
          )}
          {filtered.map((opt, i) => (
            <div
              key={opt.value}
              id={listId ? `${listId}-${i}` : undefined}
              role="option"
              aria-selected={opt.value === value}
              aria-disabled={opt.disabled}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!opt.disabled) selectOption(opt);
              }}
              onMouseEnter={() => setHighlighted(i)}
              className={cn(
                "cursor-pointer rounded-sm px-2 py-1.5 text-sm",
                i === highlighted && "bg-accent",
                opt.value === value && "font-medium",
                opt.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
