import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { TaskProgress } from "./TaskProgress";
import type { LogEntry, TaskSnapshot } from "./TaskSnapshot";

const meta: Meta<typeof TaskProgress> = {
  title: "Charts/TaskProgress",
  component: TaskProgress,
  argTypes: {
    title: { control: "text" },
    compact: { control: "boolean" },
    snapshots: { table: { disable: true } },
    className: { table: { disable: true } },
  },
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

const STORY_START = Date.parse("2026-10-15T07:00:00Z");

// A finished span of `ms`, as the wire carries it: two timestamps, no duration.
function took(ms: number): Pick<TaskSnapshot, "startedAt" | "finishedAt"> {
  return {
    startedAt: new Date(STORY_START).toISOString(),
    finishedAt: new Date(STORY_START + ms).toISOString(),
  };
}

function log(seq: number, level: string, message: string): LogEntry {
  return { seq, level, message, time: new Date(STORY_START).toISOString() };
}

function run(status: string, tasks: Partial<TaskSnapshot>[]): TaskSnapshot[] {
  const completed = tasks.filter((t) =>
    ["success", "PASS"].includes(t.status ?? ""),
  ).length;
  const failed = tasks.filter((t) =>
    ["failed", "FAIL", "ERR"].includes(t.status ?? ""),
  ).length;
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
      { name: "REBUILD idx_policy", status: "success", ...took(2100) },
      // A running task carries only its start; the elapsed time ticks client-side.
      { name: "REORGANIZE idx_client", status: "running", startedAt: new Date(Date.now() - 8_000).toISOString() },
      { name: "UPDATE STATISTICS dbo.AsPolicy", status: "pending" },
    ]),
  },
};

export const NestedGitReads: Story = {
  args: {
    snapshots: [
      {
        id: "comparison",
        groupId: "comparison",
        type: "group",
        name: "Compare DEV0BASE and acme/rules#main",
        status: "running",
      },
      {
        id: "source",
        groupId: "source",
        parentGroupId: "comparison",
        type: "group",
        name: "[acme/rules] Read main",
        status: "running",
      },
      {
        id: "refs",
        groupId: "source",
        type: "task",
        name: "[acme/rules] Resolve main",
        labels: { repository: "acme/rules", ref: "main" },
        status: "success",
        description: "Using cached result",
      },
      {
        id: "tree",
        groupId: "source",
        type: "task",
        name: "[acme/rules] Read files @49ec96f75b56",
        labels: { repository: "acme/rules", operation: "cat-file" },
        status: "running",
        description: "Reading objects",
        progress: 3,
        maxValue: 5,
        progressMetrics: { unit: "files", bytes: 1048576, bytesPerSecond: 524288 },
      },
    ],
  },
};

export const WaitingForAnswer: Story = {
  args: {
    snapshots: run("running", [
      { name: "Stage files", status: "success", ...took(400) },
      {
        name: "Commit",
        status: "running",
        prompts: [
          {
            id: "p-lock",
            kind: "select",
            state: "pending",
            title:
              "Stale git lock detected: .git/index.lock (age 12s, 0 bytes, no process has it open). Remove and retry?",
            schema: {
              type: "object",
              properties: {
                choice: {
                  type: "string",
                  enum: ["0", "1"],
                  "x-enum-labels": { "0": "Remove and retry", "1": "Cancel" },
                },
              },
              required: ["choice"],
            },
          },
        ],
      },
    ]),
  },
};

export const WithFailure: Story = {
  args: {
    snapshots: run("failed", [
      { name: "REBUILD idx_policy", status: "success", ...took(2100) },
      {
        name: "UPDATE STATISTICS dbo.AsClient",
        status: "failed",
        error: "Lock request timeout",
        logs: [
          log(1, "error", "Lock request time out period exceeded."),
        ],
      },
    ]),
  },
};

// The header split button copies the whole run as Markdown, with JSON and
// errors-only in its menu; each row reveals a copy glyph on hover.
export const CopyRunDetails: Story = {
  args: {
    snapshots: run("failed", [
      { name: "Measure dev", status: "success", ...took(527) },
      {
        name: "Export from dev",
        status: "failed",
        ...took(15298),
        error: "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",
        logs: [
          log(1, "error", "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled"),
        ],
      },
      {
        name: "Verify dev",
        status: "canceled",
        ...took(15899),
        error: "dependency failed",
      },
    ]),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Real chromium denies writeText without the clipboard-write permission,
    // so stub it and assert the affordance rather than the OS clipboard.
    const writeText = fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    await userEvent.click(canvas.getByRole("button", { name: "Copy" }));

    await expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",
      ),
    );
    await expect(
      canvas.getByRole("button", { name: "Copied" }),
    ).toBeInTheDocument();
  },
};

// A failed run whose group advertises `retry` — the operator re-runs just the
// failed work without starting the whole thing over. The exec task's details
// render a pasteable `cd ... && ...` command line rather than JSON.stringify.
export const FailedWithRetry: Story = {
  args: {
    snapshots: [
      {
        id: "commit-run",
        name: "Commit gavel",
        type: "group",
        status: "failed",
        groupId: "commit-1",
        kind: "gavel-commit",
        total: 1,
        failed: 1,
        controls: ["retry"],
      },
      {
        id: "commit-task",
        name: "Create commit",
        type: "task",
        groupId: "commit-1",
        status: "failed",
        error: "exit status 1",
        stderr: "error: nothing added to commit but untracked files present\n",
        details: {
          command: "git",
          args: ["commit", "-m", "fix bug", "src/report generator.ts"],
          cwd: "/repo path",
          status: "exited",
          exitCode: 1,
        },
      },
    ],
    onControl: fn(),
  },
};

export const Complete: Story = {
  args: {
    snapshots: run("success", [
      { name: "REBUILD idx_policy", status: "success", ...took(2100) },
      {
        name: "UPDATE STATISTICS dbo.AsClient",
        status: "success",
        ...took(400),
      },
    ]),
    title: "Defrag fixes",
  },
};

export const ControllableChildren: Story = {
  args: {
    snapshots: [
      {
        id: "commit-project",
        name: "Commit gavel",
        type: "group",
        status: "running",
        groupId: "commit-1",
        kind: "gavel-commit",
        total: 2,
        running: 1,
        controls: ["stop"],
      },
      {
        id: "commit-one",
        name: "Commit one.go",
        description: "one.go",
        type: "task",
        groupId: "commit-1",
        status: "running",
        controls: ["stop"],
      },
      {
        id: "commit-two",
        name: "Commit two.go",
        description: "two.go",
        type: "task",
        groupId: "commit-1",
        status: "pending",
        controls: ["stop"],
      },
    ],
    onControl: fn(),
    onTaskControl: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", { name: "Stop Commit one.go" }),
    );
    await expect(args.onTaskControl).toHaveBeenCalledWith(
      "stop",
      expect.objectContaining({ id: "commit-one" }),
      expect.objectContaining({ id: "commit-project" }),
    );
  },
};
