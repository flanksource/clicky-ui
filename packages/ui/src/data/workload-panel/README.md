# WorkloadPanel

`WorkloadPanel` presents one container snapshot: CPU and memory request/limit gauges, separate heap and non-heap memory stacks, GC collection duration (average, p90, p95, maximum), GC overhead, and live/daemon/peak/blocked thread counts. It reuses `WorkloadCard` for identity, status, and Kubernetes icons. The layout follows its container width, including a single-column compact layout.

Install `@flanksource/clicky-ui`, import its stylesheet in your application entry point, and supply measurements from your own API. Fetching and refresh scheduling belong to the caller; this component does not require `QueryClientProvider`.

```tsx
import { WorkloadPanel } from "@flanksource/clicky-ui";
import "@flanksource/clicky-ui/styles.css";

const MB = 1024 ** 2;

export function ContainerOverview() {
  return (
    <WorkloadPanel
      workload={{
        kind: "deployment",
        name: "api",
        namespace: "services",
        status: { label: "Running", health: "healthy" },
      }}
      container="server"
      observationWindowMs={60 * 60 * 1000}
      cpu={{ average: 0.3, request: 0.5, limit: 1, p90: 0.6, p95: 0.8 }}
      memory={{
        average: 1024 * MB,
        request: 1024 * MB,
        limit: 2048 * MB,
        p90: 1200 * MB,
        p95: 1500 * MB,
      }}
      jvm={{
        heap: {
          average: 700 * MB,
          request: 512 * MB,
          limit: 1024 * MB,
          p90: 800 * MB,
          p95: 900 * MB,
        },
        regions: {
          eden: 200 * MB,
          survivor: 50 * MB,
          old: 450 * MB,
          metaspace: 100 * MB,
          codeCache: 50 * MB,
          direct: 100 * MB,
        },
        gc: {
          count: 100,
          timeMs: 5000,
          p90Ms: 80,
          p95Ms: 90,
          maxMs: 100,
          percentP90: 0.4,
          percentP95: 0.9,
        },
        threads: { live: 24, daemon: 8, peak: 32, blocked: 0 },
      }}
    />
  );
}
```

| Prop                  | Meaning                                                                                                          |
| --------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `workload`            | Existing `WorkloadCardWorkload` identity, Kubernetes kind, status, namespace, and optional metadata.             |
| `container`           | Container name appended to the workload name.                                                                    |
| `observationWindowMs` | Positive duration covered by every statistic. GC overhead is cumulative `gc.timeMs / observationWindowMs * 100`. |
| `cpu`                 | Average, p90, p95, limit, and optional request in CPU cores.                                                     |
| `memory`              | The same statistics in bytes. Values and tooltips use the shared byte formatter.                                 |
| `jvm`                 | Optional heap statistics, region averages, GC measurements, and thread counts. Omit for non-JVM containers.      |
| `headerActions`       | Optional caller-owned controls beside status and observation window.                                             |
| `className`           | Optional classes on the panel's container.                                                                       |

Region averages must describe the same window. Eden, Survivor, and Old Gen sum to average heap usage; all supplied regions must fit within average process memory. Remaining process memory is shown as Other native. `WorkloadMemoryStack` takes `part`: `heap` stacks Eden, Survivor and Old Gen against the heap limit; `nonHeap` stacks Metaspace, Code Cache, Direct Buffers and Other native against the memory limit; `all` (default) stacks every region against the memory limit. Maxima below observed usage expand the stack scale so data stays visible.

GC durations use milliseconds. `count` and `timeMs` determine the mean; p90, p95, and maximum are observed collection durations. GC overhead is shown as average, P90, and P95: the average is derived from `timeMs` over the window, while `percentP90` and `percentP95` are percentiles (0-100) of the per-interval share of wall-clock time spent in GC. When no collections occurred, pass zeros for every GC field: the panel reports zero overhead and an uncollected mean. Invalid windows, non-finite or negative observations, inconsistent region totals, and impossible thread counts throw contextual errors.

`WorkloadMemoryStack` and `WorkloadMemoryLegend` are also exported for tables that need the same region colors and accounting. Run the kitchen sink with `pnpm --filter kitchen-sink dev`, then open `http://localhost:5801/?demo=workload-panel` for the interactive example. Storybook provides Default, Compact, WithoutJvm, and NoCollections stories under Charts/WorkloadPanel.
