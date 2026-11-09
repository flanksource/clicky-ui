import { ACTIVITY_HEADERS, validateActivity, type WorkerActivity } from "../activity-schema.ts";
import { keys, record as object } from "./profile.ts";

export function createRequestActivity(href: string): WorkerActivity {
  const url = new URL(href);
  const kind = (url.pathname.startsWith("/esm/") ? "npm" : /^\/(frame|src|npm|link)\//.exec(url.pathname)?.[1]) as WorkerActivity["kind"] | undefined;
  const pkg = kind === "npm" ? /^\/(?:npm|esm)\/((?:@[^/]+\/)?[^/@]+)@([^/]+)\/(.+)$/.exec(decodeURIComponent(url.pathname)) : null;
  return { id: crypto.randomUUID(), kind: kind ?? "static", url: href, package: pkg ? { name: pkg[1]!, version: pkg[2]!, path: pkg[3]! } : null,
    source: "generated", cache: "miss", origin: null, generated: null, transferredBytes: 0, decodedBytes: null, outputBytes: null,
    startedAt: performance.timeOrigin + performance.now(), fetchMs: 0, integrityMs: 0, compileMs: 0, rewriteMs: 0, totalMs: 0, status: 0, contentType: "", headers: {}, unavailable: [], error: null };
}

export function serverTiming(record: WorkerActivity): string {
  return ([ ["fetch", record.fetchMs], ["integrity", record.integrityMs], ["compile", record.compileMs], ["rewrite", record.rewriteMs], ["total", record.totalMs] ] as const).map(([name, ms]) => name !== "total" && record.unavailable.includes(name) ? `${name};desc="unavailable"` : `${name};dur=${ms.toFixed(2)}`).join(", ") + `, cache;desc="${record.cache === "miss" ? "miss" : "hit"}"`;
}

export function activityResponse(options: { response: Response; record: WorkerActivity; start: number }): Response {
  const { response, record } = options;
  record.totalMs = performance.now() - options.start; record.status = response.status;
  record.contentType = response.headers.get("content-type") ?? "";
  if (response.type === "opaque" || response.type === "opaqueredirect") return response;
  const headers = new Headers(response.headers);
  headers.set("server-timing", [headers.get("server-timing"), serverTiming(record)].filter(Boolean).join(", "));
  record.headers = Object.fromEntries(ACTIVITY_HEADERS.flatMap((name) => headers.has(name) ? [[name, headers.get(name)!.slice(0, 2048)]] : []));
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function createActivityBatcher(options: { send: (client: string, records: WorkerActivity[]) => Promise<void>; delayMs?: number }) {
  const pending = new Map<string, { records: WorkerActivity[]; resolve: () => void; reject: (error: unknown) => void; promise: Promise<void> }>();
  let timer: ReturnType<typeof setTimeout> | undefined;
  async function flush(): Promise<void> {
    timer = undefined;
    const batches = [...pending]; pending.clear();
    for (const [client, batch] of batches) {
      try {
        for (let index = 0; index < batch.records.length; index += 32) await options.send(client, batch.records.slice(index, index + 32));
        batch.resolve();
      } catch (error) { batch.reject(error); }
    }
  }
  return { push: ({ client, record }: { client: string; record: WorkerActivity }): Promise<void> => {
    let batch = pending.get(client);
    if (!batch) {
      let resolve!: () => void; let reject!: (error: unknown) => void;
      const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
      batch = { records: [], resolve, reject, promise }; pending.set(client, batch);
    }
    batch.records.push(record);
    timer ??= setTimeout(() => { void flush(); }, options.delayMs ?? 40);
    return batch.promise;
  } };
}

export const byteLength = (value: string): number => new TextEncoder().encode(value).byteLength;

export function applyLinkActivity(options: { response: Response; record: WorkerActivity }): boolean {
  const header = options.response.headers.get("x-link-activity");
  if (header === null) return false;
  const metrics = object(JSON.parse(decodeURIComponent(header)), "link activity");
  const fields = ["source", "cache", "origin", "generated", "transferredBytes", "decodedBytes", "outputBytes", "fetchMs", "integrityMs", "compileMs", "rewriteMs", "unavailable"];
  keys(metrics, fields, "link activity");
  for (const field of fields) if (!Object.hasOwn(metrics, field)) throw new Error(`link activity: missing ${field}`);
  const checked = validateActivity({ type: "activity", load: "link", navigationStart: 0, records: [{ ...options.record, ...metrics }], timeline: [], tailwind: [] });
  Object.assign(options.record, checked.records[0]);
  return true;
}
