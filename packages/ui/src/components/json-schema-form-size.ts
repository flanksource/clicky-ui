import type { SizeToken } from "../lib/size";

// FormSize scales a JsonSchemaForm's inputs and labels. It reuses the library's
// canonical token vocabulary (lib/size.ts). `md` reproduces the form's original
// fixed appearance.
export type FormSize = SizeToken; // "xs" | "sm" | "md" | "lg" | "xl"

export const DEFAULT_FORM_SIZE: FormSize = "md";

// Height + horizontal padding + text size for the input control box. `md` is the
// form's original hardcoded sizing (h-9 px-2 text-sm).
export const inputSizeClass: Record<FormSize, string> = {
  xs: "h-7 px-1.5 text-xs",
  sm: "h-8 px-2 text-xs",
  md: "h-9 px-2 text-sm",
  lg: "h-10 px-3 text-base",
  xl: "h-11 px-3.5 text-lg",
};

// Label text size (`md` = text-sm, the form's original default).
export const labelSizeClass: Record<FormSize, string> = {
  xs: "text-xs",
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
  xl: "text-lg",
};

// Fixed height for value containers that must align with the input box:
// read-only value spans, the boolean checkbox row, and the date read-only view.
export const controlHeightClass: Record<FormSize, string> = {
  xs: "h-7",
  sm: "h-8",
  md: "h-9",
  lg: "h-10",
  xl: "h-11",
};

// Minimum height for containers that grow (the inline label cell, the tag-array
// box) so they line up with the input box at the smallest content.
export const controlMinHeightClass: Record<FormSize, string> = {
  xs: "min-h-7",
  sm: "min-h-8",
  md: "min-h-9",
  lg: "min-h-10",
  xl: "min-h-11",
};

// Vertical gap between stacked field rows. Aggressively tight at the small end;
// the gap stops growing past `lg` so large forms don't sprawl.
export const stackedRowGapClass: Record<FormSize, string> = {
  xs: "gap-1",
  sm: "gap-1.5",
  md: "gap-2.5",
  lg: "gap-4",
  xl: "gap-4",
};

// Vertical gap between inline (2-column) field rows. Tighter than stacked since
// each row is a single line. Caps at `lg`.
export const inlineRowGapClass: Record<FormSize, string> = {
  xs: "gap-0.5",
  sm: "gap-1",
  md: "gap-1.5",
  lg: "gap-2",
  xl: "gap-2",
};

// Gap between a label/value and its helper/error text, and inside nested
// container boxes (object/array/map). Caps at `lg`.
export const fieldInnerGapClass: Record<FormSize, string> = {
  xs: "gap-1",
  sm: "gap-1",
  md: "gap-1.5",
  lg: "gap-2",
  xl: "gap-2",
};
