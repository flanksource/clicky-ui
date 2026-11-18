// @vitest-environment node
import { expect, it } from "vitest";
import { setSvgAttributes } from "./svg-edit-source";
import { mergeSvgUtility, svgPropertyClasses } from "../src/visual-edit/svg-style-values";

it("prepares both modules before applying a data-backed text and class edit", () => {
  const files = new Map([
    ["page.tsx", 'import { label } from "./labels"; export default () => <svg><text className="fill-primary">{label}</text></svg>'],
    ["labels.ts", 'export const label = "Gateway";'],
  ]);
  const result = setSvgAttributes({ files, callSiteFile: "page.tsx", ordinal: 0, values: { children: "API", className: "fill-foreground" }, textFrom: "Gateway" });
  expect(result.outcome.status).toBe("edited");
  expect(Object.fromEntries(result.patches)).toEqual({
    "labels.ts": 'export const label = "API";',
    "page.tsx": 'import { label } from "./labels"; export default () => <svg><text className="fill-foreground">{label}</text></svg>',
  });
});

it("leaves all patches unapplied when the text is ambiguous", () => {
  const files = new Map([["page.tsx", 'const labels = ["Gateway", "Gateway"]; export default () => <svg><text>{labels[0]}</text></svg>']]);
  const result = setSvgAttributes({ files, callSiteFile: "page.tsx", ordinal: 0, values: { children: "API", fill: "red" }, textFrom: "Gateway" });
  expect(result.outcome.status).toBe("ambiguous");
  expect(result.patches.size).toBe(0);
});

it("replaces only conflicting utilities and preserves variants and other classes", () => {
  expect(mergeSvgUtility("fill-primary dark:fill-white text-sm stroke-2 custom", "fill-foreground")).toBe("dark:fill-white text-sm stroke-2 custom fill-foreground");
});

it("distinguishes color, width, size and weight utilities including variants", () => {
  const classes = "fill-primary dark:fill-white stroke-primary stroke-2 text-sm text-foreground font-bold font-sans custom";
  expect(Object.fromEntries(["fill", "stroke", "strokeWidth", "fontSize", "color", "fontWeight", "fontFamily"].map(property => [property, svgPropertyClasses({ classes, property })]))).toEqual({
    fill: ["fill-primary", "dark:fill-white"], stroke: ["stroke-primary"], strokeWidth: ["stroke-2"], fontSize: ["text-sm"], color: ["text-foreground"], fontWeight: ["font-bold"], fontFamily: ["font-sans"],
  });
});
