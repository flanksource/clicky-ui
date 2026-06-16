import { useEffect, useMemo, useState, type ReactNode } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { UiAdd, UiListFlat, UiTable } from "../icons";
import { MethodBadge } from "../data/MethodBadge";
import { Modal } from "../overlay/Modal";
import { filterOperationsByDomain } from "./classify";
import {
  filterOperationsBySurface,
  findSurfaceActions,
  findSurfaceListOperation,
  getOperationClickyMeta,
  surfaceActionLabel,
} from "./clickyMetadata";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { EndpointList, type RenderLink } from "./EndpointList";
import { ExecutionResult } from "./ExecutionResult";
import { FilterForm } from "./FilterForm";
import { applyFilterExtensions, type FilterExtension } from "../components/filter-bar-utils";
import {
  type DomainDefinition,
  type ExecutionResponse,
  type OperationLookupResponse,
  type ResolvedOperation,
} from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";
import {
  dataTablePaginationFromForm,
  packParameterValues,
  parametersToFormConfig,
  type ParameterFormOptions,
} from "./formMetadata";

export type OperationCatalogProps = {
  definition: DomainDefinition;
  entities: string[];
  client: OperationsApiClient;
  renderLink: RenderLink;
  // Override to return all operations (e.g. for an "API explorer" domain
  // that shouldn't be filtered by entity tags).
  allOperations?: boolean;
  surfaceKey?: string;
  // Domain-specific filter decorators (e.g. stamp an entity icon by filter
  // name). Composed in array order; mirrors JsonSchemaForm's `pre`.
  filterPre?: FilterExtension[];
  getCommandHref?: (operationId: string, op: ResolvedOperation) => string;
  renderError?: (err: unknown, title: string) => ReactNode;
  kind?: "operations" | "configuration";
  commandRuntime?: ClickyCommandRuntime;
};

const defaultCommandHref = (operationId: string) => `/commands/${operationId}`;

function defaultRenderError(err: unknown, title: string) {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
      <div className="font-medium">{title}</div>
      {message && <div className="mt-1 whitespace-pre-wrap text-xs opacity-80">{message}</div>}
    </div>
  );
}

export function OperationCatalog({
  definition,
  entities,
  client,
  renderLink,
  allOperations = false,
  surfaceKey,
  filterPre,
  getCommandHref = defaultCommandHref,
  renderError = defaultRenderError,
  kind,
  commandRuntime,
}: OperationCatalogProps) {
  const { operations, isLoading } = useOperations(client);
  const [view, setView] = useState<"table" | "endpoints">("table");
  const [activeAction, setActiveAction] = useState<ResolvedOperation | null>(null);
  const [actionResult, setActionResult] = useState<ExecutionResponse | null>(null);
  const [actionError, setActionError] = useState("");
  const [isExecutingAction, setIsExecutingAction] = useState(false);

  const surfaceOps = useMemo(
    () => filterOperationsBySurface(operations, surfaceKey),
    [operations, surfaceKey],
  );
  const useSurfaceMetadata = surfaceOps.length > 0;

  // domainOps are the operations scoped to this domain: a surface's operations
  // when surfaceKey resolves, otherwise the entity-tagged operations — used only
  // to render the generic operation-page fallback, never to guess a table.
  const domainOps = useMemo(() => {
    if (useSurfaceMetadata) return surfaceOps;
    return allOperations ? operations : filterOperationsByDomain(operations, entities);
  }, [allOperations, entities, operations, surfaceOps, useSurfaceMetadata]);

  // The list table is driven solely by x-clicky surface metadata. Without a
  // surface there is no authoritative list op, so listEndpoint stays undefined
  // and the catalog renders the generic EndpointList fallback instead of
  // guessing a table from operationId/path conventions.
  const listEndpoint = useMemo(() => {
    if (!useSurfaceMetadata) return undefined;
    return findSurfaceListOperation(domainOps, surfaceKey);
  }, [domainOps, surfaceKey, useSurfaceMetadata]);
  const [filters, setFilters] = useState<Record<string, string>>(() => readFiltersFromUrl());
  const listParameters = listEndpoint?.operation.parameters ?? [];

  useEffect(() => {
    writeFiltersToUrl(filters);
  }, [filters]);

  const listQuery = useQuery<ExecutionResponse>({
    queryKey: ["operation-list", listEndpoint?.method, listEndpoint?.path, filters],
    queryFn: () =>
      client.executeCommand(
        listEndpoint!.path,
        listEndpoint!.method,
        packParameterValues(filters, listEndpoint!.operation.parameters ?? []),
        {
          Accept: "application/json+clicky",
        },
      ),
    enabled: !!listEndpoint && view === "table",
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 0,
  });

  const lookupQuery = useQuery<OperationLookupResponse>({
    queryKey: ["operation-lookup", listEndpoint?.method, listEndpoint?.path, filters],
    queryFn: async () =>
      (await client.lookupFilters?.(
        listEndpoint!.path,
        listEndpoint!.method,
        packParameterValues(filters, listParameters),
        { Accept: "application/json+clicky" },
      )) ?? { filters: {} },
    enabled: !!listEndpoint && view === "table" && !!client.lookupFilters,
    staleTime: 30_000,
    retry: 0,
  });

  // Action buttons come only from surface metadata. In the generic fallback the
  // EndpointList already exposes every operation as a runnable card, so there is
  // no separate action bar to guess at.
  const actionOps = useMemo(
    () => (useSurfaceMetadata ? findSurfaceActions(domainOps, surfaceKey) : []),
    [domainOps, surfaceKey, useSurfaceMetadata],
  );

  const filterBarConfig = useMemo(() => {
    const options: ParameterFormOptions = {
      includeLocations: ["query"],
    };
    if (lookupQuery.data != null) {
      options.lookup = lookupQuery.data;
    }
    return parametersToFormConfig(listParameters, filters, setFilters, options);
  }, [filters, listParameters, lookupQuery.data]);
  const dataTablePagination = useMemo(
    () => dataTablePaginationFromForm(filterBarConfig.pagination, listQuery.data),
    [filterBarConfig.pagination, listQuery.data],
  );
  const decoratedFilters = useMemo(
    () => filterBarConfig.filters.map((filter) => applyFilterExtensions(filter, filterPre)),
    [filterBarConfig.filters, filterPre],
  );

  const hasTable = !!listEndpoint;
  const showTable = hasTable && view === "table";
  const sectionLabel =
    kind === "configuration" || definition.key.startsWith("config-")
      ? "Configuration"
      : "Operations";
  const activeActionMeta = activeAction ? getOperationClickyMeta(activeAction) : undefined;

  const actionLockedValues = useMemo(() => {
    const meta = activeActionMeta;
    if (!activeAction || meta == null || !meta.supportsFilterMode) {
      return {};
    }

    const locked: Record<string, string> = {};
    for (const param of activeAction.operation.parameters ?? []) {
      const value = filters[param.name];
      if (param.in === "query" && value) {
        locked[param.name] = value;
      }
    }

    if (meta.idParam) {
      locked[meta.idParam] = "all";
    }

    if ((activeAction.operation.parameters ?? []).some((param) => param.name === "filter")) {
      locked.filter =
        Object.entries(filters)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}=${value}`)
          .join(", ") || "current list filters";
    }

    return locked;
  }, [activeAction, activeActionMeta, filters]);

  async function executeAction(values: Record<string, string>) {
    if (!activeAction) return;
    setIsExecutingAction(true);
    setActionError("");

    try {
      const response = await client.executeCommand(
        activeAction.path,
        activeAction.method,
        packParameterValues(values, activeAction.operation.parameters ?? []),
        { Accept: "application/json+clicky" },
      );
      setActionResult(response);
      await listQuery.refetch();
    } catch (err) {
      setActionResult(null);
      setActionError(err instanceof Error ? err.message : String(err ?? "Unknown error"));
    } finally {
      setIsExecutingAction(false);
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <SkeletonBlock className="h-10 w-72" />
        <SkeletonBlock className="h-4 w-[32rem]" />
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBlock key={i} className="h-12" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {sectionLabel}
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{definition.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{definition.description}</p>
        </div>
        {hasTable && (
          <div className="flex gap-1 rounded-lg border p-1">
            <Button
              type="button"
              variant={view === "table" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Table view"
              aria-pressed={view === "table"}
              onClick={() => setView("table")}
            >
              <Icon icon={UiTable} />
            </Button>
            <Button
              type="button"
              variant={view === "endpoints" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 w-7 p-0"
              aria-label="Endpoint list view"
              aria-pressed={view === "endpoints"}
              onClick={() => setView("endpoints")}
            >
              <Icon icon={UiListFlat} />
            </Button>
          </div>
        )}
      </div>

      {actionOps.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actionOps.map((op) => {
            const label = surfaceActionLabel(op);
            const summary = op.operation.summary || op.operation.description;
            const tooltip = summary ? `${label} — ${summary}` : label;
            // Every action opens the execution dialog (Modal) inline — the
            // FilterForm collects params (including any id an entity-scoped
            // action needs) and the result renders without leaving the list.
            return (
              <Button
                key={`${op.method}:${op.path}`}
                type="button"
                variant="outline"
                size="sm"
                title={tooltip}
                onClick={() => {
                  setActiveAction(op);
                  setActionResult(null);
                  setActionError("");
                }}
              >
                <Icon icon={UiAdd} className="text-xs" />
                {label}
              </Button>
            );
          })}
        </div>
      )}

      {showTable ? (
        <>
          {listQuery.isError && !listQuery.data ? (
            renderError(listQuery.error, `Failed to load ${listEndpoint?.path ?? ""}`)
          ) : (
            <ExecutionResult
              response={listQuery.data ?? null}
              loading={listQuery.isFetching}
              loadingMessage={`Loading ${definition.title} results…`}
              emptyMessage="No records returned"
              ariaLabel={`${definition.title} results`}
              className="mt-0"
              {...(commandRuntime ? { commandRuntime } : {})}
              {...(filterBarConfig.search ? { search: filterBarConfig.search } : {})}
              {...(filterBarConfig.timeRange ? { timeRange: filterBarConfig.timeRange } : {})}
              {...(decoratedFilters.length > 0
                ? { externalFilters: decoratedFilters }
                : {})}
              {...(dataTablePagination ? { pagination: dataTablePagination } : {})}
            />
          )}
        </>
      ) : (
        <EndpointList
          operations={domainOps}
          definition={definition}
          renderLink={renderLink}
          getCommandHref={getCommandHref}
        />
      )}

      <Modal
        open={activeAction != null}
        onClose={() => setActiveAction(null)}
        title={
          activeAction?.operation.summary ||
          activeActionMeta?.actionName ||
          activeAction?.operation.operationId ||
          "Action"
        }
        size="lg"
      >
        {activeAction && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <MethodBadge method={activeAction.method} />
              <code className="rounded-md bg-muted px-2 py-1 text-sm">{activeAction.path}</code>
            </div>
            <FilterForm
              client={client}
              path={activeAction.path}
              method={activeAction.method}
              parameters={activeAction.operation.parameters ?? []}
              lockedValues={actionLockedValues}
              enableLookup={Boolean(activeActionMeta?.supportsLookup)}
              submitLabel="Execute request"
              submittingLabel="Executing…"
              isSubmitting={isExecutingAction}
              onSubmit={executeAction}
            />
            {actionError ? (
              <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
                {actionError}
              </div>
            ) : actionResult ? (
              <ExecutionResult
                response={actionResult}
                className="mt-0"
                {...(commandRuntime ? { commandRuntime } : {})}
              />
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}

function readFiltersFromUrl(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const search = new URLSearchParams(window.location.search);
  const values: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    if (key.startsWith("__")) continue;
    if (value !== "") values[key] = value;
  }
  return values;
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`.trim()} />;
}

function writeFiltersToUrl(filters: Record<string, string>) {
  if (typeof window === "undefined") return;
  const search = reservedSearchParamsFromUrl();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== "") search.set(key, value);
  }
  const query = search.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
    window.history.replaceState(window.history.state, "", next);
  }
}

function reservedSearchParamsFromUrl() {
  const current = new URLSearchParams(window.location.search);
  const next = new URLSearchParams();
  for (const [key, value] of current.entries()) {
    if (!key.startsWith("__")) continue;
    if (key === "__autoRun" || key.startsWith("__arg")) continue;
    next.append(key, value);
  }
  return next;
}
