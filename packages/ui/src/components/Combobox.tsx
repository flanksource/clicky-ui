import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiChevronDown, UiClose, UiCheck } from "../icons";

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

type ComboboxBaseProps = {
  /** Available options, rendered in the order provided. */
  options: ComboboxOption[];
  /** Ghost text when no value is set. */
  placeholder?: string;
  /** Optional label rendered inline inside the control, before the input. */
  label?: ReactNode;
  /** Disables the input. */
  disabled?: boolean;
  /** When true, the value cannot be cleared (the clear button is hidden). */
  required?: boolean;
  /**
   * When false, the value is restricted to the provided options — typed text
   * that does not match an option is discarded instead of committed. Defaults
   * to true (freeform entry allowed).
   */
  allowCustomValue?: boolean;
  /** HTML id for the input element. */
  id?: string;
  /** Classes applied to the root wrapper. */
  className?: string;
  /** Shows a loading indicator when options are being fetched. */
  loading?: boolean;
  /** Called when a key is pressed in the input. */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
};

export type ComboboxSingleProps = ComboboxBaseProps & {
  multiple?: false;
  /** Controlled selected value. */
  value: string;
  /** Called when the selected value changes (from list or freeform input). */
  onChange: (value: string) => void;
};

export type ComboboxMultiProps = ComboboxBaseProps & {
  multiple: true;
  /** Controlled selected values. */
  value: string[];
  /** Called with the complete next value array after each toggle. */
  onChange: (value: string[]) => void;
};

export type ComboboxProps = ComboboxSingleProps | ComboboxMultiProps;

export function Combobox(props: ComboboxProps) {
  const {
    options,
    placeholder,
    label,
    disabled,
    required,
    allowCustomValue = true,
    id,
    className,
    loading,
    onKeyDown: onKeyDownProp,
  } = props;
  const multiple = props.multiple === true;
  const selectedValues = useMemo<string[]>(
    () => (multiple ? props.value : props.value ? [props.value] : []),
    [multiple, props.value],
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // `query` is the type-ahead filter text, kept separate from the committed
  // value. It is empty unless the user is actively typing, so opening the
  // dropdown shows every option rather than only the selected one.
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(-1);

  const isSelected = (optValue: string) => selectedValues.includes(optValue);

  // Closed-state input text. Single: the selected option's label (or its raw
  // value as a fallback). Multi: a summary mirroring MultiSelect.
  const closedLabel = useMemo(() => {
    if (multiple) {
      const labels = options
        .filter((o) => selectedValues.includes(o.value))
        .map((o) => o.label);
      if (labels.length === 0) return "";
      if (labels.length <= 2) return labels.join(", ");
      return `${labels.length} selected`;
    }
    const single = selectedValues[0] ?? "";
    return options.find((o) => o.value === single)?.label ?? single;
  }, [multiple, options, selectedValues]);

  // While open the input mirrors the query; while closed it shows the
  // committed selection's label/summary.
  const displayValue = open ? query : closedLabel;

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [options, query]);

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

  function emit(next: string[]) {
    if (multiple) {
      props.onChange(next);
    } else {
      props.onChange(next[0] ?? "");
    }
  }

  function openMenu() {
    setQuery("");
    setHighlighted(-1);
    setOpen(true);
  }

  function commitAndClose() {
    // Freeform commit (single, allowCustomValue only): a non-empty query that
    // doesn't match an option becomes the value. An empty query keeps the
    // existing selection. Multi and strict modes never commit freeform text.
    const trimmed = query.trim();
    if (!multiple && allowCustomValue && trimmed && trimmed !== selectedValues[0]) {
      emit([trimmed]);
    }
    setQuery("");
    setOpen(false);
    setHighlighted(-1);
  }

  function selectOption(opt: ComboboxOption) {
    if (multiple) {
      const next = isSelected(opt.value)
        ? selectedValues.filter((v) => v !== opt.value)
        : [...selectedValues, opt.value];
      emit(next);
      setQuery("");
      setHighlighted(-1);
      inputRef.current?.focus();
      return;
    }
    emit([opt.value]);
    setQuery("");
    setOpen(false);
    setHighlighted(-1);
    inputRef.current?.focus();
  }

  function clear() {
    if (selectedValues.length > 0) emit([]);
    setQuery("");
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
        openMenu();
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
        setQuery("");
        setOpen(false);
        setHighlighted(-1);
      }
    } else {
      onKeyDownProp?.(e);
    }
  }

  const listId = id ? `${id}-listbox` : undefined;
  const ariaLabel = typeof label === "string" ? label : undefined;
  const showClear = !required && !loading && !disabled && selectedValues.length > 0;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div className="relative flex items-center">
        {label != null && (
          <span className="pointer-events-none absolute left-2 z-10 whitespace-nowrap font-medium uppercase tracking-wide text-muted-foreground text-[10px]">
            {label}
          </span>
        )}
        <input
          ref={inputRef}
          id={id}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
          aria-label={ariaLabel}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={openMenu}
          onKeyDown={onKeyDown}
          className={cn(
            "h-control-h w-full rounded-md border border-input bg-background px-control-px text-sm text-foreground",
            showClear ? "pr-14" : "pr-8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
          style={label != null ? labelPadding(label) : undefined}
        />
        {showClear && (
          <button
            type="button"
            tabIndex={-1}
            aria-label="Clear"
            onClick={clear}
            className="absolute right-7 flex h-full items-center px-1 text-muted-foreground hover:text-foreground"
          >
            <Icon icon={UiClose} className="text-xs" />
          </button>
        )}
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
              if (open) {
                commitAndClose();
              } else {
                openMenu();
                inputRef.current?.focus();
              }
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
          aria-multiselectable={multiple || undefined}
          className="absolute left-0 top-[calc(100%+0.25rem)] z-50 w-full min-w-[10rem] max-h-64 overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
        >
          {loading && filtered.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">Loading…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">No results</div>
          )}
          {filtered.map((opt, i) => {
            const selected = isSelected(opt.value);
            return (
              <div
                key={opt.value}
                id={listId ? `${listId}-${i}` : undefined}
                role="option"
                aria-selected={selected}
                aria-disabled={opt.disabled}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (!opt.disabled) selectOption(opt);
                }}
                onMouseEnter={() => setHighlighted(i)}
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm",
                  i === highlighted && "bg-accent",
                  selected && "font-medium",
                  opt.disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <Icon
                  icon={UiCheck}
                  className={cn("text-xs shrink-0", selected ? "opacity-100" : "opacity-0")}
                />
                <span className="min-w-0 truncate">{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Reserve room on the left of the input for the inline label so typed text
// does not overlap it. Roughly 0.6rem per character plus padding.
function labelPadding(label: ReactNode) {
  const length = typeof label === "string" ? label.length : 6;
  return { paddingLeft: `${Math.min(length * 0.62 + 0.75, 9)}rem` };
}
