import { describe, expect, it } from "vitest";
import type { TaskSnapshot } from "./TaskSnapshot";
import { resourceSummary } from "./task-resource-summary";

const now = Date.parse("2026-09-06T10:00:00Z");
const process: TaskSnapshot = { id: "process", groupId: "run", name: "render", type: "task", status: "running", details: {
  pid: 123, command: "renderer", status: "running", restarts: 0, restartPolicy: "no", metrics: {},
  latest: { cpuPercent: 250, rssBytes: 1024, vmsBytes: 2048, openFiles: 3, sampledAt: new Date(now).toISOString() },
  peak: { cpuPercent: 300, rssBytes: 2048, vmsBytes: 4096, openFiles: 3, sampledAt: new Date(now).toISOString() },
} };

describe("task resource summary", () => {
  it("keeps multicore CPU and counts a process once across group and child snapshots", () => {
    expect(resourceSummary([process, { ...process, id: "group", type: "group" }], { now, connected: true })).toMatchObject({ state: "fresh", cpu: 250, rss: 1024 });
  });
  it("marks retained samples stale after connection loss or five seconds without sampling", () => {
    expect(resourceSummary([process], { now, connected: false }).state).toBe("stale");
    expect(resourceSummary([process], { now: now + 5001, connected: true }).state).toBe("stale");
  });
  it("reports missing measurements as unavailable instead of zero usage", () => {
    expect(resourceSummary([{ id: "queued", type: "task", name: "Waiting", status: "pending" }], { now, connected: true }).state).toBe("unavailable");
  });
});
