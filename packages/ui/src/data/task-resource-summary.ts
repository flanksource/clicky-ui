import type { TaskSnapshot } from "./TaskSnapshot";
import { isTaskProcessDetails } from "./task-process-details";

export type ResourceSummary = { state: "fresh" | "stale"; cpu: number; rss: number; sampledAt: number } | { state: "unavailable" };

export function resourceSummary(snapshots: TaskSnapshot[], options: { now: number; connected: boolean }): ResourceSummary {
  const processes = new Map<string, TaskSnapshot>();
  for (const snapshot of snapshots) {
    if (snapshot.status !== "running" && snapshot.status !== "pending") continue;
    if (!isTaskProcessDetails(snapshot.details)) continue;
    const key = snapshot.details.pid ? `${snapshot.details.command}:${snapshot.details.pid}` : snapshot.id;
    if (!processes.has(key) || snapshot.type === "task") processes.set(key, snapshot);
  }
  if (!processes.size) return { state: "unavailable" };
  let cpu = 0, rss = 0, sampledAt = options.now;
  for (const snapshot of processes.values()) {
    if (!isTaskProcessDetails(snapshot.details)) continue;
    const sample = snapshot.details.latest;
    const at = Date.parse(sample.sampledAt);
    if (!Number.isFinite(at) || at <= 0) return { state: "unavailable" };
    cpu += sample.cpuPercent;
    rss += sample.rssBytes;
    sampledAt = Math.min(sampledAt, at);
  }
  return { state: options.connected && options.now - sampledAt <= 5000 ? "fresh" : "stale", cpu, rss, sampledAt };
}

export function taskTransportConnected(status: string): boolean {
  return status === "connected" || status === "polling" || status === "complete";
}
