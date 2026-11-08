import { expect, it } from "vitest";
import { setAttributes } from "../../plugins/visual-edit-source";
import { diffSvgAttributes, readSvgAttributes } from "./svg-attributes";

it("reads SVG text and class expressions without flattening nested spans", () => {
  const root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  root.innerHTML = '<text class="fill-primary">Gateway</text><text><tspan>Nested</tspan></text>';
  expect(readSvgAttributes(root.children[0]!)).toEqual({ children: "Gateway", className: "fill-primary" });
  expect(readSvgAttributes(root.children[1]!)).toEqual({});
});

it("allows empty text while preserving a class and an attribute removal", () => {
  expect(diffSvgAttributes("text", { children: "Gateway", fill: "red" }, { children: "", fill: null, className: "fill-primary" })).toEqual({
    changes: { children: "", fill: null, className: "fill-primary" }, invalid: {},
  });
});

it("writes text and classes together at the selected call site, safely escaping JSX", () => {
  const result = setAttributes('<svg><text fill="red">Same</text><text>Same</text></svg>', 0, { children: "<Gateway & API>", className: "fill-primary", fill: null });
  expect(result).toMatchObject({ status: "edited", source: '<svg><text className="fill-primary">{"<Gateway & API>"}</text><text>Same</text></svg>' });
});

it("refuses an entire edit when the text has nested elements", () => {
  expect(setAttributes('<svg><text fill="red"><tspan>Child</tspan></text></svg>', 0, { fill: "blue", children: "New" })).toMatchObject({ status: "refused", attribute: "children" });
});
