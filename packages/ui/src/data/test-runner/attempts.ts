import type { DetailAttempt } from "./adapter";
import type { Test, TestAttempt } from "./types";

export type AttemptStatus = "timedout" | "failed" | "skipped" | "passed" | "pending" | "running";

/** An attempt's single status; one with no verdict flag and not queued is still running. */
export function attemptStatus(attempt: TestAttempt): AttemptStatus {
  if (attempt.timed_out) return "timedout";
  if (attempt.failed) return "failed";
  if (attempt.skipped) return "skipped";
  if (attempt.passed) return "passed";
  if (attempt.pending) return "pending";
  return "running";
}

/** The attempt has started and has no verdict yet, so its process can still be read live. */
export function isAttemptLive(attempt: TestAttempt): boolean {
  const status = attemptStatus(attempt);
  return status === "running" || status === "pending";
}

/**
 * The test as one attempt saw it: the attempt's verdict, output and duration
 * over the test's identity, with `attempts` narrowed to that attempt. A failure
 * detail only describes the final result, so only the last attempt keeps it.
 */
function attemptTest(test: Test, attempt: TestAttempt, isLast: boolean): Test {
  const {
    passed: _passed,
    failed: _failed,
    skipped: _skipped,
    warned: _warned,
    aborted: _aborted,
    pending: _pending,
    running: _running,
    timed_out: _timedOut,
    failure_detail: failureDetail,
    message: _message,
    stdout: _stdout,
    stderr: _stderr,
    duration: _duration,
    ...identity
  } = test;
  const status = attemptStatus(attempt);
  return {
    ...identity,
    ...(status === "timedout" ? { timed_out: true } : {}),
    ...(status === "failed" ? { failed: true } : {}),
    ...(status === "skipped" ? { skipped: true } : {}),
    ...(status === "passed" ? { passed: true } : {}),
    ...(status === "pending" ? { pending: true } : {}),
    ...(status === "running" ? { running: true } : {}),
    ...(attempt.message !== undefined ? { message: attempt.message } : {}),
    ...(attempt.stdout !== undefined ? { stdout: attempt.stdout } : {}),
    ...(attempt.stderr !== undefined ? { stderr: attempt.stderr } : {}),
    ...(attempt.duration !== undefined ? { duration: attempt.duration } : {}),
    ...(attempt.command !== undefined ? { command: attempt.command } : {}),
    ...(isLast && failureDetail ? { failure_detail: failureDetail } : {}),
    attempts: [attempt],
  };
}

/**
 * The attempts of `test.attempts` as chooser entries, numbered from 1 in the
 * order they ran. Empty when the test has none.
 */
export function testAttemptViews(test: Test): DetailAttempt[] {
  const attempts = test.attempts ?? [];
  return attempts.map((attempt, index) => ({
    id: index + 1,
    status: attemptStatus(attempt),
    ...(attempt.duration !== undefined && attempt.duration > 0 ? { durationMs: attempt.duration / 1e6 } : {}),
    node: attemptTest(test, attempt, index === attempts.length - 1),
  }));
}
