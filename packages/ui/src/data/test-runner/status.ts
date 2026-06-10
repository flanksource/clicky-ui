// Pure status/roll-up helpers for the test runner — ported from Gavel's
// utils.ts (Tests-only subset). No JSX here. The two status mappers
// (statusIconFor / statusToneFor) replace Gavel's raw-Tailwind statusIcon /
// statusColor with clicky's icon set and semantic Badge tones.

import type { StaticIconComponent } from "../Icon";
import type { BadgeTone } from "../Badge";
import {
  UiClass,
  UiError,
  UiHourglass,
  UiLoader,
  UiPass,
  UiPause,
  UiWarningTriangle,
} from "../../icons";
import type { Test, TestSummary } from "./types";
import { matchesFilterState, type FilterState } from "./filterState";

// --- roll-up counts ------------------------------------------------------

/**
 * Tallied verdict breakdown a `Test` subtree rolls up to. `warned` is amber and
 * orthogonal to a real failure — a warned-only leaf counts in total + warned,
 * never in failed.
 */
export type StatusCounts = {
  total: number;
  passed: number;
  failed: number;
  warned: number;
  skipped: number;
  pending: number;
  running: number;
  timedout: number;
};

const emptyCounts = (): StatusCounts => ({
  total: 0,
  passed: 0,
  failed: 0,
  warned: 0,
  skipped: 0,
  pending: 0,
  running: 0,
  timedout: 0,
});

const addCounts = (r: StatusCounts, s: StatusCounts) => {
  r.total += s.total;
  r.passed += s.passed;
  r.failed += s.failed;
  r.warned += s.warned;
  r.skipped += s.skipped;
  r.pending += s.pending;
  r.running += s.running;
  r.timedout += s.timedout;
};

const countsFromSummary = (summary: TestSummary): StatusCounts => ({
  total: summary.Total,
  passed: summary.Passed,
  failed: summary.Failed,
  warned: summary.Warned || 0,
  skipped: summary.Skipped,
  pending: summary.Pending || 0,
  running: summary.Running || 0,
  timedout: 0,
});

const countsFromLeaf = (t: Test): StatusCounts => {
  const isTimedOut = !!t.timed_out;
  const counted =
    isTimedOut || t.passed || t.failed || t.warned || t.skipped || t.pending || t.running;
  return {
    total: counted ? 1 : 0,
    passed: !isTimedOut && t.passed ? 1 : 0,
    failed: !isTimedOut && t.failed ? 1 : 0,
    warned: !isTimedOut && t.warned ? 1 : 0,
    skipped: !isTimedOut && t.skipped ? 1 : 0,
    pending: !isTimedOut && t.pending ? 1 : 0,
    running: !isTimedOut && t.running ? 1 : 0,
    timedout: isTimedOut ? 1 : 0,
  };
};

export function sum(t: Test): StatusCounts {
  if (t.summary) return countsFromSummary(t.summary);
  if (!t.children || t.children.length === 0) return countsFromLeaf(t);
  const r = emptyCounts();
  for (const c of t.children) addCounts(r, sum(c));
  return r;
}

/** Like {@link sum} but excludes `task`-framework pseudo-nodes from the tally. */
export function sumNonTaskTests(t: Test): StatusCounts {
  if (t.framework === "task") {
    const r = emptyCounts();
    for (const c of t.children || []) addCounts(r, sumNonTaskTests(c));
    return r;
  }
  if (t.summary) return countsFromSummary(t.summary);
  if (!t.children || t.children.length === 0) return countsFromLeaf(t);
  const r = emptyCounts();
  for (const c of t.children) addCounts(r, sumNonTaskTests(c));
  return r;
}

export function hasFailed(t: Test): boolean {
  if (t.failed) return true;
  return (t.children || []).some(hasFailed);
}

export function hasPending(t: Test): boolean {
  if (t.pending) return true;
  return (t.children || []).some(hasPending);
}

function hasTimedOutDescendant(t: Test): boolean {
  if (t.timed_out) return true;
  return (t.children || []).some(hasTimedOutDescendant);
}

export function totalDuration(t: Test): number {
  if (t.duration && t.duration > 0) return t.duration;
  let d = 0;
  for (const c of t.children || []) d += totalDuration(c);
  return d;
}

// --- status classification ----------------------------------------------

export type TestStatus =
  | "passed"
  | "failed"
  | "warned"
  | "skipped"
  | "pending"
  | "running"
  | "timedout";

/** Resolve a leaf node's single status, or null for a status-less container. */
export function testStatus(t: Test): TestStatus | null {
  if (t.timed_out) return "timedout";
  if (t.running) return "running";
  if (t.pending) return "pending";
  if (t.failed) return "failed";
  if (t.warned) return "warned";
  if (t.skipped) return "skipped";
  if (t.passed) return "passed";
  return null;
}

/** Pick the clicky icon for a node, rolling up container state. */
export function statusIconFor(t: Test): StaticIconComponent {
  if (t.timed_out) return UiHourglass;
  if (t.running) return UiLoader;
  if (t.pending) return UiPause;
  if (t.failed) return UiError;
  if (t.warned) return UiWarningTriangle;
  if (t.skipped) return UiPause;
  if (t.passed) return UiPass;
  if (t.children && t.children.length > 0) {
    const s = sum(t);
    if (hasTimedOutDescendant(t)) return UiHourglass;
    if (s.failed > 0) return UiError;
    if (s.warned > 0) return UiWarningTriangle;
    if (s.running > 0) return UiLoader;
    if (s.pending > 0) return UiPause;
    return UiPass;
  }
  return UiClass;
}

/** Map a node's status to a semantic Badge tone, rolling up container state. */
export function statusToneFor(t: Test): BadgeTone {
  if (t.timed_out) return "warning";
  if (t.running) return "info";
  if (t.pending) return "neutral";
  if (t.failed) return "danger";
  if (t.warned) return "warning";
  if (t.skipped) return "warning";
  if (t.passed) return "success";
  if (t.children && t.children.length > 0) {
    const s = sum(t);
    if (hasTimedOutDescendant(t)) return "warning";
    if (s.failed > 0) return "danger";
    if (s.warned > 0) return "warning";
    if (s.running > 0) return "info";
    if (s.pending > 0) return "neutral";
    return "success";
  }
  return "neutral";
}

// --- formatting ----------------------------------------------------------

/**
 * Format a nanosecond duration as "123ms" or "1.2s". Empty for non-positive.
 * Named distinctly from clicky's ms/s `formatDuration` (lib/format) since the
 * test-runner wire format is nanoseconds.
 */
export function formatTestDuration(ns: number): string {
  if (ns <= 0) return "";
  const ms = ns / 1e6;
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function compactWithUnit(value: number, unit: string): string {
  const rounded =
    Math.abs(value) >= 10 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, "");
  return `${rounded}${unit}`;
}

/** Compact integer counts: <1000 raw, then "k", then "M". */
export function formatCount(n: number): string {
  const abs = Math.abs(n);
  if (abs < 1000) return String(n);
  if (abs < 1_000_000) return compactWithUnit(n / 1000, "k");
  return compactWithUnit(n / 1_000_000, "M");
}

/** Strip Go's `Test` prefix and split CamelCase / subtest names into words. */
export function humanizeName(name: string, framework?: string): string {
  if (!name) return "";
  if (framework !== "go test") return name;
  if (name.endsWith("/")) return name;
  return name
    .split("/")
    .map((p, i) => {
      if (i === 0) {
        return p.replace(/^Test/, "").replace(/([a-z0-9])([A-Z])/g, "$1 $2");
      }
      return p.replace(/_/g, " ");
    })
    .join(" / ");
}

// --- tree transforms -----------------------------------------------------

/** Unique non-task frameworks present in the forest, sorted. */
export function collectFrameworks(tests: Test[]): string[] {
  const set = new Set<string>();
  const walk = (t: Test) => {
    if (t.framework && t.framework !== "task") set.add(t.framework);
    (t.children || []).forEach(walk);
  };
  tests.forEach(walk);
  return Array.from(set).sort();
}

function joinChainNames(parent: string | undefined, child: string | undefined): string {
  const p = (parent ?? "").trim();
  const c = (child ?? "").trim();
  if (!p) return c;
  if (!c) return p;
  return `${p} > ${c}`;
}

function isCollapsibleContainer(t: Test): boolean {
  return !(t.passed || t.failed || t.skipped || t.pending);
}

// Re-deriving a collapsed/filtered node invalidates any cached summary; drop it
// so callers re-roll-up from the surviving children.
function withoutSummary(t: Test): Omit<Test, "summary"> & { summary?: never } {
  const { summary: _summary, ...rest } = t;
  return rest;
}

function collapseNode(t: Test): Test {
  const children = t.children ?? [];
  if (children.length === 0) return t;

  const collapsedChildren = children.map(collapseNode);

  const onlyChild = collapsedChildren.length === 1 ? collapsedChildren[0] : undefined;
  if (onlyChild && isCollapsibleContainer(t)) {
    return { ...withoutSummary(onlyChild), name: joinChainNames(t.name, onlyChild.name) };
  }

  return { ...t, children: collapsedChildren };
}

/**
 * Compress any status-less container with exactly one child into that child,
 * joining names with " > ". Recursive, so chains collapse into a single row.
 */
export function collapseSingleChildChains(tests: Test[]): Test[] {
  return tests.map(collapseNode);
}

function matchesLeaf(
  t: Test,
  statusFilter: FilterState<string>,
  frameworkFilter: FilterState<string>,
): boolean {
  const s = testStatus(t);
  if (s === null) return false;
  return matchesFilterState(s, statusFilter) && matchesFilterState(t.framework, frameworkFilter);
}

function filterNode(
  t: Test,
  statusFilter: FilterState<string>,
  frameworkFilter: FilterState<string>,
): Test | null {
  if (t.children && t.children.length > 0) {
    const filtered = t.children
      .map((c) => filterNode(c, statusFilter, frameworkFilter))
      .filter(Boolean) as Test[];
    if (filtered.length === 0) return null;
    return { ...withoutSummary(t), children: filtered };
  }
  return matchesLeaf(t, statusFilter, frameworkFilter) ? t : null;
}

/** Prune leaves not matching the status/framework filters; drop empty branches. */
export function filterTests(
  tests: Test[],
  statusFilter: FilterState<string>,
  frameworkFilter: FilterState<string>,
): Test[] {
  if (statusFilter.size === 0 && frameworkFilter.size === 0) return tests;
  return tests
    .map((t) => filterNode(t, statusFilter, frameworkFilter))
    .filter(Boolean) as Test[];
}
