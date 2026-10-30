import { describe, expect, it } from "vitest";
import type { LinterResult } from "../data/lint/types";
import type { Test } from "../data/test-runner/types";
import { groupFindingsByFile, lintFindings, testFindings } from "./adapters";
import type { FileFinding, FileTreeNode } from "./types";

const WORK_DIR = "/repo/gavel";

function lintResult(overrides: Partial<LinterResult> = {}): LinterResult {
  return { linter: "golangci-lint", work_dir: WORK_DIR, violations: [], ...overrides };
}

describe("lintFindings", () => {
  it("projects a violation onto a finding relative to the linter's work dir", () => {
    const findings = lintFindings([
      lintResult({
        violations: [
          {
            file: `${WORK_DIR}/pkg/server/handler.go`,
            line: 41,
            column: 9,
            end_line: 41,
            end_column: 14,
            severity: "warning",
            rule: { method: "errcheck" },
            message: "Error return value is not checked",
          },
        ],
      }),
    ]);

    expect(findings).toEqual<FileFinding[]>([
      {
        file: "pkg/server/handler.go",
        workDir: WORK_DIR,
        line: 41,
        column: 9,
        endLine: 41,
        endColumn: 14,
        severity: "warning",
        message: "Error return value is not checked",
        source: "golangci-lint",
        rule: "errcheck",
        kind: "lint",
      },
    ]);
  });

  it("treats a violation without a severity as an error, as on the wire", () => {
    const [finding] = lintFindings([lintResult({ violations: [{ file: "a.go", line: 3, message: "m" }] })]);

    expect(finding?.severity).toBe("error");
  });

  it("places a violation found at several places on each of them, naming what is there", () => {
    const findings = lintFindings([
      lintResult({
        linter: "oipa-transaction",
        violations: [
          {
            file: "rules/a/XMLData.xml",
            line: 4,
            severity: "warning",
            message: "PlanAffectingConvert — CONVERT_IMPLICIT(nvarchar(100),[FileID],0)",
            locations: [
              { file: `${WORK_DIR}/rules/a/XMLData.xml`, line: 4, message: "statement s1" },
              { file: "rules/b/XMLData.xml", line: 9, message: "statement s2" },
            ],
          },
        ],
      }),
    ]);

    expect(findings.map((f) => `${f.file}:${f.line} ${f.message}`)).toEqual([
      "rules/a/XMLData.xml:4 PlanAffectingConvert — CONVERT_IMPLICIT(nvarchar(100),[FileID],0) (statement s1)",
      "rules/b/XMLData.xml:9 PlanAffectingConvert — CONVERT_IMPLICIT(nvarchar(100),[FileID],0) (statement s2)",
    ]);
  });

  it("prefers the violation's own source over the linter name", () => {
    const [finding] = lintFindings([
      lintResult({ linter: "eslint", violations: [{ file: "a.ts", line: 3, source: "typescript-eslint", message: "m" }] }),
    ]);

    expect(finding?.source).toBe("typescript-eslint");
  });

  it("uses raw_file when grouping has already made the path work-dir relative", () => {
    const [finding] = lintFindings([
      lintResult({ violations: [{ file: "gavel/pkg/a.go", raw_file: "pkg/a.go", line: 3, message: "m" }] }),
    ]);

    expect(finding?.file).toBe("pkg/a.go");
  });

  it("anchors a violation with no line at the top of its file", () => {
    const [finding] = lintFindings([lintResult({ violations: [{ file: "README.md", message: "m" }] })]);

    expect(finding?.line).toBe(1);
  });

  it("drops violations that name no file, and linters that reported none", () => {
    const findings = lintFindings([
      lintResult({ violations: [{ line: 1, message: "found in git history" }] }),
      lintResult({ linter: "pyright", violations: null, error: "bad config" }),
    ]);

    expect(findings).toEqual([]);
  });
});

function failedTest(overrides: Partial<Test>): Test {
  return { name: "TestThing", failed: true, work_dir: WORK_DIR, framework: "go test", ...overrides };
}

describe("testFindings", () => {
  it("projects a failed test with a location onto an error finding", () => {
    const findings = testFindings([
      failedTest({
        file: `${WORK_DIR}/pkg/server/handler_test.go`,
        line: 20,
        end_line: 34,
        failure_detail: { kind: "gomega", summary: "Expected 1 to equal 2" },
      }),
    ]);

    expect(findings).toEqual<FileFinding[]>([
      {
        file: "pkg/server/handler_test.go",
        workDir: WORK_DIR,
        line: 20,
        endLine: 34,
        severity: "error",
        message: "Expected 1 to equal 2",
        source: "go test",
        rule: "TestThing",
        kind: "test",
      },
    ]);
  });

  it("falls back to the test message, then to the test name, when there is no failure detail", () => {
    const findings = testFindings([
      failedTest({ name: "A", file: "a_test.go", line: 1, message: "boom" }),
      failedTest({ name: "B", file: "b_test.go", line: 2 }),
    ]);

    expect(findings.map((f) => f.message)).toEqual(["boom", "B failed"]);
  });

  it("reports the failing leaf rather than the suites above it", () => {
    const findings = testFindings([
      failedTest({
        name: "Suite",
        file: "suite_test.go",
        line: 5,
        children: [
          { name: "passes", passed: true, file: "suite_test.go", line: 10 },
          failedTest({ name: "fails", file: "suite_test.go", line: 20, message: "nope" }),
        ],
      }),
    ]);

    expect(findings.map((f) => [f.rule, f.line])).toEqual([["fails", 20]]);
  });

  it("keeps a failed suite that has no failing descendants of its own", () => {
    const findings = testFindings([
      failedTest({ name: "Suite", file: "suite_test.go", line: 5, children: [{ name: "ok", passed: true }] }),
    ]);

    expect(findings.map((f) => f.rule)).toEqual(["Suite"]);
  });

  it("ignores passing tests and failures with no file or line", () => {
    const findings = testFindings([
      { name: "passing", passed: true, file: "a_test.go", line: 1 },
      failedTest({ name: "no file", line: 3 }),
      failedTest({ name: "no line", file: "a_test.go" }),
    ]);

    expect(findings).toEqual([]);
  });
});

function finding(file: string, workDir: string | undefined, line = 1): FileFinding {
  return { file, workDir, line, severity: "error", message: "m", source: "x", kind: "lint" };
}

/** Folders and files as `name` paths, depth first, for comparing whole trees. */
function outline(nodes: FileTreeNode[], depth = 0): string[] {
  return nodes.flatMap((n) => [
    `${"  ".repeat(depth)}${n.kind === "folder" ? `${n.name}/` : n.name} (${n.findings.length})`,
    ...outline(n.children ?? [], depth + 1),
  ]);
}

describe("groupFindingsByFile", () => {
  it("builds a path tree with folders before files, collapsing single-child folders", () => {
    const tree = groupFindingsByFile([
      finding("pkg/server/handler.go", WORK_DIR, 41),
      finding("pkg/server/handler.go", WORK_DIR, 88),
      finding("pkg/server/routes/api.go", WORK_DIR),
      finding("README.md", WORK_DIR),
      finding("pkg/store/db.go", WORK_DIR),
    ]);

    expect(outline(tree)).toEqual([
      "pkg/ (4)",
      "  server/ (3)",
      "    routes > api.go (1)",
      "    handler.go (2)",
      "  store > db.go (1)",
      "README.md (1)",
    ]);
  });

  it("gives file nodes the ref and findings of their file, sorted by line", () => {
    const tree = groupFindingsByFile([finding("a/b.go", WORK_DIR, 9), finding("a/b.go", WORK_DIR, 2)]);

    const [leaf] = tree;
    expect(leaf?.kind).toBe("file");
    expect(leaf?.ref).toEqual({ workDir: WORK_DIR, file: "a/b.go" });
    expect(leaf?.findings.map((f) => f.line)).toEqual([2, 9]);
  });

  it("keeps the same relative path under two work dirs apart, labelled by work dir", () => {
    const tree = groupFindingsByFile([finding("src/App.tsx", "/repo/gavel/web"), finding("src/App.tsx", "/repo/gavel/ui")]);

    expect(outline(tree)).toEqual(["gavel/ui > src > App.tsx (1)", "gavel/web > src > App.tsx (1)"]);
    const keys = tree.map((n) => n.key);
    expect(new Set(keys).size).toBe(2);
  });

  it("returns an empty tree for no findings", () => {
    expect(groupFindingsByFile([])).toEqual([]);
  });
});
