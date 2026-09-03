// Golden-payload test: a realistic captain VerifyReport, shaped exactly like
// the wire payload captain's verify step actually emits — snake_case keys,
// nanosecond durations, RFC3339 timestamps, a nested group, a failed CEL leaf,
// a timed-out leaf, and a mixed checklist. Parsed with no casts, so a drift
// between this file's VerifyReport/VerifyNode/VerifyChecklistItem types and
// the Go twin fails typecheck here first.
//
// Go twin: captain/pkg/api/verify_report.go (VerifyReport, VerifyNode,
// VerifyChecklistItem, VerifySummary).

import { describe, expect, it } from "vitest";
import { verifyReportCounts, verifyReportTests } from "./verifyReportTests";
import { summarizeVerifyNodes, type VerifyReport } from "./verify-report";

const GOLDEN_REPORT: VerifyReport = {
  kind: "fixture",
  name: "todo-verify",
  ran: true,
  passed: false,
  reason: "1 of 2 checks failed",
  iteration: 1,
  state: "failed",
  started_at: "2026-09-03T10:00:00Z",
  finished_at: "2026-09-03T10:00:12Z",
  duration: 12_000_000_000,
  summary: {
    total: 22,
    passed: 15,
    failed: 4,
    warned: 1,
    skipped: 1,
    pending: 0,
    running: 0,
    timedout: 1,
  },
  tests: [
    {
      name: "verify suite",
      framework: "fixture",
      children: [
        {
          name: "assert no regressions",
          framework: "fixture",
          task_id: "step:0",
          failed: true,
          duration: 1_250_000_000,
          context: {
            command: "go test ./todos/...",
            exit_code: 1,
            cwd: "/workspace/todos",
            cel_expression: "results.failed == 0",
            cel_vars: { failed: 2, suite: "todos" },
            expected: 0,
            actual: 2,
          },
          detail: { cel_trace: "cel: results.failed == 0\n     └─ int(2)" },
        },
      ],
    },
    {
      name: "smoke test the binary",
      framework: "cmd",
      task_id: "step:1",
      timed_out: true,
      duration: 30_000_000_000,
      command: "gavel smoke ./bin/app",
      work_dir: "/workspace",
    },
    {
      // A fixture runner's elided group: it reports a pre-computed summary
      // for a large suite instead of every leaf. `children` is intentionally
      // absent here.
      name: "regression suite",
      framework: "fixture",
      task_id: "step:2",
      summary: {
        total: 20,
        passed: 15,
        failed: 3,
        warned: 1,
        skipped: 1,
        pending: 0,
        running: 0,
        timedout: 0,
      },
    },
  ],
  checklist: [
    { item: "docs updated", passed: true },
    { item: "tests added", passed: false, message: "no new test file" },
    { item: "reviewed", passed: null },
  ],
};

describe("verify report golden payload", () => {
  it("summarizes the tests-only leaves and projects the full report onto the rendered forest consistently", () => {
    expect({
      summary: summarizeVerifyNodes(GOLDEN_REPORT.tests ?? []),
      tests: verifyReportTests(GOLDEN_REPORT),
    }).toEqual({
      // The producer's own tally (tests only — the checklist never counts here).
      summary: GOLDEN_REPORT.summary,
      tests: [
        {
          name: "verify suite",
          framework: "fixture",
          children: [
            {
              name: "assert no regressions",
              framework: "fixture",
              task_id: "step:0",
              failed: true,
              duration: 1_250_000_000,
              context: {
                command: "go test ./todos/...",
                exit_code: 1,
                cwd: "/workspace/todos",
                cel_expression: "results.failed == 0",
                cel_vars: { failed: 2, suite: "todos" },
                expected: 0,
                actual: 2,
              },
              detail: { cel_trace: "cel: results.failed == 0\n     └─ int(2)" },
            },
          ],
        },
        {
          name: "smoke test the binary",
          framework: "cmd",
          task_id: "step:1",
          timed_out: true,
          duration: 30_000_000_000,
          command: "gavel smoke ./bin/app",
          work_dir: "/workspace",
        },
        {
          name: "regression suite",
          framework: "fixture",
          task_id: "step:2",
          summary: {
            Total: 20,
            Passed: 15,
            Failed: 3,
            Warned: 1,
            Skipped: 1,
            Pending: 0,
            Running: 0,
            Duration: 0,
          },
        },
        {
          name: "Acceptance criteria",
          framework: "checklist",
          task_id: "acceptance-criteria",
          children: [
            {
              name: "docs updated",
              framework: "checklist",
              task_id: "acceptance-criteria:0",
              passed: true,
              failed: false,
              pending: false,
              detail: { item: "docs updated", passed: true },
            },
            {
              name: "tests added",
              framework: "checklist",
              task_id: "acceptance-criteria:1",
              passed: false,
              failed: true,
              pending: false,
              message: "no new test file",
              detail: { item: "tests added", passed: false, message: "no new test file" },
            },
            {
              name: "reviewed",
              framework: "checklist",
              task_id: "acceptance-criteria:2",
              passed: false,
              failed: false,
              pending: true,
              detail: { item: "reviewed", passed: null },
            },
          ],
        },
      ],
    });
  });

  it("rolls up the rendered TestRunner counts from the summary-carrying group, not from an empty child list", () => {
    // "regression suite" carries no `children` — its 20/15/3/1/1 contribution
    // below can only come from reading its `summary`, the way the real
    // TestRunner's aggregateStatusCounts/sum() do.
    expect(verifyReportCounts(GOLDEN_REPORT)).toEqual({
      total: 25,
      passed: 16,
      failed: 5,
      warned: 1,
      skipped: 1,
      pending: 1,
      running: 0,
      timedout: 1,
    });
  });
});
