// Synthetic cache-browser backend for stories: an in-memory fetcher that serves
// the tree / key / search / stats endpoints with no network, so the connected
// components (CacheBrowser, CacheTree, CacheDetailPanel, CacheStatsOverview)
// render real data. Not exported from index.ts — story support only.

import { createCacheClient, type CacheClient, type CacheFetcher } from "./api";
import type {
  CacheKeyDetail,
  CacheSearchResponse,
  CacheStats,
  CacheTreeNode,
  CacheTreeResponse,
} from "./types";

const ROOT_NODES: CacheTreeNode[] = [
  { name: "user:", prefix: "user:", keys: 2, children: 2, bytes: 4096 },
  { name: "session:", prefix: "session:", keys: 3, children: 3, bytes: 12_288 },
  { name: "config", key: "config", keys: 1, type: "hash", ttlSeconds: -1, bytes: 512 },
];

const USER_NODES: CacheTreeNode[] = [
  { name: "1001", key: "user:1001", keys: 1, type: "hash", ttlSeconds: 3600, bytes: 2048 },
  { name: "1002", key: "user:1002", keys: 1, type: "hash", ttlSeconds: 3600, bytes: 2048 },
];

const SESSION_NODES: CacheTreeNode[] = [
  { name: "ab12", key: "session:ab12", keys: 1, type: "string", ttlSeconds: 900, bytes: 4096 },
  { name: "cd34", key: "session:cd34", keys: 1, type: "string", ttlSeconds: 1800, bytes: 4096 },
  { name: "ef56", key: "session:ef56", keys: 1, type: "zset", ttlSeconds: -1, bytes: 4096 },
];

const DETAILS: Record<string, CacheKeyDetail> = {
  config: {
    key: "config",
    type: "hash",
    ttlSeconds: -1,
    length: 3,
    bytes: 512,
    fields: { theme: "dark", region: "us-east-1", featureFlags: "billing,timeseries" },
  },
  "user:1001": {
    key: "user:1001",
    type: "hash",
    ttlSeconds: 3600,
    length: 4,
    bytes: 2048,
    fields: { name: "Ada Lovelace", email: "ada@example.com", plan: "enterprise", seats: "25" },
  },
  "user:1002": {
    key: "user:1002",
    type: "hash",
    ttlSeconds: 3600,
    length: 4,
    bytes: 2048,
    fields: { name: "Grace Hopper", email: "grace@example.com", plan: "team", seats: "8" },
  },
  "session:ab12": {
    key: "session:ab12",
    type: "string",
    ttlSeconds: 900,
    length: 64,
    bytes: 4096,
    value: '{"uid":1001,"csrf":"a1b2c3","exp":1750000000}',
  },
  "session:ef56": {
    key: "session:ef56",
    type: "zset",
    ttlSeconds: -1,
    length: 3,
    bytes: 4096,
    members: [
      { member: "page:/home", score: 12 },
      { member: "page:/billing", score: 7 },
      { member: "page:/settings", score: 3 },
    ],
  },
};

const STATS: CacheStats = {
  keys: 6,
  usedMemoryBytes: 22_400_000,
  maxMemoryBytes: 64_000_000,
  hits: 184_201,
  misses: 9_842,
  evictedKeys: 12,
  expiredKeys: 540,
  connectedClients: 7,
  version: "7.2.4",
  uptimeSeconds: 86_400 * 3 + 3600,
};

function treeFor(prefix: string): CacheTreeResponse {
  const nodes =
    prefix === "user:" ? USER_NODES : prefix === "session:" ? SESSION_NODES : ROOT_NODES;
  const keys = nodes.reduce((sum, n) => sum + n.keys, 0);
  return { prefix, nodes, keys, bytesSupported: true };
}

/** Builds a fetcher that serves the synthetic dataset from the URL + query. */
export function makeCacheFetcher(): CacheFetcher {
  return async (rawUrl) => {
    const url = new URL(rawUrl, "http://cache.local");
    const params = url.searchParams;
    if (url.pathname.endsWith("/cache/tree")) return treeFor(params.get("prefix") ?? "");
    if (url.pathname.endsWith("/cache/stats")) return STATS;
    if (url.pathname.endsWith("/cache/search")) {
      const q = params.get("q") ?? "";
      const hits = [...USER_NODES, ...SESSION_NODES].filter((n) => n.key?.includes(q));
      return { keys: hits } satisfies CacheSearchResponse;
    }
    if (url.pathname.endsWith("/cache/key")) {
      const key = params.get("key") ?? "";
      return (
        DETAILS[key] ?? { key, type: "string", ttlSeconds: -1, length: 0, value: "(empty)" }
      );
    }
    throw new Error(`unhandled cache URL: ${rawUrl}`);
  };
}

export function makeCacheClient(baseUrl = "/api/v1"): CacheClient {
  return createCacheClient({ baseUrl, fetcher: makeCacheFetcher() });
}

export const sampleKeyDetail = DETAILS["user:1001"] as CacheKeyDetail;
export const sampleZsetDetail = DETAILS["session:ef56"] as CacheKeyDetail;
export const rootGroupNode = ROOT_NODES[0] as CacheTreeNode;
export const leafNode = USER_NODES[0] as CacheTreeNode;
