import type { DesignFrameMessage, DesignHostMessage } from "../schema.ts";
import { parseEditableSource } from "../markers.ts";
import { record, keys } from "../sw/profile.ts";
import { isPageSource } from "./agent-source.ts";
import { validateAgentSelection, validateJson } from "./message-values.ts";

function text(value: unknown, empty = false): asserts value is string {
  if (typeof value !== "string" || (!empty && !value) || value.length > 10000) throw new Error("design: invalid text");
}
function position(value: unknown): void {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1) throw new Error("design: invalid position");
}
function source(value: unknown): void {
  text(value); parseEditableSource(value);
  if (!isPageSource(value)) throw new Error("design: expected editable page source");
}
function prop(name: string): void {
  if (!/^[a-zA-Z][\w-]*$/.test(name) || /^(?:on[A-Z]|data-source$|data-editable-source$|__|ref$|key$|dangerouslySetInnerHTML$)/.test(name)) throw new Error(`design: invalid prop ${name}`);
}
function props(value: unknown): void {
  for (const [name, item] of Object.entries(record(value, "design.props"))) { prop(name); validateJson(item); }
}
function edit(value: unknown): void {
  const e = record(value, "design.edit");
  switch (e.kind) {
    case "delete": keys(e, ["kind"], "edit"); break;
    case "style":
      keys(e, ["kind", "prop", "value"], "edit");
      if (e.prop !== "variant" && e.prop !== "role") throw new Error("design: invalid style prop");
      text(e.value, true); break;
    case "text":
      keys(e, ["kind", "prop", "from", "to"], "edit"); text(e.prop); prop(e.prop); text(e.from, true); text(e.to, true); break;
    case "attributes":
      keys(e, ["kind", "values", "textFrom"], "edit");
      if (e.textFrom !== undefined) text(e.textFrom, true);
      if (!Object.keys(record(e.values, "attributes")).length) throw new Error("design: attributes are empty");
      for (const [name, item] of Object.entries(record(e.values, "attributes"))) {
        prop(name);
        if (item !== null && typeof item !== "string" && !(typeof item === "number" && Number.isFinite(item))) throw new Error("design: invalid attribute value");
      }
      break;
    default: throw new Error("design: invalid edit kind");
  }
}
function result(value: unknown): void {
  const r = record(value, "design.result");
  switch (r.status) {
    case "applied":
      keys(r, ["status", "file", "path", "line", "hash"], "result"); text(r.file); text(r.path); position(r.line); text(r.hash);
      if (!/^[0-9a-f]{12}$/.test(r.hash)) throw new Error("design: invalid result hash");
      break;
    case "stale": keys(r, ["status", "error", "file"], "result"); text(r.error); text(r.file); break;
    case "invalid": keys(r, ["status", "error"], "result"); text(r.error); break;
    case "refused":
      keys(r, ["status", "error", "reason", "file", "line", "column", "attribute"], "result");
      text(r.error); text(r.reason); text(r.file); position(r.line); position(r.column);
      if (r.attribute !== undefined) text(r.attribute);
      break;
    case "ambiguous":
      keys(r, ["status", "error", "candidates"], "result"); text(r.error);
      if (!Array.isArray(r.candidates) || !r.candidates.length || r.candidates.length > 10000) throw new Error("design: invalid candidates");
      for (const value of r.candidates) {
        const c = record(value, "candidate"); keys(c, ["id", "file", "line", "column", "context"], "candidate");
        text(c.id); text(c.file); position(c.line); position(c.column); text(c.context, true);
      }
      break;
    default: throw new Error("design: invalid result status");
  }
}

export function validateDesignMessage(m: Record<string, unknown>, direction: "host" | "frame"): DesignHostMessage | DesignFrameMessage {
  if (m.type === "design-selection" && direction === "frame") {
    keys(m, ["type", "selection", "source", "props"], "design"); validateAgentSelection(m.selection); source(m.source); props(m.props);
    const element = record(record(m.selection, "selection").element, "element");
    if (element.source !== m.source || element.sourceContext !== undefined) throw new Error("design: selection must match the editable page source");
    return m as DesignFrameMessage;
  }
  text(m.requestId);
  if (m.type === "design-write-result") {
    keys(m, ["type", "requestId", "result"], "design"); result(m.result);
  } else if (m.type === "design-override" && direction === "host") {
    keys(m, ["type", "requestId", "source", "props"], "design"); source(m.source); props(m.props);
    if (!Object.keys(m.props as object).length) throw new Error("design: override is empty");
  } else if (m.type === "design-override-result" && direction === "frame") {
    keys(m, m.ok === true ? ["type", "requestId", "source", "ok"] : ["type", "requestId", "source", "ok", "error"], "design"); source(m.source);
    if (m.ok === false) text(m.error); else if (m.ok !== true) throw new Error("design: invalid override result");
  } else if (m.type === "design-write" && direction === "host") {
    keys(m, ["type", "requestId", "page", "source", "edit", "choose"], "design"); text(m.page); source(m.source); edit(m.edit);
    if (m.choose !== undefined) text(m.choose);
  } else if (m.type === "design-write-request" && direction === "frame") {
    keys(m, ["type", "requestId", "request"], "design");
    const r = record(m.request, "request"); keys(r, ["page", "source", "edit", "choose"], "request"); text(r.page); source(r.source); edit(r.edit);
    if (r.choose !== undefined) text(r.choose);
  } else throw new Error("design: unsupported message direction");
  return m as DesignHostMessage | DesignFrameMessage;
}
