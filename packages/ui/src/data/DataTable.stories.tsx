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

const meta = {
  title: "Data/DataTable",
  component: DataTableShowcase,
} satisfies Meta<typeof DataTableShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
