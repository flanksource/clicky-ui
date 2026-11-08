import type { BridgeEnvelope, FrameMessage, HostMessage } from "../schema.ts";
import { keys, record, validatePolicy } from "../sw/profile.ts";
import { validateAgentFrameMessage, validateAgentHostMessage } from "./agent-validation.ts";
import { validateJson } from "./message-values.ts";
import { validateActivity } from "../activity-schema.ts";
import { validatePageSources } from "../link/page-sources.ts";
import { validateReviewFrameMessage, validateReviewHostMessage } from "./review/validation.ts";

function text(value: unknown, path: string, empty = false): asserts value is string {
  if (typeof value !== "string" || (!empty && !value) || value.length > 10_000_000) throw new Error(`${path}: expected string`);
}

export function validateFrameMessage(value: unknown): FrameMessage {
  const m = record(value, "message");
  switch (m.type) {
    case "activity": return validateActivity(m);
    case "review-state": case "review-action-request": case "review-error": return validateReviewFrameMessage(m);
    case "design-selection": case "design-override-result": case "design-write-request": case "design-write-result":
    case "selection": case "vocabulary-previews": case "anchors": case "focus": case "keys": case "geometry": return validateAgentFrameMessage(m);
    case "lock": keys(m, ["type", "lock"], "message"); validateLock(m.lock); break;
    case "status":
      keys(m, ["type", "state"], "message");
      if (!["connecting", "booting", "mounted", "fonts", "images", "stylesheets", "diagrams", "hook", "quiescence", "ready"].includes(String(m.state))) throw new Error("message.state: invalid status");
      break;
    case "snapshot": keys(m, ["type", "html"], "message"); text(m.html, "snapshot.html", true); break;
    case "error": {
      keys(m, ["type", "error"], "message");
      const error = record(m.error, "error");
      keys(error, ["phase", "message", "file", "line", "column"], "error");
      if (!["resolve", "fetch", "compile", "link", "render", "readiness"].includes(String(error.phase))) throw new Error("error.phase: invalid phase");
      text(error.message, "error.message"); text(error.file, "error.file");
      for (const field of ["line", "column"]) if (error[field] !== undefined && (typeof error[field] !== "number" || !Number.isInteger(error[field]) || error[field] < 1)) throw new Error(`error.${field}: invalid position`);
      break;
    }
    default: throw new Error(`message.type: unsupported frame message ${String(m.type)}`);
  }
  return m as FrameMessage;
}

export function validateHostMessage(value: unknown): HostMessage {
  const m = record(value, "message");
  switch (m.type) {
    case "review-list": case "review-select": case "review-visibility": case "review-action": return validateReviewHostMessage(m);
    case "design-override": case "design-write": case "design-write-result":
    case "mode": case "pick": case "page": case "capture-vocabulary": case "pins": case "highlight": case "scroll": return validateAgentHostMessage(m);
    case "open": {
      keys(m, ["type", "page", "manifest", "lock", "files", "policy"], "message"); text(m.page, "open.page");
      if (m.policy !== undefined) validatePolicy(m.policy, "open.policy");
      const manifest = record(m.manifest, "manifest");
      for (const [name, range] of Object.entries(record(manifest.dependencies, "manifest.dependencies"))) text(range, `dependencies.${name}`);
      if (m.lock !== undefined) validateLock(m.lock);
      for (const [path, source] of Object.entries(record(m.files, "files"))) { validateSourcePath(path); text(source, path, true); }
      break;
    }
    case "sources":
      keys(m, ["type", "files"], "message");
      for (const [path, source] of Object.entries(record(m.files, "files"))) { validateSourcePath(path); if (source !== null) text(source, path, true); }
      break;
    case "reload": keys(m, ["type"], "message"); break;
    case "theme":
      keys(m, ["type", "theme", "density"], "message");
      if (!["light", "dark"].includes(String(m.theme)) || !["compact", "comfortable", "spacious"].includes(String(m.density))) throw new Error("theme: invalid theme/density");
      break;
    case "data": keys(m, ["type", "data"], "message"); validateJson(m.data); break;
    case "export":
      keys(m, ["type", "format"], "message");
      if (m.format !== "html" && m.format !== "print") throw new Error("export.format: expected html or print");
      break;
    default: throw new Error(`message.type: unsupported host message ${String(m.type)}`);
  }
  return m as HostMessage;
}

export function validateSourcePath(path: string): void {
  if (!path || path.startsWith("/") || path.includes("\\") || path.split("/").some((segment) => segment === ".." || segment === "." || segment === "") || /[?#]/.test(path) || Array.from(path).some((character) => character.charCodeAt(0) < 0x20)) throw new Error(`invalid source path ${path}`);
}

export function validateLock(value: unknown): void {
  const lock = record(value, "lock");
  keys(lock, ["lock", "packageOrigin", "page", "versions", "map", "integrity", "remaps", "barrels", "listings", "pageSources"], "lock");
  if (lock.pageSources !== undefined) validatePageSources(lock.pageSources);
  if (lock.lock !== 2) throw new Error("invalid lock format");
  text(lock.packageOrigin, "lock.packageOrigin");
  const origin = new URL(lock.packageOrigin);
  if (!["https:", "http:"].includes(origin.protocol) || origin.username || origin.password || origin.search || origin.hash) throw new Error("invalid lock.packageOrigin");
  text(lock.page, "lock.page"); validateSourcePath(lock.page as string);
  for (const field of ["versions", "integrity", "remaps"]) for (const target of Object.values(record(lock[field], `lock.${field}`))) text(target, field);
  if (lock.listings !== undefined) for (const target of Object.values(record(lock.listings, "lock.listings"))) text(target, "listing digest");
  const map = record(lock.map, "lock.map");
  for (const table of [record(map.imports, "map.imports"), ...Object.values(record(map.scopes, "map.scopes")).map((v) => record(v, "scope"))]) for (const target of Object.values(table)) text(target, "import target");
  const barrels = record(lock.barrels, "barrels");
  if (!Array.isArray(barrels.modules) || barrels.modules.some((m) => typeof m !== "string")) throw new Error("barrels.modules: expected strings");
  for (const entry of Object.values(record(barrels.barrels, "barrels.barrels"))) for (const position of Object.values(record(entry, "barrel"))) {
    const n = Array.isArray(position) ? position[0] : position;
    if (typeof n !== "number" || !Number.isInteger(n) || n < 0 || n >= barrels.modules.length || (Array.isArray(position) && (position.length !== 2 || typeof position[1] !== "string"))) throw new Error("invalid barrel position");
  }
}

export function validateEnvelope(value: unknown, direction: "host" | "frame"): BridgeEnvelope {
  const e = record(value, "envelope");
  keys(e, ["bridge", "session", "id", "re", "message"], "envelope");
  if (e.bridge !== "page-runtime-v1") throw new Error("invalid bridge identifier");
  text(e.session, "session");
  if (e.id !== undefined) text(e.id, "id");
  if (e.re !== undefined) text(e.re, "re");
  if (e.id !== undefined && e.re !== undefined) throw new Error("envelope cannot be request and response");
  if (direction === "host") validateHostMessage(e.message); else validateFrameMessage(e.message);
  return e as BridgeEnvelope;
}
