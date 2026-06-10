import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { cn } from "../../lib/utils";
import { formatBytes, formatDuration, formatShort } from "../../lib/format";
import { Icon } from "../Icon";
import { UiFolder, UiRefresh, UiTrash } from "../../icons";
import { KeyValueList } from "../KeyValueList";
import { TabButton } from "../TabButton";
import { Section } from "../../layout/Section";
import { cacheQueryKeys, type CacheClient } from "./api";
import type { CacheAdapterRegistry } from "./adapter";
import { CacheValue } from "./CacheValue";
import { isLeaf, type CacheTreeNode } from "./types";

export type CacheDetailPanelProps = {
  client: CacheClient;
  registry: CacheAdapterRegistry;
  node: CacheTreeNode;
  /** Called after the node (key or whole prefix) was deleted. */
  onDeleted?: (node: CacheTreeNode) => void;
  /** Drill into a child prefix/key from the subtree overview. */
  onSelect?: (node: CacheTreeNode) => void;
  className?: string;
};

/**
 * Right-hand pane of the cache browser: full key detail (metadata + adapter
 * or type-aware value rendering) for leaves, an aggregated subtree overview
 * for prefix groups.
 */
export function CacheDetailPanel(props: CacheDetailPanelProps) {
  return isLeaf(props.node) ? <KeyPanel {...props} /> : <PrefixPanel {...props} />;
}

function KeyPanel({ client, registry, node, onDeleted, className }: CacheDetailPanelProps) {
  const queryClient = useQueryClient();
  const key = node.key!;
  const detail = useQuery({
    queryKey: cacheQueryKeys.key(client.baseUrl, key),
    queryFn: () => client.key(key),
  });
  const [activeTab, setActiveTab] = useState("value");

  const ctx = { node, detail: detail.data ?? null, client };
  const adapter = registry.resolveDetail(node, detail.data ?? null);
  const tabs = registry.resolveTabs(ctx);

  const remove = async () => {
    if (!window.confirm(`Delete key ${key}?`)) return;
    await client.deleteKey(key);
    await queryClient.invalidateQueries({ queryKey: cacheQueryKeys.all(client.baseUrl) });
    onDeleted?.(node);
  };

  return (
    <div className={cn("flex min-h-0 flex-col gap-density-3 overflow-y-auto p-density-3", className)}>
      <PanelHeader
        title={key}
        onRefresh={() => detail.refetch()}
        onDelete={remove}
        deleteLabel="Delete key"
      />
      {detail.isError && <PanelError error={detail.error} />}
      {detail.data && (
        <>
          <KeyValueList
            items={[
              { key: "type", label: "Type", value: <code>{detail.data.type}</code> },
              {
                key: "ttl",
                label: "TTL",
                value:
                  detail.data.ttlSeconds < 0
                    ? "none"
                    : formatDuration(detail.data.ttlSeconds, { from: "s" }),
              },
              {
                key: "bytes",
                label: "Memory",
                value: formatBytes(detail.data.bytes),
                hidden: !detail.data.bytes,
              },
              { key: "length", label: "Length", value: formatShort(detail.data.length) },
            ]}
          />
          {tabs.length > 0 && (
            <div role="tablist" className="flex flex-wrap items-center gap-1">
              <TabButton
                active={activeTab === "value"}
                onClick={() => setActiveTab("value")}
                label="Value"
              />
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  active={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  label={tab.label}
                />
              ))}
            </div>
          )}
          {activeTab === "value"
            ? (adapter?.renderDetail?.(ctx) ?? <CacheValue detail={detail.data} />)
            : tabs.find((t) => t.id === activeTab)?.render()}
        </>
      )}
      {detail.isLoading && <div className="text-sm text-muted-foreground">Loading key…</div>}
    </div>
  );
}

function PrefixPanel({ client, node, onDeleted, onSelect, className }: CacheDetailPanelProps) {
  const queryClient = useQueryClient();
  const prefix = node.prefix ?? "";
  const subtree = useQuery({
    queryKey: cacheQueryKeys.tree(client.baseUrl, prefix),
    queryFn: () => client.tree(prefix),
  });

  const remove = async () => {
    const count = subtree.data?.keys ?? node.keys;
    if (!window.confirm(`Delete all ${count} keys under ${prefix}?`)) return;
    await client.deletePrefix(prefix);
    await queryClient.invalidateQueries({ queryKey: cacheQueryKeys.all(client.baseUrl) });
    onDeleted?.(node);
  };

  const children = subtree.data?.nodes ?? [];
  const maxKeys = Math.max(1, ...children.map((c) => c.keys));

  return (
    <div className={cn("flex min-h-0 flex-col gap-density-3 overflow-y-auto p-density-3", className)}>
      <PanelHeader
        title={
          <span className="inline-flex items-center gap-1.5">
            <Icon icon={UiFolder} className="text-muted-foreground" />
            {prefix}
          </span>
        }
        onRefresh={() => subtree.refetch()}
        onDelete={remove}
        deleteLabel="Delete prefix"
      />
      {subtree.isError && <PanelError error={subtree.error} />}
      {subtree.data && (
        <Section
          title={`${formatShort(subtree.data.keys)} keys${subtree.data.truncated ? "+" : ""}`}
          summary={`${children.length} children`}
        >
          <div className="flex flex-col">
            {children.map((child) => (
              <button
                key={child.prefix ?? child.key ?? child.name}
                type="button"
                onClick={() => onSelect?.(child)}
                className="grid grid-cols-[minmax(0,14rem)_minmax(0,1fr)_4rem] items-center gap-density-3 rounded px-density-2 py-density-1 text-left text-sm hover:bg-accent"
              >
                <span className="truncate font-mono text-xs">{child.name}</span>
                <span className="h-2 overflow-hidden rounded bg-muted">
                  <span
                    className="block h-full bg-primary/60"
                    style={{ width: `${(child.keys / maxKeys) * 100}%` }}
                  />
                </span>
                <span className="text-right text-xs text-muted-foreground">
                  {formatShort(child.keys)}
                </span>
              </button>
            ))}
          </div>
        </Section>
      )}
      {subtree.isLoading && <div className="text-sm text-muted-foreground">Loading prefix…</div>}
    </div>
  );
}

function PanelHeader({
  title,
  onRefresh,
  onDelete,
  deleteLabel,
}: {
  title: React.ReactNode;
  onRefresh: () => void;
  onDelete: () => void;
  deleteLabel: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <h3 className="min-w-0 flex-1 truncate font-mono text-sm font-semibold">{title}</h3>
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh"
        title="Refresh"
        className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Icon icon={UiRefresh} className="text-sm" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label={deleteLabel}
        title={deleteLabel}
        className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Icon icon={UiTrash} className="text-sm" />
      </button>
    </div>
  );
}

function PanelError({ error }: { error: unknown }) {
  return (
    <div className="rounded-md border border-red-300 bg-red-50 px-density-3 py-density-2 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      {error instanceof Error ? error.message : String(error)}
    </div>
  );
}
