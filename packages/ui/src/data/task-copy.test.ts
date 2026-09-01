import { describe, expect, it } from "vitest";
import {
  isFailedOrWarn,
  taskGroupErrorCount,
  taskGroupErrors,
  taskGroupJson,
  taskGroupMarkdown,
  taskMarkdown,
} from "./task-copy";
import type { TaskSnapshot } from "./TaskSnapshot";

// Modelled on a real entity-clone run: one success, one failure carrying logs,
// one dependency cancellation (error string but a non-failing status), and one
// task with streams plus open-shaped exec details.
const GROUP: TaskSnapshot = {
  id: "Clone scheme: dev -> dev",
  name: "Clone scheme: dev -> dev",
  type: "group",
  status: "failed",
  groupId: "g1",
  kind: "entity-clone",
  total: 4,
  completed: 1,
  failed: 2,
  labels: { source: "dev", target: "dev" },
  startedAt: "2026-08-31T05:01:31Z",
  finishedAt: "2026-08-31T05:01:53Z",
};

const MEASURE: TaskSnapshot = {
  id: "t1",
  name: "Measure dev",
  type: "task",
  groupId: "g1",
  status: "success",
  duration: "527ms",
  description: "1 scheme · 2 clients · 1 policy",
};

const EXPORT: TaskSnapshot = {
  id: "t2",
  name: "Export from dev",
  type: "task",
  groupId: "g1",
  status: "failed",
  duration: "15.298s",
  error: "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",
  message: "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled",
  logs: [{ level: "error", message: "export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled" }],
};

const VERIFY: TaskSnapshot = {
  id: "t3",
  name: "Verify dev",
  type: "task",
  groupId: "g1",
  status: "canceled",
  duration: "15.899s",
  error: "dependency failed",
};

const APPLY: TaskSnapshot = {
  id: "t4",
  name: "Apply to dev",
  type: "task",
  groupId: "g1",
  status: "success",
  stdout: "applied 3 rows\n",
  stderr: "warn: retrying once\n",
  stderrTruncated: true,
  details: { command: "oipa-cli", status: "exited", exitCode: 0, scanId: "abc" },
};

const TASKS = [MEASURE, EXPORT, VERIFY, APPLY];

describe("taskGroupMarkdown", () => {
  it("leads with the group's status, counts, kind, labels and timings", () => {
    const lines = taskGroupMarkdown(GROUP, TASKS).split("\n");
    // 4/4 done: bucketTasks counts a canceled task as terminal, so the copied
    // header reads exactly what the progress bar shows.
    expect(lines.slice(0, 4)).toEqual([
      "# Clone scheme: dev -> dev",
      "status: failed · 4/4 · kind: entity-clone",
      "labels: source=dev, target=dev",
      "started 2026-08-31T05:01:31Z · finished 2026-08-31T05:01:53Z",
    ]);
  });

  it("carries a failing task's error and its log lines", () => {
    const md = taskGroupMarkdown(GROUP, TASKS);
    expect(md).toContain("## Export from dev — failed (15.298s)");
    expect(md).toContain("error: export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled");
    expect(md).toContain("logs:\n  error export ASAUTHCOMPANYPAGEBUTTONLIMIT: context canceled");
  });

  it("does not repeat `message` when it merely echoes `error`", () => {
    expect(taskGroupMarkdown(GROUP, [EXPORT])).not.toContain("message:");
  });

  it("fences stdout/stderr and flags a truncated stream", () => {
    const md = taskGroupMarkdown(GROUP, [APPLY]);
    expect(md).toContain("stdout:\n```\napplied 3 rows\n```");
    expect(md).toContain("stderr (showing latest 1 MiB):\n```\nwarn: retrying once\n```");
  });

  it("fences the open-shaped details object as JSON, keeping unknown keys", () => {
    const md = taskGroupMarkdown(GROUP, [APPLY]);
    expect(md).toContain("details:\n```json");
    expect(md).toContain('"scanId": "abc"');
  });

  it("includes every task, successes included", () => {
    const md = taskGroupMarkdown(GROUP, TASKS);
    for (const t of TASKS) expect(md).toContain(`## ${t.name} —`);
  });
});

describe("taskGroupErrors", () => {
  it("keeps only tasks that failed or carry an error, and drops the successes", () => {
    const md = taskGroupErrors(GROUP, TASKS);
    expect(md).toContain("## Export from dev —");
    expect(md).toContain("## Verify dev —");
    expect(md).not.toContain("## Measure dev —");
    expect(md).not.toContain("## Apply to dev —");
  });

  it("still carries the group header so the excerpt is self-describing", () => {
    expect(taskGroupErrors(GROUP, TASKS)).toContain("# Clone scheme: dev -> dev");
  });
});

describe("taskGroupErrorCount", () => {
  it("counts failing statuses and error-carrying cancellations", () => {
    expect(taskGroupErrorCount(TASKS)).toBe(2);
  });

  it("is zero for an all-clear run, which is what disables the menu item", () => {
    expect(taskGroupErrorCount([MEASURE, APPLY])).toBe(0);
  });
});

describe("taskMarkdown", () => {
  it("renders one task without any group context", () => {
    const md = taskMarkdown(EXPORT);
    expect(md).toContain("## Export from dev — failed (15.298s)");
    expect(md).not.toContain("# Clone scheme");
  });

  it("keeps the description of a task that has one", () => {
    expect(taskMarkdown(MEASURE)).toContain("1 scheme · 2 clients · 1 policy");
  });
});

describe("taskGroupJson", () => {
  it("round-trips the raw snapshots", () => {
    expect(JSON.parse(taskGroupJson(GROUP, TASKS))).toEqual({ group: GROUP, tasks: TASKS });
  });
});

describe("isFailedOrWarn", () => {
  it.each([
    ["failed", true],
    ["FAIL", true],
    ["ERR", true],
    ["warning", true],
    ["success", false],
    ["canceled", false],
    ["running", false],
  ])("treats %s as failing=%s", (status, expected) => {
    expect(isFailedOrWarn({ ...MEASURE, status })).toBe(expected);
  });
});
