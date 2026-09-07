import { useResourceClock } from "../hooks/use-resource-clock";
import { formatBytes } from "./diagnostics/utils";
import type { TaskProcessDetails } from "./TaskSnapshot";
import { taskTransportConnected } from "./task-resource-summary";

export function TaskResourceReadings({ details, connectionStatus = "connected" }: { details: TaskProcessDetails; connectionStatus?: string }) {
  const live = ["running", "starting", "compiling", "restarting"].includes(details.status);
  const now = useResourceClock(live);
  const at = Date.parse(details.latest.sampledAt);
  if (!Number.isFinite(at) || at <= 0) return <span>Resources unavailable</span>;
  const stale = live && (!taskTransportConnected(connectionStatus) || now - at > 5000);
  return <>
    <span title="100% CPU equals one core">{details.latest.cpuPercent.toFixed(1)}% CPU</span>
    <span>{formatBytes(details.latest.rssBytes)} RSS</span>
    <span>{formatBytes(details.latest.vmsBytes)} VMS</span>
    <span>{details.latest.openFiles >= 0 ? `${details.latest.openFiles} files` : "files unavailable"}</span>
    <span>{stale ? "Stale" : live ? "Sampled" : "Final sample"} · {new Date(at).toLocaleTimeString()}</span>
    {Date.parse(details.peak.sampledAt) > 0 && <span>Peak {details.peak.cpuPercent.toFixed(1)}% CPU · {formatBytes(details.peak.rssBytes)} RSS</span>}
  </>;
}
