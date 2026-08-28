import { useMemo, useState } from "react";
import type { FilterBarFilter } from "../../../components/FilterBar";
import { cn } from "../../../lib/utils";
import { Badge } from "../../Badge";
import { DataTable, type DataTableColumn } from "../../DataTable";
import {
  catalogFilterOptions,
  entryMatches,
  previewText,
  provenanceSummary,
  runtimeSummary,
  sourceLabel,
} from "./prompt-catalog-model";
import { PromptSourceBadge } from "./PromptSourceBadge";
import type {
  PromptCatalogEntry,
  PromptCatalogFilterState,
  PromptCatalogRuntime,
} from "./types";

export type PromptCatalogTableProps = {
  entries: PromptCatalogEntry[];
  loading?: boolean | undefined;
  error?: string | null | undefined;
  emptyMessage?: string | undefined;
  selectedId?: string | undefined;
  onSelect?: ((entry: PromptCatalogEntry) => void) | undefined;
  getRowHref?: ((entry: PromptCatalogEntry) => string) | undefined;
  filterState?: PromptCatalogFilterState | undefined;
  onFilterStateChange?: ((state: PromptCatalogFilterState) => void) | undefined;
  showOwner?: boolean | undefined;
  className?: string | undefined;
};

type PromptCatalogRow = {
  id: string;
  entry: PromptCatalogEntry;
  title: string;
  owner: string;
  usedBy: string;
  source: string;
  model: string;
  overrides: string;
  variables: string;
  version: string;
} & Record<string, unknown>;

function toRow(entry: PromptCatalogEntry): PromptCatalogRow {
  return {
    id: entry.id,
    entry,
    title: entry.title,
    owner: entry.owner,
    usedBy: (entry.usedBy ?? []).join(", "),
    source: sourceLabel(entry.source),
    model: entry.effective.model ?? "",
    overrides: provenanceSummary(entry),
    variables: (entry.variables ?? []).join(", "),
    version: entry.version ?? "",
  };
}

function Chips({ values }: { values: string[] }) {
  if (values.length === 0)
    return <span className="text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {values.map((value) => (
        <Badge
          key={value}
          variant="soft"
          tone="neutral"
          size="xs"
          className="font-mono"
          clickToCopy={false}
        >
          {value}
        </Badge>
      ))}
    </div>
  );
}

function PromptCell({ entry }: { entry: PromptCatalogEntry }) {
  const secondary = entry.description || previewText(entry.body);
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="truncate font-medium">{entry.title}</span>
      <span className="truncate font-mono text-xs text-muted-foreground">
        {entry.id}
      </span>
      {secondary ? (
        <span
          className="line-clamp-1 text-xs text-muted-foreground"
          title={secondary}
        >
          {secondary}
        </span>
      ) : null}
    </div>
  );
}

function ModelCell({ runtime }: { runtime: PromptCatalogRuntime }) {
  const summary = runtimeSummary(runtime);
  if (runtime.error) {
    return (
      <span className="text-xs text-destructive" title={runtime.error}>
        {summary}
      </span>
    );
  }
  if (!runtime.model)
    return <span className="text-xs text-muted-foreground">{summary}</span>;
  return (
    <span className="font-mono text-xs" title={`from ${runtime.modelSource}`}>
      {summary}
    </span>
  );
}

function catalogColumns(
  showOwner: boolean,
): DataTableColumn<PromptCatalogRow>[] {
  const columns: DataTableColumn<PromptCatalogRow>[] = [
    {
      key: "title",
      label: "Prompt",
      sortable: true,
      grow: true,
      minWidth: 240,
      render: (_, row) => <PromptCell entry={row.entry} />,
    },
  ];
  if (showOwner)
    columns.push({
      key: "owner",
      label: "Owner",
      sortable: true,
      shrink: true,
    });
  columns.push(
    {
      key: "usedBy",
      label: "Used by",
      minWidth: 180,
      render: (_, row) => <Chips values={row.entry.usedBy ?? []} />,
    },
    {
      key: "source",
      label: "Source",
      sortable: true,
      shrink: true,
      render: (_, row) => (
        <PromptSourceBadge
          source={row.entry.source}
          parseError={row.entry.parseError}
        />
      ),
    },
    {
      key: "model",
      label: "Model",
      sortable: true,
      minWidth: 200,
      render: (_, row) => <ModelCell runtime={row.entry.effective} />,
    },
    {
      key: "overrides",
      label: "Overrides",
      minWidth: 180,
      render: (value) =>
        value ? (
          <span className="text-xs">{String(value)}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "variables",
      label: "Variables",
      minWidth: 160,
      render: (_, row) => <Chips values={row.entry.variables ?? []} />,
    },
    {
      key: "version",
      label: "Version",
      shrink: true,
      render: (value) => (
        <span className="font-mono text-xs text-muted-foreground">
          {String(value ?? "").slice(0, 8)}
        </span>
      ),
    },
  );
  return columns;
}

// PromptCatalogTable lists every prompt a host runs with the document that
// actually runs, its runtime, and which config layer overrides it. Filtering is
// done here (not by the DataTable) so the facets reflect the catalog's own
// vocabulary: commands, sources, effective models.
export function PromptCatalogTable({
  entries,
  loading,
  error,
  emptyMessage,
  selectedId,
  onSelect,
  getRowHref,
  filterState,
  onFilterStateChange,
  showOwner,
  className,
}: PromptCatalogTableProps) {
  const [internalFilterState, setInternalFilterState] =
    useState<PromptCatalogFilterState>(() => ({
      query: "",
      commands: [],
      sources: [],
      models: [],
      owners: [],
      overriddenOnly: false,
    }));
  const activeFilters = filterState ?? internalFilterState;
  const updateFilter = <Key extends keyof PromptCatalogFilterState>(
    key: Key,
    value: PromptCatalogFilterState[Key],
  ) => {
    const next = { ...activeFilters, [key]: value };
    if (filterState === undefined) setInternalFilterState(next);
    onFilterStateChange?.(next);
  };
  const { query, commands, sources, models, owners, overriddenOnly } =
    activeFilters;

  const options = useMemo(() => catalogFilterOptions(entries), [entries]);
  const showOwnerColumn = showOwner ?? options.owners.length > 1;
  const columns = useMemo(
    () => catalogColumns(showOwnerColumn),
    [showOwnerColumn],
  );
  const rows = useMemo(
    () =>
      entries
        .filter((entry) =>
          entryMatches(entry, {
            query,
            commands,
            sources,
            models,
            owners,
            overriddenOnly,
          }),
        )
        .map(toRow),
    [commands, entries, models, overriddenOnly, owners, query, sources],
  );

  const filters: FilterBarFilter[] = [
    {
      key: "commands",
      kind: "select-multi",
      label: "Used by",
      value: commands,
      options: options.commands.map((value) => ({ value, label: value })),
      onChange: (value) => updateFilter("commands", value),
    },
    {
      key: "sources",
      kind: "select-multi",
      label: "Source",
      value: sources,
      options: options.sources.map((value) => ({
        value,
        label: sourceLabel(value),
      })),
      onChange: (value) =>
        updateFilter(
          "sources",
          value.map((selected) => {
            const source = options.sources.find(
              (candidate) => candidate === selected,
            );
            if (!source)
              throw new Error(
                `unknown prompt source ${JSON.stringify(selected)}`,
              );
            return source;
          }),
        ),
    },
    {
      key: "models",
      kind: "select-multi",
      label: "Model",
      value: models,
      options: options.models.map((value) => ({ value, label: value })),
      onChange: (value) => updateFilter("models", value),
    },
  ];
  if (options.owners.length > 1) {
    filters.push({
      key: "owners",
      kind: "select-multi",
      label: "Owner",
      value: owners,
      options: options.owners.map((value) => ({ value, label: value })),
      onChange: (value) => updateFilter("owners", value),
    });
  }
  filters.push({
    key: "overridden",
    kind: "boolean",
    label: "Overridden only",
    value: overriddenOnly,
    onChange: (value) => updateFilter("overriddenOnly", value),
  });

  return (
    <DataTable<PromptCatalogRow>
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      autoFilter={false}
      showGlobalFilter={false}
      manualFilter
      externalSearch={{
        value: query,
        onChange: (value) => updateFilter("query", value),
        placeholder: "Search prompts, commands, body…",
        ariaLabel: "Search prompts",
      }}
      externalFilters={filters}
      {...(loading !== undefined ? { loading } : {})}
      {...(error ? { error } : {})}
      emptyMessage={emptyMessage ?? "No prompts match"}
      {...(onSelect
        ? { onRowClick: (row: PromptCatalogRow) => onSelect(row.entry) }
        : {})}
      {...(getRowHref
        ? { getRowHref: (row: PromptCatalogRow) => getRowHref(row.entry) }
        : {})}
      getRowClassName={(row) =>
        row.id === selectedId ? "bg-primary/5" : undefined
      }
      className={cn("min-h-0 flex-1", className)}
    />
  );
}
