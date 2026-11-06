/**
 * JSON schemas for the intrinsic SVG elements Design mode can edit in place.
 *
 * Imported by the dev-server write path as well as the browser, so it must stay
 * free of React and DOM imports. The objects are shaped for clicky-ui's
 * `JsonSchemaForm` (keys are JSX prop names, ordered with `x-order`).
 */
export const SVG_EDITABLE_TAGS = ["rect", "circle", "ellipse", "line", "polyline", "polygon", "path", "text", "g"] as const;
export type SvgEditableTag = (typeof SVG_EDITABLE_TAGS)[number];

export type SvgFieldSchema = {
  type: "string" | "number";
  format?: "color";
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
  enum?: readonly string[];
  "x-number-display"?: "slider";
};

export type SvgTagSchema = {
  type: "object";
  properties: Record<string, SvgFieldSchema>;
  "x-order": string[];
  additionalProperties: false;
};

const text: SvgFieldSchema = { type: "string" };
const length: SvgFieldSchema = { type: "number" };
const color: SvgFieldSchema = { type: "string", format: "color" };

const PAINT: Record<string, SvgFieldSchema> = {
  fill: color,
  stroke: color,
  strokeWidth: { type: "number", minimum: 0 },
  opacity: { type: "number", minimum: 0, maximum: 1, multipleOf: 0.05, "x-number-display": "slider" },
  strokeDasharray: text,
};

const FONT_WEIGHTS = ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"] as const;

const GEOMETRY: Record<SvgEditableTag, Record<string, SvgFieldSchema>> = {
  rect: { x: length, y: length, width: length, height: length, rx: length },
  circle: { cx: length, cy: length, r: length },
  ellipse: { cx: length, cy: length, rx: length, ry: length },
  line: { x1: length, y1: length, x2: length, y2: length },
  polyline: { points: text },
  polygon: { points: text },
  path: { d: text },
  text: {
    x: length,
    y: length,
    fontSize: length,
    fontWeight: { type: "string", enum: FONT_WEIGHTS },
    textAnchor: { type: "string", enum: ["start", "middle", "end"] },
  },
  g: {},
};

function buildSchema(tag: SvgEditableTag): SvgTagSchema {
  const properties = { ...GEOMETRY[tag], ...PAINT };
  return { type: "object", properties, "x-order": Object.keys(properties), additionalProperties: false };
}

const SCHEMAS = Object.fromEntries(SVG_EDITABLE_TAGS.map((tag) => [tag, buildSchema(tag)])) as Record<SvgEditableTag, SvgTagSchema>;

export function isSvgEditableTag(tag: string): tag is SvgEditableTag {
  return (SVG_EDITABLE_TAGS as readonly string[]).includes(tag);
}

export function svgSchemaFor(tag: string): SvgTagSchema {
  if (!isSvgEditableTag(tag)) throw new Error(`no SVG schema for <${tag}>; supported tags: ${SVG_EDITABLE_TAGS.join(", ")}`);
  return SCHEMAS[tag];
}

export type SvgAttributeValues = Record<string, string | number>;

/**
 * Checks `values` against the schema of `<tag>`: only its attributes, with the
 * right types, finite numbers and enum members. Returns `values`; throws a
 * message naming the offending attribute.
 */
export function validateSvgAttributes(tag: string, values: unknown): SvgAttributeValues {
  const { properties } = svgSchemaFor(tag);
  if (values === null || typeof values !== "object" || Array.isArray(values)) {
    throw new Error(`<${tag}> attributes must be an object of attribute values`);
  }
  const entries = Object.entries(values);
  if (entries.length === 0) throw new Error(`<${tag}> attributes must name at least one attribute`);
  for (const [name, value] of entries) {
    const field = properties[name];
    if (!field) throw new Error(`"${name}" is not an editable attribute of <${tag}>; allowed: ${Object.keys(properties).join(", ")}`);
    if (field.type === "number") {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new Error(`"${name}" of <${tag}> must be a finite number, got ${JSON.stringify(value)}`);
      }
      if (field.minimum !== undefined && value < field.minimum) throw new Error(`"${name}" of <${tag}> must be at least ${field.minimum}, got ${value}`);
      if (field.maximum !== undefined && value > field.maximum) throw new Error(`"${name}" of <${tag}> must be at most ${field.maximum}, got ${value}`);
      continue;
    }
    if (typeof value !== "string" || value === "") throw new Error(`"${name}" of <${tag}> must be a non-empty string, got ${JSON.stringify(value)}`);
    if (field.enum && !field.enum.includes(value)) {
      throw new Error(`"${name}" of <${tag}> must be one of ${field.enum.join(", ")}, got ${JSON.stringify(value)}`);
    }
  }
  return values as SvgAttributeValues;
}
