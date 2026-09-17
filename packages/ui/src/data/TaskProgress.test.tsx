import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TaskProgress } from "./TaskProgress";
import { bucketTasks, taskSegments } from "./task-status";
import type { TaskSnapshot } from "./TaskSnapshot";

vi.mock("./TimeseriesGauge", () => ({
  TimeseriesGauge: ({ title }: { title: string }) => <span>{title} gauge</span>,
}));

const RUN: TaskSnapshot[] = [
  {
    id: "fix-run",
    name: "fix-run",
    type: "group",
    status: "running",
    groupId: "g1",
    kind: "sql-fix",
    total: 4,
    completed: 1,
    failed: 1,
    running: 1,
  },
  { id: "t1", name: "rebuild idx_a", type: "task", groupId: "g1", status: "success", duration: "1.2s" },
  {
    id: "t2",
    name: "update stats",
    type: "task",
    groupId: "g1",
    status: "failed",
    error: "timeout",
    logs: [{ level: "error", message: "boom" }],
  },
  { id: "t3", name: "reorg idx_b", type: "task", groupId: "g1", status: "running" },
  { id: "t4", name: "update all stats", type: "task", groupId: "g1", status: "pending" },
];

describe("bucketTasks", () => {
  it("tallies child tasks by status bucket", () => {
    const counts = bucketTasks(RUN.filter((s) => s.type === "task"));
    expect(counts).toEqual({ ok: 1, warn: 0, fail: 1, run: 1, pending: 1, canceled: 0 });
  });
});

describe("taskSegments", () => {
  it("emits terminal, active, canceled, and unstarted segments in canonical order", () => {
    const segs = taskSegments({ ok: 2, warn: 0, fail: 1, run: 3, pending: 4 });
    expect(segs.map((s) => [s.label, s.count])).toEqual([
      ["passed", 2],
      ["warnings", 0],
      ["failed", 1],
      ["running", 3],
      ["pending", 4],
      ["canceled", 0],
      ["unstarted", 0],
    ]);
  });
});

describe("TaskProgress", () => {
  it("renders the group, child tasks, and a progressbar reflecting counts", () => {
    render(<TaskProgress snapshots={RUN} />);

    expect(screen.getByText("fix-run")).toBeInTheDocument();
    expect(screen.getByText("rebuild idx_a")).toBeInTheDocument();
    expect(screen.getByText("update stats")).toBeInTheDocument();
    // Failed task surfaces its error inline.
    expect(screen.getByText("timeout")).toBeInTheDocument();

    // Progress bar aria-valuenow = sum of segment counts = the 4 child tasks.
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "4");
    expect(bar).toHaveAttribute("aria-valuemax", "4");
  });

  it("counts canceled child tasks as completed in group progress", () => {
    const snapshots: TaskSnapshot[] = [
      { id: "group", name: "stopped run", type: "group", status: "canceled", groupId: "group", total: 2 },
      { id: "done", name: "completed step", type: "task", status: "success", groupId: "group" },
      { id: "stopped", name: "canceled step", type: "task", status: "canceled", groupId: "group" },
    ];

    render(<TaskProgress snapshots={snapshots} />);

    expect(screen.getByText("2/2")).toBeInTheDocument();
  });

  it("renders an x/y count, percent, description, and a bar for a running task with bounded progress", () => {
    const snapshots: TaskSnapshot[] = [
      { id: "g", name: "ast all", type: "group", status: "running", groupId: "g", total: 2, running: 1 },
      {
        id: "p1",
        name: "transactions",
        type: "task",
        groupId: "g",
        status: "running",
        description: "emitting FooBar",
        progress: 31,
        maxValue: 120,
      },
      { id: "p2", name: "finalize", type: "task", groupId: "g", status: "pending" },
    ];
    render(<TaskProgress snapshots={snapshots} />);

    expect(screen.getByText("emitting FooBar")).toBeInTheDocument();
    expect(screen.getByText("31/120 · 26%")).toBeInTheDocument();

    // Two bars now: the group aggregate (max 2) and the per-task bar (max 120).
    const taskBar = screen.getAllByRole("progressbar").find((b) => b.getAttribute("aria-valuemax") === "120");
    expect(taskBar).toBeDefined();
    expect(taskBar).toHaveAttribute("aria-valuenow", "31");
  });

  it("omits the x/y count and bar for a task whose bounded progress is still zero", () => {
    const snapshots: TaskSnapshot[] = [
      { id: "g", name: "ast all", type: "group", status: "running", groupId: "g", total: 1, running: 1 },
      {
        id: "p1",
        name: "transactions",
        type: "task",
        groupId: "g",
        status: "running",
        progress: 0,
        maxValue: 100,
      },
    ];
    render(<TaskProgress snapshots={snapshots} />);

    expect(screen.queryByText("0/100 · 0%")).not.toBeInTheDocument();
    expect(screen.queryByRole("progressbar")?.getAttribute("aria-valuemax")).not.toBe("100");
  });

  it("shows an empty message when there are no group snapshots", () => {
    render(<TaskProgress snapshots={[]} title="Fixes" />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it("surfaces the latest warning message inline without expanding the row", () => {
    const snapshots: TaskSnapshot[] = [
      { id: "g", name: "warn-run", type: "group", status: "warning", groupId: "g", total: 1 },
      {
        id: "w1",
        name: "reorg idx_c",
        type: "task",
        groupId: "g",
        status: "warning",
        logs: [
          { level: "info", message: "starting" },
          { level: "warn", message: "skipped: index already optimal" },
        ],
      },
    ];
    render(<TaskProgress snapshots={snapshots} />);
    // Visible without any click — the warning text is promoted onto the row.
    expect(screen.getByText("skipped: index already optimal")).toBeInTheDocument();
  });

  it("renders captured streams and invokes advertised lifecycle controls", async () => {
    const onControl = vi.fn();
    const snapshots: TaskSnapshot[] = [
      {
        id: "commit",
        name: "Commit changes",
        type: "group",
        status: "running",
        groupId: "commit-1",
        total: 1,
        running: 1,
        controls: ["stop", "restart"],
      },
      {
        id: "command",
        name: "Create commit",
        type: "task",
        status: "running",
        groupId: "commit-1",
        stdout: "staging files\n",
        stderr: "hook warning\n",
      },
    ];
    render(<TaskProgress snapshots={snapshots} onControl={onControl} />);

    fireEvent.click(screen.getByText("Create commit"));
    // stdout leads because it is the first stream the task produced; stderr is
    // one tab away rather than stacked below it.
    expect(screen.getByText("staging files")).toBeInTheDocument();
    expect(screen.queryByText("hook warning")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "stderr" }));
    expect(screen.getByText("hook warning")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Stop" }));
    await waitFor(() => expect(onControl).toHaveBeenCalledWith("stop", snapshots[0]));
  });

  it("invokes a child task control without toggling its output", async () => {
    const onTaskControl = vi.fn();
    const snapshots: TaskSnapshot[] = [
      {
        id: "commit",
        name: "Commit gavel",
        type: "group",
        status: "running",
        groupId: "commit-1",
        total: 1,
        running: 1,
      },
      {
        id: "command",
        name: "Commit one.go",
        type: "task",
        status: "running",
        groupId: "commit-1",
        stdout: "staging one.go\n",
        controls: ["stop"],
      },
    ];
    render(<TaskProgress snapshots={snapshots} onTaskControl={onTaskControl} />);

    fireEvent.click(screen.getByRole("button", { name: "Stop Commit one.go" }));

    await waitFor(() => expect(onTaskControl).toHaveBeenCalledWith("stop", snapshots[1], snapshots[0]));
    expect(screen.queryByText("staging one.go")).not.toBeInTheDocument();
  });

  it("renders a Retry control for a failed run and invokes onControl with the retry action", async () => {
    const onControl = vi.fn();
    const snapshots: TaskSnapshot[] = [
      {
        id: "commit",
        name: "Commit failed run",
        type: "group",
        status: "failed",
        groupId: "commit-1",
        total: 1,
        failed: 1,
        controls: ["retry"],
      },
      {
        id: "command",
        name: "Create commit",
        type: "task",
        status: "failed",
        groupId: "commit-1",
        error: "exit status 1",
      },
    ];
    render(<TaskProgress snapshots={snapshots} onControl={onControl} />);

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => expect(onControl).toHaveBeenCalledWith("retry", snapshots[0]));
  });

  describe("copy affordances", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    beforeEach(() => {
      writeText.mockClear();
      Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    });

    it("copies the whole run, including a failing task's error, from the header", async () => {
      render(<TaskProgress snapshots={RUN} />);

      fireEvent.click(screen.getByRole("button", { name: "Copy" }));

      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      const copied = writeText.mock.calls[0]?.[0] as string;
      expect(copied).toContain("# fix-run");
      expect(copied).toContain("## update stats");
      // The failing task's error and its log line are the reason to copy at all.
      expect(copied).toContain("error: timeout");
      expect(copied).toContain("error boom");
    });

    it("copies a single task from its row without toggling the row open", async () => {
      const snapshots: TaskSnapshot[] = [
        { id: "g", name: "run", type: "group", status: "running", groupId: "g1", total: 1 },
        {
          id: "t",
          name: "Commit one.go",
          type: "task",
          status: "running",
          groupId: "g1",
          stdout: "staging one.go\n",
        },
      ];
      render(<TaskProgress snapshots={snapshots} />);

      fireEvent.click(screen.getByRole("button", { name: "Copy Commit one.go" }));

      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      expect(writeText.mock.calls[0]?.[0]).toContain("## Commit one.go");
      // The row's own onClick must not have fired.
      expect(screen.queryByText("staging one.go")).not.toBeInTheDocument();
    });

    it("copies the pasteable shell command line from the exec details' copy button", async () => {
      const snapshots: TaskSnapshot[] = [
        { id: "g", name: "Commit gavel", type: "group", status: "failed", groupId: "g1", total: 1, failed: 1 },
        {
          id: "t",
          name: "Create commit",
          type: "task",
          status: "failed",
          groupId: "g1",
          details: {
            command: "git",
            args: ["commit", "-m", "fix bug"],
            cwd: "/repo path",
            status: "exited",
            exitCode: 1,
          },
        },
      ];
      render(<TaskProgress snapshots={snapshots} />);

      fireEvent.click(screen.getByText("Create commit"));
      fireEvent.click(screen.getByRole("button", { name: "Copy command" }));

      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith("cd '/repo path' && git commit -m 'fix bug'"),
      );
    });

    it("disables the errors-only item for a run with nothing wrong", () => {
      const snapshots: TaskSnapshot[] = [
        { id: "g", name: "clean", type: "group", status: "success", groupId: "g1", total: 1 },
        { id: "t", name: "step", type: "task", status: "success", groupId: "g1" },
      ];
      render(<TaskProgress snapshots={snapshots} />);

      fireEvent.click(screen.getByRole("button", { name: "More copy options" }));

      expect(screen.getByRole("menuitem", { name: /Copy errors only/ })).toBeDisabled();
      expect(screen.getByRole("menuitem", { name: /Copy as JSON/ })).toBeEnabled();
    });
  });
});
