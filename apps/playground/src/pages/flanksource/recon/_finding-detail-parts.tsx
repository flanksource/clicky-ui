import {
  Badge,
  Button,
  Callout,
  CodeBlock,
  Icon,
  Markdown,
  Panel,
  TagList,
  Tabs,
  cn,
  normalizeTags,
  type BadgeStatus,
  type StaticIconComponent,
} from "@flanksource/clicky-ui";
import {
  UiArrowLeft,
  UiClock,
  UiExternalLink,
  UiFileJson,
  UiShieldSlash,
} from "@flanksource/clicky-ui/icons";
import { useState, type ReactNode } from "react";

import {
  type FindingClass,
  type FindingFact,
  type FindingInfo,
  type RemediationSnippet,
} from "./_finding-detail-fixture";
import {
  OCSF_VISUALS,
  severityVisual,
  type FindingVisual,
} from "./_finding-detail-visuals";

export function FindingSurface({
  children,
  classInfo,
  findingInfo,
  visual,
  sourceUrl,
}: {
  children: ReactNode;
  classInfo: FindingClass;
  findingInfo: FindingInfo;
  visual: FindingVisual;
  sourceUrl?: string;
}) {
  const severity = severityVisual(classInfo.severity);

  return (
    <article className="@container overflow-hidden rounded-lg border border-border bg-background shadow-sm">
      <header className="border-b border-border bg-card">
        <div className="flex flex-wrap items-start gap-3 px-density-4 py-density-3">
          <Button
            aria-label="Back to findings"
            size="sm"
            type="button"
            variant="outline"
          >
            <UiArrowLeft aria-hidden className="size-4" />
            Back
          </Button>
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
              visual.className,
            )}
          >
            <Icon aria-hidden className="size-5" icon={visual.icon} />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                clickToCopy={false}
                icon={visual.icon}
                label="OCSF"
                labelClassName={visual.className}
                size="xs"
                value={classInfo.name}
                variant="label"
              />
              <Badge
                className={severity.className}
                clickToCopy={false}
                icon={severity.icon}
                size="xs"
                variant="soft"
              >
                {classInfo.severity}
              </Badge>
              <Badge
                clickToCopy={false}
                label="Status"
                size="xs"
                value={classInfo.status}
                variant="metric"
              />
              <Badge
                clickToCopy={false}
                label="Activity"
                size="xs"
                value={classInfo.activity}
                variant="outlined"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                {findingInfo.title}
              </h2>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {findingInfo.analytic}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {sourceUrl && (
              <Button
                onClick={() =>
                  window.open(sourceUrl, "_blank", "noopener,noreferrer")
                }
                size="sm"
                type="button"
                variant="ghost"
              >
                <UiFileJson aria-hidden className="size-4" />
                Raw JSON
              </Button>
            )}
            <Button size="sm" type="button" variant="outline">
              <UiShieldSlash aria-hidden className="size-4" />
              Mute
            </Button>
          </div>
        </div>
      </header>
      {children}
    </article>
  );
}

export function FindingInformation({
  classInfo,
  findingInfo,
}: {
  classInfo: FindingClass;
  findingInfo: FindingInfo;
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-density-4 py-density-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Finding Information
          </h3>
          <p className="text-xs text-muted-foreground">
            Shared OCSF metadata for every finding class
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Badge
            clickToCopy={false}
            label="uid"
            maxWidth={25}
            size="xs"
            truncate="auto"
            value={findingInfo.uid}
            variant="label"
          />
          <Badge clickToCopy={false} size="xs" variant="outlined">
            class_uid={classInfo.classUid}
          </Badge>
          <Badge clickToCopy={false} size="xs" variant="outlined">
            type_uid={classInfo.typeUid}
          </Badge>
        </div>
      </header>
      <div className="grid gap-density-4 p-density-4 @min-[54rem]:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-density-3">
          <p className="text-sm leading-6 text-muted-foreground">
            {findingInfo.description}
          </p>
          <TagGroup label="Types" tags={findingInfo.types} />
          <TagGroup label="Tags" tags={findingInfo.tags} />
          <TagGroup label="Data sources" tags={findingInfo.dataSources} />
        </div>
        <dl className="space-y-3 rounded-md bg-muted/40 p-density-3 text-xs">
          <FindingInfoFact
            icon={UiClock}
            label="First seen"
            value={findingInfo.firstSeen}
          />
          <FindingInfoFact
            icon={UiClock}
            label="Last seen"
            value={findingInfo.lastSeen}
          />
          <div>
            <dt className="text-muted-foreground">Analytic</dt>
            <dd className="mt-1 break-all font-mono text-foreground">
              {findingInfo.analytic}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function FindingInfoFact({
  icon,
  label,
  value,
}: {
  icon: StaticIconComponent;
  label: string;
  value: string;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-muted-foreground">
        <Icon aria-hidden className="size-3.5" icon={icon} />
        {label}
      </dt>
      <dd className="mt-1 font-mono text-foreground">{value}</dd>
    </div>
  );
}

export function TagGroup({
  label,
  tags,
  compact = false,
}: {
  label: string;
  tags: readonly string[];
  compact?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <TagList
        actions="hover"
        compact={compact}
        tags={normalizeTags([...tags])}
        wrap
      />
    </div>
  );
}

export function MetricStrip({
  metrics,
}: {
  metrics: ReadonlyArray<{
    label: string;
    value: string;
    status?: BadgeStatus;
  }>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {metrics.map((metric) => (
        <Badge
          clickToCopy={false}
          key={metric.label}
          label={metric.label}
          size="sm"
          value={metric.value}
          variant={metric.status ? "status" : "metric"}
          {...(metric.status ? { status: metric.status } : {})}
        />
      ))}
    </div>
  );
}

export function RiskCallout({ risk }: { risk: string }) {
  return (
    <Callout label="Risk" variant="caution">
      <Markdown text={risk} />
    </Callout>
  );
}

export function RemediationPanel({
  guidance,
  snippets = [],
  title = "How to fix it",
}: {
  guidance: string;
  snippets?: readonly RemediationSnippet[];
  title?: string;
}) {
  const [activeId, setActiveId] = useState<string | undefined>(snippets[0]?.id);
  const active = snippets.find((snippet) => snippet.id === activeId);

  if (snippets.length > 0 && !active) {
    throw new Error(`Unknown remediation snippet: ${activeId ?? "missing id"}`);
  }

  return (
    <Panel icon={OCSF_VISUALS.remediation.icon} title={title}>
      <Markdown text={guidance} />
      {active && (
        <div className="mt-density-3 space-y-density-2">
          <Tabs
            onChange={setActiveId}
            tabs={snippets.map(({ id, label }) => ({ id, label }))}
            value={active.id}
          />
          <CodeBlock language={active.language} source={active.source} />
        </div>
      )}
    </Panel>
  );
}

export function ResourceCard({
  account,
  name,
  region,
  type,
  uid,
}: {
  account: string;
  name: string;
  region: string;
  type: string;
  uid: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-density-3">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg ring-1 ring-inset",
            OCSF_VISUALS.cloudResource.className,
          )}
        >
          <Icon
            aria-hidden
            className="size-5"
            icon={OCSF_VISUALS.cloudResource.icon}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {name}
          </p>
          <p className="truncate text-xs text-muted-foreground">{type}</p>
          <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
            {uid}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge clickToCopy={false} size="xs" variant="outlined">
            {account}
          </Badge>
          <Badge clickToCopy={false} size="xxs" variant="outlined">
            {region}
          </Badge>
        </div>
      </div>
    </section>
  );
}

export function FactList({ facts }: { facts: readonly FindingFact[] }) {
  return (
    <dl className="divide-y divide-border/70">
      {facts.map((fact) => (
        <div
          className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 py-2 text-xs"
          key={fact.label}
        >
          <dt className="text-muted-foreground">{fact.label}</dt>
          <dd
            className={cn(
              "min-w-0 break-words text-foreground",
              fact.mono && "font-mono",
            )}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function SectionCard({
  badge,
  children,
  visual,
  title,
}: {
  badge?: string;
  children: ReactNode;
  visual: FindingVisual;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-density-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "grid size-8 place-items-center rounded-md ring-1 ring-inset",
              visual.className,
            )}
          >
            <Icon aria-hidden className="size-4" icon={visual.icon} />
          </span>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        {badge && (
          <Badge
            clickToCopy={false}
            size="xxs"
            status="info"
            variant="outlined"
          >
            {badge}
          </Badge>
        )}
      </div>
      {children}
    </section>
  );
}

export function ExternalReference({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <a
      className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
      <UiExternalLink aria-hidden className="size-3.5" />
    </a>
  );
}
