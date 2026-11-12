import type { AgentFrameMessage, AgentHostMessage } from "../schema.ts";
import { keys, record } from "../sw/profile.ts";
import { validateDesignMessage } from "./design-validation.ts";
import { text, number, list, rect, locator, validateAgentSelection } from "./message-values.ts";

export function validateAgentFrameMessage(value: unknown): AgentFrameMessage {
  const m = record(value, "agent");
  switch (m.type) {
    case "design-selection": case "design-override-result": case "design-write-request": case "design-write-result": return validateDesignMessage(m, "frame") as AgentFrameMessage;
    case "selection": keys(m, ["type", "selection"], "agent"); validateAgentSelection(m.selection); break;
    case "vocabulary-previews": {
      keys(m, ["type", "images"], "agent");
      if (!Array.isArray(m.images) || m.images.length > 2000) throw new Error("vocabulary-previews.images: expected at most 2000 images");
      const ids = new Set<string>();
      for (const value of m.images) {
        const image = record(value, "vocabulary preview");
        keys(image, ["id", "image", "width", "height"], "vocabulary preview");
        if (typeof image.id !== "string" || !image.id) throw new Error("vocabulary preview.id: expected non-empty string");
        if (typeof image.image !== "string" || !image.image.startsWith("data:image/webp;base64,")) throw new Error(`vocabulary preview ${image.id}.image: expected WebP data URL`);
        for (const dimension of ["width", "height"]) {
          if (typeof image[dimension] !== "number" || !Number.isFinite(image[dimension]) || image[dimension] <= 0) throw new Error(`vocabulary preview ${image.id}.${dimension}: expected positive finite number`);
        }
        if (ids.has(image.id)) throw new Error(`duplicate vocabulary preview id ${image.id}`);
        ids.add(image.id);
      }
      break;
    }
    case "anchors":
      keys(m, ["type", "anchors"], "agent");
      list(m.anchors).forEach((value) => {
        const a = record(value, "anchor"); keys(a, ["anchor", "state", "label", "rect"], "anchor"); text(a.anchor); text(a.label);
        if (a.state === "orphaned") { if (a.rect !== null) throw new Error("orphaned anchor must have null rect"); }
        else if (a.state === "found" || a.state === "moved") rect(a.rect);
        else throw new Error("invalid anchor state");
      }); break;
    case "focus": keys(m, ["type", "anchor"], "agent"); text(m.anchor); break;
    case "keys":
      keys(m, ["type", "key", "ctrlKey", "metaKey", "shiftKey", "altKey"], "agent");
      if (m.key !== "Escape" && m.key !== "c") throw new Error("invalid forwarded key");
      for (const key of ["ctrlKey", "metaKey", "shiftKey", "altKey"]) if (typeof m[key] !== "boolean") throw new Error("invalid key modifier");
      break;
    case "geometry":
      keys(m, ["type", "scrollX", "scrollY", "width", "height"], "agent"); number(m.scrollX); number(m.scrollY); number(m.width, 0); number(m.height, 0); break;
    default: throw new Error("unsupported agent frame message");
  }
  return m as AgentFrameMessage;
}

export function validateAgentHostMessage(value: unknown): AgentHostMessage {
  const m = record(value, "agent");
  switch (m.type) {
    case "design-override": case "design-write": case "design-write-result": return validateDesignMessage(m, "host") as AgentHostMessage;
    case "mode": keys(m, ["type", "mode"], "agent"); if (m.mode !== "off" && m.mode !== "comment" && m.mode !== "design") throw new Error("invalid agent mode"); break;
    case "pick": case "page": case "capture-vocabulary": keys(m, ["type"], "agent"); break;
    case "pins":
      keys(m, ["type", "anchors", "focus"], "agent");
      if (m.focus !== undefined && m.focus !== null) text(m.focus);
      list(m.anchors).forEach((value) => {
        const p = record(value, "pin"); keys(p, ["anchor", "count", "locators"], "pin"); text(p.anchor); number(p.count, 1);
        if (!Number.isInteger(p.count)) throw new Error("invalid pin count");
        list(p.locators).forEach(locator);
      }); break;
    case "highlight": keys(m, ["type", "anchor"], "agent"); if (m.anchor !== null) text(m.anchor); break;
    case "scroll":
      keys(m, ["type", "anchor", "behavior", "block", "offset"], "agent"); text(m.anchor);
      if (m.behavior !== undefined && !["auto", "smooth", "instant"].includes(String(m.behavior))) throw new Error("invalid scroll behavior");
      if (m.block !== undefined && m.block !== "start" && m.block !== "center") throw new Error("invalid scroll block");
      if (m.offset !== undefined) number(m.offset);
      break;
    default: throw new Error("unsupported agent host message");
  }
  return m as AgentHostMessage;
}
