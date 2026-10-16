import { describe, expect, it } from "vitest";
import { buildLintTree, findLintNode } from "./grouping";
import {
  collectLintLinters,
  countLintByLinter,
  countLintBySeverity,
  isLinterErrored,
  lintNodeCount,
  lintNodeSeverity,
  totalLintViolations,
} from "./stats";
import {
  emptyLintFilters,
  LINT_GROUPINGS,
  type LintGrouping,
  type LintNode,
  type LintSeverity,
  type LinterResult,
} from "./types";
import {
  allLintResults,
  betterleaks,
  eslint,
  golangci,
  markdownlintClean,
  pyrightFailed,
  valeSkipped,
} from "./LintResults.fixtures";

const none = emptyLintFilters();

function violation(file: string | undefined, rule: string, line = 1): LinterResult["violations"] {
  return [{ file, line, severity: "error", rule: { method: rule }, message: `${rule} at ${file}` }];
}

describe("buildLintTree linter-rule-file", () => {
  it("nests linter -> rule -> collapsed folder/file chains, sorted by name", () => {
    const [linter] = buildLintTree({ results: [golangci], grouping: "linter-rule-file", filters: none });
    expect(linter!.kind).toBe("linter");
    expect(linter!.name).toBe("golangci-lint");
    expect(linter!.children!.map((c) => [c.name, c.kind, c.ruleName])).toEqual([
      ["errcheck", "lint-rule-group", "errcheck"],
      ["godot", "lint-rule-group", "godot"],
      ["unused", "lint-rule-group", "unused"],
    ]);
    const [errcheckFile] = linter!.children![0]!.children!;
    expect(errcheckFile).toMatchObject({
      name: "pkg > server > handler.go",
      kind: "lint-file",
      file: "pkg/server/handler.go",
      target_path: "pkg/server/handler.go",
      linterName: "golangci-lint",
      ruleName: "errcheck",
      work_dir: "/repo/gavel",
    });
    expect(errcheckFile!.violations!.map((v) => v.line)).toEqual([41, 88]);
  });

  it("keeps violations without a file on the rule group", () => {
    const [linter] = buildLintTree({ results: [betterleaks], grouping: "linter-rule-file", filters: none });
    const [rule] = linter!.children!;
    expect(rule!.kind).toBe("lint-rule-group");
    expect(rule!.children ?? []).toHaveLength(0);
    expect(rule!.noFileViolations).toHaveLength(1);
    expect(rule!.failed).toBe(true);
  });

  it("assigns unique URL-safe route paths and resolves them back to nodes", () => {
    const tree = buildLintTree({ results: [golangci], grouping: "linter-rule-file", filters: none });
    const leaf = findLintNode(tree, "golangci-lint/errcheck/pkg-server-handler-go");
    expect(leaf?.name).toBe("pkg > server > handler.go");
    expect(findLintNode(tree, "golangci-lint/nope")).toBeNull();
    expect(findLintNode(tree, "")).toBeNull();
  });

  it("disambiguates sibling nodes that slug to the same path", () => {
    const results: LinterResult[] = [
      {
        linter: "x",
        violations: [
          ...(violation("a/Foo.go", "r") ?? []),
          ...(violation("a/foo.go", "r") ?? []),
        ],
      },
    ];
    const tree = buildLintTree({ results, grouping: "linter-file", filters: none });
    const paths: string[] = [];
    const walk = (n: LintNode): void => {
      paths.push(n.route_path);
      n.children?.forEach(walk);
    };
    tree.forEach(walk);
    expect(paths).toEqual(["x", "x/a", "x/a/foo-go~1", "x/a/foo-go~2"]);
  });
});

describe("buildLintTree linter-file", () => {
  it("builds a folder tree per linter with files as leaves carrying every rule's violations", () => {
    const [linter] = buildLintTree({ results: [golangci], grouping: "linter-file", filters: none });
    expect(linter!.children!.map((c) => c.name)).toEqual(["pkg"]);
    const pkg = linter!.children![0]!;
    expect(pkg.kind).toBe("lint-folder");
    expect(pkg.children!.map((c) => c.name)).toEqual(["server", "store > db.go"]);
    const server = pkg.children![0]!;
    expect(server.children!.map((c) => [c.name, c.kind])).toEqual([
      ["routes > api.go", "lint-file"],
      ["handler.go", "lint-file"],
    ]);
    expect(server.children![1]!.violations).toHaveLength(2);
    expect(server.target_path).toBe("pkg/server");
  });
});

describe("buildLintTree file-linter-rule", () => {
  it("roots the tree at files, with linters then rules beneath a multi-linter file", () => {
    const results: LinterResult[] = [
      { linter: "alpha", work_dir: "/r", violations: violation("/r/pkg/a.go", "a-rule") },
      { linter: "beta", work_dir: "/r", violations: violation("/r/pkg/a.go", "b-rule") },
    ];
    const [file] = buildLintTree({ results, grouping: "file-linter-rule", filters: none });
    expect(file).toMatchObject({ name: "pkg > a.go", kind: "lint-file", file: "pkg/a.go" });
    expect(file!.children!.map((c) => [c.name, c.kind])).toEqual([
      ["alpha", "linter"],
      ["beta", "linter"],
    ]);
    expect(file!.children![0]!.children![0]).toMatchObject({
      kind: "lint-rule",
      ruleName: "a-rule",
      linterName: "alpha",
    });
  });

  it("lists linters whose findings carry no file after the file tree", () => {
    const results: LinterResult[] = [
      { linter: "alpha", work_dir: "/r", violations: violation("/r/a.go", "a-rule") },
      { ...betterleaks, work_dir: "/r" },
    ];
    const tree = buildLintTree({ results, grouping: "file-linter-rule", filters: none });
    expect(tree.map((n) => [n.name, n.kind])).toEqual([
      ["a.go", "lint-file"],
      ["betterleaks", "linter"],
    ]);
    expect(tree[1]!.children![0]!.kind).toBe("lint-rule");
  });
});

describe("buildLintTree summary", () => {
  it("orders rules by violation count then name and aggregates per file", () => {
    const [linter] = buildLintTree({ results: [golangci], grouping: "summary", filters: none });
    expect(linter!.children!.map((c) => c.ruleName)).toEqual(["errcheck", "godot", "unused"]);
    const errcheck = linter!.children![0]!;
    expect(errcheck.name).toBe("errcheck (2) — Error return value of `w.Write` is not checked");
    expect(errcheck.children!.map((c) => c.name)).toEqual(["pkg/server/handler.go (2)"]);
    expect(linter!.children![1]!.children![0]!.name).toBe("pkg/store/db.go:7");
  });

  it("caps files per rule at five and counts the rest", () => {
    const violations = Array.from({ length: 7 }, (_, i) => violation(`d/f${i}.go`, "many", i + 1)![0]!);
    const [linter] = buildLintTree({
      results: [{ linter: "x", violations }],
      grouping: "summary",
      filters: none,
    });
    const names = linter!.children![0]!.children!.map((c) => c.name);
    expect(names).toHaveLength(6);
    expect(names[5]).toBe("… 2 more files");
  });

  it("shows a skipped linter as a skipped leaf with its reason", () => {
    const [vale] = buildLintTree({ results: [valeSkipped], grouping: "summary", filters: none });
    expect(vale).toMatchObject({
      name: "vale",
      skipped: true,
      failed: false,
      message: "skipped: no .vale.ini found",
    });
  });
});

describe("linters that failed to run", () => {
  it.each(LINT_GROUPINGS)("shows the error under its linter in %s grouping", (grouping: LintGrouping) => {
    const [pyright] = buildLintTree({ results: [pyrightFailed], grouping, filters: none });
    expect(pyright).toMatchObject({ name: "pyright", kind: "linter", failed: true, passed: false });
    expect(pyright!.children).toHaveLength(1);
    expect(pyright!.children![0]).toMatchObject({
      kind: "linter-error",
      failed: true,
      linterName: "pyright",
      message: pyrightFailed.error,
    });
    expect(pyright!.children![0]!.name).toBe("pyright: configuration file pyrightconfig.json is invalid");
  });

  it("keeps the error beside the violations of a linter that did report findings", () => {
    const partial: LinterResult = { ...golangci, error: "golangci-lint: 1 package failed to type-check" };
    const [linter] = buildLintTree({ results: [partial], grouping: "linter-file", filters: none });
    expect(linter!.children![0]!.kind).toBe("linter-error");
    expect(linter!.children!.slice(1).map((c) => c.name)).toEqual(["pkg"]);
  });

  it("still shows the error when a severity filter would hide every violation", () => {
    const filters = emptyLintFilters();
    filters.severity.set("info", "include");
    const tree = buildLintTree({ results: [pyrightFailed], grouping: "linter-rule-file", filters });
    expect(tree.map((n) => n.name)).toEqual(["pyright"]);
  });

  it("drops the error when its linter is excluded", () => {
    const filters = emptyLintFilters();
    filters.linter.set("pyright", "exclude");
    expect(buildLintTree({ results: [pyrightFailed], grouping: "linter-file", filters })).toEqual([]);
  });

  it("reports a timed-out linter even without an error message", () => {
    const timedOut: LinterResult = { linter: "slow", violations: [], timed_out: true, success: false };
    expect(isLinterErrored(timedOut)).toBe(true);
    const [slow] = buildLintTree({ results: [timedOut], grouping: "linter-file", filters: none });
    expect(slow!.children![0]!.message).toBe("timed out");
  });

  it("does not treat a skipped or clean linter as errored", () => {
    expect(isLinterErrored(valeSkipped)).toBe(false);
    expect(isLinterErrored(markdownlintClean)).toBe(false);
    expect(isLinterErrored(pyrightFailed)).toBe(true);
  });
});

describe("filters", () => {
  it("excludes a severity from every grouping", () => {
    const filters = emptyLintFilters();
    filters.severity.set("warning", "exclude");
    filters.severity.set("info", "exclude");
    const [linter] = buildLintTree({ results: [golangci], grouping: "linter-rule-file", filters });
    expect(linter!.children!.map((c) => c.ruleName)).toEqual(["errcheck"]);
  });

  it("includes only the chosen linters", () => {
    const filters = emptyLintFilters();
    filters.linter.set("eslint", "include");
    const tree = buildLintTree({ results: [golangci, eslint], grouping: "linter-rule-file", filters });
    expect(tree.map((n) => n.name)).toEqual(["eslint"]);
  });

  it("returns an empty tree for no results", () => {
    expect(buildLintTree({ results: [], grouping: "summary", filters: none })).toEqual([]);
  });
});

describe("multiple work dirs", () => {
  it("prefixes file paths with the work dir label but keeps the ignore path relative", () => {
    const tree = buildLintTree({ results: [golangci, eslint], grouping: "linter-file", filters: none });
    const esl = tree.find((n) => n.name === "eslint")!;
    expect(esl.children![0]).toMatchObject({
      name: "gavel > web > src > App.tsx",
      file: "gavel/web/src/App.tsx",
      target_path: "src/App.tsx",
      work_dir: "/repo/gavel/web",
    });
  });
});

describe("counting helpers", () => {
  it("counts violations by severity, respecting the linter filter", () => {
    expect(countLintBySeverity([golangci, eslint], emptyLintFilters().linter)).toEqual({
      error: 3,
      warning: 2,
      info: 1,
    });
    const onlyEslint = new Map([["eslint", "include" as const]]);
    expect(countLintBySeverity([golangci, eslint], onlyEslint)).toEqual({ error: 1, warning: 1, info: 0 });
  });

  it("counts violations by linter, respecting the severity filter", () => {
    const noInfo = new Map<LintSeverity, "exclude">([["info", "exclude"]]);
    expect(countLintByLinter([golangci, eslint], noInfo)).toEqual({ "golangci-lint": 3, eslint: 2 });
  });

  it("lists linters that have violations or failed, sorted", () => {
    expect(collectLintLinters(allLintResults)).toEqual(["betterleaks", "eslint", "golangci-lint", "pyright"]);
  });

  it("totals violations across results, treating null as none", () => {
    expect(totalLintViolations(allLintResults)).toBe(7);
  });

  it("rolls counts and the worst severity up the tree", () => {
    const [linter] = buildLintTree({ results: [golangci], grouping: "linter-rule-file", filters: none });
    expect(lintNodeCount(linter!)).toBe(4);
    expect(lintNodeSeverity(linter!)).toBe("error");
    const unused = linter!.children!.find((c) => c.ruleName === "unused")!;
    expect(lintNodeSeverity(unused)).toBe("warning");
    expect(lintNodeSeverity(linter!.children!.find((c) => c.ruleName === "godot")!)).toBe("info");
  });
});
