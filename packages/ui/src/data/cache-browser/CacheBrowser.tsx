import { useMemo, useState } from "react";
import { cn } from "../../lib/utils";
import { SplitPane } from "../../layout/SplitPane";
import { createCacheClient, type CacheClient, type CacheFetcher } from "./api";
import {
  CacheAdapterRegistry,
  createCacheRegistry,
  type CacheNodeAdapter,
} from "./adapter";
import { CacheTree } from "./CacheTree";
import { CacheDetailPanel } from "./CacheDetailPanel";
import { CacheStatsOverview } from "./CacheStatsOverview";
import type { CacheTreeNode } from "./types";

export type CacheBrowserProps = {
  /** API base the cache endpoints are mounted under, e.g. "/api/v1". */
  baseUrl?: string;
  /** Pre-built client; takes precedence over baseUrl/fetcher. */
  client?: CacheClient;
  fetcher?: CacheFetcher;
  /** Domain node adapters, or a pre-built registry. */
  adapters?: CacheNodeAdapter[] | CacheAdapterRegistry;
  /** Logical prefix the browser is rooted at; empty browses everything. */
  rootPrefix?: string;
  /** Initial left-pane width percentage. */
  defaultSplit?: number;
  className?: string;
};

/**
 * Generic cache/valkey browser: a lazy prefix tree with server-side key
 * search on the left, and on the right either the whole-keyspace stats
 * overview (nothing selected), an aggregated subtree overview (prefix
 * selected) or full key detail with adapter-pluggable value rendering (key
 * selected). Requires a react-query QueryClientProvider in the host app,
 * like TimeseriesPanel.
 */
export function CacheBrowser({
  baseUrl = "/api/v1",
  client: clientProp,
  fetcher,
  adapters,
  rootPrefix = "",
  defaultSplit = 35,
  className,
}: CacheBrowserProps) {
  const client = useMemo(
    () => clientProp ?? createCacheClient({ baseUrl, ...(fetcher ? { fetcher } : {}) }),
    [clientProp, baseUrl, fetcher],
  );
  const registry = useMemo(
    () =>
      adapters instanceof CacheAdapterRegistry
        ? adapters
        : createCacheRegistry(adapters ?? []),
    [adapters],
  );
  const [selected, setSelected] = useState<CacheTreeNode | null>(null);

  return (
    <SplitPane
      className={cn("min-h-0 flex-1", className)}
      defaultSplit={defaultSplit}
      left={
        <CacheTree
          client={client}
          registry={registry}
          rootPrefix={rootPrefix}
          selected={selected}
          onSelect={setSelected}
        />
      }
      right={
        selected ? (
          <CacheDetailPanel
            client={client}
            registry={registry}
            node={selected}
            onSelect={setSelected}
            onDeleted={() => setSelected(null)}
          />
        ) : (
          <CacheStatsOverview client={client} rootPrefix={rootPrefix} onSelect={setSelected} />
        )
      }
    />
  );
}
