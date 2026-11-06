// @vitest-environment node
import { describe, expect, it } from "vitest";

import { SVG_EDITABLE_TAGS, svgSchemaFor, validateSvgAttributes } from "./svg-schemas";

const GEOMETRY = {
  rect: ["x", "y", "width", "height", "rx"],
  circle: ["cx", "cy", "r"],
  ellipse: ["cx", "cy", "rx", "ry"],
  line: ["x1", "y1", "x2", "y2"],
  polyline: ["points"],
  polygon: ["points"],
  path: ["d"],
  text: ["x", "y", "fontSize", "fontWeight", "textAnchor"],
  g: [],
} as const;
const PAINT = ["fill", "stroke", "strokeWidth", "opacity", "strokeDasharray"];

describe("svgSchemaFor", () => {
  it.each(SVG_EDITABLE_TAGS)("<%s> lists its geometry then the shared paint attributes, ordered by x-order", (tag) => {
    const schema = svgSchemaFor(tag);

    expect(schema["x-order"]).toEqual([...GEOMETRY[tag], ...PAINT]);
    expect(Object.keys(schema.properties)).toEqual(schema["x-order"]);
    expect(schema).toMatchObject({ type: "object", additionalProperties: false });
  });

  it("describes paint fields for the form: colors, a non-negative width and a 0..1 slider", () => {
    const { properties } = svgSchemaFor("rect");

    expect(properties["fill"]).toEqual({ type: "string", format: "color" });
    expect(properties["stroke"]).toEqual({ type: "string", format: "color" });
    expect(properties["strokeWidth"]).toEqual({ type: "number", minimum: 0 });
    expect(properties["opacity"]).toEqual({ type: "number", minimum: 0, maximum: 1, multipleOf: 0.05, "x-number-display": "slider" });
    expect(properties["strokeDasharray"]).toEqual({ type: "string" });
  });

  it("describes text enums", () => {
    const { properties } = svgSchemaFor("text");

    expect(properties["fontWeight"]?.enum).toEqual(["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"]);
    expect(properties["textAnchor"]?.enum).toEqual(["start", "middle", "end"]);
  });

  it("throws for a tag that is not editable", () => {
    expect(() => svgSchemaFor("div")).toThrow(/no SVG schema for <div>/);
  });
});

describe("validateSvgAttributes", () => {
  it.each([
    ["rect", { x: 1, width: 40.5, fill: "#fff", opacity: 0.5 }],
    ["circle", { r: 0, stroke: "rgb(1 2 3)" }],
    ["text", { fontWeight: "bold", textAnchor: "middle", fontSize: 12 }],
    ["path", { d: "M0 0 L1 1" }],
    ["g", { opacity: 1 }],
  ])("accepts valid values for <%s>", (tag, values) => {
    expect(validateSvgAttributes(tag, values)).toBe(values);
  });

  it.each([
    ["rect", { cx: 1 }, /"cx" is not an editable attribute of <rect>/],
    ["g", { x: 1 }, /"x" is not an editable attribute of <g>/],
    ["rect", { width: "40" }, /"width" of <rect> must be a finite number/],
    ["rect", { width: Number.POSITIVE_INFINITY }, /finite number/],
    ["rect", { width: Number.NaN }, /finite number/],
    ["rect", { fill: 3 }, /"fill" of <rect> must be a non-empty string/],
    ["rect", { fill: "" }, /non-empty string/],
    ["rect", { strokeWidth: -1 }, /at least 0/],
    ["rect", { opacity: 1.5 }, /at most 1/],
    ["text", { fontWeight: "heavy" }, /one of normal, bold/],
    ["text", { textAnchor: "left" }, /one of start, middle, end/],
    ["rect", {}, /at least one attribute/],
    ["rect", null, /must be an object/],
    ["rect", ["x"], /must be an object/],
    ["div", { x: 1 }, /no SVG schema for <div>/],
    ["BoxNode", { x: 1 }, /no SVG schema for <BoxNode>/],
  ])("rejects <%s> values %j", (tag, values, message) => {
    expect(() => validateSvgAttributes(tag, values)).toThrow(message);
  });
});
