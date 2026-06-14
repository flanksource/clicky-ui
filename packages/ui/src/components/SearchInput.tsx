import { useEffect, useRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { Icon } from "../data/Icon";
import { UiSearch } from "../icons";

type NativeInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "size"
>;

export type SearchInputProps = NativeInputProps & {
  /** Controlled query value. */
  value: string;
  /** Called with the next query string. */
  onChange: (value: string) => void;
  /** Placeholder text. */
  placeholder?: string;
  /**
   * Keyboard-shortcut hint rendered as a trailing `<kbd>` (Gavel's `⌘K`).
   * Pass `null` to hide it. Defaults to `⌘K`.
   */
  shortcut?: string | null;
  /**
   * When set, the matching shortcut (cmd/ctrl + the last character of
   * `shortcut`, default `k`) focuses the input from anywhere on the page.
   */
  onShortcut?: () => void;
  /** Classes applied to the wrapper. */
  className?: string;
};

/**
 * Search field with a leading magnifier and an optional trailing keyboard-hint
 * (the Gavel app-bar `⌘K` search). Controlled. Built on clicky tokens. When
 * `onShortcut` is provided, a global cmd/ctrl+K listener is wired so the field
 * can be focused from anywhere.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  shortcut = "⌘K",
  onShortcut,
  className,
  ...rest
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Match cmd/ctrl + the shortcut's trailing key (e.g. "k" from "⌘K").
  const shortcutKey = shortcut ? shortcut.slice(-1).toLowerCase() : "k";

  useEffect(() => {
    if (!onShortcut) return;
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey) {
        e.preventDefault();
        onShortcut();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onShortcut, shortcutKey]);

  return (
    <div
      className={cn(
        "flex items-center gap-density-2 rounded-md border border-border bg-secondary px-density-3",
        "h-control-h focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <Icon icon={UiSearch} className="shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none",
          "placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:appearance-none",
        )}
        {...rest}
      />
      {shortcut && (
        <kbd className="shrink-0 rounded border border-border px-1 font-mono text-[10px] text-muted-foreground">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}
