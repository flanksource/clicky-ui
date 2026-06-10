import type {
  CacheDeleteResponse,
  CacheKeyDetail,
  CacheSearchResponse,
  CacheStats,
  CacheTreeResponse,
} from "./types";

/**
 * Fetches a cache-browser URL and returns the parsed JSON body. Hosts inject
 * their own to add auth headers or routing; the default uses window.fetch and
 * throws on any non-2xx response.
 */
export type CacheFetcher = (url: string, init?: RequestInit) => Promise<unknown>;

const defaultFetcher: CacheFetcher = async (url, init) => {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`cache request failed: ${res.status} ${body.trim()}`.trim());
  }
  return res.json();
};

/** Typed client over the cache-browser HTTP endpoints. */
export type CacheClient = {
  /** Base URL the client was created with; used to scope react-query keys. */
  baseUrl: string;
  tree(prefix?: string, max?: number): Promise<CacheTreeResponse>;
  key(key: string): Promise<CacheKeyDetail>;
  search(q: string, limit?: number): Promise<CacheSearchResponse>;
  stats(): Promise<CacheStats>;
  deleteKey(key: string): Promise<CacheDeleteResponse>;
  deletePrefix(prefix: string): Promise<CacheDeleteResponse>;
};

export type CreateCacheClientOptions = {
  /** API base shared with the rest of the app, e.g. "/api/v1". */
  baseUrl: string;
  fetcher?: CacheFetcher;
};

export function createCacheClient({
  baseUrl,
  fetcher = defaultFetcher,
}: CreateCacheClientOptions): CacheClient {
  const url = (path: string, params: Record<string, string | number | undefined>) => {
    const search = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") search.set(name, String(value));
    }
    const qs = search.toString();
    return `${baseUrl}/cache/${path}${qs ? `?${qs}` : ""}`;
  };

  return {
    baseUrl,
    tree: (prefix, max) =>
      fetcher(url("tree", { prefix, max })) as Promise<CacheTreeResponse>,
    key: (key) => fetcher(url("key", { key })) as Promise<CacheKeyDetail>,
    search: (q, limit) =>
      fetcher(url("search", { q, limit })) as Promise<CacheSearchResponse>,
    stats: () => fetcher(url("stats", {})) as Promise<CacheStats>,
    deleteKey: (key) =>
      fetcher(url("key", { key }), { method: "DELETE" }) as Promise<CacheDeleteResponse>,
    deletePrefix: (prefix) =>
      fetcher(url("prefix", { prefix }), { method: "DELETE" }) as Promise<CacheDeleteResponse>,
  };
}

/** react-query keys, scoped by baseUrl so two browsers never share caches. */
export const cacheQueryKeys = {
  all: (baseUrl: string) => ["cache-browser", baseUrl] as const,
  tree: (baseUrl: string, prefix: string) => ["cache-browser", baseUrl, "tree", prefix] as const,
  key: (baseUrl: string, key: string) => ["cache-browser", baseUrl, "key", key] as const,
  search: (baseUrl: string, q: string) => ["cache-browser", baseUrl, "search", q] as const,
  stats: (baseUrl: string) => ["cache-browser", baseUrl, "stats"] as const,
};
