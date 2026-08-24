import type { Meta, StoryObj } from "@storybook/react";
import { DebugConsole } from "./DebugConsole";
import { DebugConsoleButton } from "./DebugConsoleButton";
import { DebugClient } from "./debugClient";
import { DebugStore, type DebugStoreState } from "./debugStore";
import { InspectionTab } from "./tabs/InspectionTab";
import { NetworkTab } from "./tabs/NetworkTab";
import { QueriesTab } from "./tabs/QueriesTab";
import type { DebugLogLine, ExecutionSummary } from "./types";

/**
 * Fixtures shaped like a real session: a profile that ran two operations, an
 * OpenSearch query that made HTTP calls, and one that failed. A console with a
 * single happy row does not show what it is for.
 */

const records: ExecutionSummary[] = [
  {
    id: "d139f005",
    sequence: 1,
    source: { surface: "profile", profile: "activities", method: "GET", path: "/api/v1/profile/activities" },
    startedAt: "2026-08-23T10:00:00.000Z",
    durationMs: 42.3,
    rows: 75,
    status: 200,
    level: "trace2",
    operations: [
      {
        index: 1,
        provider: "postgres",
        connection: "connection://postgres/analytics",
        query: 'SELECT *, COUNT(*) OVER () AS "__cdb_total" FROM activities LIMIT 26',
        durationMs: 38.1,
        rows: 25,
        pages: 1,
      },
      {
        index: 2,
        provider: "postgres",
        connection: "connection://postgres/analytics",
        query: "SELECT name FROM regions WHERE id = ANY($1)",
        durationMs: 4.2,
        rows: 50,
      },
    ],
    counts: {
      operations: 2,
      harEntries: 0,
      harDropped: 0,
      logLines: 6,
      logDropped: 0,
      probes: 3,
      inspections: 2,
    },
  },
  {
    id: "a2c81f34",
    sequence: 2,
    source: { surface: "browser", method: "POST", path: "/api/v1/connection/logs/browser/query" },
    startedAt: "2026-08-23T10:00:04.000Z",
    durationMs: 512.6,
    rows: 200,
    status: 200,
    level: "debug",
    operations: [
      {
        index: 1,
        provider: "opensearch",
        connection: "connection://opensearch/logs",
        method: "POST",
        url: "https://logs.example.internal/logs-*/_search",
        status: 200,
        durationMs: 508,
        rows: 200,
      },
    ],
    counts: {
      operations: 1,
      harEntries: 3,
      harDropped: 0,
      logLines: 2,
      logDropped: 0,
      probes: 0,
      inspections: 1,
    },
  },
  {
    id: "77b0e1aa",
    sequence: 3,
    source: { surface: "sample", profile: "sample" },
    startedAt: "2026-08-23T10:00:09.000Z",
    durationMs: 15_004,
    rows: 0,
    status: 504,
    error: "profile \"sample\": provider \"clickhouse\" failed: context deadline exceeded",
    level: "trace",
    operations: [
      {
        index: 1,
        provider: "clickhouse",
        query: "SELECT * FROM events",
        durationMs: 15_000,
        rows: 0,
        error: "context deadline exceeded",
      },
    ],
    counts: {
      operations: 1,
      harEntries: 1,
      harDropped: 0,
      logLines: 4,
      logDropped: 0,
      probes: 0,
      inspections: 0,
    },
  },
];

const logs: DebugLogLine[] = [
  {
    sequence: 1,
    time: "2026-08-23T10:00:00.010Z",
    level: "debug",
    source: "request",
    logger: "query",
    event: "sql",
    message: "SELECT * FROM activities LIMIT 26",
    recordId: "d139f005",
    operation: 1,
  },
  {
    sequence: 2,
    time: "2026-08-23T10:00:04.100Z",
    level: "info",
    source: "process",
    logger: "server",
    message: "connection pool grew to 8",
  },
  {
    sequence: 3,
    time: "2026-08-23T10:00:19.000Z",
    level: "error",
    source: "request",
    logger: "query",
    message: "clickhouse read timed out after 15s",
    recordId: "77b0e1aa",
  },
];

const state: DebugStoreState = {
  records,
  logs,
  level: "debug",
  refreshInspection: false,
  connected: true,
  dropped: 0,
};

const inspectionClient = new DebugClient();
inspectionClient.runInspection = async (request) => ({
  summary: {
    ...records[0],
    id: "manual-inspection",
    counts: { ...records[0].counts, probes: 1, inspections: 1 },
  },
  inspections: [
    {
      policy: "column-cardinality",
      key: "manual-column-count",
      elapsedMs: 86.4,
      cached: !request.refresh,
      state: "fresh",
      ageMs: 0,
    },
  ],
  probes: [
    {
      provider: request.provider,
      connection: request.connection,
      column: request.columns?.[0] ?? "region",
      distinct: 7,
      limit: 50,
      kind: "list",
      cached: !request.refresh,
    },
  ],
});

const meta: Meta<typeof DebugConsole> = {
  title: "Devtools/DebugConsole",
  component: DebugConsole,
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div style={{ height: 420 }}>
      <DebugConsole {...args} />
    </div>
  ),
};
export default meta;

type Story = StoryObj<typeof DebugConsole>;

export const Queries: Story = { args: { state } };

export const Console: Story = { args: { state, tab: "console" } };

/** A capture with no HTTP traffic at all, which is the SQL case. */
export const NetworkEmpty: StoryObj<typeof NetworkTab> = {
  render: () => (
    <div style={{ height: 320 }}>
      <NetworkTab record={records[0]} entries={[]} />
    </div>
  ),
};

export const Inspection: StoryObj<typeof InspectionTab> = {
  render: () => (
    <div style={{ height: 460 }}>
      <InspectionTab
        record={records[0]}
        client={inspectionClient}
        // A warm cache, a cold one, and one mid-fill — the three states the
        // flush controls have to read sensibly against.
        caches={[
          {
            policy: "opensearch-fields",
            entries: 412,
            maxEntries: 1024,
            weight: 41_200,
            maxWeight: 250_000,
            filling: 2,
            freshForSeconds: 86_400,
            maxFreshForSeconds: 604_800,
          },
          {
            policy: "column-cardinality",
            entries: 0,
            maxEntries: 2048,
            weight: 0,
            maxWeight: 100_000,
            filling: 0,
            freshForSeconds: 604_800,
            maxFreshForSeconds: 2_592_000,
          },
        ]}
        inspections={[
          {
            policy: "opensearch-fields",
            key: "fields:logs-*:9f2a",
            elapsedMs: 1841.2,
            cached: false,
            state: "fresh",
            ageMs: 0,
          },
          {
            policy: "column-cardinality",
            key: "sql-column-stats:4c1e",
            elapsedMs: 0.2,
            cached: true,
            state: "stale",
            ageMs: 640_000,
            refreshError: "dial tcp: connection refused",
          },
        ]}
        probes={[
          {
            provider: "postgres",
            column: "message",
            distinct: 4212,
            limit: 50,
            kind: "text",
            cached: false,
          },
          {
            provider: "postgres",
            column: "region",
            field: "region_code",
            distinct: 7,
            limit: 50,
            kind: "",
            cached: false,
          },
        ]}
      />
    </div>
  ),
};

/** The empty state new users see first — it has to say what to do next. */
export const NoCaptures: StoryObj<typeof QueriesTab> = {
  render: () => (
    <div style={{ height: 240 }}>
      <QueriesTab records={[]} />
    </div>
  ),
};

/**
 * The navbar trigger, in the three states that differ: nothing captured yet, a
 * quiet run, and a run with failures — which is the one that has to catch an
 * eye across the top of the page.
 */
export const Trigger: StoryObj<typeof DebugConsoleButton> = {
  render: () => {
    const quiet = new DebugStore();
    quiet.addRecords(records.slice(0, 2));
    const failing = new DebugStore();
    failing.addRecords(records);
    return (
      <div className="flex items-center gap-6 border-border border-b p-3">
        <DebugConsoleButton store={new DebugStore()} />
        <DebugConsoleButton store={quiet} />
        <DebugConsoleButton store={failing} />
      </div>
    );
  },
};
