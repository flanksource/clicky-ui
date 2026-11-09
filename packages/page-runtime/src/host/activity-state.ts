import type { ServerTimingMetric } from "@flanksource/clicky-ui";
import type { ActivityMessage, RuntimeResolution, TailwindActivity, WorkerActivity } from "../activity-schema.ts";

export type ActivitySummary = { requests: number; transferredBytes: number; unknownTransfers: number; unknownCompiles: number; decodedBytes: number; outputBytes: number; cacheHits: number; compileMs: number; readyMs: number | null; versions: Record<string, string> };
export type ActivityLoad = { id: string; navigationStart: number; records: WorkerActivity[]; timeline: ActivityMessage["timeline"]; tailwind: TailwindActivity[]; runtime?: RuntimeResolution; editToVisibleMs?: number };
export type RuntimeActivityState = { current: ActivityLoad | null; previous: ActivitySummary | null };
export const emptyActivity = (): RuntimeActivityState => ({ current: null, previous: null });

export function summarizeActivity(load: ActivityLoad): ActivitySummary {
  return { requests: load.records.length, transferredBytes: load.records.reduce((n, r) => n + (r.transferredBytes ?? 0), 0), unknownTransfers: load.records.filter((r) => r.transferredBytes === null).length, unknownCompiles: load.records.filter((r) => r.unavailable.includes("compile")).length,
    decodedBytes: load.records.reduce((n, r) => n + (r.decodedBytes ?? 0), 0), outputBytes: load.records.reduce((n, r) => n + (r.outputBytes ?? 0), 0), cacheHits: load.records.filter((r) => r.source === "cache").length,
    compileMs: load.records.reduce((n, r) => n + r.compileMs, 0) + load.tailwind.reduce((n, r) => n + r.durationMs, 0), readyMs: load.timeline.find((mark) => mark.phase === "ready")?.atMs ?? null, versions: load.runtime?.versions ?? {} };
}

/**
 * The load as Server-Timing metrics: `total` is the time to ready, and each phase is that phase's work
 * summed over the requests that did it, so phases can exceed the total when requests overlap.
 * Empty until the load is ready.
 */
export function activityTimings(load: ActivityLoad): ServerTimingMetric[] {
  const ready = load.timeline.find((mark) => mark.phase === "ready")?.atMs;
  if (ready === undefined) return [];
  const phase = (name: string, counter: string, durations: number[]): ServerTimingMetric[] => {
    const worked = durations.filter((duration) => duration > 0);
    return worked.length ? [{ name, duration: worked.reduce((total, duration) => total + duration, 0), counters: { [counter]: worked.length } }] : [];
  };
  return [
    { name: "total", duration: ready, counters: {} },
    ...phase("fetch", "requests", load.records.map((r) => r.fetchMs)),
    ...phase("integrity", "files", load.records.map((r) => r.integrityMs)),
    ...phase("compile", "modules", load.records.map((r) => r.compileMs)),
    ...phase("rewrite", "modules", load.records.map((r) => r.rewriteMs)),
    ...phase("tailwind", "builds", load.tailwind.map((build) => build.durationMs)),
  ];
}

export function appendActivity(options: { state: RuntimeActivityState; message: ActivityMessage; editStartedAt?: number }): RuntimeActivityState {
  const { message, state } = options;
  if (state.current && message.navigationStart < state.current.navigationStart) return state;
  const same = state.current?.id === message.load;
  const current: ActivityLoad = same ? state.current! : { id: message.load, navigationStart: message.navigationStart, records: [], timeline: [], tailwind: [] };
  const ids = new Set(current.records.map((record) => record.id));
  const next = { ...current, records: [...current.records, ...message.records.filter((record) => !ids.has(record.id))], timeline: message.timeline.length ? message.timeline : current.timeline, tailwind: [...current.tailwind, ...message.tailwind], ...(message.runtime ? { runtime: message.runtime } : {}) };
  const visible = next.timeline.find((mark) => mark.phase === "visible");
  if (visible && options.editStartedAt !== undefined && options.editStartedAt < next.navigationStart) next.editToVisibleMs = next.navigationStart + visible.atMs - options.editStartedAt;
  return { current: next, previous: same ? state.previous : state.current ? summarizeActivity(state.current) : state.previous };
}

export type ActivityLibrary = { id: string; name: string; version: string; origin: string; files: number; transferredBytes: number; unknownTransfers: number; decodedBytes: number; cacheRatio: number; role: "managed library" | "base set" | "additional package" };
export function activityLibraries(load: ActivityLoad): ActivityLibrary[] {
  const groups = new Map<string, { name: string; version: string; records: WorkerActivity[]; base: boolean }>();
  for (const record of load.records) if (record.package) {
    const baseEntry = Object.entries(load.runtime?.base ?? {}).find(([, url]) => new URL(url, record.url).pathname === new URL(record.url).pathname);
    const baseName = baseEntry?.[0].startsWith("@") ? baseEntry[0].split("/").slice(0, 2).join("/") : baseEntry?.[0].split("/")[0];
    const version = baseName ? load.runtime?.versions[baseName] : undefined;
    const name = version && baseName ? baseName : record.package.name;
    const resolvedVersion = version ?? record.package.version;
    const key = `${name}@${resolvedVersion}`;
    const group = groups.get(key);
    if (group) group.records.push(record);
    else groups.set(key, { name, version: resolvedVersion, records: [record], base: Boolean(baseEntry) });
  }
  return [...groups].map(([id, { name, version, records, base }]) => {
    const first = records[0]!; const pkg = first.package!;
    return { id, name, version, origin: first.origin ? first.origin.slice(0, first.origin.length - pkg.path.length) : "", files: new Set(records.map((r) => r.package!.path)).size,
      transferredBytes: records.reduce((n, r) => n + (r.transferredBytes ?? 0), 0), unknownTransfers: records.filter((r) => r.transferredBytes === null).length, decodedBytes: records.reduce((n, r) => n + (r.decodedBytes ?? 0), 0), cacheRatio: records.filter((r) => r.source === "cache").length / records.length,
      role: load.runtime?.managed.includes(name) ? "managed library" : base ? "base set" : "additional package" };
  });
}
