// The "Ignore ..." buttons a lint node offers. These are pure descriptions: the
// component never writes configuration itself, it hands the chosen action to
// the host's `onIgnore`, which maps `req` onto an entry in `.gavel.yaml`.

import { relPath } from "./paths";
import type { LintAction, LintNode, LinterResult, Violation } from "./types";

const DISABLE_TITLE = "Add {source} to .gavel.yaml";

export function folderPattern(path: string | undefined): string {
  if (!path) return "**";
  const trimmed = path.replace(/\/+$/, "");
  return trimmed ? `${trimmed}/**` : "**";
}

type FolderLintStat = { linter: string; count: number; workDir: string | undefined };

/** Per-linter violation counts beneath a folder, most findings first. */
export function collectFolderLintStats(
  folder: LintNode,
  results: readonly LinterResult[],
): FolderLintStat[] {
  const targetPath = folder.target_path ?? "";
  const counts = new Map<string, FolderLintStat>();
  for (const result of results) {
    if (folder.work_dir && result.work_dir && result.work_dir !== folder.work_dir) continue;
    for (const violation of result.violations ?? []) {
      const rawFile = relPath(violation.file, result.work_dir);
      if (!rawFile) continue;
      if (targetPath !== "" && rawFile !== targetPath && !rawFile.startsWith(`${targetPath}/`)) continue;
      const current = counts.get(result.linter);
      if (current) current.count += 1;
      else counts.set(result.linter, { linter: result.linter, count: 1, workDir: result.work_dir });
    }
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count || a.linter.localeCompare(b.linter));
}

function disableLinter(linter: string, workDir: string): LintAction {
  return {
    key: "linter-disable",
    label: `Disable ${linter} entirely`,
    title: DISABLE_TITLE,
    req: { source: linter, work_dir: workDir },
    variant: "subtle",
  };
}

/**
 * Folder buttons, by what the folder node is scoped to:
 *   linter + rule  -> folder / everywhere / disable the linter
 *   linter only    -> whole folder / this linter in the folder / disable the linter
 *   neither        -> whole folder, then a pair per linter that reported beneath it
 */
export function lintFolderActions(node: LintNode, results: readonly LinterResult[]): LintAction[] {
  const pattern = folderPattern(node.target_path);
  const linter = node.linterName ?? "";
  const rule = node.ruleName ?? "";
  const stats = linter ? [] : collectFolderLintStats(node, results);
  const statWorkDirs = new Set(stats.flatMap((s) => (s.workDir ? [s.workDir] : [])));
  const workDir = node.work_dir || (statWorkDirs.size === 1 ? Array.from(statWorkDirs)[0]! : "");

  if (linter && rule) {
    return [
      {
        key: "rule-folder",
        label: `Ignore ${rule} in this folder`,
        title: "Add {source, rule, file} to .gavel.yaml",
        req: { source: linter, rule, file: pattern, work_dir: workDir },
        disabledWithoutWorkDir: true,
      },
      {
        key: "rule-repo",
        label: `Ignore rule ${rule} everywhere`,
        title: "Add {source, rule} to .gavel.yaml",
        req: { source: linter, rule, work_dir: workDir },
      },
      disableLinter(linter, workDir),
    ];
  }

  const everything: LintAction = {
    key: "folder-everything",
    label: "Ignore everything in this folder",
    title: "Add {file} to .gavel.yaml",
    req: { file: pattern, work_dir: workDir },
    disabledWithoutWorkDir: true,
  };

  if (linter) {
    return [
      everything,
      {
        key: "linter-folder",
        label: `Ignore ${linter} in this folder`,
        title: "Add {source, file} to .gavel.yaml",
        req: { source: linter, file: pattern, work_dir: workDir },
        disabledWithoutWorkDir: true,
      },
      disableLinter(linter, workDir),
    ];
  }

  return [
    everything,
    ...stats.flatMap((stat): LintAction[] => [
      {
        key: `linter-folder:${stat.linter}`,
        label: `Ignore ${stat.linter} in this folder`,
        title: "Add {source, file} to .gavel.yaml",
        req: { source: stat.linter, file: pattern, work_dir: workDir },
        variant: "subtle",
        disabledWithoutWorkDir: true,
      },
      { ...disableLinter(stat.linter, workDir), key: `linter-disable:${stat.linter}` },
    ]),
  ];
}

function uniqueChildLinters(node: LintNode): string[] {
  const names = (node.children ?? []).flatMap((c) => (c.kind === "linter" && c.linterName ? [c.linterName] : []));
  return Array.from(new Set(names));
}

/** File buttons: a single-linter file ignores that linter; a multi-linter file offers each. */
export function lintFileActions(node: LintNode): LintAction[] {
  const linter = node.linterName ?? "";
  const targetPath = node.target_path || node.file || "";
  const workDir = node.work_dir ?? "";

  if (linter) {
    return [
      {
        key: "file-everything-linter",
        label: `Ignore all ${linter} in this file`,
        title: "Add {source, file} to .gavel.yaml",
        req: { source: linter, file: targetPath, work_dir: workDir },
      },
      disableLinter(linter, workDir),
    ];
  }

  return [
    {
      key: "file-everything",
      label: "Ignore everything in this file",
      title: "Add {file} to .gavel.yaml",
      req: { file: targetPath, work_dir: workDir },
    },
    ...uniqueChildLinters(node).flatMap((child): LintAction[] => [
      {
        key: `file-linter:${child}`,
        label: `Ignore all ${child} in this file`,
        title: "Add {source, file} to .gavel.yaml",
        req: { source: child, file: targetPath, work_dir: workDir },
        variant: "subtle",
      },
      { ...disableLinter(child, workDir), key: `linter-disable:${child}` },
    ]),
  ];
}

function lintRuleActions(node: LintNode): LintAction[] {
  const linter = node.linterName ?? "";
  const rule = node.ruleName ?? "";
  const workDir = node.work_dir ?? "";
  const targetPath = node.target_path || node.file || "";
  return [
    ...(node.file
      ? [
          {
            key: "rule-file",
            label: `Ignore ${rule} in this file`,
            title: "Add {source, rule, file} to .gavel.yaml",
            req: { source: linter, rule, file: targetPath, work_dir: workDir },
          },
        ]
      : []),
    {
      key: "rule-repo",
      label: `Ignore rule ${rule} everywhere`,
      title: "Add {source, rule} to .gavel.yaml",
      req: { source: linter, rule, work_dir: workDir },
    },
    disableLinter(linter, workDir),
  ];
}

/** Every ignore button for the selected node. A linter-error leaf has nothing to ignore. */
export function lintNodeActions(node: LintNode, results: readonly LinterResult[]): LintAction[] {
  switch (node.kind) {
    case "linter":
      return node.linterName
        ? [disableLinter(node.linterName, node.work_dir || node.linter?.work_dir || "")]
        : [];
    case "lint-folder":
      return lintFolderActions(node, results);
    case "lint-file":
      return lintFileActions(node);
    case "lint-rule":
    case "lint-rule-group":
      return lintRuleActions(node);
    case "linter-error":
      return [];
  }
}

/** Ignore one finding's rule in its file; unavailable for a finding without a rule or file. */
export function violationIgnoreAction({
  violation,
  linter,
  file,
  workDir,
}: {
  violation: Violation;
  linter: string;
  file: string;
  workDir: string;
}): LintAction | null {
  const rule = violation.rule?.method;
  if (!rule || !file) return null;
  return {
    key: "violation",
    label: "Ignore this violation",
    title: "Add {source, rule, file} to .gavel.yaml",
    variant: "subtle",
    req: { source: linter, rule, file, work_dir: workDir },
  };
}
