import { afterEach, expect, it } from "vitest";
import { diffSvgAttributes, domAttributeName, readSvgAttributes } from "./svg-attributes";

afterEach(() => {
  document.body.innerHTML = "";
});

function svgElement(markup: string): Element {
  document.body.innerHTML = `<svg>${markup}</svg>`;
  return document.querySelector("svg")!.firstElementChild!;
}

it.each([
  ["strokeWidth", "stroke-width"],
  ["fontSize", "font-size"],
  ["fontWeight", "font-weight"],
  ["textAnchor", "text-anchor"],
  ["strokeDasharray", "stroke-dasharray"],
  ["fill", "fill"],
  ["x1", "x1"],
])("maps the JSX prop %s to the DOM attribute %s", (prop, attribute) => {
  expect(domAttributeName(prop)).toBe(attribute);
});

it("reads the schema's attributes from the element, parsing numbers and keeping non-numeric text", () => {
  const rect = svgElement(`<rect x="10" width="50%" fill="#eeeeee" stroke-width="2.5" data-other="1"/>`);
  expect(readSvgAttributes(rect)).toEqual({ x: 10, width: "50%", fill: "#eeeeee", strokeWidth: 2.5 });
});

it("diffs only valid changed values and explains the ones that cannot be saved yet", () => {
  const baseline = { x: 10, width: 80, fill: "#eeeeee" };
  expect(
    diffSvgAttributes("rect", baseline, { x: 10, width: "33.", fill: "#ff0000", stroke: "#333333", opacity: 2, y: "" }),
  ).toEqual({
    changes: { fill: "#ff0000", stroke: "#333333" },
    invalid: {
      width: '"width" of <rect> must be a finite number, got "33."',
      opacity: '"opacity" of <rect> must be at most 1, got 2',
    },
  });
});

it("refuses to treat a cleared attribute as a removal", () => {
  expect(diffSvgAttributes("rect", { fill: "#eeeeee" }, { fill: "" })).toEqual({
    changes: {},
    invalid: { fill: '"fill" cannot be removed; restore a value or use Revert' },
  });
});
