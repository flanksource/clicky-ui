import { DataTable, type DataTableColumn } from "@flanksource/clicky-ui";
import { useState } from "react";
import { DemoSection } from "./Section";

type LogRow = {
  ts: string;
  level: string;
  service: string;
  message: string;
  duration_ms: number;
  tags: string[];
};

type Spread = "subMinute" | "sameDay" | "multiYear";

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
  {
    key: "level",
    label: "Status",
    kind: "status",
    shrink: true,
    status: { showLabel: true },
  },
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

type StatusOnlyRow = {
  service: string;
  state: string;
  notes: string;
};

const statusRows: StatusOnlyRow[] = [
  { service: "api", state: "ok", notes: "all green" },
  { service: "worker", state: "ERROR", notes: "stack overflow during retry" },
  { service: "billing", state: "warning", notes: "p95 latency above SLO" },
  { service: "auth", state: "healthy", notes: "issuing tokens" },
  { service: "search", state: "failed", notes: "circuit broken" },
  { service: "cron", state: "degraded", notes: "1/3 retries failing" },
  { service: "router", state: "info", notes: "info-only event" },
  { service: "metrics", state: "mystery", notes: "unmapped value falls through" },
];

const statusColumns: DataTableColumn<StatusOnlyRow>[] = [
  {
    key: "state",
    label: "Status",
    kind: "status",
    shrink: true,
    status: { showLabel: true },
  },
  { key: "service", label: "Service", shrink: true },
  { key: "notes", label: "Notes", grow: true },
];

export function TraceLogsDemo() {
  const [spread, setSpread] = useState<Spread>("sameDay");
  const data = buildLogs(spread);

  return (
    <DemoSection
      id="trace-logs"
      title="Trace logs"
      description="DataTable with the new built-in column kinds: adaptive timestamps, tag chips with overflow + value filters, and tokenized status dots. The same column defs handle sub-minute, same-day, and multi-year data spreads."
    >
      <div className="flex flex-wrap items-center gap-density-2">
        <span className="text-sm text-muted-foreground">Data spread:</span>
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
        <span className="text-xs text-muted-foreground">
          Timestamps adapt to the spread; tag values feed the auto-filter; status tokens (ERROR /
          failed / warning / OK) collapse to three filter buckets.
        </span>
      </div>

      <DataTable
        data={data}
        columns={logColumns}
        autoFilter
        defaultSort={{ key: "ts", dir: "desc" }}
        columnResizeStorageKey={`clicky-ui-kitchen-trace-logs-${spread}`}
      />

      <div className="space-y-density-2 border-t border-border pt-density-3">
        <h3 className="text-sm font-medium">Status dot only</h3>
        <p className="text-xs text-muted-foreground">
          Mixed-case status strings (<code>ERROR</code>, <code>failed</code>, <code>warning</code>,{" "}
          <code>OK</code>, <code>healthy</code>) all collapse to the same three filter buckets.
          Unmapped values render as “—”.
        </p>
        <DataTable
          data={statusRows}
          columns={statusColumns}
          autoFilter
          columnResizeStorageKey="clicky-ui-kitchen-trace-logs-status"
        />
      </div>
    </DemoSection>
  );
}
