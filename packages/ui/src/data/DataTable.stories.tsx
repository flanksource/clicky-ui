import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DataTable, type DataTableColumn } from "./DataTable";

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
    notes: "Primary public API with long-form notes that should keep its width.",
  },
  {
    service: "worker",
    status: "degraded",
    restarts: 3,
    owner: "data",
    notes: "Background job processor with retry queues.",
  },
  {
    service: "cron",
    status: "healthy",
    restarts: 1,
    owner: "platform",
    notes: "Nightly maintenance and reporting runner.",
  },
];

const columns: DataTableColumn<Row>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "status", label: "Status", shrink: true },
  {
    key: "restarts",
    label: "Restarts",
    shrink: true,
    align: "right",
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "owner", label: "Owner", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

type CompactRow = {
  name: string;
  state: string;
  age: string;
};

const compactRows: CompactRow[] = [
  { name: "api", state: "healthy", age: "12m" },
  { name: "worker", state: "degraded", age: "4m" },
  { name: "cron", state: "healthy", age: "2h" },
];

const compactColumns: DataTableColumn<CompactRow>[] = [
  { key: "name", label: "Name", shrink: true },
  { key: "state", label: "State", shrink: true },
  { key: "age", label: "Age", shrink: true, align: "right" },
];

type FitRow = {
  service: string;
  status: string;
  region: string;
  version: string;
  owner: string;
  latency: number;
};

const fitRows: FitRow[] = [
  {
    service: "api",
    status: "healthy",
    region: "us-east",
    version: "2026.04.1",
    owner: "platform",
    latency: 42,
  },
  {
    service: "billing",
    status: "healthy",
    region: "eu-west",
    version: "2026.04.0",
    owner: "finance",
    latency: 58,
  },
  {
    service: "worker",
    status: "degraded",
    region: "us-west",
    version: "2026.03.9",
    owner: "data",
    latency: 131,
  },
];

const fitColumns: DataTableColumn<FitRow>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "status", label: "Status", shrink: true },
  { key: "region", label: "Region", shrink: true },
  { key: "version", label: "Version", shrink: true },
  { key: "owner", label: "Owner", shrink: true },
  {
    key: "latency",
    label: "Latency ms",
    shrink: true,
    align: "right",
    sortValue: (value) => Number(value ?? 0),
  },
];

type WideRow = {
  service: string;
  namespace: string;
  cluster: string;
  region: string;
  zone: string;
  status: string;
  owner: string;
  version: string;
  cpu: string;
  memory: string;
  latency: number;
  restarts: number;
  updated: string;
  notes: string;
};

const wideRows: WideRow[] = [
  {
    service: "api",
    namespace: "frontend",
    cluster: "prod-a",
    region: "us-east",
    zone: "use1-a",
    status: "healthy",
    owner: "platform",
    version: "2026.04.1",
    cpu: "62%",
    memory: "5.1 GiB",
    latency: 42,
    restarts: 0,
    updated: "4m ago",
    notes: "Primary public API serving customer traffic.",
  },
  {
    service: "worker",
    namespace: "jobs",
    cluster: "prod-b",
    region: "us-west",
    zone: "usw2-c",
    status: "degraded",
    owner: "data",
    version: "2026.03.9",
    cpu: "78%",
    memory: "7.8 GiB",
    latency: 131,
    restarts: 3,
    updated: "9m ago",
    notes: "Queue processor draining delayed retry batches.",
  },
  {
    service: "billing",
    namespace: "finance",
    cluster: "prod-eu",
    region: "eu-west",
    zone: "euw1-b",
    status: "healthy",
    owner: "finance",
    version: "2026.04.0",
    cpu: "41%",
    memory: "3.4 GiB",
    latency: 58,
    restarts: 1,
    updated: "18m ago",
    notes: "Ledger sync and invoice reconciliation service.",
  },
];

const wideColumns: DataTableColumn<WideRow>[] = [
  { key: "service", label: "Service", grow: true },
  { key: "namespace", label: "Namespace", shrink: true },
  { key: "cluster", label: "Cluster", shrink: true },
  { key: "region", label: "Region", shrink: true },
  { key: "zone", label: "Zone", shrink: true },
  { key: "status", label: "Status", shrink: true },
  { key: "owner", label: "Owner", shrink: true },
  { key: "version", label: "Version", shrink: true },
  { key: "cpu", label: "CPU", align: "right", shrink: true },
  { key: "memory", label: "Memory", align: "right", shrink: true },
  {
    key: "latency",
    label: "Latency ms",
    align: "right",
    shrink: true,
    sortValue: (value) => Number(value ?? 0),
  },
  {
    key: "restarts",
    label: "Restarts",
    align: "right",
    shrink: true,
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "updated", label: "Updated", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

function DataTableShowcase() {
  const [timeFrom, setTimeFrom] = useState("now-24h");
  const [timeTo, setTimeTo] = useState("now");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
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
        dateRange: {
          from: dateFrom,
          to: dateTo,
          onApply: (from, to) => {
            setDateFrom(from);
            setDateTo(to);
          },
        },
      }}
      renderExpandedRow={(row) => (
        <div className="text-sm text-muted-foreground">
          {row.service} is owned by <strong>{row.owner}</strong>.
        </div>
      )}
    />
  );
}

function FewColumnsShowcase() {
  return (
    <DataTable
      data={compactRows}
      columns={compactColumns}
      defaultSort={{ key: "name", dir: "asc" }}
      columnResizeStorageKey="clicky-ui-story-data-table-few-columns"
    />
  );
}

function EverythingFitsShowcase() {
  return (
    <DataTable
      data={fitRows}
      columns={fitColumns}
      autoFilter
      defaultSort={{ key: "latency", dir: "asc" }}
      columnResizeStorageKey="clicky-ui-story-data-table-everything-fits"
    />
  );
}

function LotsOfColumnsShowcase() {
  return (
    <DataTable
      data={wideRows}
      columns={wideColumns}
      autoFilter
      defaultSort={{ key: "latency", dir: "asc" }}
      columnResizeStorageKey="clicky-ui-story-data-table-lots-of-columns"
    />
  );
}

const meta = {
  title: "Data/DataTable",
  component: DataTableShowcase,
} satisfies Meta<typeof DataTableShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const FewColumns: Story = {
  render: () => <FewColumnsShowcase />,
};

export const EverythingFits: Story = {
  render: () => <EverythingFitsShowcase />,
};

export const LotsOfColumns: Story = {
  render: () => <LotsOfColumnsShowcase />,
};
