// Node adapters let a host plug domain-specific value rendering into the
// cache browser without forking it — e.g. render `schema:`-prefixed keys with
// a schema viewer or `task-snapshot:` keys with a task panel. An adapter
// claims nodes via `match` (typically by key prefix or value kind) and
// contributes detail rendering. The registry resolves the first matching
// adapter; nodes with no match fall back to the built-in type-aware value
// rendering. Mirrors the test-runner TestNodeAdapter contract.

import type { ReactNode } from "react";
import type { CacheClient } from "./api";
import type { CacheKeyDetail, CacheTreeNode } from "./types";

export type CacheAdapterContext = {
  node: CacheTreeNode;
  /** Loaded key detail; null while loading or for prefix groups. */
  detail: CacheKeyDetail | null;
  client: CacheClient;
};

export type CacheDetailTab = {
  id: string;
  label: string;
  render: () => ReactNode;
};

export type CacheNodeAdapter = {
  /** Stable identifier, used as a React key and for debugging. */
  id: string;
  /** Claim the node. The first registered adapter to return true wins per surface. */
  match: (node: CacheTreeNode, detail: CacheKeyDetail | null) => boolean;
  /** Primary value body for the key, replacing the default type-aware rendering. */
  renderDetail?: (c: CacheAdapterContext) => ReactNode;
  /** Extra detail tabs, merged (in registration order) across all matching adapters. */
  detailTabs?: (c: CacheAdapterContext) => CacheDetailTab[];
  /** Replace the leading icon on the node's tree row. */
  renderRowIcon?: (c: CacheAdapterContext) => ReactNode;
};

/**
 * Ordered set of node adapters. First match wins per surface; `detailTabs`
 * merge across every matching adapter so independent adapters can each
 * contribute a tab.
 */
export class CacheAdapterRegistry {
  readonly adapters: CacheNodeAdapter[];

  constructor(adapters: CacheNodeAdapter[] = []) {
    this.adapters = adapters;
  }

  private firstWith(
    node: CacheTreeNode,
    detail: CacheKeyDetail | null,
    has: (a: CacheNodeAdapter) => boolean,
  ): CacheNodeAdapter | null {
    for (const a of this.adapters) {
      if (has(a) && a.match(node, detail)) return a;
    }
    return null;
  }

  /** Adapter whose `renderDetail` should drive the value body, or null for the default. */
  resolveDetail(node: CacheTreeNode, detail: CacheKeyDetail | null): CacheNodeAdapter | null {
    return this.firstWith(node, detail, (a) => !!a.renderDetail);
  }

  resolveRowIcon(node: CacheTreeNode, detail: CacheKeyDetail | null): CacheNodeAdapter | null {
    return this.firstWith(node, detail, (a) => !!a.renderRowIcon);
  }

  /** Merge `detailTabs` from every matching adapter, de-duplicated by tab id. */
  resolveTabs(ctx: CacheAdapterContext): CacheDetailTab[] {
    const seen = new Set<string>();
    const tabs: CacheDetailTab[] = [];
    for (const a of this.adapters) {
      if (!a.detailTabs || !a.match(ctx.node, ctx.detail)) continue;
      for (const tab of a.detailTabs(ctx)) {
        if (seen.has(tab.id)) continue;
        seen.add(tab.id);
        tabs.push(tab);
      }
    }
    return tabs;
  }
}

export function createCacheRegistry(adapters: CacheNodeAdapter[] = []): CacheAdapterRegistry {
  return new CacheAdapterRegistry(adapters);
}

/**
 * Convenience adapter matching leaf keys by logical prefix, e.g.
 * `prefixAdapter("schemas", "schema:", (c) => <SchemaView .../>)`.
 */
export function prefixAdapter(
  id: string,
  prefix: string,
  renderDetail: (c: CacheAdapterContext) => ReactNode,
): CacheNodeAdapter {
  return {
    id,
    match: (node) => !!node.key && node.key.startsWith(prefix),
    renderDetail,
  };
}
