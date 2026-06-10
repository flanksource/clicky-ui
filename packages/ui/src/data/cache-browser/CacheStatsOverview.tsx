import { useQuery } from "@tanstack/react-query";
import { cn } from "../../lib/utils";
import { formatBytes, formatDuration, formatShort } from "../../lib/format";
import { Gauge } from "../Gauge";
import { UiClock, UiDatabase, UiMemoryStick } from "../../icons";
import { cacheQueryKeys, type CacheClient } from "./api";
import type { CacheTreeNode } from "./types";

export type CacheStatsOverviewProps = {
  client: CacheClient;
  /** Logical prefix the overview aggregates; matches the tree's rootPrefix. */
  rootPrefix?: string;
  /** Drill into a top-level prefix/key from the breakdown rows. */
  onSelect?: (node: CacheTreeNode) => void;
  className?: string;
};

/**
 * Whole-keyspace overview: server stats (memory, hit rate, uptime) plus a
 * keys-per-prefix breakdown of the top tree level. Shown when nothing is
 * selected in the browser.
 */
export function CacheStatsOverview({
  client,
  rootPrefix = "",
  onSelect,
  className,
}: CacheStatsOverviewProps) {
  const stats = useQuery({
    queryKey: cacheQueryKeys.stats(client.baseUrl),
    queryFn: () => client.stats(),
  });
  const tree = useQuery({
    queryKey: cacheQueryKeys.tree(client.baseUrl, rootPrefix),
    queryFn: () => client.tree(rootPrefix),
  });

  const s = stats.data;
  const hitTotal = (s?.hits ?? 0) + (s?.misses ?? 0);
  const nodes = tree.data?.nodes ?? [];
  const maxKeys = Math.max(1, ...nodes.map((n) => n.keys));

  return (
    <div className={cn("flex min-h-0 flex-col gap-density-3 overflow-y-auto p-density-3", className)}>
      {stats.isError && <OverviewError error={stats.error} />}
      {s?.infoError && (
        <div className="rounded-md border border-yellow-300 bg-yellow-50 px-density-3 py-density-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
          Server stats unavailable: {s.infoError}
        </div>
      )}

      <div className="flex flex-wrap gap-density-3">
        <Gauge
          label="Keys"
          icon={UiDatabase}
          value={s?.keys ?? 0}
          max={s?.keys ?? 0}
          suffix=""
          subtitle={s?.keysTruncated ? "lower bound (scan capped)" : undefined}
          meta={formatShort(s?.keys)}
        />
        {!!s?.usedMemoryBytes && (
          <Gauge
            label="Memory"
            icon={UiMemoryStick}
            value={s.usedMemoryBytes}
            max={s.maxMemoryBytes || s.usedMemoryBytes}
            suffix=""
            tone={memoryTone(s.usedMemoryBytes, s.maxMemoryBytes)}
            subtitle={s.maxMemoryBytes ? `of ${formatBytes(s.maxMemoryBytes)}` : "no maxmemory"}
            meta={formatBytes(s.usedMemoryBytes)}
          />
        )}
        {hitTotal > 0 && (
          <Gauge
            label="Hit rate"
            value={Math.round(((s?.hits ?? 0) / hitTotal) * 100)}
            subtitle={`${formatShort(s?.hits)} hits / ${formatShort(s?.misses)} misses`}
            meta={s?.evictedKeys ? `${formatShort(s.evictedKeys)} evicted` : undefined}
          />
        )}
        {!!s?.uptimeSeconds && (
          <Gauge
            label="Uptime"
            icon={UiClock}
            value={s.uptimeSeconds}
            max={s.uptimeSeconds}
            suffix=""
            subtitle={s.version ? `v${s.version}` : undefined}
            meta={formatDuration(s.uptimeSeconds, { from: "s" })}
          />
        )}
      </div>

      <div>
        <h3 className="mb-density-2 text-sm font-semibold">
          Keys by prefix{tree.data?.truncated ? " (truncated)" : ""}
        </h3>
        {tree.isError && <OverviewError error={tree.error} />}
        {tree.isLoading && <div className="text-sm text-muted-foreground">Loading keys…</div>}
        <div className="flex flex-col">
          {nodes.map((node) => (
            <button
              key={node.prefix ?? node.key ?? node.name}
              type="button"
              onClick={() => onSelect?.(node)}
              className="grid grid-cols-[minmax(0,14rem)_minmax(0,1fr)_4rem] items-center gap-density-3 rounded px-density-2 py-density-1 text-left text-sm hover:bg-accent"
            >
              <span className="truncate font-mono text-xs">{node.name}</span>
              <span className="h-2 overflow-hidden rounded bg-muted">
                <span
                  className="block h-full bg-primary/60"
                  style={{ width: `${(node.keys / maxKeys) * 100}%` }}
                />
              </span>
              <span className="text-right text-xs text-muted-foreground">
                {formatShort(node.keys)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function memoryTone(used: number, max?: number) {
  if (!max) return "neutral" as const;
  const pct = used / max;
  if (pct >= 0.9) return "danger" as const;
  if (pct >= 0.75) return "warning" as const;
  return "success" as const;
}

function OverviewError({ error }: { error: unknown }) {
  return (
    <div className="rounded-md border border-red-300 bg-red-50 px-density-3 py-density-2 text-xs text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
      {error instanceof Error ? error.message : String(error)}
    </div>
  );
}
