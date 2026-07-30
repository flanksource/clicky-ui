import { useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiSearch } from "../icons";
import { useHotkey } from "../hooks/use-hotkey";
import { useEscapeLayer, useModalStack } from "./modalStack";
import { zIndex } from "./zIndex";
import { CommandPaletteList } from "./CommandPaletteList";
import {
  defaultCommandFilter,
  filterCommandGroups,
  firstEnabledIndex,
  flattenCommands,
  lastEnabledIndex,
  nextEnabledIndex,
  type CommandFilter,
  type CommandGroup,
  type CommandItem,
} from "./CommandPalette.model";

export type {
  CommandFilter,
  CommandGroup,
  CommandItem,
  CommandSelectContext,
} from "./CommandPalette.model";

const SIZE_CLASS = {
  md: "max-w-[40rem]",
  lg: "max-w-[48rem]",
} as const;

export type CommandPaletteProps = {
  /**
   * Controls visibility. Omit to run uncontrolled — the palette then owns its
   * open state and the built-in hotkey works with no wiring beyond mounting it.
   */
  open?: boolean;
  /** Called with the next open state on hotkey, Escape, backdrop click, and selection. */
  onOpenChange?: (open: boolean) => void;
  /** Command groups, rendered top to bottom in array order. */
  groups: CommandGroup[];
  /** Controlled query. Omit to let the palette own the input. */
  query?: string;
  /** Called with the next query on every keystroke. Required for server-side search. */
  onQueryChange?: (query: string) => void;
  /**
   * Global shortcut that opens (and, while open, closes) the palette, in
   * `useHotkey` syntax — `"mod+k"` by default, where `mod` is ⌘ on macOS and
   * Ctrl elsewhere. Pass `null` when an ancestor owns the binding.
   */
  hotkey?: string | null;
  /** Ghost text in the search input. Defaults to "Type a command or search…". */
  placeholder?: string;
  /** Shows a loading row instead of the empty state while results are in flight. */
  loading?: boolean;
  /** Replaces the default "No results" body. */
  emptyState?: ReactNode;
  /** Non-interactive hint strip pinned below the list. */
  footer?: ReactNode;
  /**
   * How rows are matched. Defaults to a case-insensitive substring match over
   * label, description and keywords, ranked by hit position. Pass `false` when
   * the caller already filtered `groups` server-side.
   */
  filter?: CommandFilter | false;
  /** Fallback handler for items with no own `onSelect`. */
  onSelect?: (context: { item: CommandItem; query: string; close: () => void }) => void;
  /** Close after a successful activation. Defaults to true. */
  closeOnSelect?: boolean;
  /** Clear the query when the palette closes. Defaults to true. */
  resetQueryOnClose?: boolean;
  /** Panel width preset. Defaults to "md". */
  size?: "md" | "lg";
  /** Distance from the viewport top. Defaults to "12vh". Applied as an inline style. */
  topOffset?: string | number;
  /** Max height of the scrolling list. Defaults to "min(24rem, 50dvh)". Inline style. */
  listMaxHeight?: string | number;
  /** Accessible name for the dialog. Defaults to "Command palette". */
  ariaLabel?: string;
  /** Classes applied to the palette panel. */
  className?: string;
};

/**
 * A ⌘K command palette: a top-anchored overlay with a search field over a
 * grouped, keyboard-navigable command list.
 *
 * It renders its own portal rather than building on `Modal`, which centres its
 * panel, focuses the dialog element instead of an input, forces body padding,
 * and pins an inline max-height — none of which a palette can override. The
 * stacking primitives are shared though (`useModalStack`, `useEscapeLayer`, the
 * `zIndex` scale), so a palette opened over a modal sits above it and Escape
 * still dismisses exactly one layer.
 */
export function CommandPalette({
  open,
  onOpenChange,
  groups,
  query,
  onQueryChange,
  hotkey = "mod+k",
  placeholder = "Type a command or search…",
  loading,
  emptyState,
  footer,
  filter = defaultCommandFilter,
  onSelect,
  closeOnSelect = true,
  resetQueryOnClose = true,
  size = "md",
  topOffset = "12vh",
  listMaxHeight = "min(24rem, 50dvh)",
  ariaLabel = "Command palette",
  className,
}: CommandPaletteProps) {
  const baseId = useId();
  const [selfOpen, setSelfOpen] = useState(false);
  const [selfQuery, setSelfQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const isOpen = open ?? selfOpen;
  const currentQuery = query ?? selfQuery;

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setSelfOpen(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  const setQuery = useCallback(
    (next: string) => {
      if (query === undefined) setSelfQuery(next);
      onQueryChange?.(next);
    },
    [query, onQueryChange],
  );

  const visibleGroups = useMemo(
    () => filterCommandGroups(groups, currentQuery, filter),
    [groups, currentQuery, filter],
  );
  const items = useMemo(() => flattenCommands(visibleGroups), [visibleGroups]);

  // Priority keeps the palette ahead of any page-level ⌘K search field, whose
  // binding would otherwise win purely by mounting later.
  useHotkey(hotkey, () => setOpen(!isOpen), { priority: 10 });
  useEscapeLayer(isOpen, () => setOpen(false));

  const { depth } = useModalStack(isOpen);

  // Enter-runs-the-top-result is the point of a palette, so the active row
  // resets to the first selectable one whenever the result set changes.
  useEffect(() => {
    setActiveIndex(firstEnabledIndex(items));
  }, [items]);

  useEffect(() => {
    if (!isOpen) {
      if (resetQueryOnClose && query === undefined) setSelfQuery("");
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
      return;
    }
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
  }, [isOpen, resetQueryOnClose, query]);

  // Keep the active row in view without stealing focus from the input.
  useEffect(() => {
    if (activeIndex < 0) return;
    const option = listRef.current?.querySelectorAll('[role="option"]')[activeIndex];
    // jsdom does not implement scrollIntoView; scrolling is a progressive
    // enhancement, so skip it rather than crash a consumer's test run.
    if (option instanceof HTMLElement && typeof option.scrollIntoView === "function") {
      option.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const optionId = useCallback((item: CommandItem) => `${baseId}-option-${item.id}`, [baseId]);

  const activate = useCallback(
    (item: CommandItem) => {
      if (item.disabled) return;
      const close = () => setOpen(false);
      const context = { item, query: currentQuery.trim(), close };
      if (item.onSelect) item.onSelect(context);
      else onSelect?.(context);
      if (closeOnSelect) close();
    },
    [currentQuery, onSelect, closeOnSelect, setOpen],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActiveIndex((current) => nextEnabledIndex(items, current, 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActiveIndex((current) => nextEnabledIndex(items, current, -1));
        break;
      case "Home":
        event.preventDefault();
        setActiveIndex(firstEnabledIndex(items));
        break;
      case "End":
        event.preventDefault();
        setActiveIndex(lastEnabledIndex(items));
        break;
      case "Enter": {
        event.preventDefault();
        const index = activeIndex >= 0 ? activeIndex : firstEnabledIndex(items);
        const item = index >= 0 ? items[index] : undefined;
        if (item) activate(item);
        break;
      }
      case "Tab":
        // Nothing else in the panel is focusable, and letting Tab escape an
        // aria-modal dialog would strand focus behind the backdrop.
        if (!footer) event.preventDefault();
        break;
      default:
        break;
    }
  };

  if (!isOpen || typeof document === "undefined") return null;

  const activeItem = activeIndex >= 0 ? items[activeIndex] : undefined;
  const listId = `${baseId}-list`;

  const overlay = (
    <div
      className={cn(
        "fixed inset-0 flex justify-center p-density-4",
        depth === 0 ? "bg-black/40" : "bg-black/20",
      )}
      style={{ zIndex: zIndex.modal + depth * zIndex.modalStep }}
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        className={cn(
          "flex h-fit w-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl",
          SIZE_CLASS[size],
          className,
        )}
        style={{ marginTop: topOffset }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-density-2 border-b border-border px-density-3">
          <Icon icon={UiSearch} className="shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={activeItem ? optionId(activeItem) : undefined}
            aria-label={ariaLabel}
            value={currentQuery}
            placeholder={placeholder}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <CommandPaletteList
          groups={visibleGroups}
          items={items}
          activeIndex={activeIndex}
          listId={listId}
          optionId={optionId}
          onActivate={activate}
          onHover={setActiveIndex}
          listRef={listRef}
          loading={loading}
          emptyState={emptyState}
          listMaxHeight={listMaxHeight}
        />

        {footer && (
          <div className="border-t border-border px-density-3 py-density-2 text-xs text-muted-foreground">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
