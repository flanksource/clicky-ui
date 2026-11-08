// Detail sections for a typed fixture step (see stepKind.ts): the wait
// timeline, retry attempts, exported variables, outputs and a background
// watcher's events. Rendered inside FixtureDetail; split out so adapterViews.tsx
// stays focused on the command/CEL body.

import { useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { SegmentedControl, type SegmentedOption } from "../../components/SegmentedControl";
import { Badge, type BadgeSize, type BadgeTone } from "../Badge";
import { UiHourglass } from "../../icons";
import { CodeBlock } from "../CodeBlock";
import { JsonView } from "../JsonView";
import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import type { StepSourceResult } from "./stepSource";
import { formatTestDuration, useSelectDetailTab, type Test } from "../test-runner";
import {
  clockTime,
  stepFormState,
  formatDelay,
  formatExportValue,
  policySummary,
  waitDecidedBy,
  type ExecutionHeader,
  type StepDetail,
  type StepForm,
  type StepFormState,
  type StepExport,
  type StepQuery,
  type WaitCondition,
  type WaitDetail,
  type WaitOutcome,
  type WatcherEvent,
} from "./stepKind";

const ALERT_ROW = "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-400";

function Section({ name, title, aside, children }: { name: string; title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="min-w-0 space-y-1.5" data-step-section={name}>
      <div className="flex items-center gap-2">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{title}</div>
        {aside}
      </div>
      {children}
    </section>
  );
}

// ── Form ────────────────────────────────────────────────────────────────────

const FORM_BADGE: Record<StepFormState, { label: string; tone: BadgeTone }> = {
  answered: { label: "Answered", tone: "success" },
  rejected: { label: "Rejected", tone: "warning" },
  supplied: { label: "Supplied", tone: "info" },
  unanswered: { label: "Not answered", tone: "danger" },
};

const ignoreChange = () => {};

function StepFormBadge({ state, size }: { state: StepFormState; size?: BadgeSize }) {
  const { label, tone } = FORM_BADGE[state];
  return <Badge tone={tone} clickToCopy={false} {...(size ? { size } : {})}>{label}</Badge>;
}

/**
 * The tree row's step badge: "Awaiting answer" while the step waits on its
 * form, then how the form was answered. Null for any other node.
 */
export function StepRowBadge({ node }: { node: Test }) {
  if (node.waiting) {
    return (
      <span className="flex shrink-0 items-center" data-step-badge="">
        <Badge tone="warning" size="xs" icon={UiHourglass} clickToCopy={false}>Awaiting answer</Badge>
      </span>
    );
  }
  const state = stepFormState(node);
  if (!state) return null;
  return (
    <span className="flex shrink-0 items-center" data-step-badge="">
      <StepFormBadge state={state} size="xs" />
    </span>
  );
}

/** The form a `form` step (or `params:`) showed, read-only through the same JsonSchemaForm the prompt dialog used. */
export function StepFormSection({ form }: { form: StepForm }) {
  const by = [form.answeredBy && `by ${form.answeredBy}`, form.answeredAt && `at ${clockTime(form.answeredAt)}`].filter(Boolean).join(" ");
  return (
    <Section name="form" title="Form" aside={<StepFormBadge state={form.state} />}>
      <div className="text-sm font-medium">{form.title}</div>
      {form.description ? <div className="text-xs text-muted-foreground">{form.description}</div> : null}
      {by ? <div className="text-[11px] text-muted-foreground">{by}</div> : null}
      <JsonSchemaForm schema={form.schema} value={form.values} onChange={ignoreChange} readOnly />
    </Section>
  );
}

/** The host's answerable form for a step waiting on a person, headed like the answered form it becomes. */
export function StepPendingFormSection({ children }: { children: ReactNode }) {
  return (
    <Section
      name="pending-form"
      title="Form"
      aside={<Badge tone="warning" size="xs" icon={UiHourglass} clickToCopy={false}>Awaiting answer</Badge>}
    >
      {children}
    </Section>
  );
}

// ── Query ───────────────────────────────────────────────────────────────────

type QueryView = "template" | "sql";

function ValueTable({ name, keyLabel, rows }: { name: string; keyLabel: string; rows: [string, unknown][] }) {
  return (
    <table className="w-full table-fixed border-collapse text-left text-[11px]" {...{ [`data-query-${name}`]: "" }}>
      <thead className="text-muted-foreground">
        <tr className="border-b border-border">
          <th className="w-[28%] py-1 pr-2 font-medium">{keyLabel}</th>
          <th className="py-1 font-medium">Value</th>
        </tr>
      </thead>
      <tbody className="font-mono">
        {rows.map(([key, value]) => (
          <tr key={key} className="border-b border-border/60 align-top last:border-0">
            <td className="break-words py-1 pr-2">{key}</td>
            <td className="break-all py-1">{formatExportValue(value)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * A query step's query: the template as authored and the statement commons-db
 * issued, behind a compact Template / SQL switch, then the params by name and
 * the values bound to the statement's placeholders.
 */
export function StepQuerySection({ query }: { query: StepQuery }) {
  const [view, setView] = useState<QueryView>("template");
  const params = Object.entries(query.params ?? {});
  const args = query.arguments ?? [];
  const options: SegmentedOption<QueryView>[] = [
    { id: "template", label: "Template", title: "The query as authored, with its params references" },
    query.sql
      ? { id: "sql", label: "SQL", title: "The statement issued, params bound to driver placeholders" }
      : { id: "sql", label: "SQL", title: "No issued statement was recorded", disabled: true },
  ];
  return (
    <Section
      name="query"
      title="Query"
      aside={<SegmentedControl size="sm" value={view} options={options} onChange={setView} aria-label="Query view" />}
    >
      {query.queryFile ? <div className="break-all font-mono text-[11px] text-muted-foreground" title={query.queryFile}>{query.queryFile}</div> : null}
      <div className="min-w-0" data-query-code={view}>
        <CodeBlock language="sql" source={view === "sql" && query.sql ? query.sql : query.template} copyable />
      </div>
      {params.length > 0 && <ValueTable name="params" keyLabel="Param" rows={params} />}
      {args.length > 0 && <ValueTable name="arguments" keyLabel="Argument" rows={args.map((value, i) => [String(i + 1), value])} />}
    </Section>
  );
}

// ── Wait ────────────────────────────────────────────────────────────────────

const OUTCOME_BADGE: Record<WaitOutcome, { label: string; tone: BadgeTone }> = {
  satisfied: { label: "Satisfied", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  timeout: { label: "Timed out", tone: "warning" },
};

function WaitConditionRow({ condition, expression, decisive, wait }: { condition: WaitCondition; expression: string; decisive: boolean; wait: WaitDetail }) {
  const { label, tone } = OUTCOME_BADGE[wait.outcome];
  return (
    <li className="flex min-w-0 items-center gap-2" data-wait-condition={condition} {...(decisive ? { "data-wait-decisive": "" } : {})}>
      <span className="w-14 shrink-0 text-muted-foreground">{condition}</span>
      <code className="min-w-0 shrink break-words font-mono">{expression}</code>
      {decisive && <Badge size="xs" clickToCopy={false} tone={tone}>{label}</Badge>}
    </li>
  );
}

/**
 * The wait's conditions (the deciding one carries the outcome), elapsed time and
 * schedule. `onViewOutputs` links to the host's Outputs tab; without it the
 * observed outputs render inline, collapsed to depth 1, inside the details.
 */
export function StepWait({ wait, onViewOutputs }: { wait: WaitDetail; onViewOutputs?: () => void }) {
  const { policy } = wait;
  const schedule = policySummary(policy);
  const decidedBy = waitDecidedBy(wait);
  const inlineOutputs = wait.outputs !== undefined && !onViewOutputs;
  return (
    <section className="min-w-0 text-[11px]" data-step-section="wait">
      <div className="flex min-w-0 items-center gap-2" data-wait-summary="">
        <span className="shrink-0 text-muted-foreground">Wait</span>
        <Badge size="xs" clickToCopy={false}>{formatDelay(wait.durationMs)}</Badge>
        {wait.outputs !== undefined && onViewOutputs && (
          <Button type="button" variant="link" size="sm" className="h-auto px-0 text-[11px]" onClick={onViewOutputs}>View outputs</Button>
        )}
      </div>
      <ul className="mt-1 space-y-0.5" data-wait-conditions="">
        <WaitConditionRow condition="until" expression={policy.until ?? "Service readiness"} decisive={decidedBy === "until"} wait={wait} />
        {policy.failWhen && <WaitConditionRow condition="failWhen" expression={policy.failWhen} decisive={decidedBy === "failWhen"} wait={wait} />}
      </ul>
      {(schedule || wait.error || wait.trace || inlineOutputs) && (
        <details className="mt-1 text-muted-foreground" open={wait.outcome !== "satisfied"}>
          <summary className="cursor-pointer">Wait details</summary>
          <div className="mt-1 space-y-1 break-words">
            {schedule && <p>{schedule}</p>}
            {wait.error && <p className="text-destructive">{wait.error}</p>}
            {wait.trace && <pre className="whitespace-pre-wrap">{wait.trace}</pre>}
            {inlineOutputs && (
              <div className="min-w-0" data-wait-outputs="">
                <div className="text-[10px] uppercase tracking-wide">Outputs</div>
                <JsonView data={wait.outputs} defaultOpenDepth={1} />
              </div>
            )}
          </div>
        </details>
      )}
    </section>
  );
}

// ── Execution header ────────────────────────────────────────────────────────

const STATE_TONE: Record<string, BadgeTone> = { passed: "success", failed: "danger", warned: "warning", timedout: "warning", running: "info" };

function basename(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

function stepPosition({ rowIndex, line }: ExecutionHeader): string | undefined {
  // gavel numbers steps and table rows from 1.
  if (rowIndex !== undefined) return `step #${rowIndex}`;
  return line !== undefined ? `line ${line}` : undefined;
}

/** Where a fixture step came from (file · step · section), its kind and state, and when it ran. */
export function ExecutionHeaderView({ header, stepKind }: { header: ExecutionHeader; stepKind?: string }) {
  const place = [stepPosition(header), header.sectionPath].filter(Boolean).join(" · ");
  const kinds = [header.kind, stepKind].filter((kind, i, all): kind is string => !!kind && all.indexOf(kind) === i);
  const window = header.startedAt && header.finishedAt ? `${clockTime(header.startedAt)} → ${clockTime(header.finishedAt)}` : header.startedAt ? `started ${clockTime(header.startedAt)}` : undefined;
  if (!header.file && !place && kinds.length === 0 && !header.state && !window && header.durationNs === undefined) return null;
  return (
    <div className="min-w-0 space-y-1" data-execution-header="">
      {(header.file || place) && (
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-xs">
          {header.file && <span className="font-medium" title={header.file}>{basename(header.file)}</span>}
          {header.file && place && <span className="text-muted-foreground">·</span>}
          {place && <span className="min-w-0 break-words text-muted-foreground">{place}</span>}
        </div>
      )}
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
        {kinds.map((kind) => <Badge key={kind} size="xs" clickToCopy={false}>{kind}</Badge>)}
        {header.state && <Badge size="xs" clickToCopy={false} tone={STATE_TONE[header.state] ?? "neutral"}>{header.state}</Badge>}
        {window && <span className="font-mono">{window}</span>}
        {header.durationNs !== undefined && <span>{formatTestDuration(header.durationNs)}</span>}
      </div>
    </div>
  );
}

/** A failure message as a red bordered block that keeps the line breaks of multi-line causes. */
export function FailureCallout({ children }: { children: ReactNode }) {
  return (
    <div className={cn("whitespace-pre-wrap break-words rounded border px-2 py-1.5 text-sm", ALERT_ROW)} data-failure-callout="">
      {children}
    </div>
  );
}

// ── Exports ─────────────────────────────────────────────────────────────────

function ExportsTable({ exports }: { exports: StepExport[] }) {
  return (
    <table className="w-full table-fixed border-collapse text-left text-[11px]">
      <thead className="text-muted-foreground">
        <tr className="border-b border-border">
          <th className="w-[28%] py-1 pr-2 font-medium">Name</th>
          <th className="py-1 pr-2 font-medium">Value</th>
          <th className="w-[18%] py-1 font-medium">Step</th>
        </tr>
      </thead>
      <tbody className="font-mono">
        {exports.map((entry) => (
          <tr key={entry.name} className="border-b border-border/60 align-top last:border-0">
            <td className="break-words py-1 pr-2">{entry.name}</td>
            <td className="break-all py-1 pr-2">{formatExportValue(entry.value)}</td>
            <td className="break-words py-1 text-muted-foreground">{entry.step}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ── Watcher events ──────────────────────────────────────────────────────────

function isAlarming(event: WatcherEvent): boolean {
  return event.type === "alert" || event.type === "pageerror" || (event.type === "response" && (event.status ?? 0) >= 400);
}

function EventRow({ event }: { event: WatcherEvent }) {
  const alarming = isAlarming(event);
  return (
    <li
      className={cn("space-y-0.5 rounded border px-2 py-1 text-[11px]", alarming ? ALERT_ROW : "border-border")}
      data-event-type={event.type}
    >
      <div className="flex min-w-0 items-center gap-2">
        <Badge size="xs" clickToCopy={false} tone={alarming ? "danger" : "neutral"}>{event.type}</Badge>
        {event.status !== undefined && <span className="font-mono">{event.status}</span>}
        {event.text && <span className={cn("min-w-0 break-words", event.type === "alert" && "font-medium")}>{event.text}</span>}
      </div>
      {event.url && <div className="break-all font-mono text-[10px] opacity-80">{event.url}</div>}
      {event.detail && <p className="whitespace-pre-wrap break-words">{event.detail}</p>}
    </li>
  );
}

// ── Whole step ──────────────────────────────────────────────────────────────

/** Execution sections for a typed fixture step; final outputs render separately. */
export function StepKindSections({ step, renderWait }: { step: StepDetail; renderWait?: (wait: WaitDetail) => ReactNode }) {
  const selectTab = useSelectDetailTab();
  const viewOutputs = selectTab && step.outputs !== undefined ? () => selectTab("outputs") : undefined;
  return (
    <>
      <div className="text-[11px] text-muted-foreground" data-step-ref="">
        {step.step.kind} · {step.step.id}
        {step.background && " · background"}
      </div>
      {step.wait && (renderWait ? renderWait(step.wait) : <StepWait wait={step.wait} {...(viewOutputs ? { onViewOutputs: viewOutputs } : {})} />)}
      {step.events.length > 0 && (
        <Section name="events" title="Events">
          <ul className="space-y-1">
            {step.events.map((event, index) => (
              <EventRow key={index} event={event} />
            ))}
          </ul>
        </Section>
      )}
      {step.exports.length > 0 && (
        <Section name="exports" title="Exports">
          <ExportsTable exports={step.exports} />
        </Section>
      )}
    </>
  );
}

export function StepOutputs({ outputs }: { outputs: unknown }) {
  return (
    <div className="min-w-0 p-density-4" data-step-section="outputs">
      <JsonView data={outputs} />
    </div>
  );
}

/** Shown in place of the sections when `detail.step` is present but breaks the contract. */
// ── Source ──────────────────────────────────────────────────────────────────

/** The YAML or markdown lines a failed step was written as, under its file and line range. */
export function StepSourceSection({ result }: { result: StepSourceResult }) {
  if (result.kind === "none") return null;
  if (result.kind === "invalid") {
    return (
      <div data-step-source="">
        <Section name="source" title="Source">
          <MalformedNotice>Malformed source detail: {result.error}</MalformedNotice>
        </Section>
      </div>
    );
  }
  const { source } = result;
  const location = <span className="font-mono text-[11px] text-muted-foreground" title={source.file}>{basename(source.file)}:{source.line}-{source.endLine}</span>;
  return (
    <div data-step-source="">
      <Section name="source" title="Source" aside={location}>
        {source.error ? (
          <div className={cn("rounded border px-2 py-1 text-xs", ALERT_ROW)}>Source unavailable: {source.error}</div>
        ) : (
          <CodeBlock language={source.language} source={source.text ?? ""} copyable />
        )}
        {source.moreLines ? <div className="text-[11px] text-muted-foreground">… {source.moreLines} more lines</div> : null}
      </Section>
    </div>
  );
}

function MalformedNotice({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded border border-red-500/60 bg-red-500/10 px-2 py-1 text-xs text-red-700 dark:text-red-400">
      {children}
    </div>
  );
}

export function MalformedStepDetail({ error }: { error: string }) {
  return <MalformedNotice>Malformed step detail: {error}</MalformedNotice>;
}
