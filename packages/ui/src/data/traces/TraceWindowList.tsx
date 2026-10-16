import { Component, useEffect, useState, type ReactNode } from "react";
import { TraceView } from "./TraceView";
import type { TraceRow } from "./types";

/** A window of a trace stream a fixture armed: the records after `afterSeq` through `toSeq` (0 = unbounded) of one kind's stream. */
export type TraceWindow = {
  kind: string;
  stream: string;
  afterSeq?: number;
  toSeq?: number;
  /** The run whose trace store holds the window. */
  run_id: string;
  count: number;
  /** The kind's summary of the window, shown as chips. */
  summary?: Record<string, unknown>;
  /** Why the window could not be read. */
  error?: string;
};

/** Where a window's run serves its store, or why it does not. */
export type TraceWindowSource = {
  /** Where the store is served; absent when it is not. */
  mount?: string;
  /** Why a store that was kept is not served (for example pruned since). */
  unavailable?: string;
};

export type TraceWindowListProps = {
  windows: TraceWindow[];
  /** Resolves the store of a window's run. */
  resolve: (window: TraceWindow) => TraceWindowSource;
  /** The export formats of a kind, for example `[{ name: "har" }]`. */
  formats: (kind: string) => Array<{ name: string }>;
  /** Reads a window's records for the inline viewer. Must reject on failure and honour `signal`. */
  fetchRecords: (window: TraceWindow, signal: AbortSignal) => Promise<TraceRow[]>;
  /** Download URL of a window in one export format. */
  exportUrl: (window: TraceWindow, format: string) => string;
  /** URL of the query app opened at exactly this window. */
  openUrl: (window: TraceWindow) => string;
  /** A failure that applies to the whole list, such as the export formats not loading. */
  error?: string;
};

const UNSERVED = "This run's trace store is not served, so its windows cannot be opened.";
const MAX_SUMMARY_CHIPS = 6;

const windowKey = (window: TraceWindow) => `${window.run_id}:${window.kind}:${window.stream}:${window.afterSeq ?? 0}`;

const isScalar = (value: unknown) => typeof value === "string" || typeof value === "number" || typeof value === "boolean";

function SummaryChips({ summary }: { summary: Record<string, unknown> | undefined }) {
  const entries = Object.entries(summary ?? {})
    .filter(([key, value]) => key !== "count" && isScalar(value))
    .slice(0, MAX_SUMMARY_CHIPS);
  return (
    <>
      {entries.map(([key, value]) => (
        <span key={key} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground" data-summary-chip={key}>
          {key}: <span className="font-mono">{String(value)}</span>
        </span>
      ))}
    </>
  );
}

/** Keeps a viewer that refuses its records (TraceView throws on a row its kind's viewer cannot render) from taking the whole list down. */
class ViewerBoundary extends Component<{ children: ReactNode }, { error?: string }> {
  override state: { error?: string } = {};

  static getDerivedStateFromError(error: unknown) {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="px-2 py-1.5 text-xs text-red-700 dark:text-red-400" role="alert">
          {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}

function WindowViewer({
  window,
  fetchRecords,
}: {
  window: TraceWindow;
  fetchRecords: TraceWindowListProps["fetchRecords"];
}) {
  const [rows, setRows] = useState<TraceRow[] | null>(null);
  const [error, setError] = useState<string | undefined>(undefined);
  useEffect(() => {
    const abort = new AbortController();
    fetchRecords(window, abort.signal).then(setRows, (reason: unknown) => {
      if (!abort.signal.aborted) setError(reason instanceof Error ? reason.message : String(reason));
    });
    return () => abort.abort();
    // The window is identified by its coordinates; the host may rebuild the object each render.
  }, [window.run_id, window.kind, window.stream, window.afterSeq, window.toSeq]);
  if (error) {
    return (
      <div className="whitespace-pre-wrap border-t border-border px-2 py-1.5 text-xs text-red-700 dark:text-red-400" role="alert">
        {error}
      </div>
    );
  }
  if (!rows) return <div className="border-t border-border px-2 py-1.5 text-xs text-muted-foreground">Loading records...</div>;
  return (
    <div className="border-t border-border" style={{ height: 420 }}>
      <ViewerBoundary>
        <TraceView kind={window.kind} rows={rows} />
      </ViewerBoundary>
    </div>
  );
}

function WindowRow({
  window,
  mount,
  formats,
  fetchRecords,
  exportUrl,
  openUrl,
}: {
  window: TraceWindow;
  mount: string | undefined;
  formats: Array<{ name: string }>;
} & Pick<TraceWindowListProps, "fetchRecords" | "exportUrl" | "openUrl">) {
  const [open, setOpen] = useState(false);
  const linkClass = "text-xs text-primary hover:underline";
  return (
    <div className="rounded border border-border" data-trace-kind={window.kind}>
      <div className="flex flex-wrap items-center gap-2 px-2 py-1.5 text-sm">
        <span className="font-mono font-medium text-foreground">{window.kind}</span>
        <span className="text-xs text-muted-foreground">
          {window.count} {window.count === 1 ? "record" : "records"}
        </span>
        <SummaryChips summary={window.summary} />
        <span className="flex-1" />
        {mount && (
          <>
            <a className={linkClass} href={openUrl(window)} target="_blank" rel="noreferrer">
              Open in query
            </a>
            {formats.map((format) => (
              <a key={format.name} className={linkClass} href={exportUrl(window, format.name)} download>
                {format.name.toUpperCase()}
              </a>
            ))}
            <button type="button" className={linkClass} onClick={() => setOpen(!open)}>
              {open ? "Hide" : "View"}
            </button>
          </>
        )}
      </div>
      {window.error && (
        <div className="whitespace-pre-wrap px-2 pb-1.5 text-xs text-red-700 dark:text-red-400">{window.error}</div>
      )}
      {open && mount && <WindowViewer window={window} fetchRecords={fetchRecords} />}
    </div>
  );
}

/**
 * One fixture's trace windows: what each captured (kind, record count, summary
 * chips), a link into the query app at exactly that window, per-format export
 * downloads and an inline viewer of its records. Windows of a run whose store
 * is not served say why, once per reason. Props-only: the host resolves stores
 * and builds the URLs.
 */
export function TraceWindowList({ windows, resolve, formats, fetchRecords, exportUrl, openUrl, error }: TraceWindowListProps) {
  const sources = windows.map((window) => resolve(window));
  const unavailable = [
    ...new Set(sources.filter((source) => !source.mount).map((source) => source.unavailable || UNSERVED)),
  ];
  return (
    <div>
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Traces</h3>
      {unavailable.map((reason) => (
        <div
          key={reason}
          className="mb-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
          role="status"
        >
          {reason}
        </div>
      ))}
      <div className="space-y-2">
        {windows.map((window, index) => (
          <WindowRow
            key={windowKey(window)}
            window={window}
            mount={sources[index]!.mount}
            formats={formats(window.kind)}
            fetchRecords={fetchRecords}
            exportUrl={exportUrl}
            openUrl={openUrl}
          />
        ))}
      </div>
      {error && <div className="mt-1 text-xs text-red-700 dark:text-red-400">{error}</div>}
    </div>
  );
}
