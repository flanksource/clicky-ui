import { useState } from "react";
import {
  Badge,
  Button,
  cn,
  type StaticIconComponent,
} from "@flanksource/clicky-ui";
import {
  UiArrowRight,
  UiCalendarCheck,
  UiCheck,
  UiClock,
  UiHistory,
  UiLedger,
  UiStack,
} from "@flanksource/clicky-ui/icons";

import { BestPractice, ReviewVariant } from "../../../review/ReviewComponents";
import type { PageMeta } from "../../../registry";
import "../merivio.css";

export const meta = {
  title: "Rule history rows",
  description:
    "Single-line alternatives for reading an applied rule from its source journal through to its created sub-ledger record.",
  group: "Merivio · Reviews",
  icon: UiHistory,
  groupOrder: 20,
  navOrder: 50,
} satisfies PageMeta;

type HistoryEvent = {
  id: string;
  period: string;
  source: string;
  created: string;
  activity: string;
};

type EntityTone = "period" | "journal" | "subledger";

const EVENTS: readonly HistoryEvent[] = [
  {
    id: "7368",
    period: "01–31 Aug 2026",
    source: "Journal 7368",
    created: "AR sub-ledger · InfoSlips International (Pty) Ltd",
    activity: "24 Aug · 23:47",
  },
  {
    id: "7356",
    period: "01–31 Jul 2026",
    source: "Journal 7356",
    created: "AR sub-ledger · Vaxowave (PTY) Ltd",
    activity: "24 Aug · 23:46",
  },
  {
    id: "7359",
    period: "01–31 Jul 2026",
    source: "Journal 7359",
    created: "AR sub-ledger · InfoSlips International (Pty) Ltd",
    activity: "24 Aug · 23:46",
  },
];

const VARIANTS = [
  {
    id: "entity-flow",
    title: "A · Entity flow",
    verdict:
      "Recommended. The two linked records become the sentence: a journal produced a receivables sub-ledger entry.",
  },
  {
    id: "audit-strip",
    title: "B · Audit strip",
    verdict:
      "Prioritises execution state and timestamp for audit scanning while keeping the linked records on one baseline.",
  },
  {
    id: "entity-pills",
    title: "C · Entity pills",
    verdict:
      "Treats every field as a compact token, preserving one baseline even when entity names are long.",
  },
] as const;

const ENTITY_TONE: Record<EntityTone, string> = {
  period:
    "border-sky-200 bg-sky-500/10 text-sky-700 [[data-theme=dark]_&]:border-sky-500/30 [[data-theme=dark]_&]:text-sky-300",
  journal:
    "border-violet-200 bg-violet-500/10 text-violet-700 [[data-theme=dark]_&]:border-violet-500/30 [[data-theme=dark]_&]:text-violet-300",
  subledger:
    "border-emerald-200 bg-emerald-500/10 text-emerald-700 [[data-theme=dark]_&]:border-emerald-500/30 [[data-theme=dark]_&]:text-emerald-300",
};

function EntityMark({
  icon: Icon,
  label,
  tone,
}: {
  icon: StaticIconComponent;
  label: string;
  tone: EntityTone;
}) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-lg border",
          ENTITY_TONE[tone],
        )}
      >
        <Icon aria-hidden className="size-3.5" />
      </span>
      <span className="min-w-0 truncate text-xs font-semibold text-foreground">
        {label}
      </span>
    </span>
  );
}

function AppliedBadge() {
  return (
    <Badge variant="soft" tone="success" size="xs" icon={UiCheck}>
      Applied
    </Badge>
  );
}

function EntityPill({
  icon: Icon,
  label,
  tone,
  className,
}: {
  icon: StaticIconComponent;
  label: string;
  tone: EntityTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-medium",
        ENTITY_TONE[tone],
        className,
      )}
    >
      <Icon aria-hidden className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function SampleHeader({ note }: { note: string }) {
  return (
    <div className="flex min-w-[64rem] items-center justify-between gap-density-4 border-b border-[var(--mv-border)] bg-[var(--mv-surface-2)] px-density-3 py-density-2">
      <div className="flex items-center gap-density-2">
        <UiHistory aria-hidden className="size-4 text-[var(--mv-accent)]" />
        <span className="text-xs font-semibold text-foreground">
          Execution history
        </span>
        <span className="text-[11px] text-muted-foreground">
          3 sample events · v1 · account 610
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground">{note}</span>
    </div>
  );
}

function EntityFlow() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--mv-border)] bg-[var(--mv-surface)]">
      <SampleHeader note="source → created" />
      <div className="min-w-[64rem] divide-y divide-[var(--mv-hair)]">
        {EVENTS.map((event) => (
          <article
            key={event.id}
            data-rule-history-row="entity-flow"
            className="grid grid-cols-[11rem_minmax(0,1fr)_7.5rem_5.5rem_6.5rem_8.5rem] items-center gap-density-3 px-density-3 py-density-2 whitespace-nowrap"
          >
            <EntityMark
              icon={UiCalendarCheck}
              label={event.period}
              tone="period"
            />
            <div className="grid min-w-0 grid-cols-[minmax(0,0.7fr)_1.5rem_minmax(0,1.3fr)] items-center gap-density-2">
              <EntityMark icon={UiLedger} label={event.source} tone="journal" />
              <UiArrowRight
                aria-hidden
                className="size-4 text-muted-foreground"
              />
              <EntityMark
                icon={UiStack}
                label={event.created}
                tone="subledger"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Journal line ·{" "}
              <strong className="font-mono font-medium text-foreground">
                610
              </strong>
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              v1 · apply
            </span>
            <AppliedBadge />
            <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] text-muted-foreground">
              <UiClock aria-hidden className="size-3.5" />
              {event.activity}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function AuditStrip() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--mv-border)] bg-[var(--mv-surface)]">
      <SampleHeader note="outcome-first scanning" />
      <div className="min-w-[64rem] divide-y divide-[var(--mv-hair)]">
        {EVENTS.map((event) => (
          <article
            key={event.id}
            data-rule-history-row="audit-strip"
            className="grid grid-cols-[0.25rem_6.5rem_10.5rem_8rem_minmax(0,1fr)_5.5rem_8.5rem] items-center gap-density-3 pr-density-3 whitespace-nowrap"
          >
            <span aria-hidden className="h-full bg-[var(--mv-positive)]" />
            <p className="flex items-center gap-1.5 py-density-2 text-xs font-semibold text-[var(--mv-positive)]">
              <UiCheck aria-hidden className="size-3.5" /> Applied
            </p>
            <p className="flex items-center gap-1.5 border-l border-[var(--mv-hair)] pl-density-3 font-mono text-[11px] font-medium text-foreground">
              <UiCalendarCheck
                aria-hidden
                className="size-3.5 text-[var(--mv-info)]"
              />
              {event.period}
            </p>
            <p className="text-xs text-muted-foreground">
              Journal line ·{" "}
              <strong className="font-mono font-medium text-foreground">
                610
              </strong>
            </p>
            <div className="flex min-w-0 items-center gap-density-2 border-l border-[var(--mv-hair)] pl-density-3">
              <EntityMark icon={UiLedger} label={event.source} tone="journal" />
              <UiArrowRight
                aria-hidden
                className="size-3.5 shrink-0 text-muted-foreground"
              />
              <EntityMark
                icon={UiStack}
                label={event.created}
                tone="subledger"
              />
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              v1 · apply
            </span>
            <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] text-muted-foreground">
              <UiClock aria-hidden className="size-3.5" />
              {event.activity}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function EntityPills() {
  return (
    <div className="overflow-hidden rounded-lg border border-[var(--mv-border)] bg-[var(--mv-surface)]">
      <SampleHeader note="one-line token rail" />
      <div className="min-w-[64rem] divide-y divide-[var(--mv-hair)]">
        {EVENTS.map((event) => (
          <article
            key={event.id}
            data-rule-history-row="entity-pills"
            className="flex items-center gap-density-2 px-density-3 py-density-2 whitespace-nowrap"
          >
            <EntityPill
              icon={UiCalendarCheck}
              label={event.period}
              tone="period"
            />
            <EntityPill icon={UiLedger} label={event.source} tone="journal" />
            <UiArrowRight
              aria-hidden
              className="size-3.5 shrink-0 text-muted-foreground"
            />
            <EntityPill
              icon={UiStack}
              label={event.created}
              tone="subledger"
              className="min-w-0 flex-1"
            />
            <Badge variant="outline" size="xs">
              Journal line · 610
            </Badge>
            <span className="font-mono text-[11px] text-muted-foreground">
              v1 · apply
            </span>
            <AppliedBadge />
            <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
              <UiClock aria-hidden className="size-3.5" />
              {event.activity}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function VariantContent({ id }: { id: (typeof VARIANTS)[number]["id"] }) {
  if (id === "entity-flow") return <EntityFlow />;
  if (id === "audit-strip") return <AuditStrip />;
  return <EntityPills />;
}

export default function RuleHistoryAlternativesPage() {
  const [discarded, setDiscarded] = useState<Set<string>>(new Set());
  return (
    <main className="merivio-system mx-auto w-full max-w-screen-2xl space-y-density-6 rounded-xl border border-[var(--mv-border)] p-density-4 shadow-sm sm:p-density-6">
      <header className="space-y-density-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mv-accent)]">
          Merivio · Component review
        </p>
        <div className="flex flex-wrap items-start justify-between gap-density-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Rule history, one execution per line
            </h1>
            <p className="mt-density-2 max-w-3xl text-sm leading-6 text-muted-foreground">
              Alternatives for <code>&lt;RuleHistoryPanel&gt;</code> that use
              color and accounting entity icons to show what the rule read, what
              it created, and whether it applied.
            </p>
          </div>
          {discarded.size > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDiscarded(new Set())}
            >
              Restore discarded ({discarded.size})
            </Button>
          )}
        </div>
      </header>

      <BestPractice
        id="rule-history-one-event-one-row"
        title="One event, one line"
        description="Keep period, source, created record, target, version, mode, execution state, and activity on one baseline. No subtitles or stacked metadata."
        tone="do"
      />

      <section
        className="space-y-density-5"
        aria-label="Rule history alternatives"
      >
        {VARIANTS.map((variant) =>
          discarded.has(variant.id) ? null : (
            <ReviewVariant
              key={variant.id}
              id={variant.id}
              title={variant.title}
              verdict={variant.verdict}
              selected={variant.id === "entity-flow"}
              onDiscard={() =>
                setDiscarded((current) => new Set(current).add(variant.id))
              }
            >
              <VariantContent id={variant.id} />
            </ReviewVariant>
          ),
        )}
      </section>
    </main>
  );
}
