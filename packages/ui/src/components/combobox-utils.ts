import type { CSSProperties, ReactNode } from "react";
import type { ComboboxOption } from "./combobox-types";

export const COMBOBOX_MENU_MAX_WIDTH_PX = 400;
export const COMBOBOX_MENU_MAX_HEIGHT_PX = 256;
export const COMBOBOX_MOBILE_QUERY = "(max-width: 639px)";

const COMBOBOX_MENU_EDGE_INSET_PX = 8;
const COMBOBOX_MENU_ANCHOR_GAP_PX = 4;
const COMBOBOX_MOBILE_HORIZONTAL_INSET_PX = 16;

export type ComboboxMenuPosition = {
  strategy: "desktop" | "mobile";
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  maxWidth: number;
  maxHeight: number;
};

export function calculateComboboxMenuPosition({
  anchor,
  viewportWidth,
  viewportHeight,
  mobile,
  naturalHeight,
}: {
  anchor: Pick<DOMRect, "top" | "bottom" | "left" | "width">;
  viewportWidth: number;
  viewportHeight: number;
  mobile: boolean;
  naturalHeight?: number;
}): ComboboxMenuPosition {
  if (mobile) {
    const spaceBelow = Math.max(
      0,
      viewportHeight - anchor.bottom - COMBOBOX_MENU_ANCHOR_GAP_PX - COMBOBOX_MENU_EDGE_INSET_PX,
    );
    const spaceAbove = Math.max(
      0,
      anchor.top - COMBOBOX_MENU_ANCHOR_GAP_PX - COMBOBOX_MENU_EDGE_INSET_PX,
    );
    const openUp = naturalHeight != null && naturalHeight > spaceBelow && spaceAbove > spaceBelow;
    const width = Math.max(0, viewportWidth - COMBOBOX_MOBILE_HORIZONTAL_INSET_PX * 2);
    return {
      strategy: "mobile",
      ...(openUp
        ? { bottom: viewportHeight - anchor.top + COMBOBOX_MENU_ANCHOR_GAP_PX }
        : { top: anchor.bottom + COMBOBOX_MENU_ANCHOR_GAP_PX }),
      left: COMBOBOX_MOBILE_HORIZONTAL_INSET_PX,
      width,
      maxWidth: width,
      maxHeight: openUp ? spaceAbove : spaceBelow,
    };
  }

  const spaceBelow = viewportHeight - anchor.bottom - COMBOBOX_MENU_EDGE_INSET_PX;
  const spaceAbove = anchor.top - COMBOBOX_MENU_EDGE_INSET_PX;
  const openUp = spaceBelow < COMBOBOX_MENU_MAX_HEIGHT_PX && spaceAbove > spaceBelow;
  return {
    strategy: "desktop",
    ...(openUp
      ? { bottom: viewportHeight - anchor.top + COMBOBOX_MENU_ANCHOR_GAP_PX }
      : { top: anchor.bottom + COMBOBOX_MENU_ANCHOR_GAP_PX }),
    left: anchor.left,
    width: anchor.width,
    maxWidth: Math.max(
      anchor.width,
      Math.min(
        COMBOBOX_MENU_MAX_WIDTH_PX,
        viewportWidth - anchor.left - COMBOBOX_MENU_EDGE_INSET_PX,
      ),
    ),
    maxHeight: Math.min(COMBOBOX_MENU_MAX_HEIGHT_PX, openUp ? spaceAbove : spaceBelow),
  };
}

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
