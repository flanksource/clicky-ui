// Detail sections for a typed fixture step (see stepKind.ts): the wait
// timeline, retry attempts, exported variables, outputs and a background
// watcher's events. Rendered inside FixtureDetail; split out so adapterViews.tsx
// stays focused on the command/CEL body.

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Badge, type BadgeTone } from "../Badge";
import { JsonView } from "../JsonView";
import {
  formatDelay,
  formatExportValue,
  policySummary,
  type StepDetail,
  type StepExport,
  type WaitDetail,
  type WaitOutcome,
  type WatcherEvent,
} from "./stepKind";

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

// ── Wait ────────────────────────────────────────────────────────────────────

const OUTCOME_BADGE: Record<WaitOutcome, { label: string; tone: BadgeTone }> = {
  satisfied: { label: "Satisfied", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  timeout: { label: "Timed out", tone: "warning" },
};

export function StepWait({ wait }: { wait: WaitDetail }) {
  const { label, tone } = OUTCOME_BADGE[wait.outcome];
  const { policy } = wait;
  const schedule = policySummary(policy);
  return (
    <section className="min-w-0 text-[11px]" data-step-section="wait">
      <div className="flex min-w-0 items-center gap-2" data-wait-summary="">
        <span className="shrink-0 text-muted-foreground">Wait</span>
        <code className="min-w-0 shrink truncate font-mono" title={policy.until ?? "Service readiness"}>{policy.until ?? "Service readiness"}</code>
        <Badge size="xs" clickToCopy={false}>{formatDelay(wait.durationMs)}</Badge>
        <Badge size="xs" clickToCopy={false} tone={tone}>{label}</Badge>
        {wait.outputs !== undefined && <span className="min-w-0 flex-1 truncate font-mono text-muted-foreground" data-wait-output="" title="Full value in Outputs">{formatExportValue(wait.outputs)}</span>}
      </div>
      {(schedule || policy.failWhen || wait.error || wait.trace) && (
        <details className="mt-1 text-muted-foreground">
          <summary className="cursor-pointer">Wait details</summary>
          <div className="mt-1 space-y-1 break-words">
            {schedule && <p>{schedule}</p>}
            {policy.failWhen && <p>failWhen: <code>{policy.failWhen}</code></p>}
            {wait.error && <p className="text-destructive">{wait.error}</p>}
            {wait.trace && <pre className="whitespace-pre-wrap">{wait.trace}</pre>}
          </div>
        </details>
      )}
    </section>
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

const ALERT_ROW = "border-red-500/60 bg-red-500/10 text-red-700 dark:text-red-400";

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
  return (
    <>
      <div className="text-[11px] text-muted-foreground" data-step-ref="">
        {step.step.kind} · {step.step.id}
        {step.background && " · background"}
      </div>
      {step.wait && (renderWait ? renderWait(step.wait) : <StepWait wait={step.wait} />)}
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
export function MalformedStepDetail({ error }: { error: string }) {
  return (
    <div role="alert" className="rounded border border-red-500/60 bg-red-500/10 px-2 py-1 text-xs text-red-700 dark:text-red-400">
      Malformed step detail: {error}
    </div>
  );
}
