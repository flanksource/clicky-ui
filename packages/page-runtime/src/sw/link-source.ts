import type { StoredLink } from "../link/types.ts";
import { readLinkFile } from "../link/source.ts";
import type { PageLock } from "../schema.ts";
import type { LinkActivity } from "./link-activity.ts";
import { verifyIntegrity } from "./integrity.ts";

export async function readLinkedSource(options: {
  owner: StoredLink | undefined; path: string; source: boolean; files: Record<string, string>; lock: PageLock;
  metrics: LinkActivity; fetch: typeof fetch; readFolder: (options: { link: StoredLink; path: string }) => Promise<Uint8Array>;
}): Promise<Uint8Array> {
  const { owner, path, metrics } = options;
  if (!owner && options.source) {
    const code = options.files[path]; if (code === undefined) throw new Error(`Source ${path} does not exist`);
    const bytes = new TextEncoder().encode(code); metrics.decodedBytes = bytes.byteLength; return bytes;
  }
  if (!owner && !options.lock.integrity[path]) throw new Error(`${path} is outside the library set`);
  if (metrics.origin) { metrics.source = "network"; metrics.transferredBytes = null; }
  const fetchSource = options.fetch;
  const fetcher: typeof fetch = async (input, init) => {
    const response = await fetchSource(input, init);
    metrics.transferredBytes = response.headers.has("content-length") ? Number(response.headers.get("content-length")) : null;
    return response;
  };
  const fetching = performance.now();
  let bytes: Uint8Array;
  try {
    if (owner) bytes = owner.source.kind === "folder" ? await options.readFolder({ link: owner, path }) : await readLinkFile({ link: owner, path, fetch: fetcher });
    else {
      const response = await fetcher(metrics.origin!, { mode: "cors", credentials: "omit", redirect: "error" });
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
      bytes = new Uint8Array(await response.arrayBuffer());
    }
    metrics.decodedBytes = bytes.byteLength;
  } finally { metrics.fetchMs = performance.now() - fetching; }
  if (!owner) {
    const checking = performance.now();
    try { await verifyIntegrity(new Uint8Array(bytes), options.lock.integrity[path]!, path); }
    finally { metrics.integrityMs = performance.now() - checking; }
  }
  return bytes;
}
