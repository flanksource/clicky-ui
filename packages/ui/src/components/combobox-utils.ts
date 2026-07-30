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
