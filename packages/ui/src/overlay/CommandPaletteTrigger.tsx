import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiSearch } from "../icons";
import { formatHotkey } from "../hooks/use-hotkey";

export type CommandPaletteTriggerProps = {
  /** Opens the palette. */
  onClick: () => void;
  /** Whether the palette it controls is open; drives `aria-expanded`. */
  open?: boolean;
  /** Placeholder-style label. Defaults to "Search…". */
  label?: string;
  /** Hotkey shown in the trailing `<kbd>`, in `useHotkey` syntax. Defaults to "mod+k". */
  hotkey?: string | null;
  className?: string;
};

/**
 * Search-field-shaped button that opens a {@link CommandPalette}, sized for
 * `AppShell`'s `search` slot.
 *
 * Deliberately a button rather than a `SearchInput`: a real `<input
 * type="search">` that only opens a second search field announces itself to
 * screen readers as a searchbox that does not search, and typing into it does
 * nothing.
 */
export function CommandPaletteTrigger({
  onClick,
  open,
  label = "Search…",
  hotkey = "mod+k",
  className,
}: CommandPaletteTriggerProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      {...(open !== undefined ? { "aria-expanded": open } : {})}
      className={cn(
        "flex h-control-h w-full items-center gap-density-2 rounded-md border border-border bg-secondary px-density-3 text-sm text-muted-foreground",
        "transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <Icon icon={UiSearch} className="shrink-0" />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {hotkey && (
        <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">
          {formatHotkey(hotkey)}
        </kbd>
      )}
    </button>
  );
}
