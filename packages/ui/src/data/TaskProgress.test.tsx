import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TaskProgress } from "./TaskProgress";
import { bucketTasks, taskSegments } from "./task-status";
import type { TaskSnapshot } from "./TaskSnapshot";

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
    expect(counts).toEqual({ ok: 1, warn: 0, fail: 1, run: 1, pending: 1 });
  });
});

describe("taskSegments", () => {
  it("emits segments in canonical pass/warn/fail/run/pending order", () => {
    const segs = taskSegments({ ok: 2, warn: 0, fail: 1, run: 3, pending: 4 });
    expect(segs.map((s) => [s.label, s.count])).toEqual([
      ["passed", 2],
      ["warnings", 0],
      ["failed", 1],
      ["running", 3],
      ["pending", 4],
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
});
