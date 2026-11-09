import type { WorkerActivity } from "../activity-schema.ts";

export type LinkActivity = Pick<WorkerActivity, "source" | "cache" | "origin" | "generated" | "transferredBytes" | "decodedBytes" | "outputBytes" | "fetchMs" | "integrityMs" | "compileMs" | "rewriteMs" | "unavailable">;

export function createLinkActivity(): LinkActivity {
  return { source: "compiled", cache: "miss", origin: null, generated: null, transferredBytes: 0, decodedBytes: null, outputBytes: null, fetchMs: 0, integrityMs: 0, compileMs: 0, rewriteMs: 0, unavailable: [] };
}

export function linkActivityResponse(options: { response: Response; metrics: LinkActivity }): Response {
  options.response.headers.set("x-link-activity", encodeURIComponent(JSON.stringify(options.metrics)));
  if (options.metrics.outputBytes !== null) options.response.headers.set("content-length", String(options.metrics.outputBytes));
  return options.response;
}

export function cachedLinkActivity(options: { response: Response; layer: "memory" | "storage"; metrics: LinkActivity }): void {
  const size = options.response.headers.get("x-link-source-bytes");
  const output = options.response.headers.get("content-length");
  if (size === null || output === null) throw new Error("Linked cache entry is missing its source/output size");
  Object.assign(options.metrics, { source: "cache", cache: options.layer, decodedBytes: Number(size), outputBytes: Number(output) });
}

