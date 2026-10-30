// Projections of lint results and test results onto FileFinding, and the file
// tree the findings view lists them in.

import { collapseFolderChains } from "../data/lint/grouping";
import { collapsedPathSegments, normalizeLintPath, relPath, workDirLabel } from "../data/lint/paths";
import { severityOf } from "../data/lint/stats";
import type { LinterResult } from "../data/lint/types";
import type { Test } from "../data/test-runner/types";
import { fileRefKey, type FileFinding, type FileTreeNode } from "./types";

/**
 * One finding per violation that names a file. A violation without a file
 * cannot be placed in a source view and is left out; one without a line is
 * anchored to the first line of its file (a file-level finding). A violation
 * found at several places (`locations`) is a finding at each of them, its
 * message naming what is there.
 */
export function lintFindings(results: readonly LinterResult[]): FileFinding[] {
  return results.flatMap((result) =>
    (result.violations ?? []).flatMap((violation): FileFinding[] => {
      const finding = {
        workDir: result.work_dir,
        severity: severityOf(violation),
        source: violation.source ?? result.linter,
        rule: violation.rule?.method,
        kind: "lint" as const,
      };
      const message = violation.message ?? "";
      if ((violation.locations?.length ?? 0) > 1) {
        return violation.locations!.map((location) => ({
          ...finding,
          file: relPath(location.file, result.work_dir)!,
          line: Math.max(location.line ?? 1, 1),
          column: location.column,
          message: location.message ? `${message} (${location.message})` : message,
        }));
      }
      const file = violation.raw_file ?? relPath(violation.file, result.work_dir);
      if (!file) return [];
      return [
        {
          ...finding,
          file,
          line: Math.max(violation.line ?? 1, 1),
          column: violation.column,
          endLine: violation.end_line,
          endColumn: violation.end_column,
          message,
        },
      ];
    }),
  );
}

function testMessage(test: Test): string {
  return test.failure_detail?.summary || test.message || `${test.name} failed`;
}

function failedTestFindings(test: Test): FileFinding[] {
  const fromChildren = (test.children ?? []).flatMap(failedTestFindings);
  if (fromChildren.length > 0) return fromChildren;
  if (!test.failed || !test.file || !test.line) return [];
  return [
    {
      file: relPath(test.file, test.work_dir)!,
      workDir: test.work_dir,
      line: test.line,
      endLine: test.end_line,
      severity: "error",
      message: testMessage(test),
      source: test.framework ?? "test",
      rule: test.name,
      kind: "test",
    },
  ];
}

/**
 * One error finding per failed test that records where it lives. A failed
 * suite is only reported when none of its descendants is, so a failure is
 * shown on the test that raised it rather than on every suite above it.
 */
export function testFindings(tests: readonly Test[]): FileFinding[] {
  return tests.flatMap(failedTestFindings);
}

type PathTrie = {
  name: string;
  path: string;
  folders: Map<string, PathTrie>;
  files: Map<string, FileFinding[]>;
};

function newTrie(name: string, path: string): PathTrie {
  return { name, path, folders: new Map(), files: new Map() };
}

function addToTrie(root: PathTrie, finding: FileFinding): void {
  const segments = collapsedPathSegments(finding.file);
  if (segments.length === 0) throw new Error(`findings: empty file path (${JSON.stringify(finding.file)})`);
  let current = root;
  for (const segment of segments.slice(0, -1)) {
    let child = current.folders.get(segment);
    if (!child) {
      child = newTrie(segment, current.path ? `${current.path}/${segment}` : segment);
      current.folders.set(segment, child);
    }
    current = child;
  }
  const basename = segments[segments.length - 1]!;
  current.files.set(basename, [...(current.files.get(basename) ?? []), finding]);
}

const byName = ([a]: [string, unknown], [b]: [string, unknown]) => a.localeCompare(b);

function trieNodes(trie: PathTrie, workDir: string | undefined): FileTreeNode[] {
  const folders = Array.from(trie.folders.entries())
    .sort(byName)
    .map(([name, folder]): FileTreeNode => {
      const children = trieNodes(folder, workDir);
      return {
        key: `folder\u0000${workDir ?? ""}\u0000${folder.path}`,
        name,
        kind: "folder",
        children,
        findings: children.flatMap((c) => c.findings),
      };
    });
  const files = Array.from(trie.files.entries())
    .sort(byName)
    .map(([name, findings]): FileTreeNode => {
      const ref = { workDir, file: findings[0]!.file };
      return {
        key: fileRefKey(ref),
        name,
        kind: "file",
        ref,
        findings: findings.slice().sort((a, b) => a.line - b.line || (a.column ?? 0) - (b.column ?? 0)),
      };
    });
  return [...folders, ...files];
}

function workDirRootNames(workDirs: readonly (string | undefined)[]): Map<string | undefined, string> {
  const labels = new Map(workDirs.map((dir) => [dir, dir ? workDirLabel(dir) : "(no work dir)"]));
  const counts = new Map<string, number>();
  for (const label of labels.values()) counts.set(label, (counts.get(label) ?? 0) + 1);
  // Two roots sharing a two-segment label are told apart by their full path.
  return new Map(
    Array.from(labels, ([dir, label]) => [dir, counts.get(label)! > 1 && dir ? normalizeLintPath(dir) : label]),
  );
}

/**
 * The files that have findings as a path tree: folders before files, each level
 * sorted by name, single-child folders folded into one row (`pkg > sub > a.go`).
 * When the findings span several work dirs, each gets its own root folder.
 */
export function groupFindingsByFile(findings: readonly FileFinding[]): FileTreeNode[] {
  const byWorkDir = new Map<string | undefined, FileFinding[]>();
  for (const finding of findings) {
    byWorkDir.set(finding.workDir, [...(byWorkDir.get(finding.workDir) ?? []), finding]);
  }
  const multiRoot = byWorkDir.size > 1;
  const rootNames = workDirRootNames(Array.from(byWorkDir.keys()));

  const roots = Array.from(byWorkDir.entries())
    .map(([workDir, group]): FileTreeNode[] => {
      const trie = newTrie("", "");
      for (const finding of group) addToTrie(trie, finding);
      const nodes = trieNodes(trie, workDir);
      if (!multiRoot) return nodes;
      return [
        {
          key: `root\u0000${workDir ?? ""}`,
          name: rootNames.get(workDir)!,
          kind: "folder",
          children: nodes,
          findings: group,
        },
      ];
    })
    .flat()
    .sort((a, b) => (multiRoot ? a.name.localeCompare(b.name) : 0));

  return collapseFolderChains(roots, "folder");
}
