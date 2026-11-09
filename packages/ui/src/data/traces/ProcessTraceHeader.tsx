import { Checkbox } from "../../components/Checkbox";
import { formatBytes } from "../../lib/format";
import { MetricTile } from "../diagnostics/MetricTile";
import { cpuTone } from "../diagnostics/metric-tone";
import { processHeaderKey, type ProcessHeaderRow } from "./process-header";

export interface ProcessTraceHeaderProps {
  rows: ProcessHeaderRow[];
  showExited: boolean;
  onShowExitedChange: (show: boolean) => void;
  loading?: boolean;
  error?: string;
}

export function ProcessTraceHeader({ rows, showExited, onShowExitedChange, loading, error }: ProcessTraceHeaderProps) {
  const visible = rows.filter(row => showExited || !row.exitedAt);
  const exited = rows.filter(row => row.exitedAt).length;
  return <section aria-label="Process usage" className="flex min-h-0 max-h-[33dvh] shrink-0 flex-col rounded-md border border-border bg-background">
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2">
      <span className="text-sm font-medium">Processes · {rows.length - exited} live</span>
      <Checkbox checked={showExited} onChange={onShowExitedChange} label={`Show exited (${exited})`} />
    </div>
    {error && <p role="alert" className="px-3 py-2 text-sm text-destructive">{error}</p>}
    {loading && <p role="status" className="px-3 py-2 text-sm text-muted-foreground">Loading process measurements…</p>}
    <ul className="min-h-0 overflow-auto divide-y divide-border">
      {visible.map(row => <li key={processHeaderKey(row)} className="grid grid-cols-2 items-center gap-2 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_10rem_12rem]" data-process-key={processHeaderKey(row)}>
        <div className="col-span-2 min-w-0 sm:col-span-1" title={row.command}>
          <span className="mr-2 font-mono text-xs text-muted-foreground">{row.pid}</span>
          <span className="text-sm font-medium">{row.name}</span>
          <p className="truncate text-xs text-muted-foreground">{row.exitedAt ? "Exited · last sample" : row.command}</p>
        </div>
        <div role="progressbar" aria-label={`CPU for pid ${row.pid}`} aria-valuemin={0} aria-valuemax={100} {...(row.cpuPercent !== null ? { "aria-valuenow": Math.min(100, row.cpuPercent), "aria-valuetext": `${row.cpuPercent.toFixed(1)}% of one core` } : {})}>
          <MetricTile label="CPU" value={row.cpuPercent === null ? "Waiting for sample" : `${row.cpuPercent.toFixed(1)}%`} {...(row.cpuPercent !== null ? { barPct: Math.max(0, Math.min(100, row.cpuPercent)) } : {})} tone={row.exitedAt ? "neutral" : cpuTone(row.cpuPercent ?? 0)} />
        </div>
        <div role="progressbar" aria-label={`RAM for pid ${row.pid}`} aria-valuemin={0} aria-valuemax={100} {...(row.memoryPercent !== null ? { "aria-valuenow": Math.max(0, Math.min(100, row.memoryPercent)) } : {})}>
          <MetricTile label="RAM" value={row.rssBytes === null || row.memoryPercent === null ? "Waiting for sample" : `${formatBytes(row.rssBytes)} · ${row.memoryPercent.toFixed(1)}%`} {...(row.memoryPercent !== null ? { barPct: Math.max(0, Math.min(100, row.memoryPercent)) } : {})} tone={row.exitedAt ? "neutral" : "info"} />
        </div>
      </li>)}
    </ul>
    {!loading && visible.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">{showExited ? "No recorded processes" : "No live processes. Enable Show exited to see their last samples."}</p>}
  </section>;
}
