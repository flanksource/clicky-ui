import type { ProcessNodeRow, ProcessSampleRow } from "./types";

export type ProcessTreeNode = {
  row: ProcessNodeRow;
  children: ProcessTreeNode[];
  /** The process has exited: by its status, or because an exit time was recorded. */
  exited: boolean;
};

const byStart = (a: ProcessTreeNode, b: ProcessTreeNode) =>
  Date.parse(a.row.startedAt) - Date.parse(b.row.startedAt) || a.row.pid - b.row.pid;

/**
 * Builds the forest a `process_tree` stream describes: each row under its
 * `parentKey`. A row whose parent was never recorded (the capture began below
 * it) becomes a root. The stream holds each process once, so a repeated key or a
 * parent cycle is a corrupt capture and throws.
 */
export function buildProcessForest(rows: ProcessNodeRow[]): ProcessTreeNode[] {
  const nodes = new Map<string, ProcessTreeNode>();
  for (const row of rows) {
    if (nodes.has(row.key)) throw new Error(`process tree key "${row.key}" appears twice`);
    nodes.set(row.key, { row, children: [], exited: isProcessExited(row) });
  }

  const roots: ProcessTreeNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.row.parentKey ? nodes.get(node.row.parentKey) : undefined;
    (parent ? parent.children : roots).push(node);
  }

  roots.sort((a, b) => Number(Boolean(b.row.isRoot)) - Number(Boolean(a.row.isRoot)) || byStart(a, b));
  const reached = flattenForest(roots);
  if (reached.length !== nodes.size) {
    const lost = [...nodes.keys()].filter((key) => !reached.some((node) => node.row.key === key));
    throw new Error(`process tree has a parent cycle among keys ${lost.map((key) => `"${key}"`).join(", ")}`);
  }
  for (const node of nodes.values()) node.children.sort(byStart);
  return roots;
}

/**
 * Drops exited processes from a forest, keeping an exited process only while it
 * still has a live descendant to hang off. Returns new nodes; the input is not
 * modified.
 */
export function pruneExitedProcesses(roots: ProcessTreeNode[]): ProcessTreeNode[] {
  return roots.flatMap((node) => {
    const children = pruneExitedProcesses(node.children);
    return node.exited && children.length === 0 ? [] : [{ ...node, children }];
  });
}

/** How long the process lived: to its exit, else to the last time it was seen. */
export function processLifetimeMs(row: ProcessNodeRow): number {
  return Date.parse(row.exitedAt ?? row.lastSeenAt) - Date.parse(row.startedAt);
}

/** A trace timestamp as local `YYYY-MM-DD HH:MM:SS`; text that is not a date is returned unchanged. */
export function formatProcessTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/** The process has exited: by its status, or because an exit time was recorded. */
export function isProcessExited(row: ProcessNodeRow): boolean {
  return row.status === "exited" || Boolean(row.exitedAt);
}

/** The forest depth-first, parents before children. */
export function flattenForest(roots: ProcessTreeNode[]): ProcessTreeNode[] {
  const flat: ProcessTreeNode[] = [];
  const visit = (node: ProcessTreeNode) => {
    flat.push(node);
    node.children.forEach(visit);
  };
  roots.forEach(visit);
  return flat;
}

/** A CPU % for display, "—" while it is still unknown. */
export function formatCpuPercent(value: number | null | undefined): string {
  return value == null ? "—" : `${value.toFixed(1)}%`;
}

function knownCpu(samples: ProcessSampleRow[]): number[] {
  return samples.flatMap((sample) => (sample.cpuPercent == null ? [] : [sample.cpuPercent]));
}

/** Each process's known CPU % over its samples, in tick order. */
export function cpuSeriesByKey(samples: ProcessSampleRow[]): Map<string, number[]> {
  const byKey = new Map<string, ProcessSampleRow[]>();
  for (const sample of samples) byKey.set(sample.key, [...(byKey.get(sample.key) ?? []), sample]);
  return new Map([...byKey].map(([key, list]) => [key, knownCpu(list.sort((a, b) => a.tick - b.tick))]));
}

/** One process's known CPU % and RSS bytes over its samples, in tick order. */
export function processSeries(samples: ProcessSampleRow[], key: string): { cpu: number[]; rss: number[] } {
  const own = samples.filter((sample) => sample.key === key).sort((a, b) => a.tick - b.tick);
  return { cpu: knownCpu(own), rss: own.map((sample) => sample.rssBytes) };
}

/** SVG polyline points for `values` in a `width` x `height` box, zero at the bottom and the maximum at the top. */
export function sparklinePoints(values: number[], width: number, height: number): string | undefined {
  if (values.length < 2) return undefined;
  const max = Math.max(...values);
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = max === 0 ? height : height - (value / max) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
