import { cn } from "../lib/utils";
import { evaluatePredicate } from "./json-schema-form-conditionals";
import { DebugGlyph } from "./json-schema-form-debug-glyph";
import { ACTION_GLYPH, CONDITION_GLYPH, type DebugGlyphPair } from "./json-schema-form-debug-glyph-map";
import type { ChangeActions, ChangeCondition, ChangeListener } from "./json-schema-form-types";

// ListenerList renders an `x-on-change` / `x-on-load` array as one card per
// listener: its conditions as chips, one row per action with the fields it
// touches, and its else branch. `subject` is what `when` is evaluated against
// (the field's value, or the object for x-on-load); the branch that applies to
// it is marked and the other dimmed. A `when.expr` needs the host's
// ExpressionEvaluator, which the card does not have, so it stays "unknown".

type ListenerState = "true" | "false" | "unknown";

const VERBS: (keyof ChangeActions)[] = ["hide", "show", "enable", "disable", "require", "optional", "reset", "set", "patch"];

const STATE_BADGE: Record<ListenerState, { label: string; className: string }> = {
  true: { label: "holds", className: "text-emerald-700 dark:text-emerald-300" },
  false: { label: "does not hold", className: "text-muted-foreground" },
  unknown: { label: "needs evaluator", className: "text-amber-700 dark:text-amber-300" },
};

export function ListenerList({ listeners, subject }: { listeners: ChangeListener[]; subject: unknown }) {
  return (
    <ol className="mt-0.5 space-y-1">
      {listeners.map((listener, index) => {
        const state = listenerState(listener.when, subject);
        return (
          <li
            key={index}
            data-debug-listener=""
            data-active={state}
            className={cn(
              "space-y-0.5 rounded border px-1.5 py-1",
              state === "true" ? "border-emerald-500/50 bg-emerald-500/5" : "border-border",
            )}
          >
            <div className="flex flex-wrap items-center gap-1">
              <span className="w-10 shrink-0 text-sky-700 dark:text-sky-300">when</span>
              {conditions(listener.when).map((condition, i) => (
                <span key={i} data-condition="" className="inline-flex items-center gap-1 rounded bg-muted px-1">
                  <DebugGlyph glyph={condition.glyph} />
                  {condition.text}
                </span>
              ))}
              <span className={cn("ml-auto font-sans text-[10px]", STATE_BADGE[state].className)}>{STATE_BADGE[state].label}</span>
            </div>
            <ActionRows actions={listener} branch="then" dimmed={state === "false"} />
            {listener.else && (
              <>
                <div className="w-10 text-sky-700 dark:text-sky-300">else</div>
                <ActionRows actions={listener.else} branch="else" dimmed={state === "true"} />
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function ActionRows({ actions, branch, dimmed }: { actions: ChangeActions; branch: "then" | "else"; dimmed: boolean }) {
  const rows = VERBS.flatMap((verb) => actionRows(verb, actions).map((row) => ({ verb, ...row })));
  return (
    <ul {...{ [`data-${branch}`]: "" }} className={cn("space-y-0.5 pl-2", dimmed && "opacity-50")}>
      {rows.length === 0 && <li className="text-muted-foreground">nothing</li>}
      {rows.map(({ verb, detail, targets }) => (
        <li key={`${verb}${detail ?? ""}`} data-action={verb} className="flex items-start gap-1">
          <DebugGlyph glyph={ACTION_GLYPH[verb]} className="mt-px" />
          <span className="w-12 shrink-0">{verb}</span>
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
            {detail !== undefined && (
              <span data-detail="" className="text-muted-foreground">
                {detail}
              </span>
            )}
            {targets.map((target) => (
              <span key={target} data-target="" className="rounded bg-muted px-1">
                {target}
              </span>
            ))}
          </div>
        </li>
      ))}
    </ul>
  );
}

// actionRows lists one verb's targets. The keyed verbs gather their targets by
// what they do to them — every field set to "", every field patched readOnly —
// so a listener that touches a dozen siblings reads as a few rows.
function actionRows(verb: keyof ChangeActions, actions: ChangeActions): { detail?: string; targets: string[] }[] {
  if (verb === "set") return groupByDetail(Object.entries(actions.set ?? {}).map(([key, value]) => [key, `= ${JSON.stringify(value)}`]));
  if (verb === "patch") {
    return groupByDetail(
      Object.entries(actions.patch ?? {}).map(([key, patch]) => [
        key,
        Object.entries(patch)
          .map(([keyword, value]) => `${keyword}: ${JSON.stringify(value)}`)
          .join(", "),
      ]),
    );
  }
  const targets = actions[verb] ?? [];
  return targets.length > 0 ? [{ targets }] : [];
}

function groupByDetail(entries: [string, string][]): { detail: string; targets: string[] }[] {
  const grouped = new Map<string, string[]>();
  for (const [key, detail] of entries) grouped.set(detail, [...(grouped.get(detail) ?? []), key]);
  return [...grouped].map(([detail, targets]) => ({ detail, targets }));
}

function conditions(when: ChangeCondition | undefined): { glyph: DebugGlyphPair; text: string }[] {
  if (!when) return [{ glyph: CONDITION_GLYPH.always, text: "always" }];
  const { const: constValue, enum: enumValues, not, expr, ...rest } = when;
  const out: { glyph: DebugGlyphPair; text: string }[] = [];
  if (constValue !== undefined) out.push({ glyph: CONDITION_GLYPH.const, text: `= ${JSON.stringify(constValue)}` });
  if (enumValues !== undefined) out.push({ glyph: CONDITION_GLYPH.enum, text: `∈ ${JSON.stringify(enumValues)}` });
  if (not?.const !== undefined) out.push({ glyph: CONDITION_GLYPH.not, text: `≠ ${JSON.stringify(not.const)}` });
  if (not?.enum !== undefined) out.push({ glyph: CONDITION_GLYPH.not, text: `∉ ${JSON.stringify(not.enum)}` });
  if (not && not.const === undefined && not.enum === undefined) out.push({ glyph: CONDITION_GLYPH.not, text: `not ${JSON.stringify(not)}` });
  if (expr !== undefined) out.push({ glyph: CONDITION_GLYPH.expr, text: `expr ${expr}` });
  if (Object.keys(rest).length > 0) out.push({ glyph: CONDITION_GLYPH.schema, text: JSON.stringify(rest) });
  return out;
}

function listenerState(when: ChangeCondition | undefined, subject: unknown): ListenerState {
  if (!when) return "true";
  const { expr, ...predicate } = when;
  if (Object.keys(predicate).length > 0) {
    const holds = evaluatePredicate(predicate, subject);
    if (holds === false) return "false";
    if (holds === undefined) return "unknown";
  }
  return expr === undefined ? "true" : "unknown";
}
