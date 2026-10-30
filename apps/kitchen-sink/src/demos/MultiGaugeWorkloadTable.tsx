import { DataTable, Icon, type DataTableColumn } from "@flanksource/clicky-ui";
import { UiChip, UiMemoryStick } from "@flanksource/clicky-ui/icons";
import { K8SDeployment } from "@flanksource/icons/mi";
import {
  DeploymentContainerName,
  MultiGaugeLegend,
  MultiGaugeResourceCell,
} from "./MultiGaugeResourceCell";
import { workloadReadings, type WorkloadReading } from "./multi-gauge-fixtures";

const resourceColumns = [
  { key: "cpu", label: "CPU", icon: UiChip },
  { key: "memory", label: "Memory", icon: UiMemoryStick },
] as const;

const columns: DataTableColumn<WorkloadReading>[] = [
  {
    key: "deployment",
    label: "Deployment / container",
    minWidth: 220,
    filterValue: (_, row) => `${row.deployment} / ${row.container}`,
    render: (_, row) => <DeploymentContainerName row={row} />,
  },
  ...resourceColumns.map(
    ({ key, label, icon: MetricIcon }): DataTableColumn<WorkloadReading> => ({
      key,
      label: (
        <span className="inline-flex items-center gap-1.5">
          <MetricIcon size={16} />
          {label}
        </span>
      ),
      minWidth: 280,
      grow: true,
      sortValue: (_, row) => row[key].average,
      filterValue: (_, row) =>
        key === "memory" ? row[key].average / 1024 ** 2 : row[key].average,
      filterKind: "number",
      numberUnit: key === "memory" ? "MB" : "cores",
      render: (_, row) => (
        <MultiGaugeResourceCell
          label={`${row.pod} ${label}`}
          reading={row[key]}
          kind={key}
        />
      ),
    }),
  ),
];

export function MultiGaugeWorkloadTable() {
  return (
    <section className="min-w-0 space-y-3" aria-label="Workload resources">
      <div>
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <Icon icon={K8SDeployment} width={20} />
          Workload resources
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Six example containers over 24 hours. CPU and memory show average
          usage, request, P90, P95 and limit. Hover for exact marker values and
          full pod IDs.
        </p>
      </div>
      <MultiGaugeLegend />
      <DataTable
        data={workloadReadings}
        columns={columns}
        getRowId={(row) => row.pod}
        autoFilter
      />
    </section>
  );
}
