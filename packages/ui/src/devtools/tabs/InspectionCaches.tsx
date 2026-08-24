import { useCallback, useEffect, useState } from "react";
import { Button } from "../../components/button";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import { DebugClient } from "../debugClient";
import type { InspectionCacheStats } from "../types";

/**
 * The controls for the metadata caches: what the server is holding, and the two
 * ways to make it stop.
 *
 * The two are not interchangeable and the wording says so. **Rebuild on every
 * request** costs the caller who asked and leaves everyone else reading the
 * cache; **flush** drops the entry for every request that follows. One is a way
 * to check your own page, the other is an intervention on a running server, and
 * a console that presented them as the same button would invite the second when
 * the first was meant.
 */

export type InspectionCachesProps = {
  client?: DebugClient | undefined;
  /** Rebuild every metadata lookup on subsequent requests. */
  refreshInspection: boolean;
  onRefreshInspectionChange: (refresh: boolean) => void;
  /** Pre-loaded rows, for a story or a test that has no server. */
  caches?: InspectionCacheStats[] | undefined;
};

type CacheRow = Record<string, unknown> & InspectionCacheStats & { id: string };

export function InspectionCaches({
  client,
  refreshInspection,
  onRefreshInspectionChange,
  caches: provided,
}: InspectionCachesProps) {
  const { caches, error, reload } = useCaches(client, provided);
  const [flushing, setFlushing] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<string | undefined>();

  const flush = useCallback(
    async (policy?: string) => {
      setFlushing(policy ?? "*");
      setOutcome(undefined);
      try {
        const result = await (client ?? new DebugClient()).flushInspection(
          policy ? { policy } : {},
        );
        // Stated either way. An empty flush and a broken one look identical
        // without the count, and the operator would conclude the second.
        setOutcome(
          result.entries === 0
            ? "Nothing was cached to drop."
            : `Dropped ${result.entries} ${result.entries === 1 ? "entry" : "entries"} from ${result.caches.length} ${result.caches.length === 1 ? "cache" : "caches"}.`,
        );
        await reload();
      } catch (failure: unknown) {
        setOutcome(failure instanceof Error ? failure.message : String(failure));
      } finally {
        setFlushing(null);
      }
    },
    [client, reload],
  );

  const columns: DataTableColumn<CacheRow>[] = [
    { key: "policy", label: "Cache", grow: true, minWidth: 200 },
    {
      key: "entries",
      label: "Entries",
      align: "right",
      shrink: true,
      render: (value, row) => `${Number(value ?? 0)} / ${row.maxEntries}`,
      sortValue: (value) => Number(value ?? 0),
    },
    {
      key: "filling",
      label: "Filling",
      align: "right",
      shrink: true,
      // Blank rather than "0": a column of zeros with one occasional 1 buries
      // the only value that means anything here.
      render: (value) => (Number(value ?? 0) > 0 ? String(value) : ""),
    },
    {
      key: "freshForSeconds",
      label: "Fresh for",
      align: "right",
      shrink: true,
      render: (value) => formatDuration(Number(value ?? 0)),
      sortValue: (value) => Number(value ?? 0),
    },
    {
      key: "id",
      label: "",
      shrink: true,
      render: (_value, row) => (
        <Button
          size="sm"
          variant="ghost"
          disabled={flushing !== null || row.entries === 0}
          onClick={() => void flush(row.policy)}
        >
          {flushing === row.policy ? "Flushing…" : "Flush"}
        </Button>
      ),
    },
  ];

  const held = caches.reduce((total, cache) => total + cache.entries, 0);

  return (
    <section className="flex flex-col gap-density-2">
      <div className="flex flex-wrap items-center justify-between gap-density-2">
        <h3 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
          Metadata caches
        </h3>
        <div className="flex items-center gap-density-3">
          <label className="flex items-center gap-density-1 text-xs">
            <input
              type="checkbox"
              checked={refreshInspection}
              onChange={(event) => onRefreshInspectionChange(event.target.checked)}
            />
            <span title="Every request this console arms rebuilds the metadata it reads, instead of using the cache. Costs only your requests.">
              Rebuild on every request
            </span>
          </label>
          <Button
            size="sm"
            variant="outline"
            disabled={flushing !== null || held === 0}
            onClick={() => void flush()}
            title="Drops cached metadata for every request that follows, not just yours."
          >
            {flushing === "*" ? "Flushing…" : "Flush all"}
          </Button>
        </div>
      </div>

      {refreshInspection ? (
        <p className="text-muted-foreground text-xs">
          Rebuilding on every request. Pages will be slower until this is switched off — it is
          dropped automatically when the console closes.
        </p>
      ) : null}
      {outcome ? <p className="text-muted-foreground text-xs">{outcome}</p> : null}
      {error ? <p className="text-destructive text-xs">{error}</p> : null}

      <DataTable<CacheRow>
        data={caches.map((cache) => ({ ...cache, id: cache.policy }))}
        columns={columns}
        emptyMessage="This server registered no metadata caches."
      />
    </section>
  );
}

function useCaches(client: DebugClient | undefined, provided: InspectionCacheStats[] | undefined) {
  const [caches, setCaches] = useState<InspectionCacheStats[]>(provided ?? []);
  const [error, setError] = useState<string | undefined>();

  const reload = useCallback(async () => {
    if (provided !== undefined) return;
    try {
      setCaches((await (client ?? new DebugClient()).inspection()).caches);
      setError(undefined);
    } catch (failure: unknown) {
      setError(failure instanceof Error ? failure.message : String(failure));
    }
  }, [client, provided]);

  useEffect(() => {
    if (provided !== undefined) {
      setCaches(provided);
      return;
    }
    void reload();
  }, [provided, reload]);

  return { caches, error, reload };
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  if (seconds < 86_400) return `${Math.round(seconds / 3600)}h`;
  return `${Math.round(seconds / 86_400)}d`;
}
