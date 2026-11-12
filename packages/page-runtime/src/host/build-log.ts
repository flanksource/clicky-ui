import type { ActivityLoad } from "./activity-state.ts";

/** A host-observed load step, stamped in epoch milliseconds (`performance.timeOrigin + performance.now()`). */
export type BuildStep = { label: string; at: number; source: "host" | "frame"; error?: string };
export type BuildLogEntry = { label: string; source: "host" | "frame" | "timeline" | "tailwind"; offsetMs: number; durationMs: number | null; error?: string };

/**
 * One timed log of a page load: host and frame steps offset from the first step, each lasting until the
 * next step (`null` while the last is still running), merged with the frame's timeline marks and Tailwind
 * builds once the frame has reported activity.
 */
export function buildLog({ steps, load }: { steps: BuildStep[]; load: ActivityLoad | null }): BuildLogEntry[] {
  const start = steps[0]?.at;
  if (start === undefined) {
    if (load) throw new Error(`buildLog: load ${load.id} has activity but no recorded build steps to time it against`);
    return [];
  }
  const entries: BuildLogEntry[] = steps.map((step, index) => {
    const next = steps[index + 1];
    return { label: step.label, source: step.source, offsetMs: step.at - start, durationMs: step.error ? 0 : next ? next.at - step.at : null, ...(step.error ? { error: step.error } : {}) };
  });
  // A frame navigation that began before the first step belongs to the previous load.
  if (load && load.navigationStart >= start) {
    const base = load.navigationStart - start;
    load.timeline.forEach((mark, index) => entries.push({ label: mark.phase, source: "timeline", offsetMs: base + mark.atMs, durationMs: mark.atMs - (load.timeline[index - 1]?.atMs ?? 0) }));
    for (const build of load.tailwind) entries.push({ label: `Tailwind ${build.kind}${build.cacheHit ? " (cache)" : ""}`, source: "tailwind", offsetMs: base + build.startMs, durationMs: build.durationMs });
  }
  return entries.sort((a, b) => a.offsetMs - b.offsetMs);
}
