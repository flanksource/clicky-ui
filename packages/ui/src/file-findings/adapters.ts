// Projections of lint results and test results onto FileFinding, and the file
// tree the findings view lists them in.

import { collapseFolderChains } from "../data/lint/grouping";
import { collapsedPathSegments, normalizeLintPath, relPath, workDirLabel } from "../data/lint/paths";
import { severityOf } from "../data/lint/stats";
import type { LinterResult } from "../data/lint/types";
import type { Test } from "../data/test-runner/types";
import { fileRefKey, type FileFinding, type FileRef, type FileTreeNode } from "./types";

/**
 * One finding per violation that names a file. A violation without a file
 * cannot be placed in a source view and is left out; one without a line is
 * anchored to the first line of its file (a file-level finding). A violation
 * found at several file locations is a finding at each of them, its message
 * naming what is there; entity, URL and image locations have no place here.
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
      const fileLocations = (violation.locations ?? []).filter((location) => location.file);
      if (fileLocations.length > 1) {
        return fileLocations.map((location) => ({
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
  files: Map<string, { file: string; findings: FileFinding[] }>;
};

function newTrie(name: string, path: string): PathTrie {
  return { name, path, folders: new Map(), files: new Map() };
}

function addToTrie(root: PathTrie, file: string, finding?: FileFinding): void {
  const segments = collapsedPathSegments(file);
  if (segments.length === 0) throw new Error(`findings: empty file path (${JSON.stringify(file)})`);
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
  const entry = current.files.get(basename) ?? { file, findings: [] };
  if (finding) entry.findings.push(finding);
  current.files.set(basename, entry);
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
        ref: { workDir, file: folder.path },
        children,
        findings: children.flatMap((c) => c.findings),
      };
    });
  const files = Array.from(trie.files.entries())
    .sort(byName)
    .map(([name, { file, findings }]): FileTreeNode => {
      const ref = { workDir, file };
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
 * The files that have findings, plus any listed in `files`, as a path tree:
 * folders before files, each level sorted by name, single-child folders folded
 * into one row (`pkg/sub/a.go`). A listed file with no findings is a node with
 * none. When the files span several work dirs, each gets its own root folder.
 */
export function groupFindingsByFile(findings: readonly FileFinding[], files: readonly FileRef[] = []): FileTreeNode[] {
  const byWorkDir = new Map<string | undefined, { findings: FileFinding[]; files: string[] }>();
  const groupOf = (workDir: string | undefined) => {
    const existing = byWorkDir.get(workDir);
    if (existing) return existing;
    const created = { findings: [], files: [] };
    byWorkDir.set(workDir, created);
    return created;
  };
  for (const finding of findings) groupOf(finding.workDir).findings.push(finding);
  for (const ref of files) groupOf(ref.workDir).files.push(ref.file);
  const multiRoot = byWorkDir.size > 1;
  const rootNames = workDirRootNames(Array.from(byWorkDir.keys()));

  const roots = Array.from(byWorkDir.entries())
    .map(([workDir, { findings: group, files: groupFiles }]): FileTreeNode[] => {
      const trie = newTrie("", "");
      for (const file of groupFiles) addToTrie(trie, file);
      for (const finding of group) addToTrie(trie, finding.file, finding);
      const nodes = trieNodes(trie, workDir);
      if (!multiRoot) return nodes;
      return [
        {
          key: `root\u0000${workDir ?? ""}`,
          name: rootNames.get(workDir)!,
          kind: "folder",
          ref: { workDir, file: "" },
          children: nodes,
          findings: group,
        },
      ];
    })
    .flat()
    .sort((a, b) => (multiRoot ? a.name.localeCompare(b.name) : 0));

  return collapseFolderChains(roots, "folder");
}
