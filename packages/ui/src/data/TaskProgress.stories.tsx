import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaskProgress } from "./TaskProgress";
import type { TaskSnapshot } from "./TaskSnapshot";

const meta: Meta<typeof TaskProgress> = {
  title: "Data/TaskProgress",
  component: TaskProgress,
  parameters: {
    docs: {
      description: {
        component:
          "Renders clicky task runs (groups) and their child tasks: a segmented progress bar plus per-task rows with status icon, duration, error, and expandable logs. Fed from useTaskRun (SSE) or any TaskSnapshot source.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TaskProgress>;

function run(status: string, tasks: Partial<TaskSnapshot>[]): TaskSnapshot[] {
  const completed = tasks.filter((t) => ["success", "PASS"].includes(t.status ?? "")).length;
  const failed = tasks.filter((t) => ["failed", "FAIL", "ERR"].includes(t.status ?? "")).length;
  const running = tasks.filter((t) => t.status === "running").length;
  const group: TaskSnapshot = {
    id: "fix-run",
    name: "Apply selected fixes",
    type: "group",
    status,
    groupId: "g1",
    kind: "sql-fix",
    total: tasks.length,
    completed,
    failed,
    running,
  };
  return [
    group,
    ...tasks.map((t, i) => ({
      id: `t${i}`,
      name: t.name ?? `task ${i}`,
      type: "task" as const,
      groupId: "g1",
      status: t.status ?? "pending",
      ...t,
    })),
  ];
}

export const Running: Story = {
  args: {
    snapshots: run("running", [
      { name: "REBUILD idx_policy", status: "success", duration: "2.1s" },
      { name: "REORGANIZE idx_client", status: "running" },
      { name: "UPDATE STATISTICS dbo.AsPolicy", status: "pending" },
    ]),
  },
};

export const WithFailure: Story = {
  args: {
    snapshots: run("failed", [
      { name: "REBUILD idx_policy", status: "success", duration: "2.1s" },
      {
        name: "UPDATE STATISTICS dbo.AsClient",
        status: "failed",
        error: "Lock request timeout",
        logs: [{ level: "error", message: "Lock request time out period exceeded." }],
      },
    ]),
  },
};

export const Complete: Story = {
  args: {
    snapshots: run("success", [
      { name: "REBUILD idx_policy", status: "success", duration: "2.1s" },
      { name: "UPDATE STATISTICS dbo.AsClient", status: "success", duration: "0.4s" },
    ]),
    title: "Defrag fixes",
  },
};
