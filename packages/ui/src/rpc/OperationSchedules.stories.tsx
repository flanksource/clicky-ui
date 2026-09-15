import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { OperationSchedules } from "./OperationSchedules";
import type { OperationSchedule, OperationScheduleInput } from "./operation-schedule-types";
import type { ResolvedOperation } from "./types";

const operations: ResolvedOperation[] = [
  {
    path: "/maintenance/truncate-cycles",
    method: "post",
    operation: {
      operationId: "truncateCycles",
      summary: "Truncate cycle history",
      description: "Remove completed cycle runtime rows.",
      tags: ["Database maintenance"],
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                batchSize: {
                  type: "integer",
                  title: "Batch size",
                  description: "Rows removed in each transaction.",
                  default: 500,
                },
              },
            },
          },
        },
      },
      "x-clicky": {
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
    path: "/maintenance/rebuild-indexes",
    method: "post",
    operation: {
      operationId: "rebuildIndexes",
      summary: "Rebuild all indexes",
      description: "Rebuild indexes in the configured database.",
      tags: ["Database maintenance"],
      "x-clicky": {
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

const initialSchedules: OperationSchedule[] = [
  {
    id: "weekly-cleanup",
    name: "Weekly cycle cleanup",
    operationId: "truncateCycles",
    args: { batchSize: 500 },
    cron: "0 2 * * 0",
    timezone: "UTC",
    enabled: true,
    lastRun: "2026-09-13T02:00:00Z",
    nextRun: "2026-09-20T02:00:00Z",
  },
  {
    id: "monthly-indexes",
    name: "Monthly index rebuild",
    operationId: "rebuildIndexes",
    args: {},
    cron: "0 3 1 * *",
    timezone: "UTC",
    enabled: false,
  },
];

function SchedulesStory() {
  const [schedules, setSchedules] = useState(initialSchedules);

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
    <div className="mx-auto max-w-6xl p-6">
      <OperationSchedules
        operations={operations}
        schedules={schedules}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        onRunSaved={async () => undefined}
        onRunDraft={async () => undefined}
      />
    </div>
  );
}

const meta = {
  title: "RPC/OperationSchedules",
  component: OperationSchedules,
  render: () => <SchedulesStory />,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof OperationSchedules>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
