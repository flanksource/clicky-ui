import { useMemo } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CacheBrowser, type CacheFetcher } from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

// Compact in-memory backend so the demo renders without a real cache server.
const TREE: Record<string, unknown> = {
  "": {
    prefix: "",
    bytesSupported: true,
    keys: 5,
    nodes: [
      { name: "user:", prefix: "user:", keys: 2, children: 2, bytes: 4096 },
      { name: "session:", prefix: "session:", keys: 2, children: 2, bytes: 8192 },
      { name: "config", key: "config", keys: 1, type: "hash", ttlSeconds: -1, bytes: 512 },
    ],
  },
  "user:": {
    prefix: "user:",
    bytesSupported: true,
    keys: 2,
    nodes: [
      { name: "1001", key: "user:1001", keys: 1, type: "hash", ttlSeconds: 3600, bytes: 2048 },
      { name: "1002", key: "user:1002", keys: 1, type: "hash", ttlSeconds: 3600, bytes: 2048 },
    ],
  },
  "session:": {
    prefix: "session:",
    bytesSupported: true,
    keys: 2,
    nodes: [
      { name: "ab12", key: "session:ab12", keys: 1, type: "string", ttlSeconds: 900, bytes: 4096 },
      { name: "cd34", key: "session:cd34", keys: 1, type: "string", ttlSeconds: 1800, bytes: 4096 },
    ],
  },
};

const KEYS: Record<string, unknown> = {
  config: { key: "config", type: "hash", ttlSeconds: -1, length: 2, bytes: 512, fields: { theme: "dark", region: "us-east-1" } },
  "user:1001": { key: "user:1001", type: "hash", ttlSeconds: 3600, length: 3, bytes: 2048, fields: { name: "Ada Lovelace", email: "ada@example.com", plan: "enterprise" } },
  "user:1002": { key: "user:1002", type: "hash", ttlSeconds: 3600, length: 3, bytes: 2048, fields: { name: "Grace Hopper", email: "grace@example.com", plan: "team" } },
  "session:ab12": { key: "session:ab12", type: "string", ttlSeconds: 900, length: 45, bytes: 4096, value: '{"uid":1001,"csrf":"a1b2c3"}' },
};

const STATS = {
  keys: 5,
  usedMemoryBytes: 18_900_000,
  maxMemoryBytes: 64_000_000,
  hits: 120_400,
  misses: 6_210,
  connectedClients: 4,
  version: "7.2.4",
  uptimeSeconds: 250_000,
};

const fetcher: CacheFetcher = async (rawUrl) => {
  const url = new URL(rawUrl, "http://cache.local");
  if (url.pathname.endsWith("/cache/tree")) return TREE[url.searchParams.get("prefix") ?? ""] ?? TREE[""];
  if (url.pathname.endsWith("/cache/stats")) return STATS;
  if (url.pathname.endsWith("/cache/search")) return { keys: [] };
  if (url.pathname.endsWith("/cache/key")) {
    const key = url.searchParams.get("key") ?? "";
    return KEYS[key] ?? { key, type: "string", ttlSeconds: -1, length: 0, value: "(empty)" };
  }
  throw new Error(`unhandled cache URL: ${rawUrl}`);
};

export function CacheBrowserDemo() {
  const queryClient = useMemo(
    () => new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } }),
    [],
  );
  return (
    <QueryClientProvider client={queryClient}>
      <DemoSection
        id="cache-browser"
        title="CacheBrowser"
        description="Generic cache/valkey browser: a lazy prefix tree with search on the left, and stats / subtree / key detail on the right. This demo uses a synthetic in-memory fetcher."
      >
        <div className="h-[560px] rounded-md border border-border">
          <CacheBrowser baseUrl="/api/v1" fetcher={fetcher} />
        </div>
      </DemoSection>
    </QueryClientProvider>
  );
}
