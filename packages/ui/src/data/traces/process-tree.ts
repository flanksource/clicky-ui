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
    nodes.set(row.key, { row, children: [], exited: row.status === "exited" || Boolean(row.exitedAt) });
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

/** Each process's CPU % over its samples, in tick order. */
export function cpuSeriesByKey(samples: ProcessSampleRow[]): Map<string, number[]> {
  const byKey = new Map<string, ProcessSampleRow[]>();
  for (const sample of samples) byKey.set(sample.key, [...(byKey.get(sample.key) ?? []), sample]);
  return new Map(
    [...byKey].map(([key, list]) => [key, list.sort((a, b) => a.tick - b.tick).map((sample) => sample.cpuPercent)]),
  );
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
