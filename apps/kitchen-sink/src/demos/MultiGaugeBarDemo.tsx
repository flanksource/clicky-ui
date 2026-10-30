import { MultiGaugeBar } from "@flanksource/clicky-ui";
import { formatBytes } from "@flanksource/clicky-ui/utils";
import { UiChip, UiMemoryStick } from "@flanksource/clicky-ui/icons";
import { MultiGaugeWorkloadTable } from "./MultiGaugeWorkloadTable";
import { MultiGaugeJvmTable } from "./MultiGaugeJvmTable";

export function MultiGaugeBarDemo() {
  return (
    <div className="min-w-0 space-y-6">
      <p className="text-sm text-muted-foreground">
        Kubernetes resource usage: average fill, request and limit markers, and
        small percentile pointers. Usage is inside the bar and the maximum is at
        its end.
      </p>
      <div className="grid max-w-7xl min-w-0 gap-4 lg:grid-cols-2">
        <MultiGaugeBar
          label="CPU"
          icon={<UiChip size={16} />}
          unit="cores"
          average={1.24}
          max={4}
          markers={[
            { label: "Request", value: 2, shape: "pointer", tone: "info" },
            { label: "P90", value: 2, tone: "warning" },
            { label: "P95", value: 2.4, tone: "danger" },
            { label: "Limit", value: 4, shape: "pointer" },
          ]}
          formatValue={(value) => String(Number(value.toFixed(2)))}
        />
        <MultiGaugeBar
          label="Memory"
          icon={<UiMemoryStick size={16} />}
          average={1382 * 1024 ** 2}
          max={4 * 1024 ** 3}
          markers={[
            {
              label: "Request",
              value: 2 * 1024 ** 3,
              shape: "pointer",
              tone: "info",
            },
            { label: "P90", value: 2662 * 1024 ** 2, tone: "warning" },
            { label: "P95", value: 3174 * 1024 ** 2, tone: "danger" },
            { label: "Limit", value: 4 * 1024 ** 3, shape: "pointer" },
          ]}
          formatValue={formatBytes}
        />
        <MultiGaugeBar
          label="Coincident percentiles"
          unit="cores"
          average={1.24}
          max={4}
          markers={[
            { label: "Request", value: 2, shape: "pointer", tone: "info" },
            { label: "P90", value: 2, tone: "warning" },
            { label: "P95", value: 2, tone: "danger" },
            { label: "Limit", value: 4, shape: "pointer" },
          ]}
        />
        <MultiGaugeBar
          label="Zero"
          average={0}
          max={0}
          markers={[{ label: "Max", value: 0 }]}
        />
      </div>
      <MultiGaugeWorkloadTable />
      <MultiGaugeJvmTable />
    </div>
  );
}
