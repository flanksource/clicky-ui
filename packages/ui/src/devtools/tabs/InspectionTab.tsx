import { useEffect, useState } from "react";
import { Button } from "../../components/button";
import { DataTable, type DataTableColumn } from "../../data/DataTable";
import {
  DebugClient,
  type ManualInspectionRequest,
} from "../debugClient";
import type { QueryBrowserDiagnostics } from "../../data/query-browser/QueryBrowser.types";
import type {
  CardinalityProbe,
  ExecutionDetail,
  ExecutionSummary,
  InspectionCacheStats,
  InspectionRecord,
} from "../types";
import { InspectionCaches } from "./InspectionCaches";

/**
 * What the request paid to describe its own columns.
 *
 * Two questions live here, and both are otherwise unanswerable from outside the
 * server. "Why did opening this profile take four seconds once and 200ms
 * after?" is the cache table: a miss pays the whole fill, a hit pays nothing,
 * and the elapsed column is the difference. "Why is this column a free-text box
 * instead of a dropdown?" is the probe table: a distinct count above the lookup
 * limit is the entire reason, and reading the provider's source was previously
 * the only way to learn it.
 */

export type InspectionTabProps = {
  record?: ExecutionSummary | undefined;
  client?: DebugClient | undefined;
  /** Pre-loaded rows, for a story or a test that has no server. */
  inspections?: InspectionRecord[] | undefined;
  probes?: CardinalityProbe[] | undefined;
  /** Rebuild every metadata lookup on subsequent requests. */
  refreshInspection?: boolean | undefined;
  onRefreshInspectionChange?: ((refresh: boolean) => void) | undefined;
  /** Pre-loaded cache stats, for a story or a test that has no server. */
  caches?: InspectionCacheStats[] | undefined;
};

type CacheRow = Record<string, unknown> & InspectionRecord & { id: string };
type ProbeRow = Record<string, unknown> & CardinalityProbe & { id: string };

const CACHE_COLUMNS: DataTableColumn<CacheRow>[] = [
  { key: "policy", label: "Cache", shrink: true, minWidth: 180, filterable: true },
  {
    key: "cached",
    label: "Result",
    shrink: true,
    minWidth: 90,
    filterable: true,
    render: (value) => (value === true ? "hit" : "miss"),
  },
  {
    key: "elapsedMs",
    label: "Waited",
    align: "right",
    shrink: true,
    render: (value) => `${Number(value ?? 0).toFixed(1)}ms`,
    sortValue: (value) => Number(value ?? 0),
  },
  {
    key: "ageMs",
    label: "Age",
    align: "right",
    shrink: true,
    render: (value) => formatAge(Number(value ?? 0)),
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "state", label: "State", shrink: true, minWidth: 80 },
  {
    key: "refreshError",
    label: "Note",
    grow: true,
    render: (value, row) => row.error || String(value ?? ""),
  },
];

const PROBE_COLUMNS: DataTableColumn<ProbeRow>[] = [
  { key: "column", label: "Column", shrink: true, minWidth: 160 },
  { key: "field", label: "Field", shrink: true, minWidth: 160 },
  { key: "distinct", label: "Distinct", align: "right", shrink: true },
  { key: "limit", label: "Limit", align: "right", shrink: true },
  {
    key: "kind",
    label: "Chose",
    shrink: true,
    minWidth: 110,
    // An empty kind means the count came back under the limit and nothing had
    // to change — which is an answer, so it is spelled out rather than blank.
    render: (value) => (String(value ?? "") === "" ? "left as-is" : String(value)),
  },
  {
    key: "cached",
    label: "Counted",
    shrink: true,
    minWidth: 90,
    render: (value) => (value === true ? "from cache" : "this run"),
  },
];

export function InspectionTab({
  record,
  client,
  inspections,
  probes,
  refreshInspection = false,
  onRefreshInspectionChange,
  caches,
}: InspectionTabProps) {
  const loaded = useInspection(record, client, inspections, probes);
  const [manualDetail, setManualDetail] = useState<ExecutionDetail | undefined>();

  useEffect(() => setManualDetail(undefined), [record?.id]);

  const displayedInspections = manualDetail?.inspections ?? loaded.inspections;
  const displayedProbes = manualDetail?.probes ?? loaded.probes;

  return (
    // Three sections stacked, so this scrolls as one region rather than
    // bounding each table separately — a five-row list with its own scrollbar
    // reads as truncated when it is complete.
    <div className="flex h-full min-h-0 flex-col gap-density-4 overflow-auto p-density-3">
      {/* Always first, and always present: the caches are the server's state,
          not the selected capture's, so they are worth reading — and flushable —
          even before anything has run. */}
      <InspectionCaches
        {...(client ? { client } : {})}
        refreshInspection={refreshInspection}
        onRefreshInspectionChange={onRefreshInspectionChange ?? (() => undefined)}
        {...(caches !== undefined ? { caches } : {})}
      />

      <ManualInspection
        record={record}
        operations={loaded.operations}
        client={client}
        onComplete={setManualDetail}
      />

      {loaded.error ? <Empty className="text-destructive">{loaded.error}</Empty> : null}
      {!loaded.error && displayedInspections.length === 0 && displayedProbes.length === 0 ? (
        <Empty>
          {record
            ? "This capture looked nothing up — every column it needed was already described."
            : "Select a capture in Queries to see the metadata it looked up."}
        </Empty>
      ) : null}

      {displayedInspections.length > 0 ? (
        <section>
          <Heading>Metadata cache</Heading>
          <DataTable<CacheRow>
            data={displayedInspections.map((row, index) => ({
              ...row,
              id: `${row.key}-${index}`,
            }))}
            columns={CACHE_COLUMNS}
            emptyMessage="No cache lookups"
          />
        </section>
      ) : null}

      {displayedProbes.length > 0 ? (
        <section>
          <Heading>Column cardinality</Heading>
          <DataTable<ProbeRow>
            data={displayedProbes.map((row, index) => ({
              ...row,
              id: `${row.column}-${index}`,
            }))}
            columns={PROBE_COLUMNS}
            emptyMessage="No cardinality probes"
          />
        </section>
      ) : null}
    </div>
  );
}

function ManualInspection({
  record,
  operations,
  client,
  onComplete,
}: {
  record: ExecutionSummary | undefined;
  operations: QueryBrowserDiagnostics[];
  client: DebugClient | undefined;
  onComplete: (detail: ExecutionDetail) => void;
}) {
  const [selected, setSelected] = useState(0);
  const [columns, setColumns] = useState("");
  const [refresh, setRefresh] = useState(true);
  const [running, setRunning] = useState(false);
  const [outcome, setOutcome] = useState<string | undefined>();

  useEffect(() => {
    setSelected(0);
    setColumns("");
    setOutcome(undefined);
  }, [record?.id]);

  const operation = operations[selected];
  if (!record) {
    return (
      <section>
        <Heading>Run inspection</Heading>
        <p className="text-muted-foreground text-sm">
          Select a capture first; its provider request supplies the connection and query.
        </p>
      </section>
    );
  }
  if (!operation) {
    return (
      <section>
        <Heading>Run inspection</Heading>
        <p className="text-muted-foreground text-sm">
          This capture has no provider operation that can be inspected.
        </p>
      </section>
    );
  }

  const query = operation.request.rendered || operation.request.query || "";
  const connection = operation.request.connection;
  const request: ManualInspectionRequest = {
    provider: operation.provider,
    ...(connection ? { connection } : {}),
    query,
    ...(operation.request.options ? { options: operation.request.options } : {}),
    columns: parseColumns(columns),
    refresh,
  };

  const run = async () => {
    setRunning(true);
    setOutcome(undefined);
    try {
      const detail = await (client ?? new DebugClient()).runInspection(request);
      onComplete(detail);
      const failure = detail.summary.error ?? detail.operations?.find((item) => item.error)?.error;
      setOutcome(
        failure
          ? `Inspection completed with an error: ${failure}`
          : `Inspection ${detail.summary.id} completed.`,
      );
    } catch (failure: unknown) {
      setOutcome(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className="flex flex-col gap-density-2 rounded border border-border p-density-3">
      <div className="flex flex-wrap items-center justify-between gap-density-2">
        <Heading>Run inspection</Heading>
        <span className="text-muted-foreground text-xs">
          {operation.provider} · {connection || "inline connection"}
        </span>
      </div>
      {operations.length > 1 ? (
        <label className="grid gap-density-1 text-xs">
          <span className="text-muted-foreground">Provider operation</span>
          <select
            className="rounded border border-border bg-background px-density-2 py-density-1"
            value={selected}
            onChange={(event) => setSelected(Number(event.target.value))}
          >
            {operations.map((item, index) => (
              <option key={`${item.provider}-${index}`} value={index}>
                {index + 1}. {item.provider} · {item.request.connection || "inline connection"}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <label className="grid gap-density-1 text-xs">
        <span className="text-muted-foreground">Columns to inspect</span>
        <input
          aria-label="Columns to inspect"
          className="rounded border border-border bg-background px-density-2 py-density-1 font-mono"
          value={columns}
          placeholder="Auto-detect, or enter comma-separated names"
          onChange={(event) => setColumns(event.target.value)}
        />
      </label>
      <code className="max-h-20 overflow-auto whitespace-pre-wrap rounded bg-muted/40 p-density-2 text-xs">
        {query}
      </code>
      <div className="flex flex-wrap items-center justify-between gap-density-2">
        <label className="flex items-center gap-density-1 text-xs">
          <input
            type="checkbox"
            checked={refresh}
            onChange={(event) => setRefresh(event.target.checked)}
          />
          Refresh cached metadata
        </label>
        <Button size="sm" disabled={running || query === ""} onClick={() => void run()}>
          {running ? "Running inspection…" : "Run inspection"}
        </Button>
      </div>
      {outcome ? (
        <p className={outcome.includes("error") ? "text-destructive text-xs" : "text-muted-foreground text-xs"}>
          {outcome}
        </p>
      ) : null}
    </section>
  );
}

function parseColumns(value: string): string[] {
  return [...new Set(value.split(",").map((column) => column.trim()).filter(Boolean))];
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-density-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
      {children}
    </h3>
  );
}

function Empty({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`p-density-6 text-center text-muted-foreground text-sm ${className ?? ""}`}>
      {children}
    </div>
  );
}

function useInspection(
  record: ExecutionSummary | undefined,
  client: DebugClient | undefined,
  providedInspections: InspectionRecord[] | undefined,
  providedProbes: CardinalityProbe[] | undefined,
) {
  const [inspections, setInspections] = useState<InspectionRecord[]>(providedInspections ?? []);
  const [probes, setProbes] = useState<CardinalityProbe[]>(providedProbes ?? []);
  const [operations, setOperations] = useState<QueryBrowserDiagnostics[]>(
    summaryOperations(record),
  );
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (providedInspections !== undefined || providedProbes !== undefined) {
      setInspections(providedInspections ?? []);
      setProbes(providedProbes ?? []);
      setOperations(summaryOperations(record));
      return;
    }
    if (!record) {
      setInspections([]);
      setProbes([]);
      setOperations([]);
      return;
    }
    let cancelled = false;
    setError(undefined);
    setInspections([]);
    setProbes([]);
    setOperations(summaryOperations(record));
    (client ?? new DebugClient())
      .detail(record.id)
      .then((detail) => {
        if (cancelled) return;
        setInspections(detail.inspections ?? []);
        setProbes(detail.probes ?? []);
        setOperations(detail.operations ?? summaryOperations(record));
      })
      .catch((failure: unknown) => {
        if (!cancelled) setError(failure instanceof Error ? failure.message : String(failure));
      });
    return () => {
      cancelled = true;
    };
  }, [record, client, providedInspections, providedProbes]);

  return { inspections, probes, operations, error };
}

function summaryOperations(record: ExecutionSummary | undefined): QueryBrowserDiagnostics[] {
  return (record?.operations ?? []).map((operation) => ({
    provider: operation.provider,
    request: {
      ...(operation.query ? { query: operation.query, rendered: operation.query } : {}),
      ...(operation.connection ? { connection: operation.connection } : {}),
      ...(operation.method ? { method: operation.method } : {}),
      ...(operation.url ? { url: operation.url } : {}),
    },
    ...(operation.error ? { error: operation.error } : {}),
  }));
}

function formatAge(ageMs: number): string {
  if (ageMs < 1000) return `${ageMs}ms`;
  if (ageMs < 60_000) return `${(ageMs / 1000).toFixed(0)}s`;
  if (ageMs < 3_600_000) return `${(ageMs / 60_000).toFixed(0)}m`;
  return `${(ageMs / 3_600_000).toFixed(1)}h`;
}
