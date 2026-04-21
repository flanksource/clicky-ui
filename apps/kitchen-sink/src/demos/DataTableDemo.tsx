import { DataTable, type DataTableColumn } from "@flanksource/clicky-ui";
import { useState } from "react";
import { DemoSection } from "./Section";

type Row = {
  service: string;
  status: string;
  restarts: number;
  owner: string;
  notes: string;
};

const rows: Row[] = [
  {
    service: "api",
    status: "healthy",
    restarts: 0,
    owner: "platform",
    notes: "Primary public API with room to grow.",
  },
  {
    service: "worker",
    status: "degraded",
    restarts: 3,
    owner: "data",
    notes: "Background processing with retry queues and backoff.",
  },
  {
    service: "cron",
    status: "healthy",
    restarts: 1,
    owner: "platform",
    notes: "Nightly maintenance and reporting jobs.",
  },
];

const columns: DataTableColumn<Row>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "status", label: "Status", shrink: true },
  {
    key: "restarts",
    label: "Restarts",
    align: "right",
    shrink: true,
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "owner", label: "Owner", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

export function DataTableDemo() {
  const [timeFrom, setTimeFrom] = useState("now-24h");
  const [timeTo, setTimeTo] = useState("now");

  return (
    <DemoSection
      id="data-table"
      title="DataTable"
      description="Shared sortable table using FilterBar natively for search, numeric and categorical filters, and range controls."
    >
      <DataTable
        data={rows}
        columns={columns}
        autoFilter
        defaultSort={{ key: "restarts", dir: "asc" }}
        filterBarProps={{
          timeRange: {
            from: timeFrom,
            to: timeTo,
            onApply: (from, to) => {
              setTimeFrom(from);
              setTimeTo(to);
            },
          },
        }}
        renderExpandedRow={(row) => (
          <div className="text-sm text-muted-foreground">
            {row.service} is owned by <strong>{row.owner}</strong>.
          </div>
        )}
      />
    </DemoSection>
  );
}
