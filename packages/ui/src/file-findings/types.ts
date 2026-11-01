// One finding against one line of one file, whichever tool raised it. Lint
// violations and failed tests both project onto this shape so a single view
// can overlay them on the file's source.

import type { LintSeverity } from "../data/lint/types";

export type { LintSeverity };

export type FindingKind = "lint" | "test";

export type FileFinding = {
  /** Path relative to `workDir` when it lives under it, otherwise as the tool reported it. */
  file: string;
  /** Root `file` is relative to; absent when the tool reported none. */
  workDir?: string | undefined;
  /** 1-based first line of the finding. */
  line: number;
  /** 1-based first column. */
  column?: number | undefined;
  /** 1-based last line of the finding's range. */
  endLine?: number | undefined;
  /** 1-based column just past the range on `endLine`. */
  endColumn?: number | undefined;
  severity: LintSeverity;
  message: string;
  /** The linter or test framework that raised it. */
  source: string;
  /** Rule id for lint findings; the test name for test findings. */
  rule?: string | undefined;
  kind: FindingKind;
};

/** Identifies a file within a findings set: the same relative path can exist under several work dirs. */
export type FileRef = {
  workDir?: string | undefined;
  file: string;
};

export type FileTreeNode = {
  /** Stable, unique key (folders collapsed into a child keep the child's key). */
  key: string;
  name: string;
  kind: "folder" | "file";
  children?: FileTreeNode[] | undefined;
  /** Set on `file` nodes. */
  ref?: FileRef | undefined;
  /** Findings in this file, or beneath this folder. */
  findings: FileFinding[];
};

export function fileRefKey(ref: FileRef): string {
  return `${ref.workDir ?? ""}\u0000${ref.file}`;
}

export function sameFileRef(a: FileRef | null, b: FileRef | null): boolean {
  if (!a || !b) return a === b;
  return a.file === b.file && (a.workDir ?? "") === (b.workDir ?? "");
}
