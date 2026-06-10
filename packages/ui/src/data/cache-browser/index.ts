// Public surface of the cache-browser component family. Re-exported from
// ../../data.ts so consumers import from "@flanksource/clicky-ui" or "/data".

export { CacheBrowser, type CacheBrowserProps } from "./CacheBrowser";
export { CacheTree, CacheNodeRow, type CacheTreeProps } from "./CacheTree";
export { CacheDetailPanel, type CacheDetailPanelProps } from "./CacheDetailPanel";
export { CacheStatsOverview, type CacheStatsOverviewProps } from "./CacheStatsOverview";
export { CacheValue } from "./CacheValue";

export {
  createCacheClient,
  cacheQueryKeys,
  type CacheClient,
  type CacheFetcher,
  type CreateCacheClientOptions,
} from "./api";

export {
  CacheAdapterRegistry,
  createCacheRegistry,
  prefixAdapter,
  type CacheNodeAdapter,
  type CacheAdapterContext,
  type CacheDetailTab,
} from "./adapter";

export {
  isLeaf,
  type CacheTreeNode,
  type CacheTreeResponse,
  type CacheKeyDetail,
  type CacheScoredMember,
  type CacheSearchResponse,
  type CacheStats,
  type CacheDeleteResponse,
} from "./types";
