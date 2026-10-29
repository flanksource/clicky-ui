import type { ReactNode } from "react";
import type { WorkloadCardWorkload } from "../WorkloadCard.model";

/** CPU values use cores; memory and heap values use bytes. */
export interface WorkloadResourceStatistics {
  average: number;
  p90: number;
  p95: number;
  limit: number;
  request?: number;
}

/** Average bytes in each region, collected over the same window as heap and memory. */
export interface WorkloadMemoryRegions {
  eden: number;
  survivor: number;
  old: number;
  metaspace: number;
  codeCache: number;
  direct: number;
}

/** Which slice of process memory a stack draws: every region, heap regions only, or non-heap plus native. */
export type WorkloadMemoryPart = "all" | "heap" | "nonHeap";

export interface WorkloadGcStatistics {
  count: number;
  /** Cumulative wall-clock collection time over observationWindowMs. */
  timeMs: number;
  p90Ms: number;
  p95Ms: number;
  maxMs: number;
  /** P90 and P95 of the per-interval share of wall-clock time spent in GC, 0-100. */
  percentP90: number;
  percentP95: number;
}

export interface WorkloadThreadStatistics {
  live: number;
  daemon: number;
  peak: number;
  blocked: number;
}

export interface WorkloadJvmStatistics {
  heap: WorkloadResourceStatistics;
  regions: WorkloadMemoryRegions;
  gc: WorkloadGcStatistics;
  threads: WorkloadThreadStatistics;
}

export interface WorkloadPanelProps {
  workload: WorkloadCardWorkload;
  container: string;
  observationWindowMs: number;
  cpu: WorkloadResourceStatistics;
  memory: WorkloadResourceStatistics;
  /** Omit for containers without a JVM. */
  jvm?: WorkloadJvmStatistics;
  headerActions?: ReactNode;
  className?: string;
}
