// The shared iconography for test and lint results: what happened (outcome),
// how bad a finding is (lint severity), and what produced it (tool).
//
// Every outcome has its own outline glyph, so a result never reads by colour
// alone.
// Tool marks are bundled Simple Icons brand glyphs (offline, no runtime icon
// names), coloured per theme here because one brand hex can't hold up on both
// light and dark surfaces.

import type { StaticIconComponent } from "../Icon";
import {
  UiCircleOutline,
  UiCircleX,
  UiBeaker,
  UiCopy,
  UiDatabase,
  UiInfo,
  UiKey,
  UiListChecks,
  UiLoader,
  UiLogoEslint,
  UiLogoGo,
  UiLogoJest,
  UiLogoMarkdown,
  UiLogoOxc,
  UiLogoPlaywright,
  UiLogoPython,
  UiLogoReact,
  UiLogoRuff,
  UiLogoTypescript,
  UiLogoVitest,
  UiPass,
  UiProhibit,
  UiSealCheck,
  UiSkipForward,
  UiSparkles,
  UiTerminal,
  UiTimer,
  UiWarningTriangle,
} from "../../icons";
import { STATUS_LABELS, type TestOutcome } from "./status";

export type { TestOutcome } from "./status";

export type ResultMark = {
  icon: StaticIconComponent;
  label: string;
  /** Text colour classes for light and dark themes. */
  className: string;
  spin?: boolean;
};

const LABEL = Object.fromEntries(STATUS_LABELS.map((s) => [s.key, s.label]));

const RED = "text-red-600 dark:text-red-400";
const AMBER = "text-amber-600 dark:text-amber-400";

export const TEST_OUTCOMES: Record<TestOutcome, ResultMark> = {
  failed: { icon: UiCircleX, label: LABEL.failed!, className: RED },
  errored: { icon: UiProhibit, label: "Could not run", className: RED },
  timedout: { icon: UiTimer, label: LABEL.timedout!, className: AMBER },
  warned: { icon: UiWarningTriangle, label: LABEL.warned!, className: AMBER },
  passed: {
    icon: UiPass,
    label: LABEL.passed!,
    className: "text-emerald-600 dark:text-emerald-400",
  },
  skipped: { icon: UiSkipForward, label: LABEL.skipped!, className: "text-slate-500" },
  pending: {
    icon: UiCircleOutline,
    label: LABEL.pending!,
    className: "text-slate-400 dark:text-slate-500",
  },
  running: {
    icon: UiLoader,
    label: LABEL.running!,
    className: "text-blue-600 dark:text-blue-400",
    spin: true,
  },
};

export type LintSeverity = "error" | "warning" | "info";

/** An error-severity finding fails the verdict and a warning warns it, so they share those outcomes' marks. */
export const LINT_SEVERITIES: Record<LintSeverity, ResultMark> = {
  error: { ...TEST_OUTCOMES.failed, label: "Error" },
  warning: { ...TEST_OUTCOMES.warned, label: "Warning" },
  info: { icon: UiInfo, label: "Info", className: "text-sky-600 dark:text-sky-400" },
};

export type ToolKind = "test" | "lint" | "fixture" | "runner";

export type ToolMark = {
  icon: StaticIconComponent;
  label: string;
  kind: ToolKind;
  className: string;
};

const GO = "text-[#00add8]";
const MARKDOWN = "text-foreground";
const MUTED = "text-muted-foreground";

/**
 * Keyed by the identifiers gavel reports: testrunner/parsers Framework values
 * and each linter's Name(). A tool without a mark of its own takes its
 * language's (golangci-lint → Go, pyright → Python).
 */
export const TEST_TOOLS: Record<string, ToolMark> = {
  "go test": { icon: UiLogoGo, label: "go test", kind: "test", className: GO },
  ginkgo: { icon: UiLogoGo, label: "Ginkgo", kind: "test", className: GO },
  vitest: { icon: UiLogoVitest, label: "Vitest", kind: "test", className: "text-[#6e9f18]" },
  jest: { icon: UiLogoJest, label: "Jest", kind: "test", className: "text-[#c21325] dark:text-[#e5576a]" },
  playwright: {
    icon: UiLogoPlaywright,
    label: "Playwright",
    kind: "test",
    className: "text-[#2ead33]",
  },
  fixture: { icon: UiLogoMarkdown, label: "Markdown fixture", kind: "test", className: MARKDOWN },
  task: { icon: UiTerminal, label: "Task", kind: "runner", className: MUTED },
  // Fixture step types (gavel fixtures FixtureResult.Type) and the
  // "checklist" node verifyReportTests synthesizes for acceptance criteria.
  exec: { icon: UiTerminal, label: "Command", kind: "fixture", className: MUTED },
  test: { icon: UiBeaker, label: "Test step", kind: "fixture", className: MUTED },
  lint: { icon: UiListChecks, label: "Lint step", kind: "fixture", className: MUTED },
  verify: {
    icon: UiSparkles,
    label: "AI review",
    kind: "fixture",
    className: "text-violet-600 dark:text-violet-400",
  },
  query: { icon: UiDatabase, label: "Query", kind: "fixture", className: MUTED },
  criterion: { icon: UiSealCheck, label: "Acceptance criterion", kind: "fixture", className: MUTED },
  checklist: { icon: UiSealCheck, label: "Acceptance criteria", kind: "fixture", className: MUTED },
  "golangci-lint": { icon: UiLogoGo, label: "golangci-lint", kind: "lint", className: GO },
  eslint: {
    icon: UiLogoEslint,
    label: "ESLint",
    kind: "lint",
    className: "text-[#4b32c3] dark:text-[#8080f2]",
  },
  oxlint: {
    icon: UiLogoOxc,
    label: "oxlint",
    kind: "lint",
    className: "text-[#0891b2] dark:text-[#00f7f1]",
  },
  tsc: {
    icon: UiLogoTypescript,
    label: "TypeScript compiler",
    kind: "lint",
    className: "text-[#3178c6]",
  },
  markdownlint: { icon: UiLogoMarkdown, label: "markdownlint", kind: "lint", className: MARKDOWN },
  vale: { icon: UiLogoMarkdown, label: "Vale (prose)", kind: "lint", className: MARKDOWN },
  pyright: {
    icon: UiLogoPython,
    label: "Pyright",
    kind: "lint",
    className: "text-[#3776ab] dark:text-[#ffd43b]",
  },
  ruff: {
    icon: UiLogoRuff,
    label: "Ruff",
    kind: "lint",
    className: "text-[#261230] dark:text-[#d7ff64]",
  },
  // A secret scanner's finding is about a credential, not a language.
  betterleaks: { icon: UiKey, label: "betterleaks (secrets)", kind: "lint", className: MUTED },
  jscpd: { icon: UiCopy, label: "jscpd (duplicate code)", kind: "lint", className: MUTED },
  reactdoctor: {
    icon: UiLogoReact,
    label: "React Doctor",
    kind: "lint",
    className: "text-[#0e7490] dark:text-[#61dafb]",
  },
};

/** The tool's mark, or null for a tool the catalog doesn't know (render its name alone). */
export function toolMark(tool: string | undefined): ToolMark | null {
  return (tool && TEST_TOOLS[tool]) || null;
}

