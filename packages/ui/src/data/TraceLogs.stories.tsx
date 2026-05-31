import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { DataTable, type DataTableColumn } from "./DataTable";

type Spread = "subMinute" | "sameDay" | "multiYear";

type LogRow = {
  ts: string;
  level: string;
  service: string;
  message: string;
  duration_ms: number;
  tags: string[];
};

function buildLogs(spread: Spread): LogRow[] {
  const base = new Date("2026-04-15T12:04:33Z").getTime();
  const services = ["api", "worker", "billing", "auth", "search", "cron"];
  const levels = ["INFO", "WARN", "error", "ERR", "ok", "failed", "degraded"];
  const tagSets = [
    ["region=us-east", "tier=edge", "version=2026.04.1", "team=platform"],
    ["region=eu-west", "tier=core", "team=finance"],
    ["region=us-west", "tier=edge", "version=2026.04.0", "owner=platform"],
    ["region=eu-west", "tier=core", "owner=finance", "team=billing"],
    ["region=us-east"],
    ["region=ap-south", "tier=edge", "version=2026.03.9", "team=growth"],
    ["region=us-east", "tier=edge", "team=identity"],
    [
      "region=us-east",
      "tier=edge",
      "team=platform",
      "version=2026.04.1",
      "owner=platform",
      "shard=primary",
      "trace=high-cardinality",
      "experiment=on",
    ],
  ];
  const messages = [
    "request handled",
    "queue drained",
    "circuit broke; falling back to read replica",
    "ledger sync completed",
    "auth succeeded",
    "search timeout",
    "cron tick",
    "publish accepted",
  ];

  const stepMs =
    spread === "subMinute" ? 9_000 : spread === "sameDay" ? 1_800_000 : 86_400_000 * 90;

  return Array.from({ length: 14 }, (_, i) => ({
    ts: new Date(base + stepMs * i).toISOString(),
    level: levels[i % levels.length]!,
    service: services[i % services.length]!,
    message: messages[i % messages.length]!,
    duration_ms: 12 + ((i * 37) % 980),
    tags: tagSets[i % tagSets.length]!,
  }));
}

const logColumns: DataTableColumn<LogRow>[] = [
  { key: "ts", label: "Timestamp", kind: "timestamp", shrink: true },
  { key: "level", label: "Status", kind: "status", shrink: true, status: { showLabel: true } },
  { key: "service", label: "Service", shrink: true },
  { key: "message", label: "Message", grow: true },
  {
    key: "duration_ms",
    label: "Duration ms",
    align: "right",
    shrink: true,
    sortValue: (value) => Number(value ?? 0),
  },
  { key: "tags", label: "Tags", kind: "tags", grow: true, tags: { maxVisible: 3 } },
];

function TraceLogsShowcase({
  autoFilter = true,
  showGlobalFilter = true,
  showHeaderFilters = true,
}: {
  autoFilter?: boolean;
  showGlobalFilter?: boolean;
  showHeaderFilters?: boolean;
}) {
  const [spread, setSpread] = useState<Spread>("sameDay");
  const data = buildLogs(spread);
  return (
    <div className="space-y-density-2">
      <div className="flex flex-wrap items-center gap-density-2 text-sm">
        <span className="text-muted-foreground">Data spread:</span>
        {(["subMinute", "sameDay", "multiYear"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSpread(option)}
            className={`rounded-md border px-density-2 py-density-1 text-xs ${
              spread === option
                ? "border-primary bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
      <DataTable
        data={data}
        columns={logColumns}
        autoFilter={autoFilter}
        defaultSort={{ key: "ts", dir: "desc" }}
        showGlobalFilter={showGlobalFilter}
        showHeaderFilters={showHeaderFilters}
        columnResizeStorageKey={`clicky-ui-story-trace-logs-${spread}`}
      />
    </div>
  );
}

const meta: Meta<typeof DataTable> = {
  title: "Data/DataTable/TraceLogs",
  component: DataTable,
  args: {
    data: buildLogs("sameDay"),
    columns: logColumns,
    autoFilter: true,
    showGlobalFilter: true,
    showHeaderFilters: true,
    defaultSort: { key: "ts", dir: "desc" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Trace-log composition combining every built-in column kind in one table: adaptive timestamps, tokenized status dots with collapsible labels, a right-aligned numeric duration, and tag chips with overflow + value filters. The same column defs handle sub-minute, same-day, and multi-year data spreads.",
      },
    },
  },
};

export default meta;

export const TraceLogs: StoryObj<typeof DataTable<LogRow>> = {
  render: (args) => (
    <TraceLogsShowcase
      autoFilter={args.autoFilter}
      showGlobalFilter={args.showGlobalFilter}
      showHeaderFilters={args.showHeaderFilters}
    />
  ),
};
