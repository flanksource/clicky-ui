import type { JvmThread } from "../protocol/types";

/** Anything the thread tree can group: an id, a name and optionally a state. */
export type ThreadLike = { id: number; name: string; state?: string };

export type ThreadTreeNode<T extends ThreadLike> = {
  id: string;
  label: string;
  state?: string;
  count?: number;
  thread?: T;
  children?: ThreadTreeNode<T>[];
};

export type ThreadSort = "cpu" | "name";

export const THREAD_SORTS: readonly ThreadSort[] = ["cpu", "name"];

/** URL-shaped selection of the Threads surface; every value is a string so a host can keep it in search params. */
export type ThreadsViewState = {
  /** Selected thread id. */
  thread?: string;
  /** `cpu` (default) or `name`. */
  sort?: string;
  /** Comma separated thread states to show; empty shows all. */
  states?: string;
  /** Tree filter text. */
  q?: string;
};

/**
 * Groups threads that share a base name. A trailing parenthesised family label
 * wins ("Gang worker#3 (Parallel GC Threads)" → "(Parallel GC Threads)"), then a
 * trailing numeric suffix is dropped ("worker-3", "worker#3", "CompilerThread0").
 * A name that is only a suffix ("-1") stays intact.
 */
export function baseThreadName(name: string): string {
  const family = name.match(/\(([^()]+)\)\s*$/);
  if (family) return `(${family[1]})`;
  const stripped = name.replace(/[-#]\d+$/, "").replace(/(?<=[A-Za-z])\d+$/, "");
  return stripped.length > 0 ? stripped : name;
}

/** The most common state in `threads`; the earliest wins a tie. */
export function dominantState(threads: ThreadLike[]): string | undefined {
  const counts = new Map<string, number>();
  for (const thread of threads) {
    const state = thread.state ?? "UNKNOWN";
    counts.set(state, (counts.get(state) ?? 0) + 1);
  }
  let best: string | undefined;
  let bestCount = 0;
  for (const [state, count] of counts) {
    if (count > bestCount) {
      best = state;
      bestCount = count;
    }
  }
  return best;
}

function leaf<T extends ThreadLike>(thread: T): ThreadTreeNode<T> {
  return { id: `t-${thread.id}-${thread.name}`, label: thread.name, ...(thread.state ? { state: thread.state } : {}), thread };
}

/**
 * Groups threads sharing a base name, keeping input order for groups and their
 * members (sort before building). A group of one collapses to its thread.
 */
export function buildThreadTree<T extends ThreadLike>(threads: T[]): ThreadTreeNode<T>[] {
  const groups = new Map<string, T[]>();
  for (const thread of threads) {
    const base = baseThreadName(thread.name);
    groups.set(base, [...(groups.get(base) ?? []), thread]);
  }
  const nodes: ThreadTreeNode<T>[] = [];
  for (const [base, bucket] of groups) {
    const [only] = bucket;
    if (bucket.length === 1 && only) {
      nodes.push(leaf(only));
      continue;
    }
    const state = dominantState(bucket);
    nodes.push({ id: `g-${base}`, label: base, count: bucket.length, ...(state ? { state } : {}), children: bucket.map(leaf) });
  }
  return nodes;
}

/**
 * Orders by CPU (hottest first, threads without a sample last) or by name,
 * comparing numeric suffixes as numbers so worker-9 precedes worker-10.
 */
export function sortThreads<T extends { name: string; cpuPercent: number | null }>(threads: T[], sort: ThreadSort): T[] {
  const byName = (a: T, b: T) => a.name.localeCompare(b.name, undefined, { numeric: true });
  return [...threads].sort((a, b) => {
    if (sort === "name" || a.cpuPercent === b.cpuPercent) return byName(a, b);
    if (a.cpuPercent === null) return 1;
    if (b.cpuPercent === null) return -1;
    return b.cpuPercent - a.cpuPercent;
  });
}

/** A thread's sampled CPU %. Both reasons for a missing figure show a dash, never 0%, and say why. */
export function formatThreadCpu(thread: { cpuPercent: number | null }, cpuTimeEnabled: boolean): { text: string; title?: string } {
  if (!cpuTimeEnabled) return { text: "—", title: "This JVM does not report per-thread CPU time (unsupported or disabled)" };
  if (thread.cpuPercent === null) return { text: "—", title: "No CPU sample: the thread started or ended while the snapshot was sampled" };
  return { text: `${thread.cpuPercent.toFixed(1)}%` };
}

/** Blocked/waited totals; the time is absent while thread contention monitoring is off in the JVM. */
export function formatContention(count: number, timeMs: number | null | undefined): string {
  return timeMs === null || timeMs === undefined ? `${count}× (time not monitored)` : `${count}× · ${timeMs} ms`;
}

/** Threads a diagnostics agent spawned for itself (Arthas, the JVM's attach listener). */
export function isDiagnosticsAgentThread(name: string): boolean {
  return name.startsWith("arthas-") || name.startsWith("Timer-for-arthas-") || name === "Attach Listener";
}

/** Thread count per state, in first-seen order. */
export function countThreadStates(threads: Array<{ state: string }>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const thread of threads) counts.set(thread.state, (counts.get(thread.state) ?? 0) + 1);
  return counts;
}

export type VisibleThreadsOptions = { states: ReadonlySet<string>; sort: ThreadSort; showAgent: boolean };

/** The threads the tree shows: agent threads hidden unless asked for, restricted to `states` (empty = all), sorted. */
export function visibleThreads(threads: JvmThread[], { states, sort, showAgent }: VisibleThreadsOptions): JvmThread[] {
  const own = showAgent ? threads : threads.filter((thread) => !isDiagnosticsAgentThread(thread.name));
  return sortThreads(states.size === 0 ? own : own.filter((thread) => states.has(thread.state)), sort);
}

/** The id a `thread` param names; anything but a plain number selects nothing. */
export function parseThreadId(raw: string | undefined): number | null {
  return raw !== undefined && /^\d+$/.test(raw) ? Number(raw) : null;
}

export function parseThreadSort(raw: string | undefined): ThreadSort {
  return THREAD_SORTS.find((sort) => sort === raw) ?? "cpu";
}

export function parseStateSet(raw: string | undefined): Set<string> {
  return new Set((raw ?? "").split(",").filter((state) => state !== ""));
}

export function serializeStateSet(states: ReadonlySet<string>): string {
  return [...states].join(",");
}

/** `state` with `key` set to `value`, or removed when `value` is empty, so a default never lingers in a host's URL. */
export function withViewParam(state: ThreadsViewState, key: keyof ThreadsViewState, value: string): ThreadsViewState {
  const { [key]: _previous, ...rest } = state;
  return value === "" ? rest : { ...rest, [key]: value };
}

/** A file name for one thread's stack download. */
export function threadStackFileName(thread: { id: number; name: string }): string {
  const slug = thread.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return `${slug || "thread"}-${thread.id}.txt`;
}
