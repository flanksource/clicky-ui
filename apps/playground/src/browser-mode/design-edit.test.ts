import { expect, it } from "vitest";
import { designEdit } from "./design-edit";

it("keeps Facet variants on the style writer and literal SVG values on the attribute writer", () => {
  expect(designEdit({ baseline: { variant: "default", title: "Box" }, values: { variant: "primary", title: "Box" }, svg: false })).toEqual({ kind: "style", prop: "variant", value: "primary" });
  expect(designEdit({ baseline: { fill: "red", width: 80 }, values: { fill: "blue", width: 120 }, svg: true })).toEqual({ kind: "attributes", values: { fill: "blue", width: 120 } });
});

it("preserves the original authored text for the text writer and rejects an ambiguous multi-property Facet write", () => {
  expect(designEdit({ baseline: { title: "Before" }, values: { title: "After" }, svg: false })).toEqual({ kind: "text", prop: "title", from: "Before", to: "After" });
  expect(() => designEdit({ baseline: { title: "Before", variant: "default" }, values: { title: "After", variant: "primary" }, svg: false })).toThrow("one Facet property");
});

it("guards SVG text writes with the original text", () => {
  expect(designEdit({ baseline: { children: "Before" }, values: { children: "After" }, svg: true })).toEqual({ kind: "attributes", textFrom: "Before", values: { children: "After" } });
});
