import { formatBytes } from "../../lib/format";
import { ProgressBar } from "../ProgressBar";
import { formatCpuPercent } from "./process-tree";
import type { ProcessNodeRow } from "./types";

function Usage({ resource, pid, value, percent, title }: { resource: "CPU" | "RAM"; pid: number; value: string; percent: number | null | undefined; title: string }) {
  const label = `${resource} for pid ${pid}`;
  return <div className="w-28 shrink-0 text-xs tabular-nums" title={title}>
    <div className="mb-0.5 flex justify-between gap-1 text-muted-foreground"><span>{resource}</span><span>{value}</span></div>
    {percent == null
      ? <div role="progressbar" aria-label={label} aria-valuetext="Waiting for sample" aria-valuemin={0} aria-valuemax={100} className="h-1 rounded-full bg-muted" />
      : <ProgressBar label={label} total={100} height="h-1" segments={[{ count: Math.max(0, Math.min(100, percent)), color: "bg-primary", label: value }]} />}
  </div>;
}

export function ProcessUsageBars({ row, memoryPercent }: { row: ProcessNodeRow; memoryPercent: number | undefined }) {
  return <div className="flex shrink-0 gap-3">
    <Usage resource="CPU" pid={row.pid} value={formatCpuPercent(row.cpuPercent)} percent={row.cpuPercent} title={`Peak ${formatCpuPercent(row.peakCpuPercent)} · CPU per core`} />
    <Usage resource="RAM" pid={row.pid} value={formatBytes(row.rssBytes)} percent={memoryPercent} title={`Peak ${formatBytes(row.peakRssBytes)}${memoryPercent === undefined ? "" : ` · ${memoryPercent.toFixed(1)}% of host RAM`}`} />
  </div>;
}
