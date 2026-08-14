import type { CSSProperties, ReactNode } from "react";
import type { ComboboxOption } from "./combobox-types";

export const COMBOBOX_MENU_MAX_WIDTH_PX = 400;
export const COMBOBOX_MENU_MAX_HEIGHT_PX = 256;

export type ComboboxMenuPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxWidth: number;
  maxHeight: number;
};

export function comboboxLabelPadding(
  label: ReactNode,
  measuredWidth: number,
): CSSProperties {
  if (measuredWidth > 0) {
    return { paddingLeft: `calc(${measuredWidth}px + 0.75rem)` };
  }
  if (typeof label !== "string") return { paddingLeft: "1.75rem" };
  return { paddingLeft: `${Math.min(label.length * 0.48 + 0.75, 7)}rem` };
}

export function withSelectedComboboxOptions(
  options: ComboboxOption[],
  selectedValues: string[],
): ComboboxOption[] {
  const present = new Set(options.map((option) => option.value));
  const pinned = selectedValues
    .filter((value) => !present.has(value))
    .map((value) => ({ value, label: value }));
  return pinned.length === 0 ? options : [...pinned, ...options];
}

export function multipleComboboxLabel(
  options: ComboboxOption[],
  selectedValues: string[],
): string {
  const labels = selectedValues.map((value) => {
    const option = options.find((entry) => entry.value === value);
    return option?.selectedLabel ?? option?.label ?? value;
  });
  if (labels.length <= 2) return labels.join(", ");
  return `${labels.length} selected`;
}

// Splits pasted text into one entry per value. Newlines always separate — a
// list copied out of a file or a column of cells arrives that way — plus
// whichever characters the consumer declared. Empty entries are the caller's to
// drop, so "a,,b" and a trailing comma stay visible here.
export function splitOnComboboxSeparators(
  text: string,
  separators: string[],
): string[] {
  const marks = new Set([...separators, "\n", "\r"]);
  const parts: string[] = [];
  let current = "";
  for (const char of text) {
    if (marks.has(char)) {
      parts.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  parts.push(current);
  return parts;
}

export function createComboboxCustomEntry(options: {
  allowCustomValue: boolean;
  query: string;
  multiple: boolean;
  tristate: boolean;
  onNew: ((value: string) => ComboboxOption | null) | undefined;
  choices: ComboboxOption[];
  selectedValues: string[];
}): ComboboxOption | null {
  const {
    allowCustomValue,
    query,
    multiple,
    tristate,
    onNew,
    choices,
    selectedValues,
  } = options;
  if (
    !allowCustomValue ||
    !query ||
    selectedValues.includes(query) ||
    (!tristate && !multiple && !onNew) ||
    choices.some((option) => option.value === query)
  ) {
    return null;
  }
  if (onNew) return onNew(query);
  return { value: query, label: `Add "${query}"` };
}
