import { describe, expect, it } from "vitest";
import { createTestRunnerRegistry } from "./adapter";
import { attemptStatus, isAttemptLive, testAttemptViews } from "./attempts";
import type { TestRunnerContext } from "./context";
import type { Test, TestAttempt } from "./types";

const runner = { tests: [] } as unknown as TestRunnerContext;

describe("attemptStatus", () => {
  it.each<[Partial<TestAttempt>, string]>([
    [{ timed_out: true, failed: true }, "timedout"],
    [{ failed: true }, "failed"],
    [{ skipped: true }, "skipped"],
    [{ passed: true }, "passed"],
    [{ pending: true }, "pending"],
    [{}, "running"],
  ])("resolves %o to %s", (flags, status) => {
    expect(attemptStatus({ sequence: 1, ...flags })).toBe(status);
  });

  it("calls an attempt live while it is queued or running, and not once it has a verdict", () => {
    expect(isAttemptLive({ sequence: 1 })).toBe(true);
    expect(isAttemptLive({ sequence: 1, pending: true })).toBe(true);
    expect(isAttemptLive({ sequence: 1, passed: true })).toBe(false);
    expect(isAttemptLive({ sequence: 1, timed_out: true })).toBe(false);
  });
});

describe("testAttemptViews", () => {
  const flaky: Test = {
    name: "TestCharge",
    framework: "go test",
    file: "billing/charge_test.go",
    failed: true,
    message: "final failure",
    stdout: "final stdout",
    duration: 3e9,
    failure_detail: { summary: "boom" },
    attempts: [
      { sequence: 1, failed: true, message: "first failure", stdout: "first stdout", duration: 1e9, pid: 11 },
      { sequence: 2, run_kind: "rerun", failed: true, message: "final failure", duration: 2e9, pid: 12 },
    ],
  };

  it("is empty for a test without attempts", () => {
    expect(testAttemptViews({ name: "x", passed: true })).toEqual([]);
  });

  it("numbers attempts from 1 in run order, with status and duration in milliseconds", () => {
    expect(testAttemptViews(flaky).map(({ id, status, durationMs }) => ({ id, status, durationMs }))).toEqual([
      { id: 1, status: "failed", durationMs: 1000 },
      { id: 2, status: "failed", durationMs: 2000 },
    ]);
  });

  it("projects each attempt over the test's identity, with that attempt's verdict and output", () => {
    const [first] = testAttemptViews(flaky);
    expect(first!.node).toMatchObject({
      name: "TestCharge",
      framework: "go test",
      file: "billing/charge_test.go",
      failed: true,
      message: "first failure",
      stdout: "first stdout",
      duration: 1e9,
    });
    expect(first!.node.attempts).toEqual([flaky.attempts![0]]);
  });

  it("drops the test's own verdict, message and output from an attempt that did not set them", () => {
    const [passedLater] = testAttemptViews({
      name: "t",
      failed: true,
      message: "overall",
      stderr: "overall stderr",
      attempts: [{ sequence: 1, passed: true }],
    });
    expect(passedLater!.node.failed).toBeUndefined();
    expect(passedLater!.node.passed).toBe(true);
    expect(passedLater!.node.message).toBeUndefined();
    expect(passedLater!.node.stderr).toBeUndefined();
  });

  it("keeps the failure detail on the last attempt only", () => {
    const [first, last] = testAttemptViews(flaky);
    expect(first!.node.failure_detail).toBeUndefined();
    expect(last!.node.failure_detail).toEqual({ summary: "boom" });
  });

  it("marks a verdict-less attempt as running", () => {
    const [view] = testAttemptViews({ name: "t", attempts: [{ sequence: 1, pid: 5 }] });
    expect(view!.status).toBe("running");
    expect(view!.node.running).toBe(true);
  });
});

describe("TestNodeAdapterRegistry.resolveAttempts", () => {
  const withAttempts: Test = { name: "t", attempts: [{ sequence: 1, failed: true }, { sequence: 2, passed: true }] };

  it("offers a node's own attempts with no adapter registered", () => {
    expect(createTestRunnerRegistry().resolveAttempts(withAttempts, runner).map((a) => a.status)).toEqual([
      "failed",
      "passed",
    ]);
  });

  it("prefers a matching adapter's detailAttempts over the node's own", () => {
    const stored = [{ id: 7, status: "stored", node: { name: "stored" } }];
    const registry = createTestRunnerRegistry([
      { id: "stored", match: () => true, detailAttempts: () => stored },
    ]);
    expect(registry.resolveAttempts(withAttempts, runner)).toBe(stored);
  });

  it("falls back to the node's own attempts when the matching adapter has none", () => {
    const registry = createTestRunnerRegistry([{ id: "none", match: () => true, detailAttempts: () => [] }]);
    expect(registry.resolveAttempts(withAttempts, runner)).toHaveLength(2);
  });

  it("is empty for a node with neither", () => {
    expect(createTestRunnerRegistry().resolveAttempts({ name: "t" }, runner)).toEqual([]);
  });
});
