import type { ProgressSegment } from "../ProgressBar";
import type {
  WorkloadGcStatistics,
  WorkloadMemoryPart,
  WorkloadPanelProps,
  WorkloadResourceStatistics,
} from "./types";

export const memoryRegions = [
  { key: "eden", label: "Eden", color: "var(--fs-info-500)", heap: true },
  {
    key: "survivor",
    label: "Survivor",
    color: "var(--fs-hint-500)",
    heap: true,
  },
  { key: "old", label: "Old Gen", color: "var(--fs-prereq-500)", heap: true },
  {
    key: "metaspace",
    label: "Metaspace",
    color: "var(--fs-warning-500)",
    heap: false,
  },
  {
    key: "codeCache",
    label: "Code Cache",
    color: "var(--fs-success-500)",
    heap: false,
  },
  {
    key: "direct",
    label: "Direct Buffers",
    color: "var(--fs-error-500)",
    heap: false,
  },
] as const;

export const nativeMemoryRegion = {
  label: "Other native",
  color: "var(--fs-gray-400)",
};

function nonNegative(values: Record<string, number>) {
  for (const [name, value] of Object.entries(values)) {
    if (!Number.isFinite(value) || value < 0)
      throw new Error(
        `${name} must be finite and non-negative; received ${value}`,
      );
  }
}

function validateResource(label: string, value: WorkloadResourceStatistics) {
  nonNegative(
    Object.fromEntries(
      (["average", "p90", "p95", "limit"] as const).map((key) => [
        `${label}.${key}`,
        value[key],
      ]),
    ),
  );
  if (value.request !== undefined)
    nonNegative({ [`${label}.request`]: value.request });
  if (value.p90 > value.p95)
    throw new Error(`${label}.p90 must not exceed p95`);
}

export function gcStatistics(
  gc: WorkloadGcStatistics,
  observationWindowMs: number,
) {
  if (!Number.isFinite(observationWindowMs) || observationWindowMs <= 0)
    throw new Error("observationWindowMs must be finite and positive");
  nonNegative(
    Object.fromEntries(
      (
        [
          "count",
          "timeMs",
          "p90Ms",
          "p95Ms",
          "maxMs",
          "percentP90",
          "percentP95",
        ] as const
      ).map((key) => [`gc.${key}`, gc[key]]),
    ),
  );
  if (gc.percentP90 > gc.percentP95 || gc.percentP95 > 100)
    throw new Error("GC percentages must satisfy p90 <= p95 <= 100");
  if (!Number.isInteger(gc.count))
    throw new Error("gc.count must be an integer");
  if (
    gc.count === 0 &&
    [
      gc.timeMs,
      gc.p90Ms,
      gc.p95Ms,
      gc.maxMs,
      gc.percentP90,
      gc.percentP95,
    ].some((value) => value !== 0)
  )
    throw new Error("GC timing requires a positive collection count");
  if (gc.p90Ms > gc.p95Ms || gc.p95Ms > gc.maxMs)
    throw new Error("GC percentiles must satisfy p90 <= p95 <= max");
  const averageMs = gc.count === 0 ? undefined : gc.timeMs / gc.count;
  if (averageMs !== undefined && averageMs > gc.maxMs)
    throw new Error("Average GC time must not exceed the observed maximum");
  return { averageMs, percentage: (gc.timeMs / observationWindowMs) * 100 };
}

export function memorySegments({
  memory,
  jvm,
  part = "all",
}: {
  memory: WorkloadResourceStatistics;
  jvm: Pick<NonNullable<WorkloadPanelProps["jvm"]>, "heap" | "regions">;
  /** `heap` stacks heap regions on the heap limit; `nonHeap` stacks the rest of process memory on the memory limit. */
  part?: WorkloadMemoryPart;
}) {
  validateResource("memory", memory);
  validateResource("heap", jvm.heap);
  nonNegative(
    Object.fromEntries(
      memoryRegions.map(({ key }) => [`regions.${key}`, jvm.regions[key]]),
    ),
  );
  const heapBytes = jvm.regions.eden + jvm.regions.survivor + jvm.regions.old;
  if (Math.abs(heapBytes - jvm.heap.average) > 1)
    throw new Error(
      "Heap regions must sum to average heap usage within one byte",
    );
  const regionBytes = memoryRegions.reduce(
    (sum, { key }) => sum + jvm.regions[key],
    0,
  );
  if (regionBytes > memory.average)
    throw new Error("JVM memory regions exceed reported memory usage");
  const segments: ProgressSegment[] = [
    ...memoryRegions
      .filter((region) => part === "all" || region.heap === (part === "heap"))
      .map(({ key, label, color }) => ({
        label,
        color,
        count: jvm.regions[key],
      })),
    ...(part === "heap"
      ? []
      : [{ ...nativeMemoryRegion, count: memory.average - regionBytes }]),
  ];
  const reading = part === "heap" ? jvm.heap : memory;
  return {
    segments,
    usage: segments.reduce((sum, segment) => sum + segment.count, 0),
    scale: Math.max(reading.limit, reading.average),
  };
}

export function validateWorkloadPanel(props: WorkloadPanelProps) {
  if (!props.workload.name.trim() || !props.container.trim())
    throw new Error("Workload and container names must not be empty");
  if (
    !Number.isFinite(props.observationWindowMs) ||
    props.observationWindowMs <= 0
  )
    throw new Error("observationWindowMs must be finite and positive");
  validateResource("cpu", props.cpu);
  validateResource("memory", props.memory);
  if (!props.jvm) return;
  validateResource("heap", props.jvm.heap);
  memorySegments({ memory: props.memory, jvm: props.jvm });
  gcStatistics(props.jvm.gc, props.observationWindowMs);
  nonNegative(
    Object.fromEntries(
      (["live", "daemon", "peak", "blocked"] as const).map((key) => [
        `threads.${key}`,
        props.jvm!.threads[key],
      ]),
    ),
  );
  if (
    Object.values(props.jvm.threads).some((value) => !Number.isInteger(value))
  )
    throw new Error("Thread counts must be integers");
  const { live, daemon, peak, blocked } = props.jvm.threads;
  if (daemon > live || blocked > live || live > peak)
    throw new Error("Thread counts require daemon and blocked <= live <= peak");
}
