import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

/** Renders the way a static report does (no DOM, no effects) and parses the markup back for assertions. */
export function renderStatic(element: ReactElement): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = renderToStaticMarkup(element);
  return host;
}

export function rootSvg(host: HTMLElement): SVGSVGElement {
  const svg = host.querySelector("svg");
  if (!svg) throw new Error(`no <svg> rendered in: ${host.innerHTML.slice(0, 200)}`);
  return svg;
}

export function numAttr(element: Element, name: string): number {
  const raw = element.getAttribute(name);
  if (raw === null) throw new Error(`<${element.tagName}> has no ${name} attribute`);
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`<${element.tagName}> ${name}="${raw}" is not a number`);
  return value;
}

export function texts(host: ParentNode, selector: string): string[] {
  return Array.from(host.querySelectorAll(selector)).map((node) => node.textContent ?? "");
}
