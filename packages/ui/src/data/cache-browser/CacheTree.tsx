import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "../../lib/utils";
import { formatBytes, formatDuration, formatShort } from "../../lib/format";
import { Icon, type StaticIconComponent } from "../Icon";
import {
  UiBraces,
  UiClose,
  UiFileText,
  UiFolder,
  UiKey,
  UiLayers,
  UiListFlat,
  UiSearch,
  UiTag,
} from "../../icons";
import { Tree } from "../Tree";
import { cacheQueryKeys, type CacheClient } from "./api";
import type { CacheAdapterRegistry } from "./adapter";
import { isLeaf, type CacheTreeNode } from "./types";

const typeIcons: Record<string, StaticIconComponent> = {
  string: UiFileText,
  hash: UiBraces,
  list: UiListFlat,
  set: UiTag,
  zset: UiLayers,
};

export type CacheTreeProps = {
  client: CacheClient;
  registry: CacheAdapterRegistry;
  /** Logical prefix the tree is rooted at; empty browses the whole keyspace. */
  rootPrefix?: string;
  selected: CacheTreeNode | null;
  onSelect: (node: CacheTreeNode | null) => void;
  className?: string;
};

/**
 * Lazy key tree over the cache-browser tree endpoint, with a server-side
 * substring search that swaps the tree for a flat result list while active.
 * (The tree's own toolbar filter still narrows already-loaded nodes.)
 */
export function CacheTree({
  client,
  registry,
  rootPrefix = "",
  selected,
  onSelect,
  className,
}: CacheTreeProps) {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const handle = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const root = useQuery({
    queryKey: cacheQueryKeys.tree(client.baseUrl, rootPrefix),
    queryFn: () => client.tree(rootPrefix),
  });

  const searchResults = useQuery({
    queryKey: cacheQueryKeys.search(client.baseUrl, search),
    queryFn: () => client.search(search),
    enabled: search.length > 0,
  });

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <label className="m-density-2 flex items-center gap-2 rounded-md border border-border bg-background px-2 py-1 text-xs shadow-sm">
        <Icon icon={UiSearch} className="text-xs text-muted-foreground" />
        <input
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search keys"
          aria-label="Search cache keys"
          className="h-5 w-full border-0 bg-transparent p-0 text-xs outline-none placeholder:text-muted-foreground"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput("")}
            aria-label="Clear key search"
            className="inline-flex items-center rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Icon icon={UiClose} className="text-xs" />
          </button>
        )}
      </label>

      {root.isError && <QueryError error={root.error} />}

      {search ? (
        <SearchResults
          nodes={searchResults.data?.keys ?? []}
          truncated={searchResults.data?.truncated ?? false}
          loading={searchResults.isLoading}
          error={searchResults.isError ? searchResults.error : null}
          registry={registry}
          client={client}
          selected={selected}
          onSelect={onSelect}
        />
      ) : (
        <Tree<CacheTreeNode>
          roots={root.data?.nodes ?? []}
          className="min-h-0 flex-1"
          empty={
            <div className="px-3 py-4 text-sm text-muted-foreground">
              {root.isLoading ? "Loading keys…" : "No keys found."}
            </div>
          }
          getKey={(node) => node.prefix ?? node.key ?? node.name}
          getChildren={() => undefined}
          hasMoreChildren={(node) => !isLeaf(node)}
          loadChildren={async (node) => (await client.tree(node.prefix ?? "")).nodes}
          selected={selected}
          onSelect={onSelect}
          defaultOpen={() => false}
          getSearchText={(node) => node.name}
          renderRow={({ node, selected: isSelected, error }) => (
            <CacheNodeRow
              node={node}
              selected={isSelected}
              error={error}
              registry={registry}
              client={client}
            />
          )}
        />
      )}
    </div>
  );
}

function SearchResults({
  nodes,
  truncated,
  loading,
  error,
  registry,
  client,
  selected,
  onSelect,
}: {
  nodes: CacheTreeNode[];
  truncated: boolean;
  loading: boolean;
  error: unknown;
  registry: CacheAdapterRegistry;
  client: CacheClient;
  selected: CacheTreeNode | null;
  onSelect: (node: CacheTreeNode) => void;
}) {
  if (error) return <QueryError error={error} />;
  if (loading) {
    return <div className="px-3 py-4 text-sm text-muted-foreground">Searching…</div>;
  }
  if (nodes.length === 0) {
    return <div className="px-3 py-4 text-sm text-muted-foreground">No matching keys.</div>;
  }
  return (
    <div className="min-h-0 flex-1 overflow-auto" role="listbox" aria-label="Matching cache keys">
      {truncated && (
        <div className="px-3 py-1 text-xs text-muted-foreground">
          Showing the first {nodes.length} matches — refine the search to narrow down.
        </div>
      )}
      {nodes.map((node) => (
        <button
          key={node.key ?? node.name}
          type="button"
          role="option"
          aria-selected={selected?.key === node.key}
          onClick={() => onSelect(node)}
          className={cn(
            "flex w-full items-center gap-1.5 px-2 py-1 text-left text-sm",
            selected?.key === node.key
              ? "border-l-2 border-primary bg-primary/10"
              : "hover:bg-accent",
          )}
        >
          <CacheNodeRow node={node} selected={selected?.key === node.key} registry={registry} client={client} />
        </button>
      ))}
    </div>
  );
}

/** Shared row body: adapter icon (or type/folder icon), name and size hints. */
export function CacheNodeRow({
  node,
  selected: _selected,
  error,
  registry,
  client,
}: {
  node: CacheTreeNode;
  selected: boolean;
  error?: unknown;
  registry: CacheAdapterRegistry;
  client: CacheClient;
}) {
  const adapter = registry.resolveRowIcon(node, null);
  const icon = adapter ? (
    adapter.renderRowIcon!({ node, detail: null, client })
  ) : (
    <Icon
      icon={isLeaf(node) ? (typeIcons[node.type ?? ""] ?? UiKey) : UiFolder}
      className="shrink-0 text-xs text-muted-foreground"
    />
  );
  return (
    <span className="flex min-w-0 flex-1 items-center gap-1.5">
      {icon}
      <span className="truncate font-mono text-xs">{node.name}</span>
      {!isLeaf(node) && (
        <span className="ml-auto shrink-0 rounded-full bg-muted px-1.5 text-[10px] text-muted-foreground">
          {formatShort(node.keys)}
        </span>
      )}
      {isLeaf(node) && (
        <span className="ml-auto flex shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
          {node.bytes ? <span>{formatBytes(node.bytes)}</span> : null}
          {node.ttlSeconds !== undefined && node.ttlSeconds >= 0 && (
            <span>ttl {formatDuration(node.ttlSeconds, { from: "s" })}</span>
          )}
        </span>
      )}
      {error != null && (
        <span className="shrink-0 text-[10px] text-red-600 dark:text-red-400">
          load failed
        </span>
      )}
    </span>
  );
}

function QueryError({ error }: { error: unknown }) {
  return (
    <div className="m-density-2 rounded-md border border-red-300 bg-red-50 px-density-3 py-density-2 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      {error instanceof Error ? error.message : String(error)}
    </div>
  );
}
