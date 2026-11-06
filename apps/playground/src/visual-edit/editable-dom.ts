import { BOX_STYLES, CONTAINER_STYLES, DIAGRAM_ROLES } from "@flanksource/facet";
import {
  EDITABLE_SOURCE_ATTRIBUTE,
  parseEditableSource,
  type EditableSourceMarker,
} from "../../plugins/editable-source-marker";
import type { VisualEditStyleProp } from "../../plugins/visual-edits-contract";
import { SVG_EDITABLE_TAGS, isSvgEditableTag, type SvgEditableTag } from "./svg-schemas";

export type EditableKind = "box" | "container";

export type EditableTextPart = { prop: string; element: HTMLElement; text: string };

type EditableSource = {
  element: Element;
  /** The raw call-site marker; null when `unavailable` is set. */
  markerValue: string | null;
  marker: EditableSourceMarker | null;
  /** Why this node cannot be edited, or null when it can. */
  unavailable: string | null;
};

export type FacetEditableRoot = EditableSource & {
  kind: EditableKind;
  styleProp: VisualEditStyleProp;
  value: string;
  textParts: EditableTextPart[];
};
export type SvgEditableRoot = EditableSource & { kind: "svg"; tag: SvgEditableTag };
export type EditableRoot = FacetEditableRoot | SvgEditableRoot;

const FACET_SELECTOR = "[data-editable-box],[data-editable-container]";
export const EDITABLE_ROOT_SELECTOR = `${FACET_SELECTOR},${SVG_EDITABLE_TAGS.map(tag => `svg ${tag}[${EDITABLE_SOURCE_ATTRIBUTE}]`).join(",")}`;
const SVG_RESOURCES = "defs,marker,clipPath,mask,pattern,linearGradient,radialGradient,filter,symbol";
const TEXT_SELECTOR = "[data-editable-text]";

function styleProp(element: Element, attribute: string): VisualEditStyleProp {
  const prop = element.getAttribute(attribute);
  if (prop !== "variant" && prop !== "role") {
    throw new Error(`${attribute}=${JSON.stringify(prop)} on <${element.localName}> must be "variant" or "role"`);
  }
  return prop;
}

function currentValue(element: Element, kind: EditableKind, prop: VisualEditStyleProp): string {
  const attribute = prop === "role" ? "data-role" : kind === "box" ? "data-box-style" : "data-container-style";
  const value = element.getAttribute(attribute);
  if (value === null) throw new Error(`editable ${kind} <${element.localName}> is missing ${attribute}`);
  return value;
}

/** Reads one editable root's markers. */
export function describeEditable(element: Element): EditableRoot {
  const markerValue = element.getAttribute(EDITABLE_SOURCE_ATTRIBUTE);
  const source = {
    element,
    markerValue,
    marker: markerValue === null ? null : parseEditableSource(markerValue),
    unavailable: markerValue === null ? `<${element.localName}> has no ${EDITABLE_SOURCE_ATTRIBUTE}: it is not rendered from a page module` : null,
  };
  if (element.namespaceURI === "http://www.w3.org/2000/svg" && isSvgEditableTag(element.localName)) {
    if (element.closest(SVG_RESOURCES)) throw new Error("SVG definitions are not editable diagram targets");
    return { ...source, kind: "svg", tag: element.localName };
  }
  if (!element.matches(FACET_SELECTOR)) throw new Error(`<${element.localName}> is not a supported editable target`);
  const kind: EditableKind = element.hasAttribute("data-editable-box") ? "box" : "container";
  const prop = styleProp(element, kind === "box" ? "data-editable-box" : "data-editable-container");
  const textParts = Array.from(element.querySelectorAll<HTMLElement>(TEXT_SELECTOR))
    .filter((part) => part.closest(EDITABLE_ROOT_SELECTOR) === element)
    .map((part) => ({ prop: part.getAttribute("data-editable-text") ?? "", element: part, text: part.textContent ?? "" }));
  return {
    ...source,
    kind,
    styleProp: prop,
    value: currentValue(element, kind, prop),
    textParts,
  };
}

/** Every editable root under `root`, outermost first, including ones that cannot be edited. */
export function findEditableRoots(root: ParentNode): EditableRoot[] {
  return Array.from(root.querySelectorAll(EDITABLE_ROOT_SELECTOR)).filter(element => !element.closest(SVG_RESOURCES)).map(describeEditable);
}

export function editableTargetOf(element: Element, root: Element): EditableRoot | null {
  if (!root.contains(element) || element.closest(SVG_RESOURCES)) return null;
  const target = element.closest(EDITABLE_ROOT_SELECTOR);
  return target && root.contains(target) ? describeEditable(target) : null;
}

export function isEditableVisible(element: Element): boolean {
  if (!Array.from(element.getClientRects()).some(rect => rect.width > 0 && rect.height > 0)) return false;
  for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
    const style = getComputedStyle(ancestor);
    if (style.display === "none" || style.visibility === "hidden" || style.visibility === "collapse" || style.opacity === "0") return false;
  }
  return true;
}

/** All roots rendered from the same call site, e.g. the items of a `.map`. */
export function instancesOf(root: ParentNode, markerValue: string): EditableRoot[] {
  return findEditableRoots(root).filter((node) => node.markerValue === markerValue);
}

export function styleOptions(kind: EditableKind, prop: VisualEditStyleProp): readonly string[] {
  if (prop === "role") return DIAGRAM_ROLES;
  if (prop === "variant") return kind === "box" ? BOX_STYLES : CONTAINER_STYLES;
  throw new Error(`no style options for ${kind} prop ${JSON.stringify(prop)}`);
}
