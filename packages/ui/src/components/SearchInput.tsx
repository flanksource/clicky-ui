import type { ReactNode } from "react";
import { Icon } from "../data/Icon";
import { UiSearch } from "../icons";
import { cn } from "../lib/utils";
import { InputField, type InputFieldInputProps } from "./InputField";

export type SearchInputProps = Omit<
  InputFieldInputProps,
  "onChange" | "prefix" | "type" | "value"
> & {
  /** Controlled query value. */
  value: string;
  /** Called with the next query string. */
  onChange: (value: string) => void;
  /** Placeholder text. */
  placeholder?: string;
  /** Leading adornment. Defaults to the search icon. */
  prefix?: ReactNode | undefined;
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
  prefix,
  className,
  ...rest
}: SearchInputProps) {
  return (
    <InputField
      type="search"
      value={value}
      onChange={(next) => onChange(next)}
      placeholder={placeholder}
      shortcut={shortcut}
      onShortcut={onShortcut}
      prefix={
        prefix ?? (
          <Icon icon={UiSearch} className="shrink-0 text-muted-foreground" />
        )
      }
      className={cn("bg-secondary px-density-3", className)}
      {...rest}
    />
  );
}
