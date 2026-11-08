// Lint data model — gavel's wire shape (models.Violation / linters.LinterResult)
// plus the synthetic tree nodes the groupings build from it. Field names keep
// the snake_case wire spelling on purpose so a host can pass a snapshot's
// `lint` array straight through.

import type { FilterState } from "../test-runner/filterState";
import type { LintSeverity } from "../test-runner/marks";
import { formatRelativeTime } from "../cells/timestamp-format";

export type { LintSeverity };

export type Violation = {
  file?: string | undefined;
  /** Frontend-only: the path relative to the linter's work_dir, set while grouping. */
  raw_file?: string | undefined;
  line?: number;
  column?: number;
  /** Last line of the flagged range, when the linter reports one. */
  end_line?: number;
  /** Column just past the flagged range on `end_line`, when reported. */
  end_column?: number;
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
  /**
   * Every place one fix resolves (gavel models.ViolationLocation), `file` and
   * `line` naming the first; absent for a violation found at one place.
   */
  locations?: ViolationLocation[];
};

/**
 * One place a violation applies (gavel models.ViolationLocation): a file
 * (optionally at a git ref), an entity, a URL (optionally narrowed by one
 * selector) or a region of an image. A location may carry several of them.
 */
export type ViolationLocation = {
  file?: string;
  line?: number;
  column?: number;
  end_line?: number;
  /** Git ref (branch, tag or SHA) `file` is read at. */
  ref?: string;
  entity?: ViolationEntity;
  url?: ViolationUrlTarget;
  image?: ViolationImageRegion;
  /** What is at this place, e.g. the statement a plan finding came from. */
  message?: string;
};

/** A domain entity, e.g. `{kind: "Policy", id: "<guid>"}`; the host decides where it links. */
export type ViolationEntity = {
  kind: string;
  id: string;
  name?: string;
};

/** A page, narrowed by at most one selector strategy (`role` may pair with `name`). */
export type ViolationUrlTarget = {
  url: string;
  css?: string;
  xpath?: string;
  testId?: string;
  role?: string;
  /** The accessible name a `role` selector matches. */
  name?: string;
  text?: string;
};

/** A rectangle, in the image's own pixels, on a screenshot or artefact at `src`. */
export type ViolationImageRegion = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Where an entity location links in the host, or undefined for a plain chip. */
export type EntityHref = (entity: ViolationEntity) => string | undefined;

/** What a file-less violation's group is keyed on: its first location's entity kind or URL host, else "Other". */
export type LintTargetKind = "entity" | "url" | "other";

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
  /**
   * Set while the linter is in flight: `pending` (queued, not launched) or
   * `running`. Absent once it has finished, so a finished result never carries it.
   */
  status?: LinterStatus;
  /** Where the result came from when its linter answered from its own cache (gavel linters.ResultProvenance). */
  cache?: LintResultProvenance;
  /** The prompt run that produced (or is producing) this result, for hosts that can follow it. */
  run_id?: string;
  /** The agent session behind that run, kept so a replayed snapshot still names it. */
  session_id?: string;
};

export type LinterStatus = "pending" | "running";

export type LintResultProvenance = {
  /** What `fingerprint` is computed from: "build" (the linter's input digest) or "uir" (a UIR symbol closure). */
  source: string;
  fingerprint?: string;
  /** When the oldest reused entry was linted. */
  stored_at: string;
  /** True only when the whole result came from the cache. */
  hit: boolean;
};

/** A full cache hit's age, e.g. "3h ago"; undefined for a fresh or partly cached result. */
export function cachedAge(result: LinterResult | undefined, now: Date = new Date()): string | undefined {
  const cache = result?.cache;
  if (!cache?.hit) return undefined;
  return formatRelativeTime(new Date(cache.stored_at), now);
}

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
  /** File-less violations sharing a target group (entity kind, URL host or "Other"). */
  | "lint-target"
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
  /**
   * For a linter published as `<parent>/<child>` beneath an existing `<parent>`
   * result: the parent's linter name. `name` is then just the child part and
   * `linterName` stays the full result name.
   */
  nestedUnder?: string | undefined;
  ruleName?: string | undefined;
  linter?: LinterResult | undefined;
  violations?: Violation[] | undefined;
  /** For a `lint-target` node: what its name is (an entity kind, a URL host, or "Other"). */
  targetKind?: LintTargetKind | undefined;
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
  /** Narrows a `file` ignore to the violation on this 1-based line. */
  line?: number | undefined;
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
