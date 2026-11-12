// Domain node adapters for VerificationResults: a checklist adapter for the
// synthesized "Acceptance criteria" node and its items, and a fixture/CEL
// adapter for the failing-step detail. Rendering lives in adapterViews.tsx —
// split out so this file's only exports are the registry (react/only-export-
// components forbids mixing component declarations with plain exports).

import type { ReactNode } from "react";
import { ChecklistDetail, FixtureDetail } from "./adapterViews";
import { StepOutputs } from "./stepKindViews";
import { verifyNodeTest } from "./verifyReportTests";
import { UiTerminal } from "../../icons";
import { hasStepDetail, readStepDetail, stepKindCopy, type WaitDetail } from "./stepKind";
import { readStepSource, stepSourceCopy } from "./stepSource";
import {
  createTestRunnerRegistry,
  outcomeFor,
  type BriefSection,
  type CopySections,
  type FixtureContext,
  type Test,
  type TestNodeAdapter,
  type TestNodeAdapterRegistry,
  type TestOutcome,
  type TestSummary,
} from "../test-runner";

function isChecklistNode(node: Test): boolean {
  return node.framework === "checklist";
}

function checklistMark(item: Test): string {
  if (item.failed) return "[ ]";
  if (item.passed) return "[x]";
  return "[?]";
}

/** `- [x]/[ ]/[?] criterion — reason` for each item, or the leaf itself. */
function checklistCopy(node: Test): CopySections {
  const items = node.children && node.children.length > 0 ? node.children : [node];
  const lines = items.map(
    (item) => `- ${checklistMark(item)} ${item.name}${item.message ? ` — ${item.message}` : ""}`,
  );
  return { brief: [{ title: "Criteria", body: lines.join("\n") }] };
}

const checklistAdapter: TestNodeAdapter = {
  id: "verification-checklist",
  match: isChecklistNode,
  renderDetail: ({ node }) => <ChecklistDetail node={node} />,
  copy: ({ node }) => checklistCopy(node),
};

// A typed step kind (services, todo, …) may report no command or CEL context at
// all, so `detail.step` claims the node as well. A "fixture" leaf is a step whose
// result has not arrived yet (a live or background step): it carries only the
// execution node, which FixtureDetail renders as a header. Fixture parents
// (markdown tables, runner steps) have children and stay with the default body.
function isFixtureNode(node: Test): boolean {
  if (node.context !== undefined || hasStepDetail(node.detail)) return true;
  return node.framework === "fixture" && (node.children?.length ?? 0) === 0;
}

// ── Copy sections for fixture steps (exec / query / table / test / lint) ───

function readCelTrace(detail: unknown): string | undefined {
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const value = (detail as Record<string, unknown>).cel_trace;
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

// Mirrors CelDetails: without a CEL gate, a command step's `actual` is the whole
// command result object, already covered by the Command section and output.
function comparisonValue(hasCelGate: boolean, value: unknown): unknown {
  if (value === undefined) return undefined;
  if (hasCelGate) return value;
  if (value !== null && typeof value === "object" && !Array.isArray(value)) return undefined;
  return value;
}

function formatValue(value: unknown): string {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function commandSection(node: Test, context: FixtureContext | undefined): BriefSection[] {
  const command = context?.command ?? node.command;
  if (!command) return [];
  const cwd = context?.cwd ?? node.work_dir;
  const exit = context?.exit_code;
  const lines = [`$ ${command}`, cwd && `cwd: ${cwd}`, exit !== undefined && `exit: ${exit}`];
  return [{ title: "Command", lang: "sh", body: lines.filter(Boolean).join("\n") }];
}

function assertionSection(node: Test, context: FixtureContext | undefined): BriefSection[] {
  const expression = context?.cel_expression;
  const trace = readCelTrace(node.detail);
  const hasCelGate = !!(expression || trace);
  const vars = context?.cel_vars ?? {};
  const expected = comparisonValue(hasCelGate, context?.expected);
  const actual = comparisonValue(hasCelGate, context?.actual);
  const lines = [
    expression && `expression: ${expression}`,
    trace && `trace:\n${trace}`,
    Object.keys(vars).length > 0 && `vars: ${formatValue(vars)}`,
    expected !== undefined && `expected: ${formatValue(expected)}`,
    actual !== undefined && `actual: ${formatValue(actual)}`,
  ].filter(Boolean);
  return lines.length > 0 ? [{ title: "Assertion", body: lines.join("\n") }] : [];
}

const OUTCOME_GLYPH: Record<TestOutcome, string> = {
  passed: "✓",
  failed: "✗",
  errored: "✗",
  timedout: "⏱",
  warned: "!",
  aborted: "■",
  skipped: "-",
  pending: "○",
  running: "…",
};

function childLine(child: Test): string {
  const outcome = outcomeFor(child);
  const exit = (child.context as FixtureContext | undefined)?.exit_code;
  const reason = child.message ?? (exit ? `exit ${exit}` : undefined);
  return `${outcome ? OUTCOME_GLYPH[outcome] : "·"} ${child.name}${reason ? ` — ${reason}` : ""}`;
}

function summaryLine(summary: TestSummary): string {
  const counts: [number | undefined, string][] = [
    [summary.Passed, "passed"],
    [summary.Failed, "failed"],
    [summary.Warned, "warned"],
    [summary.Timedout, "timed out"],
    [summary.Skipped, "skipped"],
    [summary.Pending, "pending"],
    [summary.Running, "running"],
  ];
  const parts = counts.filter(([n]) => !!n).map(([n, label]) => `${n} ${label}`);
  return [`${summary.Total} total`, ...parts].join(" · ");
}

function resultsSection(node: Test): BriefSection[] {
  const lines = [
    ...(node.summary ? [summaryLine(node.summary)] : []),
    ...(node.children ?? []).map(childLine),
  ];
  return lines.length > 0 ? [{ title: "Results", body: lines.join("\n") }] : [];
}

/** Command, CEL assertion and per-child verdicts for a fixture step or its parent. */
function fixtureCopy(node: Test): CopySections {
  const context = node.context as FixtureContext | undefined;
  const command = context?.command ?? node.command;
  const stepDetail = readStepDetail(node.detail);
  const source = readStepSource(node.detail);
  return {
    brief: [
      ...commandSection(node, context),
      ...assertionSection(node, context),
      ...(source.kind === "source" ? stepSourceCopy(source.source) : []),
      ...(stepDetail.kind === "step" ? stepKindCopy(stepDetail.step) : []),
      ...resultsSection(node),
    ],
    items: command ? [{ label: "Copy command", icon: UiTerminal, value: command }] : [],
  };
}

// gavel's FixtureResult.Type values plus "fixture" (a markdown table of rows)
// and the typed step kinds. Table and runner-step parents carry no `context`,
// so the fixture adapter never claims them; this copy-only adapter gives them
// the same sections. "playwright" is also a test framework, so it counts as a
// step only when the node carries `detail.step`.
const FIXTURE_STEP_FRAMEWORKS = new Set([
  "exec",
  "query",
  "fixture",
  "test",
  "lint",
  "verify",
  "services",
  "todo",
  "todo_prompt",
  "ai",
  "browser",
  "playwright",
  "agent-browser",
]);

function isFixtureStepNode(node: Test): boolean {
  const framework = node.framework ?? "";
  if (framework === "playwright") return hasStepDetail(node.detail);
  return FIXTURE_STEP_FRAMEWORKS.has(framework);
}

const fixtureStepCopyAdapter: TestNodeAdapter = {
  id: "verification-step-copy",
  match: isFixtureStepNode,
  copy: ({ node }) => fixtureCopy(node),
};

/** Default node adapters for VerificationResults: checklist items and
 *  fixture/CEL steps. Registration order matters only when a node could match
 *  both — a checklist node never carries a `context`, so the two never race. */
export type VerificationAdapterOptions = {
  /** Override the wait section while retaining the fixture's other detail sections. */
  renderWait?: (wait: WaitDetail) => ReactNode;
  /**
   * The answerable form of a step waiting on a person (`node.waiting`), shown in
   * its own section at the top of the step's detail. The host resolves which
   * pending prompt belongs to the node and answers it (e.g. with PromptForm).
   */
  renderPendingPrompt?: (node: Test) => ReactNode;
};

// The attempt a step is waiting in: it carries the step's name and task id (the
// host finds the step's prompt by them) and `waiting`, and, when its result has
// nothing marking it a fixture step, the step reference, so the fixture detail
// (and its pending form) still renders it.
function liveAttemptNode(step: Test, attempt: Test, ref: { id: string; kind: string }): Test {
  const live: Test = { ...attempt, name: step.name, ...(step.task_id !== undefined ? { task_id: step.task_id } : {}), waiting: true };
  if (isFixtureNode(live)) return live;
  // readStepDetail has already checked that an attempt result's detail is an object.
  return { ...live, detail: { ...(attempt.detail as Record<string, unknown> | undefined), step: ref } };
}

export function verificationAdapters(options: VerificationAdapterOptions = {}): TestNodeAdapterRegistry {
  const fixtureAdapter: TestNodeAdapter = {
    id: "verification-fixture",
    match: isFixtureNode,
    renderDetail: ({ node }) => <FixtureDetail node={node} {...options} />,
    detailAttempts: ({ node }) => {
      const detail = readStepDetail(node.detail);
      if (detail.kind !== "step") return [];
      const live = detail.step.attempts.length - 1;
      return detail.step.attempts.map((attempt, index) => {
        const attemptNode: Test = attempt.result ? verifyNodeTest(attempt.result) : {
          name: node.name, message: `Attempt ${attempt.attempt}: execution evidence was not stored in this report.`,
          detail: { step: detail.step.step },
        };
        // The step waits in its last attempt; that one keeps the step's identity so the host finds its prompt.
        const waiting = node.waiting === true && index === live;
        return {
          id: attempt.attempt, status: attempt.status,
          ...(attempt.durationMs !== undefined ? { durationMs: attempt.durationMs } : {}),
          node: waiting ? liveAttemptNode(node, attemptNode, detail.step.step) : attemptNode,
        };
      });
    },
    detailTabs: ({ node }) => {
      const detail = readStepDetail(node.detail);
      if (detail.kind !== "step" || detail.step.outputs === undefined) return [];
      return [{ id: "outputs", label: "Outputs", render: () => <StepOutputs outputs={detail.step.outputs} /> }];
    },
    copy: ({ node }) => fixtureCopy(node),
  };
  return createTestRunnerRegistry([checklistAdapter, fixtureAdapter, fixtureStepCopyAdapter]);
}
