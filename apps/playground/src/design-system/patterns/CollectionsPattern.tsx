import { useMemo, useState } from "react";
import {
  Badge,
  DataTable,
  Panel,
  type DataTableColumn,
} from "@flanksource/clicky-ui";

interface ServiceRow extends Record<string, unknown> {
  service: string;
  namespace: string;
  status: string;
  owner: string;
  checked: string;
}

const SERVICES: ServiceRow[] = [
  { service: "config-api", namespace: "platform", status: "Healthy", owner: "Platform", checked: "2m ago" },
  { service: "canary-runner", namespace: "monitoring", status: "Healthy", owner: "Reliability", checked: "4m ago" },
  { service: "notification-hub", namespace: "platform", status: "Warning", owner: "Platform", checked: "8m ago" },
  { service: "evidence-store", namespace: "compliance", status: "Healthy", owner: "Trust", checked: "11m ago" },
  { service: "asset-indexer", namespace: "inventory", status: "Failed", owner: "Inventory", checked: "14m ago" },
  { service: "policy-engine", namespace: "compliance", status: "Healthy", owner: "Trust", checked: "16m ago" },
  { service: "topology-sync", namespace: "inventory", status: "Warning", owner: "Inventory", checked: "18m ago" },
  { service: "audit-export", namespace: "reporting", status: "Healthy", owner: "Reporting", checked: "21m ago" },
];

const COLUMNS: DataTableColumn<ServiceRow>[] = [
  { key: "service", label: "Service", grow: true, sortable: true, filterable: true },
  { key: "namespace", label: "Namespace", filterable: true },
  { key: "status", label: "Status", kind: "status", filterable: true },
  { key: "owner", label: "Owner", filterable: true },
  { key: "checked", label: "Last checked", align: "right" },
];

export function CollectionsPattern() {
  const [selected, setSelected] = useState(SERVICES[0]!);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(4);
  const rows = useMemo(
    () => SERVICES.slice(page * pageSize, (page + 1) * pageSize),
    [page, pageSize],
  );

  return (
    <div className="grid min-h-[32rem] gap-density-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="h-[32rem] min-h-0 overflow-hidden rounded-xl border border-border bg-card">
        <DataTable
          data={rows}
          columns={COLUMNS}
          autoFilter
          globalFilterPlaceholder="Search services…"
          getRowId={(row) => row.service}
          onRowClick={setSelected}
          isRowClickable={() => true}
          getRowClassName={(row) => row.service === selected.service ? "bg-primary/5" : undefined}
          pagination={{
            page,
            pageSize,
            total: SERVICES.length,
            onPageChange: setPage,
            onPageSizeChange: (next) => {
              setPage(0);
              setPageSize(next);
            },
            pageSizeOptions: [4, 8],
          }}
          className="h-full"
        />
      </div>

      <Panel title="Selected service" tone={selected.status === "Failed" ? "danger" : "default"} padded>
        <div className="space-y-density-4">
          <div>
            <p className="text-lg font-semibold text-foreground">{selected.service}</p>
            <p className="text-xs text-muted-foreground">{selected.namespace} namespace</p>
          </div>
          <Badge
            tone={selected.status === "Healthy" ? "success" : selected.status === "Warning" ? "warning" : "danger"}
            clickToCopy={false}
          >
            {selected.status}
          </Badge>
          <dl className="grid grid-cols-[auto_1fr] gap-x-density-3 gap-y-density-2 text-sm">
            <dt className="text-muted-foreground">Owner</dt>
            <dd className="text-right font-medium text-foreground">{selected.owner}</dd>
            <dt className="text-muted-foreground">Checked</dt>
            <dd className="text-right text-foreground">{selected.checked}</dd>
          </dl>
          <p className="border-t border-border pt-density-3 text-xs leading-5 text-muted-foreground">
            Selection opens context without replacing the collection or losing its filters.
          </p>
        </div>
      </Panel>
    </div>
  );
}
