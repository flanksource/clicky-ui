import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";
import preset from "../tailwind-preset";
import type { ComboboxOption } from "./combobox-types";

export type TailwindPickerOption = ComboboxOption & { color?: string };
export type TailwindNumberProperty = "fontSize" | "strokeWidth" | "opacity";

function themeColors(colors: unknown, prefix = ""): Array<{ name: string; color: string }> {
  if (!colors || typeof colors !== "object") return [];
  return Object.entries(colors).flatMap(([key, value]) => {
    const name = key === "DEFAULT" ? prefix : [prefix, key].filter(Boolean).join("-");
    return typeof value === "string" ? [{ name, color: value }] : themeColors(value, name);
  });
}

export function tailwindColorOptions(utility: string): TailwindPickerOption[] {
  const option = (value: string, group: string, color?: string): TailwindPickerOption => ({ value: `${utility}-${value}`, label: `${utility}-${value}`, group, ...(color === undefined ? {} : { color }) });
  return [
    ...themeColors(preset.theme?.extend?.colors).map(({ name, color }) => option(name, "Theme", color)),
    ...["current", "inherit", ...(utility === "fill" || utility === "stroke" ? ["none"] : [])].map(value => option(value, "Special")),
    ...Object.entries(colors).filter(([name]) => name !== "inherit" && name !== "current").flatMap(([name, palette]) => typeof palette === "string"
      ? [option(name, "Basic", palette)]
      : Object.entries(palette).map(([shade, color]) => option(`${name}-${shade}`, name, color))),
  ];
}

export function tailwindNumberOptions(property: TailwindNumberProperty): TailwindPickerOption[] {
  const prefix = { fontSize: "text", strokeWidth: "stroke", opacity: "opacity" }[property];
  const scale = property === "strokeWidth" ? { ...defaultTheme.strokeWidth, 3: "3", 4: "4" } : defaultTheme[property];
  if (typeof scale !== "object") throw new Error(`Invalid Tailwind numeric scale ${property}`);
  return Object.entries(scale).filter(([name]) => name !== "__BARE_VALUE__").map(([name, definition]) => {
    const description = Array.isArray(definition) ? definition[0] : definition;
    if (typeof description !== "string") throw new Error(`Invalid Tailwind ${property} value ${name}`);
    return { value: `${prefix}-${name}`, label: `${prefix}-${name}`, group: property, description, descriptionLayout: "inline" };
  });
}
