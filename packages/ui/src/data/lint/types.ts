// Lint data model — gavel's wire shape (models.Violation / linters.LinterResult)
// plus the synthetic tree nodes the groupings build from it. Field names keep
// the snake_case wire spelling on purpose so a host can pass a snapshot's
// `lint` array straight through.

import type { FilterState } from "../test-runner/filterState";
import type { LintSeverity } from "../test-runner/marks";

export type { LintSeverity };

export type Violation = {
  file?: string | undefined;
  /** Frontend-only: the path relative to the linter's work_dir, set while grouping. */
  raw_file?: string | undefined;
  line?: number;
  column?: number;
  message?: string;
  source?: string;
  rule?: {
    method?: string;
    description?: string;
    pattern?: string;
    package?: string;
  } | null;
  /** Absent means error, as on the wire. */
  severity?: LintSeverity;
  /** The offending source snippet, not a rule id. */
  code?: string;
  fixable?: boolean;
};

export type LinterResult = {
  linter: string;
  work_dir?: string;
  /** Resolved executable, e.g. "eslint". */
  command?: string;
  /** argv without the command name. */
  args?: string[];
  success?: boolean;
  skipped?: boolean;
  timed_out?: boolean;
  /** Nanoseconds. */
  duration?: number;
  /** Go marshals a nil slice as null when the linter failed before reporting. */
  violations: Violation[] | null;
  raw_output?: string;
  /** Why the linter failed to run (or why it was skipped). */
  error?: string;
  file_count?: number;
  rule_count?: number;
};

export type LintGrouping = "linter-rule-file" | "linter-file" | "file-linter-rule" | "summary";

export const DEFAULT_LINT_GROUPING: LintGrouping = "linter-rule-file";

export const LINT_GROUPINGS: readonly LintGrouping[] = [
  "linter-rule-file",
  "linter-file",
  "file-linter-rule",
  "summary",
];

/** Tri-state severity and linter filters, same primitives as the test runner. */
export type LintFilters = {
  severity: FilterState<LintSeverity>;
  linter: FilterState<string>;
};

export function emptyLintFilters(): LintFilters {
  return { severity: new Map(), linter: new Map() };
}

export type LintNodeKind =
  | "linter"
  | "lint-folder"
  | "lint-file"
  | "lint-rule"
  | "lint-rule-group"
  /** A linter that failed to run: the leaf carries its error text. */
  | "linter-error";

export type LintNode = {
  name: string;
  kind: LintNodeKind;
  /** Stable, URL-safe selection key assigned by buildLintTree. */
  route_path: string;
  children?: LintNode[] | undefined;
  file?: string | undefined;
  /** Path relative to the linter's work_dir — what ignore rules match against. */
  target_path?: string | undefined;
  work_dir?: string | undefined;
  linterName?: string | undefined;
  ruleName?: string | undefined;
  linter?: LinterResult | undefined;
  violations?: Violation[] | undefined;
  /** Violations that carry no file, shown on the node itself. */
  noFileViolations?: Violation[] | undefined;
  failed: boolean;
  passed: boolean;
  skipped: boolean;
  message?: string | undefined;
};

/** The body of an ignore request, matching gavel's `.gavel.yaml` ignore entries. */
export type LintIgnoreRequest = {
  source?: string | undefined;
  rule?: string | undefined;
  file?: string | undefined;
  work_dir?: string | undefined;
};

export type LintAction = {
  key: string;
  label: string;
  title: string;
  req: LintIgnoreRequest;
  variant?: "primary" | "subtle";
  /** Folder-scoped ignores cannot be applied without knowing the work dir. */
  disabledWithoutWorkDir?: boolean;
};
