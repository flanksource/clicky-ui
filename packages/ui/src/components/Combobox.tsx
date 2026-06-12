import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { Icon, LabelIcon, type LabelIconSpec } from "../data/Icon";
import { UiChevronDown, UiClose, UiCheck } from "../icons";
import { inputSizeClass, type FormSize } from "./json-schema-form-size";

// Upper bound the open dropdown grows to in order to show full option labels
// before they truncate. The menu's minimum is always the input's width.
const MENU_MAX_WIDTH_PX = 400;

// Matches the menu's `max-h-64` (16rem) cap; also the threshold below which the
// menu flips above the input instead of opening downward off-screen.
const MENU_MAX_HEIGHT_PX = 256;

export type ComboboxOption = {
  value: string;
  label: string;
  disabled?: boolean;
  /** Leading glyph for the option: a runtime icon name or a rendered node. */
  icon?: LabelIconSpec;
  /**
   * Optional section label. A non-interactive header renders above the first
   * option of each group (options are grouped by contiguous `group` value in
   * the order provided). Options without a `group` render no header.
   */
  group?: string;
};

type ComboboxBaseProps = {
  /** Available options, rendered in the order provided. */
  options: ComboboxOption[];
  /** Ghost text when no value is set. */
  placeholder?: string;
  /** Optional label rendered inline inside the control, before the input. */
  label?: ReactNode;
  /**
   * Accessible name for the input. Use when `label` is a non-string node (e.g.
   * an icon) so the control still has a text name for screen readers; defaults
   * to `label` when it is a string.
   */
  ariaLabel?: string;
  /** Disables the input. */
  disabled?: boolean;
  /** When true, the value cannot be cleared (the clear button is hidden). */
  required?: boolean;
  /**
   * Marks the control as invalid: renders a destructive border and sets
   * aria-invalid. Purely presentational — the consumer decides what invalid
   * means (e.g. a value absent from the options in a strict picker).
   */
  invalid?: boolean;
  /**
   * When false, the value is restricted to the provided options — typed text
   * that does not match an option is discarded instead of committed. Defaults
   * to true (freeform entry allowed).
   */
  allowCustomValue?: boolean;
  /** HTML id for the input element. */
  id?: string;
  /**
   * Overrides the input's height/padding/text size with an explicit size token
   * (xs–xl). When unset, the input uses the global density tokens.
   */
  size?: FormSize;
  /** Classes applied to the root wrapper. */
  className?: string;
  /** Shows a loading indicator when options are being fetched. */
  loading?: boolean;
  /**
   * Optional async search invoked (debounced ~250ms) as the user types. The
   * consumer fetches and feeds matching options back via the `options` prop
   * (setting `loading` while in flight). When set, the component renders the
   * provided `options` as-is instead of filtering them client-side — the
   * server has already filtered. When absent, typing filters `options`
   * client-side as before.
   */
  onSearch?: (query: string) => void;
  /** Called when a key is pressed in the input. */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Trailing in-field adornment, rendered left of the clear/chevron controls. */
  suffix?: ReactNode;
  /** Leading in-field adornment, rendered at the left edge of the input. */
  prefix?: ReactNode;
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
    ariaLabel: ariaLabelProp,
    disabled,
    required,
    invalid,
    allowCustomValue = true,
    id,
    size,
    className,
    loading,
    onSearch,
    onKeyDown: onKeyDownProp,
    suffix,
    prefix,
  } = props;
  const multiple = props.multiple === true;
  const selectedValues = useMemo<string[]>(
    () => (multiple ? props.value : props.value ? [props.value] : []),
    [multiple, props.value],
  );

  const rootRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  // Fixed-position coordinates for the portaled listbox, measured from the
  // input row. `width` is the input width (the menu's minimum); `maxWidth` caps
  // content growth at 400px, further bounded by the viewport. Null until first
  // measured so we never render at (0,0).
  // Either `top` (opening downward) or `bottom` (flipped upward when space below
  // is tight, e.g. a control docked near the viewport bottom) is set, never both.
  const [menuPos, setMenuPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    maxWidth: number;
    maxHeight: number;
  } | null>(null);
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
    // With onSearch the server already filtered. The matches replace the list,
    // but any already-selected value not in the matches is pinned so the user's
    // selection stays visible and toggleable. Selected values carry no label
    // object here, so synthesize {value, label: value} (the typeahead's value is
    // its own human label).
    if (onSearch) return withSelectedOptions(options, selectedValues);
    const q = query.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q),
    );
  }, [onSearch, options, query, selectedValues]);

  // Debounced server-side search: fires onSearch ~250ms after the query settles
  // while the menu is open. The empty-query call lets the consumer reset its
  // result set. Only active when onSearch is provided.
  useEffect(() => {
    if (!onSearch || !open) return;
    const handle = setTimeout(() => onSearch(query.trim()), 250);
    return () => clearTimeout(handle);
  }, [onSearch, open, query]);

  useEffect(() => {
    setHighlighted(-1);
  }, [filtered.length]);

  useEffect(() => {
    if (!open) return;
    // Dismiss when the pointer goes down, OR focus moves, anywhere outside the
    // control and its portaled listbox — so clicking elsewhere in a dialog (the
    // backdrop never intercepts a document-level listener) or tabbing to another
    // field both close the menu. The listbox is portaled out of rootRef, so a
    // click inside it would otherwise read as "outside" and close before select.
    const onAway = (e: Event) => {
      const target = e.target as Node;
      if (!rootRef.current?.contains(target) && !listRef.current?.contains(target)) {
        commitAndClose();
      }
    };
    document.addEventListener("mousedown", onAway);
    document.addEventListener("focusin", onAway);
    return () => {
      document.removeEventListener("mousedown", onAway);
      document.removeEventListener("focusin", onAway);
    };
  });

  // Position the portaled listbox with fixed coordinates measured from the
  // input row, so it escapes any overflow-hidden / scroll ancestor (e.g. a
  // Modal body) that would otherwise clip it. Mirrors HoverCard's approach.
  useLayoutEffect(() => {
    if (!open) {
      setMenuPos(null);
      return;
    }
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      // The menu may grow rightward up to 400px, but not past the viewport edge
      // (leaving an 8px gutter). Never let the cap fall below the input width.
      const viewportCap = window.innerWidth - rect.left - 8;
      const maxWidth = Math.max(rect.width, Math.min(MENU_MAX_WIDTH_PX, viewportCap));
      // Flip upward when there isn't room below for the menu but there is above
      // (the input is docked near the viewport bottom). The available side bounds
      // the menu height so it never runs off-screen.
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const spaceAbove = rect.top - 8;
      const openUp = spaceBelow < MENU_MAX_HEIGHT_PX && spaceAbove > spaceBelow;
      const maxHeight = Math.min(MENU_MAX_HEIGHT_PX, openUp ? spaceAbove : spaceBelow);
      setMenuPos({
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
        left: rect.left,
        width: rect.width,
        maxWidth,
        maxHeight,
      });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

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
    // Query option rows by role rather than child index — interleaved group
    // header rows are direct children too, so children[index] would be offset.
    const item = list.querySelectorAll<HTMLElement>('[role="option"]')[index];
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
  const ariaLabel = ariaLabelProp ?? (typeof label === "string" ? label : undefined);
  const showClear = !required && !loading && !disabled && selectedValues.length > 0;

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <div ref={anchorRef} data-jsf-control className="relative flex items-center">
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
          aria-invalid={invalid || undefined}
          autoComplete="off"
          disabled={disabled}
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={openMenu}
          // Reopen on click too: focus only fires on the first focus, so a click
          // on an already-focused-but-closed input (e.g. after selecting, or
          // after Escape) would otherwise do nothing.
          onClick={() => {
            if (!open) openMenu();
          }}
          onKeyDown={onKeyDown}
          className={cn(
            "w-full rounded-md border border-input bg-background text-foreground",
            size ? inputSizeClass[size] : "h-control-h px-control-px text-sm",
            prefix && "pl-8",
            suffix ? (showClear ? "pr-[5.5rem]" : "pr-14") : showClear ? "pr-14" : "pr-8",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "disabled:cursor-not-allowed disabled:opacity-50",
            invalid && "border-destructive focus-visible:ring-destructive",
          )}
          style={label != null ? labelPadding(label) : undefined}
        />
        {prefix && (
          <div className="absolute inset-y-0 left-1.5 flex items-center">{prefix}</div>
        )}
        {suffix && (
          <div className={cn("absolute flex h-full items-center", showClear ? "right-[3.75rem]" : "right-7")}>
            {suffix}
          </div>
        )}
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
      {open && menuPos && typeof document !== "undefined" &&
        createPortal(
        <div
          id={listId}
          ref={listRef}
          role="listbox"
          aria-multiselectable={multiple || undefined}
          style={{
            position: "fixed",
            ...(menuPos.top != null ? { top: menuPos.top } : { bottom: menuPos.bottom }),
            left: menuPos.left,
            // Grow to fit the widest option, but never narrower than the input
            // nor wider than 400px (beyond which option labels truncate). The
            // cap is also bounded by the viewport so the menu can't overflow.
            minWidth: menuPos.width,
            maxWidth: menuPos.maxWidth,
            maxHeight: menuPos.maxHeight,
          }}
          className="z-[9999] w-max overflow-auto rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg shadow-black/5"
        >
          {loading && filtered.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">Loading…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">No results</div>
          )}
          {filtered.map((opt, i) => {
            const selected = isSelected(opt.value);
            // A header renders above the first option of each group. Derived
            // from the surviving (filtered) options, so an empty group emits no
            // header. The option keeps `i` (its index in `filtered`) for
            // id/highlight/select — headers are role="presentation", never
            // counted in the highlight/scroll index.
            const showHeader = opt.group != null && opt.group !== filtered[i - 1]?.group;
            return (
              <Fragment key={opt.value}>
                {showHeader && (
                  <div
                    role="presentation"
                    className="select-none px-2 pb-1 pt-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {opt.group}
                  </div>
                )}
                <div
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
                  <LabelIcon icon={opt.icon} className="text-sm text-muted-foreground" />
                  <span className="min-w-0 truncate">{opt.label}</span>
                </div>
              </Fragment>
            );
          })}
        </div>,
          document.body,
        )}
    </div>
  );
}

// Reserve room on the left of the input for the inline label so typed text
// does not overlap it. Node labels (an icon from comboboxLabelProps) are
// compact, so reserve a fixed icon-sized inset; text labels scale with their
// character count at roughly 0.6rem per character plus padding.
function labelPadding(label: ReactNode) {
  if (typeof label !== "string") return { paddingLeft: "1.75rem" };
  return { paddingLeft: `${Math.min(label.length * 0.62 + 0.75, 9)}rem` };
}

// withSelectedOptions returns the option list plus any selected value that isn't
// already present, synthesized as {value, label: value}. Used by the server
// (onSearch) typeahead so an already-selected value missing from the current
// matches still renders as a checked row. Selected-but-absent values come first
// so they don't get scrolled past by a long match list.
function withSelectedOptions(
  options: ComboboxOption[],
  selectedValues: string[],
): ComboboxOption[] {
  const present = new Set(options.map((o) => o.value));
  const pinned = selectedValues
    .filter((v) => !present.has(v))
    .map((v) => ({ value: v, label: v }));
  return pinned.length === 0 ? options : [...pinned, ...options];
}
