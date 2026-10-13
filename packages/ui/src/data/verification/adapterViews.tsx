// Detail-body components for the verification node adapters. Split from
// adapters.ts (react/only-export-components: a file mixing component
// declarations with the plain TestNodeAdapter/registry exports loses Fast
// Refresh). Ported from gavel's VerificationStepOutput.tsx (the checklist list
// and the CelDetails block).

import { JsonView } from "../JsonView";
import {
  Expectation,
  OutcomeIcon,
  TestOutput,
  type FixtureContext,
  type Test,
  type TestOutcome,
} from "../test-runner";

// ── Checklist: the synthesized "Acceptance criteria" node and its items ────

function checklistItemOutcome(item: Test): TestOutcome {
  if (item.failed) return "failed";
  if (item.passed) return "passed";
  return "pending";
}

function ChecklistItemRow({ item }: { item: Test }) {
  return (
    <li className="flex items-start gap-1.5 text-xs">
      <OutcomeIcon outcome={checklistItemOutcome(item)} className="mt-0.5 text-sm" />
      <span className="min-w-0">
        {item.name}
        {item.message ? (
          <span className="block text-[11px] text-muted-foreground">{item.message}</span>
        ) : null}
      </span>
    </li>
  );
}

/** Renders every checklist item for the "Acceptance criteria" parent, or the
 *  single item itself when a leaf criterion is selected directly. */
export function ChecklistDetail({ node }: { node: Test }) {
  const items = node.children && node.children.length > 0 ? node.children : [node];
  return (
    <div className="space-y-2 p-density-4">
      <ul className="space-y-1">
        {items.map((item, index) => (
          <ChecklistItemRow key={item.task_id ?? index} item={item} />
        ))}
      </ul>
    </div>
  );
}

// ── Fixture / CEL: the failing-step detail (command + CelDetails) ──────────

function readCelTrace(detail: unknown): string | undefined {
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const value = (detail as Record<string, unknown>).cel_trace;
    if (typeof value === "string" && value.length > 0) return value;
  }
  return undefined;
}

// A command step with no CEL assertion stores the whole command result object
// in `actual` — the command/output is already rendered above, so dumping it
// again as JSON is noise. Anything a CEL expression compared is shown as-is,
// structured values included. `hasCelGate` mirrors gavel's own gate: a plain
// `context.cel_expression`, or a trace recorded in `node.detail` when the
// expression itself wasn't preserved on `context`.
function comparisonValue(hasCelGate: boolean, value: unknown): unknown {
  if (value === undefined) return undefined;
  if (hasCelGate) return value;
  if (value !== null && typeof value === "object" && !Array.isArray(value)) return undefined;
  return value;
}

// CEL detail is rendered only for a failing node: the expression and the
// values it saw are what explain the verdict.
export function CelDetails({ node }: { node: Test }) {
  if (node.passed) return null;
  const context = node.context as FixtureContext | undefined;
  const vars = context?.cel_vars ?? {};
  const expression = readCelTrace(node.detail) || context?.cel_expression;
  const hasCelGate = !!expression;
  const expected = comparisonValue(hasCelGate, context?.expected);
  const actual = comparisonValue(hasCelGate, context?.actual);
  const hasComparison = expected !== undefined || actual !== undefined;
  if (!expression && Object.keys(vars).length === 0 && !hasComparison) return null;
  return (
    <Expectation
      check={expression}
      checkLabel="expression"
      vars={vars}
      expected={expected}
      actual={actual}
    />
  );
}

export function FixtureDetail({ node }: { node: Test }) {
  const context = node.context as FixtureContext | undefined;
  const command = context?.command ?? node.command;
  const cwd = context?.cwd ?? node.work_dir;
  return (
    <div className="space-y-4 p-density-4">
      {node.message && (
        <p className="whitespace-pre-wrap break-words text-sm">{node.message}</p>
      )}
      {command && (
        <div className="min-w-0 space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Command</div>
          <code className="block overflow-x-auto whitespace-pre rounded bg-muted px-2 py-1.5 text-xs">
            {command}
          </code>
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
            {cwd && <span>in {cwd}</span>}
            {typeof context?.exit_code === "number" && (
              <span className={context.exit_code === 0 ? undefined : "text-red-600"}>
                exit {context.exit_code}
              </span>
            )}
          </div>
        </div>
      )}
      <TestOutput node={node} />
      <CelDetails node={node} />
      {node.detail != null && (
        <div className="space-y-1">
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Detail</div>
          <JsonView data={node.detail} />
        </div>
      )}
    </div>
  );
}
