import { useState } from "react";
import {
  Field,
  Select,
  WorkloadPanel,
  type WorkloadPanelProps,
} from "@flanksource/clicky-ui";
import {
  JVM_OBSERVATION_WINDOW_MS,
  workloadReadings,
  type WorkloadReading,
} from "./multi-gauge-fixtures";

function panelProps(row: WorkloadReading): WorkloadPanelProps {
  return {
    workload: {
      kind: "deployment",
      name: row.deployment,
      status: { label: "Running", health: "healthy" },
      metadata: [{ label: "pod", value: row.pod }],
    },
    container: row.container,
    observationWindowMs: JVM_OBSERVATION_WINDOW_MS,
    cpu: row.cpu,
    memory: row.memory,
    jvm: {
      heap: row.heap,
      regions: {
        eden: row.eden.average,
        survivor: row.survivor.average,
        old: row.old.average,
        metaspace: row.metaspace.average,
        codeCache: row.codeCache.average,
        direct: row.direct.average,
      },
      gc: row.gc,
      threads: row.threads,
    },
  };
}

export function WorkloadPanelDemo() {
  const [pod, setPod] = useState("worker-6c8d4f-b3n5m");
  const row = workloadReadings.find((item) => item.pod === pod);
  if (!row) throw new Error(`Unknown workload panel example: ${pod}`);
  return (
    <div className="w-full max-w-5xl space-y-4">
      <Field label="Container" htmlFor="workload-panel-container">
        <Select
          id="workload-panel-container"
          value={pod}
          onChange={(event) => setPod(event.target.value)}
          options={workloadReadings.map((item) => ({
            value: item.pod,
            label: `${item.deployment} / ${item.container} (${item.pod})`,
          }))}
        />
      </Field>
      <WorkloadPanel {...panelProps(row)} />
    </div>
  );
}
