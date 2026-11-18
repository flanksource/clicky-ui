import { Icon, MultiGaugeBar } from "@flanksource/clicky-ui";
import { formatBytes } from "@flanksource/clicky-ui/utils";
import { K8SDeployment } from "@flanksource/icons/mi";
import type { ResourceReading, WorkloadReading } from "./multi-gauge-fixtures";

export function MultiGaugeResourceCell({
  label,
  reading,
  kind,
}: {
  label: string;
  reading: ResourceReading;
  kind: "cpu" | "memory" | "jvm";
}) {
  return (
    <MultiGaugeBar
      label={label}
      variant="cell"
      {...(kind === "cpu" ? { unit: "cores" } : {})}
      average={reading.average}
      max={reading.limit}
      formatValue={
        kind === "cpu"
          ? (value) => String(Number(value.toFixed(2)))
          : formatBytes
      }
      markers={[
        ...(reading.request === undefined
          ? []
          : [
              {
                label: kind === "jvm" ? "Initial heap" : "Request",
                value: reading.request,
                tone: "info" as const,
              },
            ]),
        { label: "P90", value: reading.p90, tone: "warning" },
        { label: "P95", value: reading.p95, tone: "danger" },
        { label: kind === "jvm" ? "Maximum" : "Limit", value: reading.limit },
      ]}
    />
  );
}

export function DeploymentContainerName({ row }: { row: WorkloadReading }) {
  return (
    <span
      className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-xs"
      title={`Pod: ${row.pod}`}
    >
      <Icon icon={K8SDeployment} width={16} className="shrink-0" />
      <span className="truncate">
        {row.deployment} / {row.container}
      </span>
    </span>
  );
}

export function MultiGaugeLegend({ jvm = false }: { jvm?: boolean }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
      {[
        {
          label: jvm ? "Initial heap" : "Request",
          color: "fill-[var(--clicky-info)]",
        },
        { label: "P90", color: "fill-[var(--clicky-warning)]" },
        { label: "P95", color: "fill-[var(--clicky-error)]" },
        { label: jvm ? "Maximum" : "Limit", color: "fill-muted-foreground" },
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
  );
}
