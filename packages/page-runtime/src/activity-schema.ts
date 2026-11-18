import type { RuntimePhase } from "./schema.ts";
import { keys, record } from "./sw/profile.ts";

export type WorkerActivity = {
  id: string; kind: "frame" | "src" | "npm" | "link" | "static"; url: string;
  package: { name: string; version: string; path: string } | null;
  source: "cache" | "network" | "compiled" | "generated";
  cache: "storage" | "memory" | "miss"; origin: string | null; generated: string | null;
  transferredBytes: number | null; decodedBytes: number | null; outputBytes: number | null;
  startedAt: number; fetchMs: number; integrityMs: number; compileMs: number; rewriteMs: number; totalMs: number;
  status: number; contentType: string; headers: Record<string, string>;
  unavailable: Array<"fetch" | "integrity" | "compile" | "rewrite" | "cache-layer">;
  error: { phase: RuntimePhase; message: string } | null;
};
export type TailwindActivity = { kind: "libraries" | "candidates"; startMs: number; durationMs: number; candidates: number; cssBytes: number; cacheHit: boolean };
export type RuntimeResolution = { versions: Record<string, string>; base: Record<string, string>; managed: string[]; importMapBytes: number; scopes: number };
export type ActivityMessage = { type: "activity"; load: string; navigationStart: number; records: WorkerActivity[]; timeline: Array<{ phase: string; atMs: number }>; tailwind: TailwindActivity[]; runtime?: RuntimeResolution; styles?: Record<string, string> };

export function validateActivity(value: unknown): ActivityMessage {
  const m = record(value, "activity");
  keys(m, ["type", "load", "navigationStart", "records", "timeline", "tailwind", "runtime", "styles"], "activity");
  if (m.styles !== undefined) for (const [name, value] of Object.entries(record(m.styles, 'styles'))) { string(name, 128); string(value, 65536, true); }
  if (m.type !== "activity") throw new Error("activity.type: expected activity");
  string(m.load, 256); number(m.navigationStart);
  for (const item of array(m.records, 32)) validateRequest(item);
  for (const item of array(m.timeline, 64)) {
    const mark = record(item, "timeline"); keys(mark, ["phase", "atMs"], "timeline");
    string(mark.phase, 64); number(mark.atMs);
  }
  for (const item of array(m.tailwind, 32)) {
    const build = record(item, "tailwind"); keys(build, ["kind", "startMs", "durationMs", "candidates", "cssBytes", "cacheHit"], "tailwind");
    choice(build.kind, ["libraries", "candidates"]); number(build.startMs); number(build.durationMs);
    number(build.candidates, true); number(build.cssBytes, true);
    if (typeof build.cacheHit !== "boolean") throw new Error("tailwind.cacheHit: expected boolean");
  }
  if (m.runtime !== undefined) validateResolution(m.runtime);
  return m as ActivityMessage;
}

export const ACTIVITY_HEADERS = ["content-type", "content-length", "content-encoding", "cache-control", "etag", "last-modified", "age", "expires", "vary", "server-timing", "x-page-integrity", "x-page-runtime-error", "x-link-compiled", "x-link-cache"];

function validateRequest(value: unknown): void {
  const r = record(value, "request");
  keys(r, ["id", "kind", "url", "package", "source", "cache", "origin", "generated", "transferredBytes", "decodedBytes", "outputBytes", "startedAt", "fetchMs", "integrityMs", "compileMs", "rewriteMs", "totalMs", "status", "contentType", "headers", "unavailable", "error"], "request");
  string(r.id, 256); url(r.url); choice(r.kind, ["frame", "src", "npm", "link", "static"]);
  choice(r.source, ["cache", "network", "compiled", "generated"]); choice(r.cache, ["storage", "memory", "miss"]);
  if (r.origin !== null) url(r.origin);
  if (r.generated !== null) string(r.generated, 64);
  for (const field of ["transferredBytes", "decodedBytes", "outputBytes"]) if (r[field] !== null) number(r[field], true);
  for (const field of ["startedAt", "fetchMs", "integrityMs", "compileMs", "rewriteMs", "totalMs"]) number(r[field]);
  number(r.status, true); if (Number(r.status) > 599) throw new Error("request.status: invalid HTTP status");
  string(r.contentType, 256, true);
  const headers = record(r.headers, "headers"); keys(headers, ACTIVITY_HEADERS, "headers");
  for (const field of array(r.unavailable, 5)) choice(field, ["fetch", "integrity", "compile", "rewrite", "cache-layer"]);
  for (const header of Object.values(headers)) string(header, 2048, true);
  if (r.package !== null) {
    const pkg = record(r.package, "package"); keys(pkg, ["name", "version", "path"], "package");
    string(pkg.name, 256); string(pkg.version, 128); string(pkg.path, 4096);
  }
  if (r.kind === "npm" && r.package === null && r.error === null) throw new Error("npm request requires package identity");
  if (r.error !== null) {
    const error = record(r.error, "error"); keys(error, ["phase", "message"], "error");
    choice(error.phase, ["resolve", "fetch", "compile", "link", "render", "readiness"]); string(error.message, 4096);
  }
}

function validateResolution(value: unknown): void {
  const r = record(value, "runtime"); keys(r, ["versions", "base", "managed", "importMapBytes", "scopes"], "runtime");
  for (const field of ["versions", "base"]) {
    const table = record(r[field], field);
    if (Object.keys(table).length > 512) throw new Error(`${field}: too many entries`);
    for (const [key, target] of Object.entries(table)) { string(key, 256); string(target, 4096); }
  }
  for (const name of array(r.managed, 32)) string(name, 256);
  number(r.importMapBytes, true); number(r.scopes, true);
}
function string(value: unknown, max: number, empty = false): asserts value is string {
  if (typeof value !== "string" || (!empty && !value) || value.length > max) throw new Error("activity: invalid or oversized string");
}
function number(value: unknown, integer = false): void {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > Number.MAX_SAFE_INTEGER || (integer && !Number.isInteger(value))) throw new Error("activity: invalid number");
}
function choice(value: unknown, allowed: string[]): void {
  if (typeof value !== "string" || !allowed.includes(value)) throw new Error("activity: invalid enum value");
}
function array(value: unknown, max: number): unknown[] {
  if (!Array.isArray(value) || value.length > max) throw new Error("activity: invalid or oversized array");
  return value;
}
function url(value: unknown): void {
  string(value, 8192); if (!["https:", "http:"].includes(new URL(value).protocol)) throw new Error("activity: invalid URL protocol");
}
