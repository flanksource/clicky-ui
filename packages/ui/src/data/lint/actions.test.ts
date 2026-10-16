import { describe, expect, it } from "vitest";
import {
  folderPattern,
  lintFileActions,
  lintFolderActions,
  lintNodeActions,
  violationIgnoreAction,
} from "./actions";
import type { LintNode, LinterResult } from "./types";

function node(partial: Partial<LintNode> & Pick<LintNode, "kind">): LintNode {
  return {
    name: partial.name ?? "n",
    route_path: partial.route_path ?? "n",
    failed: false,
    passed: true,
    skipped: false,
    ...partial,
  };
}

const lintBothLinters: LinterResult[] = [
  {
    linter: "golangci-lint",
    work_dir: "/repo",
    violations: [{ file: "/repo/pkg/sub/a.go", line: 1, message: "x", rule: { method: "errcheck" } }],
  },
  {
    linter: "betterleaks",
    work_dir: "/repo",
    violations: [{ file: "/repo/pkg/sub/b.go", line: 2, message: "y", rule: { method: "gen-key" } }],
  },
];

describe("folderPattern", () => {
  it("matches everything when there is no path", () => {
    expect(folderPattern(undefined)).toBe("**");
    expect(folderPattern("")).toBe("**");
  });

  it("appends /** and strips trailing slashes", () => {
    expect(folderPattern("pkg")).toBe("pkg/**");
    expect(folderPattern("pkg/")).toBe("pkg/**");
    expect(folderPattern("pkg/sub")).toBe("pkg/sub/**");
  });
});

describe("lintFolderActions", () => {
  it("rule-scoped folder: ignore in folder, ignore rule everywhere, disable linter", () => {
    const actions = lintFolderActions(
      node({
        kind: "lint-folder",
        target_path: "pkg/sub",
        linterName: "golangci-lint",
        ruleName: "errcheck",
        work_dir: "/repo",
      }),
      [],
    );
    expect(actions.map((a) => a.label)).toEqual([
      "Ignore errcheck in this folder",
      "Ignore rule errcheck everywhere",
      "Disable golangci-lint entirely",
    ]);
    expect(actions.map((a) => a.req)).toEqual([
      { source: "golangci-lint", rule: "errcheck", file: "pkg/sub/**", work_dir: "/repo" },
      { source: "golangci-lint", rule: "errcheck", work_dir: "/repo" },
      { source: "golangci-lint", work_dir: "/repo" },
    ]);
    expect(actions[2]!.variant).toBe("subtle");
    expect(actions[0]!.disabledWithoutWorkDir).toBe(true);
  });

  it("linter-scoped folder with no direct violations: folder, linter-in-folder, disable", () => {
    const actions = lintFolderActions(
      node({ kind: "lint-folder", target_path: "pkg/empty", linterName: "eslint", work_dir: "/repo" }),
      [],
    );
    expect(actions.map((a) => a.label)).toEqual([
      "Ignore everything in this folder",
      "Ignore eslint in this folder",
      "Disable eslint entirely",
    ]);
    expect(actions[2]!.disabledWithoutWorkDir).toBeFalsy();
  });

  it("multi-linter folder: everything-in-folder plus a pair per linter that reported there", () => {
    const actions = lintFolderActions(node({ kind: "lint-folder", target_path: "pkg/sub" }), lintBothLinters);
    expect(actions[0]!.label).toBe("Ignore everything in this folder");
    expect(actions.map((a) => a.label)).toEqual([
      "Ignore everything in this folder",
      "Ignore betterleaks in this folder",
      "Disable betterleaks entirely",
      "Ignore golangci-lint in this folder",
      "Disable golangci-lint entirely",
    ]);
    expect(actions[0]!.req.work_dir).toBe("/repo");
  });

  it("multi-linter folder with nothing beneath it offers only everything-in-folder", () => {
    const actions = lintFolderActions(node({ kind: "lint-folder", target_path: "pkg/orphan" }), lintBothLinters);
    expect(actions.map((a) => a.label)).toEqual(["Ignore everything in this folder"]);
  });
});

describe("lintFileActions", () => {
  it("single-linter file: ignore all of that linter in the file, or disable it", () => {
    const actions = lintFileActions(
      node({
        kind: "lint-file",
        file: "pkg/foo.go",
        target_path: "pkg/foo.go",
        linterName: "golangci-lint",
        work_dir: "/repo",
      }),
    );
    expect(actions.map((a) => a.label)).toEqual([
      "Ignore all golangci-lint in this file",
      "Disable golangci-lint entirely",
    ]);
    expect(actions[0]!.req).toEqual({ source: "golangci-lint", file: "pkg/foo.go", work_dir: "/repo" });
  });

  it("multi-linter file: everything-in-file plus a pair per child linter, once each", () => {
    const child = (linterName: string) => node({ kind: "linter", name: linterName, linterName });
    const actions = lintFileActions(
      node({
        kind: "lint-file",
        file: "pkg/foo.go",
        target_path: "pkg/foo.go",
        work_dir: "/repo",
        children: [child("golangci-lint"), child("eslint"), child("eslint")],
      }),
    );
    expect(actions.map((a) => a.label)).toEqual([
      "Ignore everything in this file",
      "Ignore all golangci-lint in this file",
      "Disable golangci-lint entirely",
      "Ignore all eslint in this file",
      "Disable eslint entirely",
    ]);
    expect(actions[0]!.req).toEqual({ file: "pkg/foo.go", work_dir: "/repo" });
  });
});

describe("lintNodeActions", () => {
  it("linter node offers only disabling the linter, using its result's work dir", () => {
    const actions = lintNodeActions(
      node({
        kind: "linter",
        linterName: "eslint",
        linter: { linter: "eslint", work_dir: "/repo/web", violations: [] },
      }),
      [],
    );
    expect(actions.map((a) => [a.label, a.req])).toEqual([
      ["Disable eslint entirely", { source: "eslint", work_dir: "/repo/web" }],
    ]);
  });

  it("rule node in a file offers file, repo-wide and linter scopes", () => {
    const actions = lintNodeActions(
      node({
        kind: "lint-rule",
        linterName: "golangci-lint",
        ruleName: "errcheck",
        file: "pkg/a.go",
        target_path: "pkg/a.go",
        work_dir: "/repo",
      }),
      [],
    );
    expect(actions.map((a) => a.label)).toEqual([
      "Ignore errcheck in this file",
      "Ignore rule errcheck everywhere",
      "Disable golangci-lint entirely",
    ]);
    expect(actions[0]!.req).toEqual({
      source: "golangci-lint",
      rule: "errcheck",
      file: "pkg/a.go",
      work_dir: "/repo",
    });
  });

  it("rule group without a file skips the per-file scope", () => {
    const actions = lintNodeActions(
      node({ kind: "lint-rule-group", linterName: "betterleaks", ruleName: "generic-api-key", work_dir: "/repo" }),
      [],
    );
    expect(actions.map((a) => a.label)).toEqual([
      "Ignore rule generic-api-key everywhere",
      "Disable betterleaks entirely",
    ]);
  });

  it("linter-error nodes have nothing to ignore", () => {
    expect(lintNodeActions(node({ kind: "linter-error", linterName: "pyright" }), [])).toEqual([]);
  });
});

describe("violationIgnoreAction", () => {
  it("targets the violation's rule in its file", () => {
    expect(
      violationIgnoreAction({
        violation: { rule: { method: "errcheck" }, line: 3 },
        linter: "golangci-lint",
        file: "pkg/a.go",
        workDir: "/repo",
      }),
    ).toEqual({
      key: "violation",
      label: "Ignore this violation",
      title: "Add {source, rule, file} to .gavel.yaml",
      variant: "subtle",
      req: { source: "golangci-lint", rule: "errcheck", file: "pkg/a.go", work_dir: "/repo" },
    });
  });

  it("is unavailable without a rule or a file", () => {
    expect(violationIgnoreAction({ violation: { line: 3 }, linter: "x", file: "a.go", workDir: "" })).toBeNull();
    expect(
      violationIgnoreAction({ violation: { rule: { method: "r" } }, linter: "x", file: "", workDir: "" }),
    ).toBeNull();
  });
});
