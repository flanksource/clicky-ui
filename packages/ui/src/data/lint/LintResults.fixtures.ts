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

export const allLintResults: LinterResult[] = [
  golangci,
  eslint,
  betterleaks,
  pyrightFailed,
  valeSkipped,
  markdownlintClean,
];
