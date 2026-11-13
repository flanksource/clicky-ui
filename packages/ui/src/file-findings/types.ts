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
  /** The file, or the folder's path under its work dir (`""` for a work dir's root). */
  ref: FileRef;
  /** Findings in this file, or beneath this folder. */
  findings: FileFinding[];
};

/** The tree node open in the viewer: a file, or a folder shown as the findings beneath it. */
export type FileTreeSelection = { kind: FileTreeNode["kind"]; ref: FileRef };

export function sameSelection(a: FileTreeSelection | null, b: FileTreeSelection | null): boolean {
  if (!a || !b) return a === b;
  return a.kind === b.kind && sameFileRef(a.ref, b.ref);
}

export function fileRefKey(ref: FileRef): string {
  return `${ref.workDir ?? ""}\u0000${ref.file}`;
}

export function sameFileRef(a: FileRef | null, b: FileRef | null): boolean {
  if (!a || !b) return a === b;
  return a.file === b.file && (a.workDir ?? "") === (b.workDir ?? "");
}
