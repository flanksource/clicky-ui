import {
  DataTable,
  MultiGaugeBar,
  type DataTableColumn,
} from "@flanksource/clicky-ui";
import { formatDuration } from "@flanksource/clicky-ui/utils";
import {
  UiLangJava,
  UiChip,
  UiMemoryStick,
  UiTimer,
  UiDumpThreads,
} from "@flanksource/clicky-ui/icons";
import {
  DeploymentContainerName,
  MultiGaugeResourceCell,
} from "./MultiGaugeResourceCell";
import {
  MultiGaugeJvmMemory,
  MultiGaugeJvmMemoryLegend,
} from "./MultiGaugeJvmMemory";
import {
  JVM_OBSERVATION_WINDOW_MS,
  workloadReadings,
  type WorkloadReading,
} from "./multi-gauge-fixtures";

const columns: DataTableColumn<WorkloadReading>[] = [
  {
    key: "deployment",
    label: "Deployment / container",
    minWidth: 220,
    filterValue: (_, row) => `${row.deployment} / ${row.container}`,
    render: (_, row) => <DeploymentContainerName row={row} />,
  },
  {
    key: "cpuUsage",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <UiChip size={14} />
        CPU usage
      </span>
    ),
    minWidth: 220,
    accessor: (row) => row.cpu.average,
    filterKind: "number",
    numberUnit: "cores",
    render: (_, row) => (
      <MultiGaugeResourceCell
        label={`${row.pod} CPU usage`}
        reading={row.cpu}
        kind="cpu"
      />
    ),
  },
  {
    key: "memoryUsage",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <UiMemoryStick size={14} />
        Memory usage
      </span>
    ),
    minWidth: 240,
    accessor: (row) => row.memory.average,
    filterValue: (_, row) => row.memory.average / 1024 ** 2,
    filterKind: "number",
    numberUnit: "MB",
    render: (_, row) => (
      <MultiGaugeResourceCell
        label={`${row.pod} Memory usage`}
        reading={row.memory}
        kind="memory"
      />
    ),
  },
  {
    key: "memory",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <UiMemoryStick size={14} />
        JVM Memory
      </span>
    ),
    minWidth: 340,
    grow: true,
    sortValue: (_, row) => row.memory.average,
    filterValue: (_, row) => row.memory.average / 1024 ** 2,
    filterKind: "number",
    numberUnit: "MB",
    render: (_, row) => <MultiGaugeJvmMemory row={row} />,
  },
  {
    key: "heap",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <UiMemoryStick size={14} />
        Heap regions
      </span>
    ),
    minWidth: 280,
    grow: true,
    sortValue: (_, row) => row.heap.average,
    filterValue: (_, row) => row.heap.average / 1024 ** 2,
    filterKind: "number",
    numberUnit: "MB",
    render: (_, row) => <MultiGaugeJvmMemory row={row} part="heap" />,
  },
  {
    key: "gc.duration",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <UiTimer size={14} />
        GC time
      </span>
    ),
    minWidth: 280,
    grow: true,
    accessor: (row) => row.gc.timeMs / row.gc.count,
    filterKind: "duration",
    filterUnit: "ms",
    render: (_, row) => (
      <MultiGaugeBar
        label={`${row.pod} GC collection time`}
        variant="cell"
        average={row.gc.timeMs / row.gc.count}
        max={row.gc.maxMs}
        formatValue={formatDuration}
        markers={[
          { label: "P90", value: row.gc.p90Ms, tone: "warning" },
          { label: "P95", value: row.gc.p95Ms, tone: "danger" },
          { label: "Max", value: row.gc.maxMs },
        ]}
      />
    ),
  },
  {
    key: "gc.percent",
    label: "GC %",
    minWidth: 110,
    align: "right",
    accessor: (row) => (row.gc.timeMs / JVM_OBSERVATION_WINDOW_MS) * 100,
    filterKind: "number",
    numberUnit: "%",
    render: (_, row) => (
      <span
        className="whitespace-nowrap text-xs tabular-nums"
        title={`${formatDuration(row.gc.timeMs)} GC time / ${formatDuration(JVM_OBSERVATION_WINDOW_MS)} observation window`}
      >
        {((row.gc.timeMs / JVM_OBSERVATION_WINDOW_MS) * 100).toFixed(4)}%
      </span>
    ),
  },
  {
    key: "gc.count",
    label: "GC count / total",
    minWidth: 145,
    align: "right",
    filterKind: "number",
    render: (_, row) => (
      <span
        className="whitespace-nowrap text-xs tabular-nums"
        title="G1 collection count and cumulative time over 24 hours"
      >
        {row.gc.count} / {formatDuration(row.gc.timeMs)}
      </span>
    ),
  },
  {
    key: "threads.live",
    label: (
      <span className="inline-flex items-center gap-1.5">
        <UiDumpThreads size={14} />
        Threads / peak
      </span>
    ),
    minWidth: 145,
    align: "right",
    filterKind: "number",
    render: (_, row) => (
      <span
        className="whitespace-nowrap text-xs tabular-nums"
        title={`${row.threads.daemon} daemon threads`}
      >
        {row.threads.live} / {row.threads.peak}
      </span>
    ),
  },
  {
    key: "threads.blocked",
    label: "Blocked",
    minWidth: 90,
    align: "right",
    filterKind: "number",
  },
];

export function MultiGaugeJvmTable() {
  return (
    <section className="min-w-0 space-y-3" aria-label="JVM resources">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <UiLangJava size={20} />
          JVM resources
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Example G1 JVMs over 24 hours. CPU and memory usage appear first.
          Stacked colors show memory regions; unused capacity stays unfilled. GC
          time shows average collection duration with P90, P95 and the observed
          maximum. GC % is cumulative GC time divided by the 24-hour observation
          window.
        </p>
      </div>
      <MultiGaugeJvmMemoryLegend />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <span>GC time:</span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-[var(--fs-success-500)]" />
          Avg
        </span>
        {[
          { label: "P90", color: "fill-[var(--fs-warning)]" },
          { label: "P95", color: "fill-[var(--fs-error)]" },
          { label: "Max", color: "fill-muted-foreground" },
        ].map(({ label, color }) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <svg
              className={`h-2 w-2.5 ${color}`}
              viewBox="0 0 10 8"
              aria-hidden="true"
            >
              <path d="M0 0H10L5 8Z" />
            </svg>
            {label}
          </span>
        ))}
      </div>
      <DataTable
        data={workloadReadings}
        columns={columns}
        getRowId={(row) => row.pod}
        autoFilter
      />
    </section>
  );
}
