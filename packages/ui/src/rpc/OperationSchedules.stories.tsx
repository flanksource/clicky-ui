import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { OperationSchedules } from "./OperationSchedules";
import type { OperationSchedule, OperationScheduleInput } from "./operation-schedule-types";
import type { OpenAPISpec, OperationLookupResponse, ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";

// The dialog renders each operation's own parameter form, so the fixtures carry
// the query parameters clicky documents for a command's flags.
const operations: ResolvedOperation[] = [
  {
    path: "/maintenance/truncate-cycles",
    method: "post",
    operation: {
      operationId: "truncateCycles",
      summary: "Truncate cycle history",
      description: "Remove completed cycle runtime rows.",
      tags: ["Database maintenance"],
      parameters: [
        {
          name: "batch-size",
          in: "query",
          description: "Rows removed in each transaction.",
          required: true,
          schema: { type: "integer", default: "500" },
        },
      ],
      "x-clicky": {
        command: "cycle/truncate",
        verb: "action",
        scope: "collection",
        toolHints: { destructiveHint: true },
        schedule: {
          suggestions: [
            {
              label: "Recommended",
              cron: "0 2 * * 0",
              description: "Every Sunday at 02:00",
            },
          ],
        },
      },
    },
  },
  {
    path: "/cycle/catch-up",
    method: "post",
    operation: {
      operationId: "cycleCatchUp",
      summary: "Cycle catch-up",
      description: "Advance the system date one cycle at a time until it reaches today.",
      tags: ["Cycles"],
      parameters: [
        { name: "company", in: "query", description: "Company name or GUID", schema: { type: "string" } },
        { name: "mode", in: "query", schema: { type: "string", enum: ["preview", "apply"] } },
        { name: "dry-run", in: "query", schema: { type: "boolean", default: false } },
        { name: "max-date-steps", in: "query", schema: { type: "integer", default: "30" } },
      ],
      "x-clicky": {
        command: "cycle/catch-up",
        verb: "action",
        scope: "collection",
        supportsLookup: true,
        schedule: {
          suggestions: [{ label: "Nightly", cron: "0 1 * * *", description: "Every night at 01:00" }],
        },
      },
    },
  },
  {
    path: "/maintenance/rebuild-indexes",
    method: "post",
    operation: {
      operationId: "rebuildIndexes",
      summary: "Rebuild all indexes",
      description: "Rebuild indexes in the configured database.",
      tags: ["Database maintenance"],
      "x-clicky": {
        command: "sql/defrag/rebuild-all-indexes",
        verb: "action",
        scope: "collection",
        toolHints: { destructiveHint: true },
        schedule: {
          suggestions: [
            {
              label: "Recommended",
              cron: "0 3 1 * *",
              description: "First day of every month at 03:00",
            },
          ],
        },
      },
    },
  },
];

const companyLookup: OperationLookupResponse = {
  filters: {
    company: {
      label: "Company",
      options: {
        "acme-regional": { kind: "text", text: "Acme Regional" },
        "acme-holdings": { kind: "text", text: "Acme Holdings" },
      },
    },
  },
};

const client: OperationsApiClient = {
  async getOpenAPISpec(): Promise<OpenAPISpec> {
    return { openapi: "3.0.0", info: { title: "Story", version: "1" }, paths: {} };
  },
  async executeCommand() {
    throw new Error("Schedules story does not execute operations");
  },
  async lookupFilters() {
    return companyLookup;
  },
};

const initialSchedules: OperationSchedule[] = [
  {
    id: "weekly-cleanup",
    targets: ["dev", "qa"],
    name: "Weekly cycle cleanup",
    operationId: "truncateCycles",
    args: { "batch-size": 500 },
    cron: "0 2 * * 0",
    timezone: "UTC",
    enabled: true,
    lastRun: "2026-09-13T02:00:00Z",
    nextRun: "2026-09-20T02:00:00Z",
  },
  {
    id: "nightly-catch-up",
    targets: ["dev"],
    name: "Nightly catch-up preview",
    operationId: "cycleCatchUp",
    args: { company: "acme-regional", "dry-run": true, "max-date-steps": 5 },
    cron: "0 1 * * *",
    timezone: "UTC",
    enabled: true,
    nextRun: "2026-09-14T01:00:00Z",
  },
  {
    id: "monthly-indexes",
    targets: ["qa"],
    name: "Monthly index rebuild",
    operationId: "rebuildIndexes",
    args: {},
    cron: "0 3 1 * *",
    timezone: "UTC",
    enabled: false,
  },
];

const environmentOptions = [
  { value: "dev", label: "Development" },
  { value: "qa", label: "QA" },
  { value: "uat", label: "UAT" },
];

const multiEnvironmentSchedules: OperationSchedule[] = [
  {
    id: "nightly-cleanup",
    targets: ["dev", "qa", "uat"],
    concurrency: 2,
    name: "Nightly cycle cleanup",
    operationId: "truncateCycles",
    args: { "batch-size": 500 },
    cron: "0 1 * * *",
    timezone: "UTC",
    enabled: true,
    nextRun: "2026-09-14T01:00:00Z",
  },
];

interface SchedulesStoryProps {
  initial: OperationSchedule[];
  defaultTargets: string[];
  targetLabel?: string;
}

function SchedulesStory({ initial, defaultTargets, targetLabel }: SchedulesStoryProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  const [schedules, setSchedules] = useState(initial);

  const create = async (input: OperationScheduleInput) => {
    setSchedules((current) => [
      ...current,
      { ...input, id: `schedule-${current.length + 1}` },
    ]);
  };

  const update = async (id: string, input: OperationScheduleInput) => {
    setSchedules((current) =>
      current.map((schedule) => (schedule.id === id ? { ...schedule, ...input } : schedule)),
    );
  };

  const remove = async (id: string) => {
    setSchedules((current) => current.filter((schedule) => schedule.id !== id));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="mx-auto max-w-6xl p-6">
        <OperationSchedules
          client={client}
          operations={operations}
          schedules={schedules}
          targetOptions={environmentOptions}
          defaultTargets={defaultTargets}
          cli={{ executable: "oipa-cli", targetFlag: "context" }}
          {...(targetLabel ? { targetLabel } : {})}
          onCreate={create}
          onUpdate={update}
          onDelete={remove}
          onRunSaved={async () => undefined}
          onRunDraft={async () => undefined}
        />
      </div>
    </QueryClientProvider>
  );
}

const meta = {
  title: "RPC/OperationSchedules",
  component: OperationSchedules,
  render: () => <SchedulesStory initial={initialSchedules} defaultTargets={["dev"]} />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OperationSchedules>;

export default meta;
type Story = StoryObj<typeof meta>;

// Edit "Nightly catch-up preview" to see the operation's own form: a company
// lookup, an enum, a checkbox and a number, loaded from the stored args.
export const Default: Story = {};

// Several environments selected: the dialog shows "Environments at once",
// bounded by the selection, and edits start from the saved concurrency.
export const MultipleEnvironments: Story = {
  render: () => (
    <SchedulesStory
      initial={multiEnvironmentSchedules}
      defaultTargets={["dev", "qa", "uat"]}
      targetLabel="Environments"
    />
  ),
};
