import type { KeyboardEvent, ReactNode } from "react";
import type { LabelIconSpec } from "../data/Icon";
import type { FormSize } from "./json-schema-form-size";

export type ComboboxOption = {
  value: string;
  /** Full label used for searching and in the open option menu. */
  label: string;
  /** Secondary text rendered below the label and included in local filtering. */
  description?: string;
  /**
   * Node pinned to the right edge of the option row — a rendered preview of
   * what the choice produces, a count, a badge. Keeps the row single-line, so
   * prefer it over `description` when the secondary content is a value rather
   * than a sentence. Not searchable (use `label`, `description` or `title` for
   * anything that must match a query), and ignored in tristate mode, whose row
   * is a full-width pill.
   */
  trailing?: ReactNode;
  /** Optional compact label used in the closed selection or a selected tag. */
  selectedLabel?: string;
  disabled?: boolean;
  /** Leading glyph for the option: a runtime icon name or a rendered node. */
  icon?: LabelIconSpec;
  /**
   * Optional section label. A non-interactive header renders above the first
   * option of each group (options are grouped by contiguous `group` value in
   * the order provided). Options without a `group` render no header.
   */
  group?: string;
  /** Browser tooltip on the option row (for truncated or explanatory labels). */
  title?: string;
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
   * Sets aria-required on the input. Separate from `required`, which governs
   * whether the value can be cleared; a consumer announcing a mandatory field
   * to assistive technology need not also remove the clear button.
   */
  ariaRequired?: boolean;
  /**
   * Id of the element describing the control (typically its validation
   * message), wired through as aria-describedby.
   */
  describedBy?: string;
  /**
   * When false, the value is restricted to the provided options — typed text
   * that does not match an option is discarded instead of committed. Defaults
   * to true (freeform entry allowed).
   */
  allowCustomValue?: boolean;
  /**
   * Converts unmatched text into a creatable option. Returning null rejects
   * the text. The same option decorates a controlled unmatched single value.
   */
  onNew?: (value: string) => ComboboxOption | null;
  /**
   * Converts a creatable option into the committed value. Returning null
   * rejects the candidate. Defaults to the option's value.
   */
  onCreate?: (option: ComboboxOption) => string | null;
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
   * consumer fetches and feeds matching options back via the `options` prop.
   */
  onSearch?: (query: string) => void;
  /** Called when a key is pressed in the input. */
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  /** Trailing in-field adornment, rendered left of the clear/chevron controls. */
  suffix?: ReactNode;
  /** Leading in-field adornment, rendered at the left edge of the input. */
  prefix?: ReactNode;
  /** Non-interactive content pinned below the option rows. */
  footer?: ReactNode;
};

export type ComboboxSingleProps = ComboboxBaseProps & {
  multiple?: false;
  tristate?: false;
  value: string;
  onChange: (value: string) => void;
};

export type ComboboxMultiProps = ComboboxBaseProps & {
  multiple: true;
  tristate?: false;
  /** Renders selected values as wrapping removable pills instead of a summary. */
  variant?: "default" | "tags";
  /**
   * Characters that commit the typed text as a value, alongside Enter — and
   * that pasted text is split on (newlines always split too). For a list of
   * short values that is usually typed or pasted comma-separated. Tags variant
   * only; needs `allowCustomValue`.
   */
  separators?: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

export type ComboboxTriStateMode = "include" | "exclude";

export type ComboboxTriStateProps = ComboboxBaseProps & {
  multiple: true;
  tristate: true;
  /**
   * Renders each value as a pill carrying its mode (included / excluded) instead
   * of the `+n -n` summary. The pill cycles include ↔ exclude on click and its
   * close button returns the value to neutral.
   */
  variant?: "default" | "tags";
  value: Record<string, ComboboxTriStateMode>;
  onChange: (value: Record<string, ComboboxTriStateMode>) => void;
};

export type ComboboxProps =
  | ComboboxSingleProps
  | ComboboxMultiProps
  | ComboboxTriStateProps;
