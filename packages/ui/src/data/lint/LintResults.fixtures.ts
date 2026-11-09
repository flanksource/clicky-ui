// Realistic gavel lint output shared by the tests and the stories: two Go
// linters in one repo, a secret scanner whose findings carry no file, a
// linter that failed to run, a skipped one and a clean one.

import type { LinterResult } from "./types";

const WORK_DIR = "/repo/gavel";

export const golangci: LinterResult = {
  linter: "golangci-lint",
  work_dir: WORK_DIR,
  command: "golangci-lint",
  args: ["run", "--out-format", "json", "./..."],
  success: false,
  duration: 4_200_000_000,
  file_count: 212,
  rule_count: 18,
  violations: [
    {
      file: `${WORK_DIR}/pkg/server/handler.go`,
      line: 41,
      column: 9,
      severity: "error",
      rule: { method: "errcheck" },
      message: "Error return value of `w.Write` is not checked",
    },
    {
      file: `${WORK_DIR}/pkg/server/handler.go`,
      line: 88,
      column: 3,
      severity: "error",
      rule: { method: "errcheck" },
      message: "Error return value of `f.Close` is not checked",
    },
    {
      file: `${WORK_DIR}/pkg/server/routes/api.go`,
      line: 12,
      severity: "warning",
      rule: { method: "unused" },
      message: "func `legacyRoute` is unused",
    },
    {
      file: `${WORK_DIR}/pkg/store/db.go`,
      line: 7,
      severity: "info",
      rule: { method: "godot" },
      message: "Comment should end in a period",
    },
  ],
};

export const eslint: LinterResult = {
  linter: "eslint",
  work_dir: `${WORK_DIR}/web`,
  command: "eslint",
  args: ["--format", "json", "src"],
  success: false,
  duration: 2_100_000_000,
  violations: [
    {
      file: `${WORK_DIR}/web/src/App.tsx`,
      line: 20,
      column: 5,
      severity: "warning",
      rule: { method: "react-hooks/exhaustive-deps" },
      message: "React Hook useEffect has a missing dependency: 'load'",
    },
    {
      file: `${WORK_DIR}/web/src/App.tsx`,
      line: 64,
      severity: "error",
      rule: { method: "no-unused-vars" },
      message: "'draft' is assigned a value but never used",
      code: "const draft = readDraft();",
    },
  ],
};

export const betterleaks: LinterResult = {
  linter: "betterleaks",
  work_dir: WORK_DIR,
  success: false,
  duration: 600_000_000,
  violations: [
    {
      line: 1,
      severity: "error",
      rule: { method: "generic-api-key" },
      message: "Potential API key found in git history",
    },
  ],
};

/**
 * A data check: one finding read from a rules file at a git ref, the rest
 * pointing at entities, a page and a screenshot rather than at a file.
 */
export const dataLint: LinterResult = {
  linter: "data-lint",
  work_dir: "/repo/rules",
  success: false,
  duration: 1_400_000_000,
  violations: [
    {
      file: "/repo/rules/checks/looping-spawn.sql",
      line: 120,
      severity: "warning",
      rule: { method: "looping-spawn" },
      message: "Query scans every pending activity",
      locations: [{ ref: "main", file: "/repo/rules/checks/looping-spawn.sql", line: 120, column: 5 }],
    },
    {
      severity: "error",
      rule: { method: "looping-spawn" },
      message: "P-1001 spawned InvoiceStart 3 times",
      locations: [
        { entity: { kind: "Policy", id: "7f3a2c10-5b0a-4c53-9a73-0c9d3f5e8b11", name: "P-1001" } },
        { entity: { kind: "AsTransaction", id: "c8d73550-1111-4c53-9a73-0c9d3f5e8b11", name: "InvoiceStart" } },
        {
          url: { url: "https://oipa.example.com/entity/policy/7f3a2c10", css: "[data-activity='a1']" },
          message: "the pending activity row",
        },
      ],
    },
    {
      severity: "warning",
      rule: { method: "pending-row" },
      message: "Activity row still shows 02 Pending",
      locations: [
        { url: { url: "https://oipa.example.com/activity/a1", testId: "activity-status" } },
        { image: { src: "/samples/markdown/swatch.svg", x: 0, y: 0, width: 64, height: 32 }, message: "as captured" },
      ],
    },
    {
      severity: "info",
      rule: { method: "pending-row" },
      message: "Screenshot only, no page recorded",
      locations: [{ image: { src: "/samples/markdown/swatch.svg", x: 8, y: 8, width: 32, height: 16 } }],
    },
  ],
};

/** The linter binary exited with a config error: no violations, only an error. */
export const pyrightFailed: LinterResult = {
  linter: "pyright",
  work_dir: WORK_DIR,
  command: "pyright",
  success: false,
  duration: 300_000_000,
  violations: null,
  error: "pyright: configuration file pyrightconfig.json is invalid\nunexpected token at line 3",
  raw_output: "Error: Unexpected token } in JSON at position 41",
};

export const valeSkipped: LinterResult = {
  linter: "vale",
  work_dir: WORK_DIR,
  success: true,
  skipped: true,
  duration: 0,
  violations: [],
  error: "no .vale.ini found",
};

export const markdownlintClean: LinterResult = {
  linter: "markdownlint",
  work_dir: WORK_DIR,
  success: true,
  duration: 90_000_000,
  violations: [],
};

/** A prompt run queued behind the concurrency limit: nothing launched yet. */
export const promptPending: LinterResult = {
  linter: "review:pkg/server",
  work_dir: WORK_DIR,
  status: "pending",
  violations: [],
};

/** A prompt run in flight: the agent has already reported one finding. */
export const promptRunning: LinterResult = {
  linter: "review:models/violation.go",
  work_dir: WORK_DIR,
  status: "running",
  run_id: "run-7f3a",
  violations: [
    {
      file: `${WORK_DIR}/models/violation.go`,
      line: 14,
      severity: "warning",
      rule: { method: "naming" },
      message: "Field `EndCol` should be named `EndColumn` to match the wire format",
    },
  ],
};

/** Prompt runs that finished (no status): the run id stays for the transcript. */
export const promptFinished: LinterResult = {
  linter: "review:cmd/gavel/main.go",
  work_dir: WORK_DIR,
  run_id: "run-2c10",
  success: true,
  duration: 38_000_000_000,
  violations: [],
};

export const inFlightLintResults: LinterResult[] = [promptPending, promptRunning, promptFinished];

const REVIEW = "messaging-review:report.mdx";
const REVIEW_DIR = "/repo/gtm";

/** A prompt run whose agent is still working: its session is known, linters beneath it are in flight. */
export const reviewRunning: LinterResult = {
  linter: REVIEW,
  work_dir: REVIEW_DIR,
  status: "running",
  run_id: "run-91ab",
  session_id: "7c1d2e44-5b0a-4c53-9a73-0c9d3f5e8b11",
  violations: [
    {
      file: `${REVIEW_DIR}/report.mdx`,
      line: 12,
      severity: "warning",
      rule: { method: "tone" },
      message: "Claim lacks a source",
    },
  ],
};

/** A linter the agent started through its `lint` tool and is still running. */
export const reviewEslintRunning: LinterResult = {
  linter: `${REVIEW}/eslint`,
  work_dir: REVIEW_DIR,
  status: "running",
  run_id: "run-91ab",
  violations: [],
};

/** A linter the agent ran that could not start. */
export const reviewUirFailed: LinterResult = {
  linter: `${REVIEW}/uir`,
  work_dir: REVIEW_DIR,
  run_id: "run-91ab",
  success: false,
  duration: 1_200_000,
  violations: null,
  error: "uir executable not found on PATH",
};

/** A linter the agent ran that finished clean. */
export const reviewMarkdownlintPassed: LinterResult = {
  linter: `${REVIEW}/markdownlint`,
  work_dir: REVIEW_DIR,
  run_id: "run-91ab",
  success: true,
  duration: 480_000_000,
  violations: [],
};

/** A linter the agent ran that reported findings. */
export const reviewValeViolations: LinterResult = {
  linter: `${REVIEW}/vale`,
  work_dir: REVIEW_DIR,
  run_id: "run-91ab",
  success: false,
  duration: 2_300_000_000,
  violations: [
    {
      file: `${REVIEW_DIR}/report.mdx`,
      line: 30,
      severity: "warning",
      rule: { method: "Vale.Passive" },
      message: "Avoid the passive voice",
    },
  ],
};

/** A prompt run with nested linters: running, failed, with findings and passed. */
export const promptRunWithNestedLinters: LinterResult[] = [
  reviewMarkdownlintPassed,
  reviewRunning,
  reviewValeViolations,
  reviewUirFailed,
  reviewEslintRunning,
];

export const allLintResults: LinterResult[] = [
  golangci,
  eslint,
  betterleaks,
  pyrightFailed,
  valeSkipped,
  markdownlintClean,
];
