// Projects a captain VerifyReport onto the shared test-runner Test model, so
// VerificationResults can render it with the same TestRunner every other
// fixture/test surface uses. Ported from gavel's verificationAttempts.ts
// (executionNodeTest / checklistTest), adapted to VerifyReport's node shape
// (which already carries boolean status flags, unlike gavel's execution
// snapshot which carried a single `state` string to translate).

import { aggregateStatusCounts, type StatusCounts, type Test, type TestSummary } from "../test-runner";
import type { VerifyChecklistItem, VerifyNode, VerifyReport, VerifySummary } from "./verify-report";

const ACCEPTANCE_CRITERIA_ID = "acceptance-criteria";

function coerceDuration(duration: unknown): number | undefined {
  return typeof duration === "number" && Number.isFinite(duration) ? duration : undefined;
}

/**
 * Projects a `VerifySummary` onto the test-runner's `TestSummary` shape (see
 * `test-runner/types.ts`), so `sum()`/`aggregateStatusCounts` (test-runner
 * `status.ts`) read a summary-carrying node's counts directly instead of
 * recursing into (possibly elided) children.
 *
 * `Duration` is not carried by `VerifySummary`, so it is reported as 0.
 */
function verifySummaryToTestSummary(summary: VerifySummary): TestSummary {
  return {
    Total: summary.total,
    Passed: summary.passed,
    Failed: summary.failed,
    Warned: summary.warned,
    Skipped: summary.skipped,
    Pending: summary.pending,
    Running: summary.running,
    Timedout: summary.timedout,
    Duration: 0,
  };
}

// Every field below is optional on both VerifyNode and Test, and the project
// compiles with exactOptionalPropertyTypes — so an absent field must be an
// absent key, not a key explicitly set to undefined. Each is assigned only
// when present rather than copied through in one object literal.
function verifyNodeTest(node: VerifyNode): Test {
  const test: Test = { name: node.name };
  if (node.framework !== undefined) test.framework = node.framework;
  if (node.task_id !== undefined) test.task_id = node.task_id;
  if (node.file !== undefined) test.file = node.file;
  if (node.line !== undefined) test.line = node.line;
  if (node.message !== undefined) test.message = node.message;
  if (node.command !== undefined) test.command = node.command;
  if (node.work_dir !== undefined) test.work_dir = node.work_dir;
  if (node.stdout !== undefined) test.stdout = node.stdout;
  if (node.stderr !== undefined) test.stderr = node.stderr;
  const duration = coerceDuration(node.duration);
  if (duration !== undefined) test.duration = duration;
  if (node.passed !== undefined) test.passed = node.passed;
  if (node.failed !== undefined) test.failed = node.failed;
  if (node.warned !== undefined) test.warned = node.warned;
  if (node.skipped !== undefined) test.skipped = node.skipped;
  if (node.pending !== undefined) test.pending = node.pending;
  if (node.running !== undefined) test.running = node.running;
  if (node.timed_out !== undefined) test.timed_out = node.timed_out;
  if (node.progress !== undefined) test.progress = node.progress;
  if (node.context !== undefined) test.context = node.context;
  if (node.detail !== undefined) test.detail = node.detail;
  // A node carrying its own `summary` (elided children) contributes that
  // summary directly and is never recursed into, even if `children` is also
  // present — parity with Go's `SummarizeNodes` and `summarizeVerifyNodes`.
  if (node.summary !== undefined) {
    test.summary = verifySummaryToTestSummary(node.summary);
  } else if (node.children !== undefined) {
    test.children = node.children.map(verifyNodeTest);
  }
  return test;
}

function checklistItemTest(item: VerifyChecklistItem, index: number): Test {
  const test: Test = {
    name: item.item || `Criterion ${index + 1}`,
    framework: "checklist",
    task_id: `${ACCEPTANCE_CRITERIA_ID}:${index}`,
    passed: item.passed === true,
    failed: item.passed === false,
    pending: item.passed !== true && item.passed !== false,
    detail: item,
  };
  if (item.message !== undefined) test.message = item.message;
  return test;
}

/**
 * Synthesizes the "Acceptance criteria" parent node gavel's checklistTest
 * ports. Deliberately carries no status flags of its own — `status.ts`'s
 * `testStatus` checks `pending` before `failed`, so a container explicitly
 * flagged both `failed` and `pending` (one item failed, another is still
 * unjudged) would render as queued instead of failed. Leaving the container
 * status-less lets the shared roll-up (`statusIconFor`/`statusToneFor`: failed
 * → warned → running → pending → passed, via `sum()` over the children) decide
 * instead.
 */
function checklistTest(checklist: VerifyChecklistItem[]): Test | null {
  if (checklist.length === 0) return null;
  const children = checklist.map(checklistItemTest);
  return {
    name: "Acceptance criteria",
    framework: "checklist",
    task_id: ACCEPTANCE_CRITERIA_ID,
    children,
  };
}

/** Maps a VerifyReport onto the TestRunner's Test forest, appending a
 *  synthesized "Acceptance criteria" node for the checklist when present. */
export function verifyReportTests(report: VerifyReport): Test[] {
  const tests = (report.tests ?? []).map(verifyNodeTest);
  const checklist = checklistTest(report.checklist ?? []);
  return checklist ? [...tests, checklist] : tests;
}

/**
 * Status roll-up across the *rendered* forest: `report.tests` plus the
 * synthesized checklist leaves. This is **not** `report.summary` — the
 * producer's tests-only tally (see `summarizeVerifyNodes` in ./verify-report)
 * — since it also counts checklist items, which never appear in `tests`.
 */
export function verifyReportCounts(report: VerifyReport): StatusCounts {
  return aggregateStatusCounts(verifyReportTests(report));
}
