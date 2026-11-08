import { expect, it } from "vitest";
import { tailwindColorOptions, tailwindNumberOptions } from "./tailwind-picker-options";

it.each(["fill", "stroke", "color"] as const)("offers theme and standard palette classes for %s", property => {
  const prefix = property === "color" ? "text" : property;
  const values = tailwindColorOptions(prefix).map(option => option.value);
  expect(new Set(values).size).toBe(values.length);
  expect(tailwindColorOptions(prefix)).toEqual(expect.arrayContaining([
    expect.objectContaining({ value: `${prefix}-primary`, group: "Theme", color: "var(--primary)" }),
    expect.objectContaining({ value: `${prefix}-red-500`, group: "red", color: expect.any(String) }),
    expect.objectContaining({ value: `${prefix}-transparent` }),
    expect.objectContaining({ value: `${prefix}-current` }),
  ]));
});

it("offers the complete default font size scale with dimensions", () => {
  const options = tailwindNumberOptions("fontSize");
  expect(options.map(option => option.value)).toEqual(["text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl", "text-7xl", "text-8xl", "text-9xl"]);
  expect(options.find(option => option.value === "text-sm")).toMatchObject({ description: "0.875rem" });
});

