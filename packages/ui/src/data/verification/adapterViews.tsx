// Detail-body components for the verification node adapters. Split from
// adapters.ts (react/only-export-components: a file mixing component
// declarations with the plain TestNodeAdapter/registry exports loses Fast
// Refresh). Ported from gavel's VerificationStepOutput.tsx (the checklist list
// and the CelDetails block).

import { cn } from "../../lib/utils";
import { Icon, type StaticIconComponent } from "../Icon";
import { UiError, UiPass, UiPause } from "../../icons";
import { JsonView } from "../JsonView";
import { TestOutput, type Test, type FixtureContext } from "../test-runner";

// ── Checklist: the synthesized "Acceptance criteria" node and its items ────

type ChecklistState = "passed" | "failed" | "pending";

function checklistItemState(item: Test): ChecklistState {
  if (item.failed) return "failed";
  if (item.passed) return "passed";
  return "pending";
}

const CHECKLIST_ICONS: Record<ChecklistState, { icon: StaticIconComponent; tone: string }> = {
  passed: { icon: UiPass, tone: "text-emerald-600" },
  failed: { icon: UiError, tone: "text-red-600" },
  pending: { icon: UiPause, tone: "text-muted-foreground" },
};

function ChecklistItemRow({ item }: { item: Test }) {
  const { icon, tone } = CHECKLIST_ICONS[checklistItemState(item)];
  return (
    <li className="flex items-start gap-1.5 text-xs">
      <Icon icon={icon} className={cn("mt-0.5 shrink-0 text-sm", tone)} />
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

function formatCelValue(value: unknown): string {
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

// CEL detail is rendered only for a failing node: the expression and the
// values it saw are what explain the verdict.
export function CelDetails({ node }: { node: Test }) {
  if (node.passed) return null;
  const context = node.context as FixtureContext | undefined;
  const vars = Object.entries(context?.cel_vars ?? {});
  const expression = readCelTrace(node.detail) || context?.cel_expression;
  const hasCelGate = !!expression;
  const expected = comparisonValue(hasCelGate, context?.expected);
  const actual = comparisonValue(hasCelGate, context?.actual);
  const hasComparison = expected !== undefined || actual !== undefined;
  if (!expression && vars.length === 0 && !hasComparison) return null;
  return (
    <div className="space-y-1 rounded border border-border bg-muted/30 px-2 py-1.5">
      {expression && (
        <div>
          <span className="text-[10px] uppercase text-muted-foreground">expression</span>
          <code className="block overflow-x-auto whitespace-pre text-[11px]">{expression}</code>
        </div>
      )}
      {vars.length > 0 && (
        <table className="w-full table-fixed text-[11px]">
          <tbody>
            {vars.map(([name, value]) => (
              <tr key={name} className="align-top">
                <td className="w-1/3 truncate pr-2 font-medium text-muted-foreground">{name}</td>
                <td className="break-words font-mono">{formatCelValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {expected !== undefined && (
        <div className="text-[11px]">
          <span className="text-muted-foreground">expected </span>
          <span className="font-mono">{formatCelValue(expected)}</span>
        </div>
      )}
      {actual !== undefined && (
        <div className="text-[11px]">
          <span className="text-muted-foreground">actual </span>
          <span className="font-mono">{formatCelValue(actual)}</span>
        </div>
      )}
    </div>
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
