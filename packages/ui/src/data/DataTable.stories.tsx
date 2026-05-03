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

type LogRow = {
  ts: string;
  level: string;
  service: string;
  message: string;
  tags: string[];
};

function makeLogRows(spread: "subMinute" | "sameDay" | "multiYear"): LogRow[] {
  const base = new Date("2026-04-15T12:04:33Z").getTime();
  const services = ["api", "worker", "billing", "auth"];
  const levels = ["INFO", "WARN", "error", "ERR", "failed", "ok"];
  const tagPool = [
    ["region:us-east", "tier:edge", "v=2026.04.1"],
    ["region:eu-west", "tier:core"],
    ["region:us-west", "tier:edge", "v=2026.04.0", "owner=platform"],
    ["region:eu-west", "tier:core", "owner=finance"],
    ["region:us-east"],
    ["region:ap-south", "tier:edge", "v=2026.03.9"],
  ];

  const stepMs =
    spread === "subMinute" ? 8_000 : spread === "sameDay" ? 1_800_000 : 86_400_000 * 90;

  return Array.from({ length: 6 }, (_, i) => ({
    ts: new Date(base + stepMs * i).toISOString(),
    level: levels[i % levels.length],
    service: services[i % services.length],
    message: `event #${i} from ${services[i % services.length]}`,
    tags: tagPool[i % tagPool.length],
  }));
}

const logColumns: DataTableColumn<LogRow>[] = [
  { key: "ts", label: "Timestamp", kind: "timestamp", shrink: true },
  { key: "level", label: "Status", kind: "status", shrink: true, status: { showLabel: true } },
  { key: "service", label: "Service", shrink: true },
  { key: "message", label: "Message", grow: true },
  { key: "tags", label: "Tags", kind: "tags", grow: true, tags: { maxVisible: 2 } },
];

function TimestampsShowcase() {
  const [spread, setSpread] = useState<"subMinute" | "sameDay" | "multiYear">("sameDay");
  const data = makeLogRows(spread);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Data spread:</span>
        {(["subMinute", "sameDay", "multiYear"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSpread(option)}
            className={`rounded-md border px-2 py-1 text-xs ${
              spread === option ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <DataTable
        data={data}
        columns={logColumns}
        autoFilter
        defaultSort={{ key: "ts", dir: "desc" }}
        columnResizeStorageKey={`clicky-ui-story-data-table-timestamps-${spread}`}
      />
    </div>
  );
}

type TagRow = {
  id: string;
  name: string;
  tags: string[];
};

const tagRows: TagRow[] = [
  {
    id: "1",
    name: "auth-service",
    tags: ["env=prod", "team=identity", "tier=edge", "region=us-east", "v=2026.04.1"],
  },
  { id: "2", name: "billing-svc", tags: ["env=prod", "team=finance", "tier=core"] },
  { id: "3", name: "ingest-pipeline", tags: ["env=staging", "team=data", "tier=core"] },
  { id: "4", name: "marketing-site", tags: ["env=prod", "team=growth"] },
  {
    id: "5",
    name: "many-tags",
    tags: Array.from({ length: 30 }, (_, i) => `label-${i}=value-${i}`),
  },
];

const tagColumns: DataTableColumn<TagRow>[] = [
  { key: "id", label: "ID", shrink: true },
  { key: "name", label: "Name", grow: true },
  { key: "tags", label: "Tags", kind: "tags", grow: true, tags: { maxVisible: 3 } },
];

function TagsShowcase() {
  return (
    <DataTable
      data={tagRows}
      columns={tagColumns}
      autoFilter
      columnResizeStorageKey="clicky-ui-story-data-table-tags"
    />
  );
}

type StatusRow = {
  service: string;
  state: string;
  notes: string;
};

const statusRows: StatusRow[] = [
  { service: "api", state: "ok", notes: "running normally" },
  { service: "worker", state: "ERROR", notes: "stack overflow" },
  { service: "billing", state: "warning", notes: "latency p95 elevated" },
  { service: "auth", state: "healthy", notes: "all checks green" },
  { service: "search", state: "failed", notes: "circuit broken" },
  { service: "cron", state: "degraded", notes: "1/3 retries" },
  { service: "router", state: "info", notes: "info-only event" },
  { service: "unknown", state: "mystery", notes: "unmapped value falls through" },
];

const statusColumns: DataTableColumn<StatusRow>[] = [
  { key: "state", label: "Status", kind: "status", shrink: true, status: { showLabel: true } },
  { key: "service", label: "Service", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

function StatusDotShowcase() {
  return (
    <DataTable
      data={statusRows}
      columns={statusColumns}
      autoFilter
      columnResizeStorageKey="clicky-ui-story-data-table-status-dot"
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

export const Timestamps: Story = {
  render: () => <TimestampsShowcase />,
};

export const Tags: Story = {
  render: () => <TagsShowcase />,
};

export const StatusDots: Story = {
  render: () => <StatusDotShowcase />,
};
