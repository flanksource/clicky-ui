import { svgSchemaFor, validateSvgAttributes, type SvgAttributeValues } from "./svg-schemas";

/** An element's editable attributes by JSX prop name; an attribute the element does not carry is absent. */
export type SvgFormValues = Record<string, string | number | null>;

/** `strokeWidth` → `stroke-width`: the DOM attribute a JSX prop of the schema renders as. */
export function domAttributeName(prop: string): string {
  if (prop === "className") return "class";
  return prop.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

/** Reads the attributes `<tag>`'s schema covers; numeric fields are parsed, anything else (`"50%"`) stays text. */
export function readSvgAttributes(element: Element): SvgFormValues {
  const { properties } = svgSchemaFor(element.localName);
  const values: SvgFormValues = {};
  for (const [prop, field] of Object.entries(properties)) {
    if (prop === "children") {
      if (element.children.length === 0) values[prop] = element.textContent ?? "";
      continue;
    }
    const raw = element.getAttribute(domAttributeName(prop));
    if (raw === null) continue;
    const parsed = Number(raw);
    values[prop] = field.type === "number" && raw.trim() !== "" && Number.isFinite(parsed) ? parsed : raw;
  }
  return values;
}

export type SvgDiff = {
  /** Valid values that differ from the baseline; the only thing a save sends. */
  changes: SvgAttributeValues;
  /** Why an edited attribute cannot be saved or previewed yet, by prop name (e.g. a number mid-typing). */
  invalid: Record<string, string>;
};

/** What `values` changes against `baseline`; an attribute the form never held is not a change. */
export function diffSvgAttributes(tag: string, baseline: SvgFormValues, values: Record<string, unknown>): SvgDiff {
  const changes: SvgAttributeValues = {};
  const invalid: Record<string, string> = {};
  for (const prop of Object.keys(svgSchemaFor(tag).properties)) {
    const value = values[prop];
    if (value === undefined || value === baseline[prop]) continue;
    if (value === null && baseline[prop] == null) continue;
    if (value === "" && prop !== "children" && prop !== "className") {
      if (baseline[prop] !== undefined) invalid[prop] = `"${prop}" cannot be removed; restore a value or use Revert`;
      continue;
    }
    try {
      Object.assign(changes, validateSvgAttributes(tag, { [prop]: value }));
    } catch (error) {
      invalid[prop] = (error as Error).message;
    }
  }
  return { changes, invalid };
}
