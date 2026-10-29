import {
  UiChip,
  UiMemoryStick,
  UiLangJava,
  UiTimer,
  UiDumpThreads,
} from "../../icons";
import { formatBytes, formatDuration } from "../../lib/format";
import { MultiGaugeBar } from "../MultiGaugeBar";
import { MetricTile } from "../diagnostics/MetricTile";
import { gcStatistics } from "./model";
import { WorkloadMemoryLegend, WorkloadMemoryStack } from "./MemoryStack";
import type {
  WorkloadJvmStatistics,
  WorkloadResourceStatistics,
} from "./types";

export function ResourceMetrics({
  cpu,
  memory,
}: {
  cpu: WorkloadResourceStatistics;
  memory: WorkloadResourceStatistics;
}) {
  return (
    <div className="grid min-w-0 gap-4 @2xl:grid-cols-2">
      {(
        [
          { label: "CPU usage", reading: cpu, Icon: UiChip, bytes: false },
          {
            label: "Memory usage",
            reading: memory,
            Icon: UiMemoryStick,
            bytes: true,
          },
        ] as const
      ).map(({ label, reading, Icon, bytes }) => (
        <section key={label} className="min-w-0 space-y-1" aria-label={label}>
          <h3 className="flex items-center gap-1.5 text-sm font-medium">
            <Icon size={16} />
            {label}
          </h3>
          <MultiGaugeBar
            label={label}
            variant="cell"
            average={reading.average}
            max={reading.limit}
            {...(!bytes ? { unit: "cores" } : {})}
            formatValue={
              bytes ? formatBytes : (value) => String(Number(value.toFixed(2)))
            }
            markers={[
              ...(reading.request === undefined
                ? []
                : [
                    {
                      label: "Request",
                      value: reading.request,
                      tone: "info" as const,
                    },
                  ]),
              { label: "P90", value: reading.p90, tone: "warning" },
              { label: "P95", value: reading.p95, tone: "danger" },
              { label: "Limit", value: reading.limit },
            ]}
          />
        </section>
      ))}
    </div>
  );
}

export function JvmMetrics({
  jvm,
  memory,
  observationWindowMs,
}: {
  jvm: WorkloadJvmStatistics;
  memory: WorkloadResourceStatistics;
  observationWindowMs: number;
}) {
  const gc = gcStatistics(jvm.gc, observationWindowMs);
  return (
    <section
      className="space-y-4 border-t border-border pt-4"
      aria-label="JVM metrics"
    >
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <UiLangJava size={18} />
        JVM
      </h3>
      <div className="grid min-w-0 gap-4 @2xl:grid-cols-2">
        {(
          [
            { label: "Heap", part: "heap" },
            { label: "Non-heap", part: "nonHeap" },
          ] as const
        ).map(({ label, part }) => (
          <div key={label} className="min-w-0 space-y-1">
            <h4 className="text-xs text-muted-foreground">{label}</h4>
            <WorkloadMemoryStack
              label={label}
              memory={memory}
              jvm={jvm}
              part={part}
            />
          </div>
        ))}
      </div>
      <WorkloadMemoryLegend />
      <div className="grid min-w-0 items-end gap-4 @2xl:grid-cols-2">
        <section className="min-w-0 space-y-1" aria-label="Garbage collection">
          <h4 className="flex items-center gap-1.5 text-sm font-medium">
            <UiTimer size={16} />
            GC collection time
          </h4>
          <MultiGaugeBar
            label="GC collection time"
            variant="cell"
            {...(gc.averageMs === undefined ? {} : { average: gc.averageMs })}
            max={jvm.gc.maxMs}
            formatValue={formatDuration}
            markers={[
              { label: "P90", value: jvm.gc.p90Ms, tone: "warning" },
              { label: "P95", value: jvm.gc.p95Ms, tone: "danger" },
              { label: "Max", value: jvm.gc.maxMs },
            ]}
          />
        </section>
        <section className="min-w-0 space-y-1" aria-label="Time in GC">
          <h4 className="flex items-center gap-1.5 text-sm font-medium">
            <UiTimer size={16} />
            Time in GC
          </h4>
          <MultiGaugeBar
            label="Time in GC"
            variant="cell"
            average={gc.percentage}
            formatValue={(value) => `${Number(value.toPrecision(3))}%`}
            markers={[
              { label: "P90", value: jvm.gc.percentP90, tone: "warning" },
              { label: "P95", value: jvm.gc.percentP95, tone: "danger" },
            ]}
          />
        </section>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <MetricTile label="Collections" value={String(jvm.gc.count)} />
        <MetricTile label="Total GC" value={formatDuration(jvm.gc.timeMs)} />
      </div>
      <section className="space-y-2" aria-label="Threads">
        <h4 className="flex items-center gap-1.5 text-sm font-medium">
          <UiDumpThreads size={16} />
          Threads
        </h4>
        <div className="grid grid-cols-2 gap-2 @md:grid-cols-4">
          {[
            { label: "Live", value: jvm.threads.live },
            { label: "Daemon", value: jvm.threads.daemon },
            { label: "Peak", value: jvm.threads.peak },
            { label: "Blocked", value: jvm.threads.blocked },
          ].map(({ label, value }) => (
            <MetricTile key={label} label={label} value={String(value)} />
          ))}
        </div>
      </section>
    </section>
  );
}
