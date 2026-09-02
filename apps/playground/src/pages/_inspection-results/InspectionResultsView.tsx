import {
  Badge,
  DataTable,
  StatStrip,
  type BadgeTone,
  type DataTableColumn,
  type StaticIconComponent,
} from "@flanksource/clicky-ui";
import {
  UiBraces,
  UiCalendar,
  UiCheck,
  UiClock,
  UiColumns,
  UiCursorClick,
  UiCursorText,
  UiDatabase,
  UiFilter,
  UiListChecks,
  UiListOrdered,
  UiProhibit,
  UiPulse,
  UiSearch,
  UiSigma,
  UiSliders,
  UiSparkles,
  UiTimer,
  UiWarningCircle,
} from "@flanksource/clicky-ui/icons";
import type { ReactNode } from "react";

import { HUES, NEUTRAL_HUE, type HueClasses } from "../_shared/hues";
import type {
  FilterResolution,
  InspectedField,
  InspectionMode,
  InspectionResult,
} from "./model";

type SemanticVisual = HueClasses & { icon: StaticIconComponent };

const semanticVisuals: Record<string, SemanticVisual> = {
  string: { icon: UiCursorText, ...HUES.slate },
  number: { icon: UiSigma, ...HUES.violet },
  datetime: { icon: UiCalendar, ...HUES.sky },
  duration: { icon: UiTimer, ...HUES.amber },
  status: { icon: UiPulse, ...HUES.teal },
  json: { icon: UiBraces, ...HUES.indigo },
};

const fallbackSemanticVisual: SemanticVisual = {
  icon: UiColumns,
  ...NEUTRAL_HUE,
};

const filterIcons: Record<FilterResolution["kind"], StaticIconComponent> = {
  terms: UiListChecks,
  lookup: UiSearch,
  range: UiSliders,
  time: UiClock,
  text: UiCursorText,
  none: UiProhibit,
};

const originIcons: Record<FilterResolution["origin"], StaticIconComponent> = {
  Inferred: UiSparkles,
  "Profile override": UiSliders,
  Disabled: UiProhibit,
};

const fieldColumns: DataTableColumn<InspectedField>[] = [
  {
    key: "name",
    label: "Field",
    minWidth: 190,
    grow: true,
    render: (_, field) => (
      <div className="min-w-0">
        <div className="truncate font-mono text-xs font-medium text-foreground">
          {field.name}
        </div>
        {field.source ? (
          <div className="truncate font-mono text-[11px] text-muted-foreground">
            ← {field.source}
          </div>
        ) : null}
      </div>
    ),
  },
  {
    key: "databaseType",
    label: "Datatype",
    minWidth: 150,
    shrink: true,
    render: (_, field) => {
      const visual = semanticVisual(field.semanticType);
      const SemanticIcon = visual.icon;
      return (
        <div className="flex items-center gap-density-2">
          <span
            className={`grid size-7 shrink-0 place-items-center rounded-md ring-1 ring-inset ${visual.chip}`}
          >
            <SemanticIcon className={`size-3.5 ${visual.glyph}`} />
          </span>
          <div className="min-w-0 space-y-0.5">
            <div className="truncate font-mono text-xs text-foreground">
              {field.databaseType}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {field.semanticType}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    key: "cardinality",
    label: "Cardinality",
    minWidth: 130,
    shrink: true,
    align: "right",
    accessor: (field) => field.cardinality?.value,
    sortValue: (_, field) => field.cardinality?.value ?? -1,
    render: (_, field) =>
      field.cardinality ? (
        <div className="space-y-0.5 text-right">
          <div className="font-mono text-xs font-medium tabular-nums">
            {formatCount(field.cardinality.value)}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {field.cardinality.relation} ·{" "}
            {field.cardinality.cached ? "cached" : "this run"}
          </div>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground">Not probed</span>
      ),
  },
  {
    key: "filter",
    label: "Resolved auto-filter",
    minWidth: 240,
    shrink: true,
    accessor: (field) => field.filter.label,
    render: (_, field) => (
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            size="xxs"
            tone={filterTone(field.filter.kind)}
            variant="soft"
            icon={filterIcons[field.filter.kind]}
            clickToCopy={false}
          >
            {field.filter.label}
          </Badge>
          <Badge
            size="xxs"
            tone={originTone(field.filter.origin)}
            variant="outline"
            icon={originIcons[field.filter.origin]}
            clickToCopy={false}
          >
            {field.filter.origin}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-x-2 text-[11px] text-muted-foreground">
          {field.filter.lookup ? <span>lookup</span> : null}
          {field.filter.multi ? <span>multi-value</span> : null}
          {!field.filter.lookup && !field.filter.multi ? (
            <span>direct</span>
          ) : null}
        </div>
      </div>
    ),
  },
];

export function InspectionResultsView({
  mode,
  result,
}: {
  mode: InspectionMode;
  result: InspectionResult;
}) {
  const filterable = result.fields.filter(
    (field) => field.filter.kind !== "none",
  ).length;
  const probed = result.fields.filter(
    (field) => field.cardinality !== undefined,
  ).length;
  const provider = providerVisual(result.provider);
  const ProviderIcon = provider.icon;

  return (
    <div className="space-y-density-4">
      <div className="flex flex-wrap items-start justify-between gap-density-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-density-2">
            <span
              className={`grid size-8 shrink-0 place-items-center rounded-md ring-1 ring-inset ${provider.classes}`}
            >
              <ProviderIcon className="size-4" />
            </span>
            <h2 className="truncate text-xl font-semibold tracking-tight">
              {result.name}
            </h2>
            <Badge
              size="xs"
              variant="status"
              status={result.status === "Complete" ? "success" : "warning"}
              icon={result.status === "Complete" ? UiCheck : UiWarningCircle}
              clickToCopy={false}
            >
              {result.status}
            </Badge>
          </div>
          <p className="max-w-4xl text-sm text-muted-foreground">
            {result.statusNote}
          </p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div>{result.durationMs.toFixed(0)}ms inspection</div>
          <div>
            {result.cache.state.toLowerCase()} metadata · {result.cache.age} old
          </div>
        </div>
      </div>

      <StatStrip
        columns={4}
        items={[
          {
            label: "Discovered fields",
            value: result.fields.length,
            sub: `${filterable} backend-filterable`,
            icon: UiColumns,
          },
          {
            label: "Cardinality probes",
            value: `${probed}/${result.fields.length}`,
            sub: `${result.cache.policy} · ${result.cache.cached ? "cache hit" : "fresh read"}`,
            icon: UiSearch,
          },
          {
            label: "Resolved paging",
            value: result.paging.selected,
            sub: `${result.paging.execution.toLowerCase()} · ${result.paging.consistency.toLowerCase()}`,
            tone: result.paging.selected === "Cursor" ? "info" : "neutral",
            icon:
              result.paging.selected === "Cursor"
                ? UiCursorClick
                : UiListOrdered,
          },
          {
            label: "Inspection metadata",
            value: result.cache.state,
            sub: `${result.cache.age} old`,
            tone: result.cache.state === "Fresh" ? "success" : "warning",
            icon: result.cache.state === "Fresh" ? UiClock : UiWarningCircle,
          },
        ]}
      />

      <section className="overflow-hidden rounded-md border border-border bg-card">
        <div className="border-b border-border px-density-3 py-density-2">
          <h3 className="flex items-center gap-density-2 font-medium">
            <UiFilter className="size-4 text-sky-600 dark:text-sky-400" />
            Fields and resolved filters
          </h3>
          <p className="text-xs text-muted-foreground">
            Backend types, display semantics, and the controls the provider can
            honour.
          </p>
        </div>
        <DataTable<InspectedField>
          data={result.fields}
          columns={fieldColumns}
          getRowId={(field) => field.id}
          emptyMessage="No fields were discovered"
          scrollContainerClassName="max-h-[32rem]"
        />
      </section>

      <div className="grid gap-density-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.2fr)_minmax(18rem,0.75fr)]">
        <DetailSection
          title={`${mode === "connection" ? "Connection" : "Profile"} context`}
          icon={mode === "connection" ? UiDatabase : UiSliders}
          iconClassName="text-violet-600 dark:text-violet-400"
        >
          <Definition label="Provider" value={result.provider} mono />
          <Definition label="Connection" value={result.connection} mono />
          <Definition label={result.scopeLabel} value={result.scope} mono />
          <div className="space-y-density-1">
            <dt className="text-xs font-medium text-muted-foreground">
              Resolved query
            </dt>
            <dd>
              <code className="block max-h-28 overflow-auto whitespace-pre-wrap break-words rounded bg-muted/50 p-density-2 text-xs leading-5">
                {result.query}
              </code>
            </dd>
          </div>
        </DetailSection>

        <DetailSection
          title="Paging resolution"
          icon={
            result.paging.selected === "Cursor" ? UiCursorClick : UiListOrdered
          }
          iconClassName="text-sky-600 dark:text-sky-400"
        >
          <Definition
            label="Selected mode"
            value={
              <Badge size="xxs" tone="info" variant="soft" clickToCopy={false}>
                {result.paging.selected}
              </Badge>
            }
          />
          <Definition
            label="Provider supports"
            value={result.paging.supported.join(" · ")}
          />
          <Definition label="Execution" value={result.paging.execution} />
          <Definition label="Consistency" value={result.paging.consistency} />
          <Definition
            label="Effective order"
            value={result.paging.order}
            mono
          />
          <p className="rounded bg-muted/50 p-density-2 text-xs leading-5 text-muted-foreground">
            {result.paging.note}
          </p>
        </DetailSection>

        <DetailSection
          title="Resolved limits"
          icon={UiSliders}
          iconClassName="text-amber-600 dark:text-amber-400"
        >
          {result.paging.limits.map((limit) => (
            <Definition
              key={limit.label}
              label={limit.label}
              value={
                <div className="text-right">
                  <div className="font-mono font-medium tabular-nums">
                    {formatCount(limit.value)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {limit.origin}
                  </div>
                </div>
              }
            />
          ))}
        </DetailSection>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon: SectionIcon,
  iconClassName,
  children,
}: {
  title: string;
  icon: StaticIconComponent;
  iconClassName: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-density-3 rounded-md border border-border bg-card p-density-3">
      <h3 className="flex items-center gap-density-2 font-medium">
        <SectionIcon className={`size-4 ${iconClassName}`} />
        {title}
      </h3>
      <dl className="space-y-density-2">{children}</dl>
    </section>
  );
}

function Definition({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-density-3 border-b border-border/60 pb-density-2 last:border-0 last:pb-0">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className={`min-w-0 max-w-[70%] break-words text-right text-xs ${mono ? "font-mono" : ""}`}
      >
        {value}
      </dd>
    </div>
  );
}

function filterTone(kind: FilterResolution["kind"]): BadgeTone {
  switch (kind) {
    case "terms":
      return "success";
    case "lookup":
      return "info";
    case "range":
    case "time":
      return "warning";
    case "none":
      return "neutral";
    case "text":
      return "neutral";
  }
}

function semanticVisual(semanticType: string): SemanticVisual {
  return (
    semanticVisuals[semanticType.split(" · ")[0] ?? ""] ??
    fallbackSemanticVisual
  );
}

function providerVisual(provider: string): {
  icon: StaticIconComponent;
  classes: string;
} {
  return provider === "OpenSearch"
    ? {
        icon: UiSearch,
        classes: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
      }
    : {
        icon: UiDatabase,
        classes:
          "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
      };
}

function originTone(origin: FilterResolution["origin"]): BadgeTone {
  switch (origin) {
    case "Profile override":
      return "info";
    case "Disabled":
      return "neutral";
    case "Inferred":
      return "success";
  }
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}
