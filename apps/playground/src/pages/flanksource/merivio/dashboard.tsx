import {
  Badge,
  Panel,
  cn,
  type StaticIconComponent,
} from "@flanksource/clicky-ui";
import {
  UiActivity,
  UiBank,
  UiCheck,
  UiClock,
  UiDatabase,
  UiFolder,
  UiLayoutDashboard,
  UiPauseCircle,
  UiPlugsConnected,
  UiWarningCircle,
  UiWorkflow,
} from "@flanksource/clicky-ui/icons";

import type { PageMeta } from "../../../registry";
import {
  ATTENTION_COUNT,
  ENTITY,
  HEALTHY_INTEGRATIONS,
  INTEGRATIONS,
  OPERATIONAL_RULES,
  RULES,
  SYNCED_DATA,
  type ConnectionLifecycle,
  type DashboardIntegration,
  type DashboardRule,
  type IntegrationKind,
  type RuleActivation,
  type RuleExecution,
  type SyncOutcome,
} from "./_dashboard-data";
import "../merivio.css";

export const meta = {
  title: "Dashboard readiness",
  description:
    "A selected-entity dashboard that makes integration and rule status the primary operational story.",
  group: "Merivio · Reviews",
  icon: UiLayoutDashboard,
  groupOrder: 20,
  navOrder: 40,
} satisfies PageMeta;

const INTEGRATION_ICON: Record<IntegrationKind, StaticIconComponent> = {
  ledger: UiDatabase,
  documents: UiFolder,
  "bank-feed": UiBank,
};

const INTEGRATION_TONE: Record<IntegrationKind, string> = {
  ledger:
    "border-[var(--mv-cat-journal-line)] bg-[var(--mv-cat-journal-soft)] text-[var(--mv-cat-journal-accent)]",
  documents:
    "border-[var(--mv-cat-report-line)] bg-[var(--mv-cat-report-soft)] text-[var(--mv-cat-report-accent)]",
  "bank-feed":
    "border-[var(--mv-cat-bank-line)] bg-[var(--mv-cat-bank-soft)] text-[var(--mv-cat-bank-accent)]",
};

function LifecycleBadge({ lifecycle }: { lifecycle: ConnectionLifecycle }) {
  if (lifecycle === "active") {
    return (
      <Badge
        clickToCopy={false}
        icon={UiCheck}
        size="xs"
        tone="success"
        variant="outline"
      >
        Active
      </Badge>
    );
  }
  return (
    <Badge
      clickToCopy={false}
      icon={UiWarningCircle}
      size="xs"
      tone="warning"
      variant="outline"
    >
      Expired
    </Badge>
  );
}

function SyncBadge({ outcome }: { outcome: SyncOutcome }) {
  if (outcome === "success") {
    return (
      <Badge
        clickToCopy={false}
        icon={UiCheck}
        size="xs"
        tone="success"
        variant="soft"
      >
        Sync healthy
      </Badge>
    );
  }
  return (
    <Badge
      clickToCopy={false}
      icon={UiWarningCircle}
      size="xs"
      tone="danger"
      variant="soft"
    >
      Sync failed
    </Badge>
  );
}

function ActivationBadge({ activation }: { activation: RuleActivation }) {
  if (activation === "active-here") {
    return (
      <Badge
        clickToCopy={false}
        icon={UiCheck}
        size="xs"
        tone="success"
        variant="outline"
      >
        Active here
      </Badge>
    );
  }
  return (
    <Badge
      clickToCopy={false}
      icon={UiPauseCircle}
      size="xs"
      tone="warning"
      variant="outline"
    >
      Out of scope
    </Badge>
  );
}

function ExecutionBadge({ execution }: { execution: RuleExecution }) {
  switch (execution) {
    case "ready":
      return (
        <Badge
          clickToCopy={false}
          icon={UiCheck}
          size="xs"
          tone="success"
          variant="soft"
        >
          Ready
        </Badge>
      );
    case "running":
      return (
        <Badge
          clickToCopy={false}
          icon={UiActivity}
          size="xs"
          tone="info"
          variant="soft"
        >
          Running
        </Badge>
      );
    case "failed":
      return (
        <Badge
          clickToCopy={false}
          icon={UiWarningCircle}
          size="xs"
          tone="danger"
          variant="soft"
        >
          Failed
        </Badge>
      );
    case "inactive":
      return (
        <Badge
          clickToCopy={false}
          icon={UiPauseCircle}
          size="xs"
          variant="outline"
        >
          Inactive
        </Badge>
      );
  }
}

function IntegrationRow({
  integration,
}: {
  integration: DashboardIntegration;
}) {
  const Icon = INTEGRATION_ICON[integration.kind];
  return (
    <article className="grid gap-density-3 px-density-4 py-density-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-density-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg border",
            INTEGRATION_TONE[integration.kind],
          )}
        >
          <Icon aria-hidden className="size-4.5" />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-density-2 gap-y-1">
            <h3 className="text-sm font-semibold text-[var(--mv-ink)]">
              {integration.name}
            </h3>
            <span className="text-[11px] text-[var(--mv-muted)]">
              {integration.purpose}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-[var(--mv-ink-3)]">
            {integration.resource}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--mv-muted)]">
            {integration.sync.detail}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-density-2 sm:max-w-52 sm:justify-end">
        <LifecycleBadge lifecycle={integration.lifecycle} />
        <SyncBadge outcome={integration.sync.outcome} />
        <span
          className={cn(
            "w-full text-[11px] sm:text-right",
            integration.sync.outcome === "error"
              ? "font-medium text-[var(--mv-negative)]"
              : "text-[var(--mv-muted)]",
          )}
        >
          {integration.sync.label}
        </span>
      </div>
    </article>
  );
}

function RuleRow({ rule }: { rule: DashboardRule }) {
  return (
    <article className="grid gap-density-3 px-density-4 py-density-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="flex min-w-0 items-start gap-density-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-[var(--mv-cat-rule-line)] bg-[var(--mv-cat-rule-soft)] text-[var(--mv-cat-rule-accent)]">
          <UiWorkflow aria-hidden className="size-4.5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[var(--mv-ink)]">
            {rule.name}
          </h3>
          <p className="mt-1 text-xs text-[var(--mv-ink-3)]">
            {rule.module} · {rule.target}
          </p>
          <p
            className={cn(
              "mt-0.5 text-[11px]",
              rule.execution === "failed"
                ? "font-medium text-[var(--mv-negative)]"
                : "text-[var(--mv-muted)]",
            )}
          >
            {rule.detail}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-density-2 sm:max-w-52 sm:justify-end">
        <ActivationBadge activation={rule.activation} />
        <ExecutionBadge execution={rule.execution} />
        <span className="w-full text-[11px] text-[var(--mv-muted)] sm:text-right">
          {rule.activity}
        </span>
      </div>
    </article>
  );
}

function StatusOverview() {
  return (
    <section
      aria-labelledby="attention-heading"
      className="grid gap-density-4 rounded-xl border border-[var(--mv-warm)]/30 border-l-4 border-l-[var(--mv-warm)] bg-[var(--mv-warm-soft)] p-density-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
    >
      <div className="flex items-start gap-density-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--mv-surface)] text-[var(--mv-warm)] shadow-sm">
          <UiWarningCircle aria-hidden className="size-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--mv-warm)]">
            Close readiness
          </p>
          <h2
            id="attention-heading"
            className="mt-1 text-xl font-semibold tracking-tight text-[var(--mv-ink)]"
          >
            {ATTENTION_COUNT} items need attention
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--mv-ink-3)]">
            Wise has not imported its latest statement, and the accrual reversal
            rule failed its most recent execution.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-[var(--mv-border-strong)] rounded-lg border border-[var(--mv-border-strong)] bg-[var(--mv-surface)]">
        <div className="min-w-32 px-density-4 py-density-3">
          <p className="font-mono text-xl font-semibold tabular-nums text-[var(--mv-ink)]">
            {HEALTHY_INTEGRATIONS}/{INTEGRATIONS.length}
          </p>
          <p className="text-[11px] text-[var(--mv-muted)]">
            integrations healthy
          </p>
        </div>
        <div className="min-w-32 px-density-4 py-density-3">
          <p className="font-mono text-xl font-semibold tabular-nums text-[var(--mv-ink)]">
            {OPERATIONAL_RULES}/{RULES.length}
          </p>
          <p className="text-[11px] text-[var(--mv-muted)]">
            rules operational
          </p>
        </div>
      </div>
    </section>
  );
}

function SyncedDataPanel() {
  return (
    <Panel
      actions={
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--mv-muted)]">
          <UiClock aria-hidden className="size-3.5" />
          Oldest model sync 16m ago
        </span>
      }
      icon={UiDatabase}
      title="Synced data"
    >
      <div className="grid gap-density-2 [grid-template-columns:repeat(auto-fit,minmax(min(100%,11rem),1fr))]">
        {SYNCED_DATA.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--mv-hair)] bg-[var(--mv-surface-2)] px-density-3 py-density-2"
          >
            <p className="font-mono text-lg font-semibold tabular-nums text-[var(--mv-ink)]">
              {item.value}
            </p>
            <div className="mt-0.5 flex items-center justify-between gap-density-2 text-[11px] text-[var(--mv-muted)]">
              <span>{item.label}</span>
              <span>{item.synced}</span>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export default function DashboardReadinessPage() {
  return (
    <main className="merivio-system mx-auto w-full max-w-screen-2xl space-y-density-5 rounded-xl border border-[var(--mv-border)] p-density-4 shadow-sm sm:p-density-6 xl:p-density-7">
      <header className="flex flex-wrap items-end justify-between gap-density-4 border-b border-[var(--mv-hair)] pb-density-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--mv-accent)]">
            Merivio · Dashboard proposal
          </p>
          <h1 className="mt-density-2 text-3xl font-semibold tracking-[-0.025em] text-[var(--mv-ink)]">
            Operational readiness
          </h1>
          <p className="mt-density-2 max-w-3xl text-sm leading-6 text-[var(--mv-ink-3)]">
            Integration health and rule execution for the selected entity, with
            synced volumes kept as supporting evidence.
          </p>
          <div className="mt-density-3 flex flex-wrap items-center gap-density-2">
            <Badge clickToCopy={false} size="xs" variant="outline">
              {ENTITY.name}
            </Badge>
            <Badge clickToCopy={false} size="xs" variant="outline">
              {ENTITY.jurisdiction}
            </Badge>
            <Badge clickToCopy={false} size="xs" variant="outline">
              {ENTITY.currency}
            </Badge>
          </div>
        </div>
        <span className="flex items-center gap-density-2 text-xs text-[var(--mv-muted)]">
          <UiClock aria-hidden className="size-4" />
          Last refreshed {ENTITY.refreshed}
        </span>
      </header>

      <StatusOverview />

      <section
        aria-label="Operational status"
        className="grid items-start gap-density-4 xl:grid-cols-2"
      >
        <Panel
          actions={
            <Badge clickToCopy={false} size="xs" tone="warning" variant="soft">
              {HEALTHY_INTEGRATIONS} of {INTEGRATIONS.length} healthy
            </Badge>
          }
          count={INTEGRATIONS.length}
          icon={UiPlugsConnected}
          padded={false}
          title="Integrations"
          tone="warning"
        >
          <p className="border-b border-[var(--mv-hair)] bg-[var(--mv-surface-2)] px-density-4 py-density-2 text-[11px] leading-5 text-[var(--mv-muted)]">
            Connection lifecycle and the selected resource&rsquo;s latest sync
            are shown separately.
          </p>
          <div className="divide-y divide-[var(--mv-hair)]">
            {INTEGRATIONS.map((integration) => (
              <IntegrationRow key={integration.id} integration={integration} />
            ))}
          </div>
        </Panel>

        <Panel
          actions={
            <Badge clickToCopy={false} size="xs" tone="warning" variant="soft">
              {OPERATIONAL_RULES} of {RULES.length} operational
            </Badge>
          }
          count={RULES.length}
          icon={UiWorkflow}
          padded={false}
          title="Rules"
          tone="warning"
        >
          <p className="border-b border-[var(--mv-hair)] bg-[var(--mv-surface-2)] px-density-4 py-density-2 text-[11px] leading-5 text-[var(--mv-muted)]">
            Entity activation and latest execution outcome remain distinct
            signals.
          </p>
          <div className="divide-y divide-[var(--mv-hair)]">
            {RULES.map((rule) => (
              <RuleRow key={rule.id} rule={rule} />
            ))}
          </div>
        </Panel>
      </section>

      <SyncedDataPanel />
    </main>
  );
}
