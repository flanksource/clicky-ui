import {
  WorkloadMemoryLegend,
  WorkloadMemoryStack,
  type WorkloadMemoryPart,
} from "@flanksource/clicky-ui";
import type { WorkloadReading } from "./multi-gauge-fixtures";

export function MultiGaugeJvmMemory({
  row,
  part = "all",
}: {
  row: WorkloadReading;
  part?: WorkloadMemoryPart;
}) {
  return (
    <WorkloadMemoryStack
      label={`${row.pod} ${part === "heap" ? "Heap" : "JVM memory"}`}
      memory={row.memory}
      part={part}
      jvm={{
        heap: row.heap,
        regions: {
          eden: row.eden.average,
          survivor: row.survivor.average,
          old: row.old.average,
          metaspace: row.metaspace.average,
          codeCache: row.codeCache.average,
          direct: row.direct.average,
        },
      }}
    />
  );
}

export function MultiGaugeJvmMemoryLegend() {
  return <WorkloadMemoryLegend />;
}
