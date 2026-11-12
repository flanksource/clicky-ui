import type { JsonValue } from "../schema.ts";
import { keys, record } from "../sw/profile.ts";
import { isPageSource, validateDocumentSource } from "./agent-source.ts";

export function text(value: unknown, max = 4096, empty = false): asserts value is string {
  if (typeof value !== "string" || (!empty && !value) || value.length > max) throw new Error("agent: invalid text");
}
export function number(value: unknown, min = -Infinity): asserts value is number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < min) throw new Error("agent: invalid number");
}
export function list(value: unknown): unknown[] {
  if (!Array.isArray(value) || value.length > 10000) throw new Error("agent: invalid list");
  return value;
}
export function rect(value: unknown): void {
  const r = record(value, "agent.rect");
  keys(r, ["left", "top", "width", "height"], "agent.rect");
  number(r.left); number(r.top); number(r.width, 0); number(r.height, 0);
}
export function locator(value: unknown): void {
  const l = record(value, "agent.locator");
  if (l.kind === "css") { keys(l, ["kind", "selector"], "locator"); text(l.selector, 1024); return; }
  text(l.tag, 100);
  if (l.kind === "role") { keys(l, ["kind", "tag", "role", "name"], "locator"); text(l.role, 100); text(l.name, 200); return; }
  text(l.text, 200, true);
  if (l.kind === "text") {
    keys(l, ["kind", "tag", "text", "heading", "scope"], "locator");
    if (l.scope !== undefined) text(l.scope, 1024);
    if (l.heading !== undefined) {
      const h = record(l.heading, "heading"); keys(h, ["selector", "text"], "heading"); text(h.selector, 1024); text(h.text, 200);
    }
  } else if (l.kind === "markdown") {
    keys(l, ["kind", "tag", "text", "path", "line"], "locator");
    list(l.path).forEach((part) => text(part, 200));
    if (l.line !== undefined) { number(l.line, 1); if (!Number.isInteger(l.line)) throw new Error("locator: invalid line"); }
  } else throw new Error("agent: invalid locator kind");
}
export function validateAgentSelection(value: unknown): void {
  const s = record(value, "selection"); keys(s, ["anchor", "label", "element", "rect"], "selection");
  text(s.anchor); text(s.label); rect(s.rect);
  const e = record(s.element, "element"); keys(e, ["source", "sourceContext", "componentName", "html", "locators"], "element");
  text(e.source); text(e.componentName); text(e.html, 4200, true);
  if (e.sourceContext !== undefined) {
    const context = record(e.sourceContext, "sourceContext"); keys(context, ["mode", "url"], "sourceContext");
    if (context.mode !== "external-document" || context.url !== e.source) throw new Error("selection: external source does not match document context");
    validateDocumentSource(e.source);
  } else if (!isPageSource(e.source)) throw new Error("selection: expected page source");
  list(e.locators).forEach(locator);
}
export function validateJson(value: unknown, depth = 0): asserts value is JsonValue {
  if (depth > 50) throw new Error("data: maximum nesting exceeded");
  if (value === null || typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return;
  if (Array.isArray(value)) { value.forEach((v) => validateJson(v, depth + 1)); return; }
  for (const item of Object.values(record(value, "data"))) validateJson(item, depth + 1);
}
