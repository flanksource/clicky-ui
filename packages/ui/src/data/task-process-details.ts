import type { ProcessNode } from "./diagnostics/types";
import type { TaskProcessDetails, TaskProcessSample } from "./TaskSnapshot";

export function isTaskProcessDetails(value: unknown): value is TaskProcessDetails {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<TaskProcessDetails>;
  return (
    typeof candidate.command === "string" &&
    typeof candidate.status === "string" &&
    typeof candidate.restarts === "number" &&
    !!candidate.latest &&
    !!candidate.peak &&
    !!candidate.metrics
  );
}

function processNode(sample: TaskProcessSample): ProcessNode {
  return {
    pid: sample.pid,
    ppid: sample.ppid,
    command: sample.command,
    ...(sample.status ? { status: sample.status } : {}),
    cpu_percent: sample.cpuPercent,
    rss: sample.rssBytes,
    vms: sample.vmsBytes,
    open_files: sample.openFiles,
    is_root: sample.isRoot ?? false,
    children: [],
  };
}

// buildTaskProcessForest deterministically projects Clicky's flat PID/PPID
// samples into diagnostics trees. Missing parents remain roots and cycles are
// cut at the first previously-visited PID so malformed OS snapshots stay usable.
export function buildTaskProcessForest(samples: TaskProcessSample[]): ProcessNode[] {
  const byPid = new Map<number, TaskProcessSample>();
  const children = new Map<number, TaskProcessSample[]>();
  for (const sample of samples) {
    if (byPid.has(sample.pid)) throw new Error(`duplicate process pid ${sample.pid}`);
    byPid.set(sample.pid, sample);
    children.set(sample.ppid, [...(children.get(sample.ppid) ?? []), sample]);
  }

  const visited = new Set<number>();
  const visit = (sample: TaskProcessSample): ProcessNode | null => {
    if (visited.has(sample.pid)) return null;
    visited.add(sample.pid);
    const node = processNode(sample);
    node.children = (children.get(sample.pid) ?? [])
      .map(visit)
      .filter((child): child is ProcessNode => child !== null);
    return node;
  };

  const roots = samples.filter((sample) => sample.isRoot || !byPid.has(sample.ppid));
  const forest = roots.map(visit).filter((node): node is ProcessNode => node !== null);
  for (const sample of samples) {
    const orphan = visit(sample);
    if (orphan) forest.push(orphan);
  }
  return forest;
}
