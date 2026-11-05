import { BOX_STYLES, CONTAINER_STYLES, DIAGRAM_ROLES } from "@flanksource/facet";
import {
  EDITABLE_SOURCE_ATTRIBUTE,
  parseEditableSource,
  type EditableSourceMarker,
} from "../../plugins/editable-source-marker";
import type { VisualEditStyleProp } from "../../plugins/visual-edits-contract";

export type EditableKind = "box" | "container";

export type EditableTextPart = { prop: string; element: HTMLElement; text: string };

export type EditableRoot = {
  element: HTMLElement;
  kind: EditableKind;
  styleProp: VisualEditStyleProp;
  value: string;
  /** The raw call-site marker; null when `unavailable` is set. */
  markerValue: string | null;
  marker: EditableSourceMarker | null;
  textParts: EditableTextPart[];
  /** Why this node cannot be edited, or null when it can. */
  unavailable: string | null;
};

export const EDITABLE_ROOT_SELECTOR = "[data-editable-box],[data-editable-container]";
const TEXT_SELECTOR = "[data-editable-text]";

function styleProp(element: HTMLElement, attribute: string): VisualEditStyleProp {
  const prop = element.getAttribute(attribute);
  if (prop !== "variant" && prop !== "role") {
    throw new Error(`${attribute}=${JSON.stringify(prop)} on <${element.localName}> must be "variant" or "role"`);
  }
  return prop;
}

function currentValue(element: HTMLElement, kind: EditableKind, prop: VisualEditStyleProp): string {
  const attribute = prop === "role" ? "data-role" : kind === "box" ? "data-box-style" : "data-container-style";
  const value = element.getAttribute(attribute);
  if (value === null) throw new Error(`editable ${kind} <${element.localName}> is missing ${attribute}`);
  return value;
}

/** Reads one editable root's markers. */
export function describeEditable(element: HTMLElement): EditableRoot {
  const kind: EditableKind = element.hasAttribute("data-editable-box") ? "box" : "container";
  const prop = styleProp(element, kind === "box" ? "data-editable-box" : "data-editable-container");
  const markerValue = element.getAttribute(EDITABLE_SOURCE_ATTRIBUTE);
  const textParts = Array.from(element.querySelectorAll<HTMLElement>(TEXT_SELECTOR))
    .filter((part) => part.closest(EDITABLE_ROOT_SELECTOR) === element)
    .map((part) => ({ prop: part.getAttribute("data-editable-text") ?? "", element: part, text: part.textContent ?? "" }));
  return {
    element,
    kind,
    styleProp: prop,
    value: currentValue(element, kind, prop),
    markerValue,
    marker: markerValue === null ? null : parseEditableSource(markerValue),
    textParts,
    unavailable:
      markerValue === null
        ? `<${element.localName}> has no ${EDITABLE_SOURCE_ATTRIBUTE}: it is not rendered from a page module`
        : null,
  };
}

/** Every editable root under `root`, outermost first, including ones that cannot be edited. */
export function findEditableRoots(root: ParentNode): EditableRoot[] {
  return Array.from(root.querySelectorAll<HTMLElement>(EDITABLE_ROOT_SELECTOR), describeEditable);
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
