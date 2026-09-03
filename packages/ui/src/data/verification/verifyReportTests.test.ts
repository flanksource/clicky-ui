import { describe, expect, it } from "vitest";
import { verifyReportCounts, verifyReportTests } from "./verifyReportTests";
import { aggregateStatusCounts, statusIconFor, statusToneFor, sum } from "../test-runner";
import { UiError, UiPass } from "../../icons";
import {
  emptyVerifySummary,
  summarizeVerifyNodes,
  type VerifyNode,
  type VerifyReport,
  type VerifySummary,
} from "./verify-report";

// Every fixture below must be a report captain's `Validate` would accept: the
// `summary` matches the `tests` leaves (via `summarizeVerifyNodes`, mirroring
// Go's `SummarizeNodes`), and `passed` matches `state === "passed"`.
function report(overrides: Partial<VerifyReport> = {}): VerifyReport {
  const state = overrides.state ?? "passed";
  const tests = overrides.tests ?? [];
  return {
    kind: "fixture",
    ran: true,
    passed: state === "passed",
    summary: summarizeVerifyNodes(tests),
    state,
    ...overrides,
  };
}

function node(overrides: Partial<VerifyNode> = {}): VerifyNode {
  return { name: "step", ...overrides };
}

describe("verifyReportTests", () => {
  it.each([
    ["passed", { passed: true }, { passed: true }],
    ["failed", { failed: true }, { failed: true }],
    ["warned", { warned: true }, { warned: true }],
    ["skipped", { skipped: true }, { skipped: true }],
    ["pending", { pending: true }, { pending: true }],
    ["running", { running: true }, { running: true }],
    ["timed out", { timed_out: true }, { timed_out: true }],
  ])("carries the %s flag through to the Test node", (_label, nodeOverride, expected) => {
    const tests = verifyReportTests(report({ tests: [node(nodeOverride)] }));
    expect(tests[0]).toMatchObject(expected);
  });

  it("copies snake_case fields through unchanged, including nested context", () => {
    const tests = verifyReportTests(
      report({
        tests: [
          node({
            name: "run the suite",
            framework: "fixture",
            task_id: "step:0",
            file: "fixture.md",
            line: 12,
            message: "assertion failed",
            command: "go test ./...",
            work_dir: "/repo",
            stdout: "ok\n",
            stderr: "",
            duration: 2_500_000_000,
            failed: true,
            context: { cel_expression: "results.failed == 0", cel_vars: { failed: 1 } },
            detail: { cel_trace: "cel: results.failed == 0" },
          }),
        ],
      }),
    );

    expect(tests[0]).toMatchObject({
      name: "run the suite",
      framework: "fixture",
      task_id: "step:0",
      file: "fixture.md",
      line: 12,
      message: "assertion failed",
      command: "go test ./...",
      work_dir: "/repo",
      stdout: "ok\n",
      duration: 2_500_000_000,
      failed: true,
      context: { cel_expression: "results.failed == 0", cel_vars: { failed: 1 } },
      detail: { cel_trace: "cel: results.failed == 0" },
    });
  });

  it("drops a non-finite duration rather than passing malformed data through", () => {
    const malformed = { ...node({ passed: true }), duration: "not-a-number" } as unknown as VerifyNode;
    const tests = verifyReportTests(report({ tests: [malformed] }));
    expect(tests[0]?.duration).toBeUndefined();
  });

  it("recurses into nested children", () => {
    const tests = verifyReportTests(
      report({
        tests: [
          node({
            name: "fixture.md",
            passed: true,
            children: [
              node({ name: "step one", passed: true }),
              node({ name: "step two", failed: true, children: [node({ name: "grandchild", passed: true })] }),
            ],
          }),
        ],
      }),
    );

    expect(tests[0]?.children?.map((c) => c.name)).toEqual(["step one", "step two"]);
    expect(tests[0]?.children?.[1]?.children?.[0]).toMatchObject({ name: "grandchild", passed: true });
  });

  describe("summary-carrying node (elided children)", () => {
    const groupSummary: VerifySummary = {
      total: 20,
      passed: 15,
      failed: 3,
      warned: 1,
      skipped: 1,
      pending: 0,
      running: 0,
      timedout: 2,
    };

    it("maps VerifySummary onto the test-runner's PascalCase TestSummary shape", () => {
      const tests = verifyReportTests(
        report({ tests: [node({ name: "large suite", summary: groupSummary })] }),
      );

      expect(tests[0]?.summary).toEqual({
        Total: 20,
        Passed: 15,
        Failed: 3,
        Warned: 1,
        Skipped: 1,
        Pending: 0,
        Running: 0,
        Timedout: 2,
        Duration: 0,
      });
    });

    it("counts from the summary rather than recursing, for a group with no children", () => {
      const tests = verifyReportTests(
        report({ tests: [node({ name: "large suite", summary: groupSummary })] }),
      );

      expect(tests[0]?.children).toBeUndefined();
      expect(sum(tests[0]!)).toMatchObject({
        total: 20,
        passed: 15,
        failed: 3,
        warned: 1,
        skipped: 1,
        timedout: 2,
      });
      expect(aggregateStatusCounts(tests)).toMatchObject({
        total: 20,
        passed: 15,
        failed: 3,
        warned: 1,
        skipped: 1,
        timedout: 2,
      });
    });

    it("prefers the summary over children when a node carries both", () => {
      const tests = verifyReportTests(
        report({
          tests: [
            node({
              name: "large suite",
              summary: groupSummary,
              children: [node({ name: "child one", failed: true })],
            }),
          ],
        }),
      );

      // The child list is dropped entirely — its single failure must not
      // leak into the summary-driven roll-up.
      expect(tests[0]?.children).toBeUndefined();
      expect(sum(tests[0]!)).toMatchObject({ total: 20, passed: 15, failed: 3 });
    });

    it("contributes the summary directly in summarizeVerifyNodes, without recursing into children", () => {
      const summary = summarizeVerifyNodes([
        {
          name: "large suite",
          summary: groupSummary,
          children: [{ name: "child one", failed: true }],
        },
      ]);

      expect(summary).toEqual(groupSummary);
    });
  });

  describe("checklist synthesis", () => {
    it("appends an Acceptance criteria node with a child per checklist item, carrying no status flags of its own", () => {
      const tests = verifyReportTests(
        report({
          checklist: [
            { item: "docs updated", passed: true },
            { item: "tests added", passed: false, message: "no new test file" },
            { item: "reviewed", passed: null },
          ],
        }),
      );

      expect(tests).toHaveLength(1);
      const acceptance = tests[0]!;
      expect(acceptance).toMatchObject({
        name: "Acceptance criteria",
        framework: "checklist",
        task_id: "acceptance-criteria",
      });
      // No `passed`/`failed`/`pending` of its own — the row's rendered status
      // is left to the shared roll-up over its children.
      expect(acceptance.passed).toBeUndefined();
      expect(acceptance.failed).toBeUndefined();
      expect(acceptance.pending).toBeUndefined();
      expect(acceptance.children).toEqual([
        expect.objectContaining({ name: "docs updated", passed: true, failed: false, pending: false }),
        expect.objectContaining({
          name: "tests added",
          passed: false,
          failed: true,
          pending: false,
          message: "no new test file",
        }),
        expect.objectContaining({ name: "reviewed", passed: false, failed: false, pending: true }),
      ]);
      // Roll-up: one failed leaf outranks the still-pending one, so the
      // container itself must render as failed, not queued.
      expect(statusToneFor(acceptance)).toBe("danger");
      expect(statusIconFor(acceptance)).toBe(UiError);
    });

    it("falls back to a numbered criterion name when an item's name is empty", () => {
      const tests = verifyReportTests(report({ checklist: [{ item: "", passed: true }] }));
      expect(tests[0]?.children?.[0]?.name).toBe("Criterion 1");
    });

    it("renders a failed leaf even alongside an unjudged (pending) sibling — the regression this container used to mask", () => {
      const tests = verifyReportTests(
        report({ checklist: [{ item: "a", passed: false }, { item: "b", passed: null }] }),
      );
      const acceptance = tests[0]!;
      expect(statusToneFor(acceptance)).toBe("danger");
      expect(statusIconFor(acceptance)).toBe(UiError);
    });

    it("omits the Acceptance criteria node when the checklist is empty", () => {
      const tests = verifyReportTests(report({ tests: [node({ passed: true })], checklist: [] }));
      expect(tests.map((t) => t.name)).toEqual(["step"]);
    });

    it("rolls up to passed when every criterion passes and none are pending", () => {
      const tests = verifyReportTests(
        report({ checklist: [{ item: "a", passed: true }, { item: "b", passed: true }] }),
      );
      expect(statusToneFor(tests[0]!)).toBe("success");
      expect(statusIconFor(tests[0]!)).toBe(UiPass);
    });
  });

  describe("verifyReportCounts", () => {
    it("sums test and checklist status across the report", () => {
      const counts = verifyReportCounts(
        report({
          tests: [node({ passed: true }), node({ failed: true }), node({ warned: true })],
          checklist: [{ item: "a", passed: true }, { item: "b", passed: false }],
        }),
      );

      // 3 top-level test nodes + 1 acceptance-criteria container rolling up 2 leaves.
      expect(counts).toMatchObject({ total: 5, passed: 2, failed: 2, warned: 1 });
    });

    it("counts a timed-out node in its own bucket, not in failed", () => {
      const counts = verifyReportCounts(report({ tests: [node({ timed_out: true })] }));
      expect(counts).toMatchObject({ total: 1, failed: 0, timedout: 1 });
    });

    it("is all zero for an empty report", () => {
      expect(verifyReportCounts(report())).toMatchObject({
        total: 0,
        passed: 0,
        failed: 0,
        warned: 0,
        skipped: 0,
        pending: 0,
        running: 0,
        timedout: 0,
      });
    });
  });

  describe("summarizeVerifyNodes", () => {
    it("tallies only leaf nodes, applying failed > timed-out > warned > skipped > running > pending > passed precedence", () => {
      const summary = summarizeVerifyNodes([
        node({ passed: true }),
        node({ failed: true }),
        node({ timed_out: true }),
        node({ warned: true }),
        node({ skipped: true }),
        node({ running: true }),
        node({ pending: true }),
      ]);
      expect(summary).toEqual({
        total: 7,
        passed: 1,
        failed: 1,
        timedout: 1,
        warned: 1,
        skipped: 1,
        running: 1,
        pending: 1,
      });
    });

    it("skips a container node itself and recurses into its children instead", () => {
      const summary = summarizeVerifyNodes([
        node({
          name: "group",
          children: [node({ passed: true }), node({ failed: true })],
        }),
      ]);
      expect(summary).toMatchObject({ total: 2, passed: 1, failed: 1 });
    });

    it("is all zero for an empty node list", () => {
      expect(summarizeVerifyNodes([])).toEqual(emptyVerifySummary());
    });
  });
});
