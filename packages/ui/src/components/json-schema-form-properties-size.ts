import type { FormSize } from "./json-schema-form-size";

export const propertyControlSize: Record<FormSize, FormSize> = {
  xs: "xs",
  sm: "xs",
  md: "sm",
  lg: "sm",
  xl: "md",
};

// XL retains the former Medium cell: a 36px control with 8px padding per side.
export const propertyRowClass: Record<FormSize, string> = {
  xs: "px-1.5 py-0",
  sm: "px-2 py-0.5",
  md: "px-2 py-1",
  lg: "px-2.5 py-1.5",
  xl: "px-3 py-2",
};
