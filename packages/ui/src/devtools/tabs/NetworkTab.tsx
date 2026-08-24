import { useEffect, useState } from "react";
import { Button } from "../../components/button";
import { HarPanel } from "../../data/har/HarPanel";
import { DebugClient } from "../debugClient";
import type { ExecutionSummary, HAREntry } from "../types";

/**
 * The HTTP traffic a capture rode on, given the producer it never had.
 *
 * HarPanel has shipped in this library with no data source on either side of
 * the wire. The entries here are real HAR 1.2 built by the server's own
 * collector, which is why "Export HAR" produces a file Chrome devtools opens
 * directly rather than a lookalike.
 */

export type NetworkTabProps = {
  /** The record whose traffic to show; the most recent one with entries by default. */
  record?: ExecutionSummary | undefined;
  client?: DebugClient | undefined;
  /** Pre-loaded entries, for a story or a test that has no server. */
  entries?: HAREntry[] | undefined;
  search?: string | undefined;
};

export function NetworkTab({ record, client, entries: provided, search }: NetworkTabProps) {
  const { entries, error, sensitive, loading } = useHarEntries(record, client, provided);

  if (!record && !provided) {
    return (
      <Empty>Select a capture in Queries to see the HTTP calls it made.</Empty>
    );
  }
  if (loading) return <Empty>Loading HTTP traffic…</Empty>;
  if (error) return <Empty className="text-destructive">{error}</Empty>;
  if (entries.length === 0) {
    return <Empty>This capture made no HTTP calls — its provider does not speak HTTP.</Empty>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-density-2 border-border border-b px-density-3 py-density-2">
        <span className="text-muted-foreground text-xs">
          {entries.length} request{entries.length === 1 ? "" : "s"}
          {/* Never softened: a capture taken with credential logging on is a
              different kind of file, and whoever shares it has to know. */}
          {sensitive ? " · contains credentials — do not share this export" : ""}
        </span>
        {record ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => downloadHar(record.id, client)}
          >
            Export HAR
          </Button>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <HarPanel entries={entries} {...(search !== undefined ? { search } : {})} />
      </div>
    </div>
  );
}

function Empty({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-density-6 text-center text-muted-foreground text-sm ${className ?? ""}`}>
      {children}
    </div>
  );
}

function useHarEntries(
  record: ExecutionSummary | undefined,
  client: DebugClient | undefined,
  provided: HAREntry[] | undefined,
) {
  const [entries, setEntries] = useState<HAREntry[]>(provided ?? []);
  const [sensitive, setSensitive] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (provided !== undefined) {
      setEntries(provided);
      return;
    }
    if (!record) {
      setEntries([]);
      return;
    }
    // Nothing to fetch when the summary already says there was no traffic —
    // the counts exist so a badge, and this, can skip the round trip.
    if (record.counts.harEntries === 0) {
      setEntries([]);
      setSensitive(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(undefined);
    (client ?? new DebugClient())
      .detail(record.id)
      .then((detail) => {
        if (cancelled) return;
        setEntries(detail.har?.log.entries ?? []);
        setSensitive(detail.harSensitive === true);
      })
      .catch((failure: unknown) => {
        if (!cancelled) setError(failure instanceof Error ? failure.message : String(failure));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [record, client, provided]);

  return { entries, error, sensitive, loading };
}

async function downloadHar(id: string, client?: DebugClient): Promise<void> {
  const file = await (client ?? new DebugClient()).har(id);
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${id}.har`;
  anchor.click();
  URL.revokeObjectURL(url);
}
