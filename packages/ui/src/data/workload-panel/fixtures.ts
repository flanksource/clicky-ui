import type { WorkloadPanelProps } from "./types";

const MB = 1024 ** 2;

export const workloadPanelExample = {
  workload: {
    kind: "deployment",
    name: "worker",
    namespace: "jobs",
    status: { label: "Running", health: "healthy" },
  },
  container: "processor",
  observationWindowMs: 24 * 60 * 60 * 1000,
  cpu: { average: 1.24, request: 2, limit: 4, p90: 2.4, p95: 3.2 },
  memory: {
    average: 3686 * MB,
    request: 4096 * MB,
    limit: 8192 * MB,
    p90: 5325 * MB,
    p95: 6554 * MB,
  },
  jvm: {
    heap: {
      average: 2458 * MB,
      request: 2048 * MB,
      limit: 4096 * MB,
      p90: 3174 * MB,
      p95: 3789 * MB,
    },
    regions: {
      eden: 640 * MB,
      survivor: 96 * MB,
      old: 1722 * MB,
      metaspace: 224 * MB,
      codeCache: 116 * MB,
      direct: 384 * MB,
    },
    gc: {
      count: 412,
      timeMs: 28840,
      p90Ms: 92,
      p95Ms: 116,
      maxMs: 280,
      percentP90: 0.12,
      percentP95: 0.31,
    },
    threads: { live: 96, daemon: 24, peak: 128, blocked: 1 },
  },
} satisfies WorkloadPanelProps;
