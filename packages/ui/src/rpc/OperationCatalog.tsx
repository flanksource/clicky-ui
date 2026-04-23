import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import { FilterBar } from "../components/FilterBar";
import { DataTable, inferColumns } from "../data/DataTable";
import { Icon } from "../data/Icon";
import { MethodBadge } from "../data/MethodBadge";
import {
  filterOperationsByDomain,
  findDetailEndpointForList,
  findListEndpoint,
  normalizeRows,
  parseJsonBody,
} from "./classify";
import { EndpointList, type RenderLink } from "./EndpointList";
import {
  type DomainDefinition,
  type ExecutionResponse,
  type OperationLookupResponse,
  type ResolvedOperation,
  isPositionalParam,
} from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";
import {
  packParameterValues,
  parametersToFormConfig,
  useDebouncedRecord,
} from "./formMetadata";

export type OperationCatalogProps = {
  definition: DomainDefinition;
  entities: string[];
  client: OperationsApiClient;
  renderLink: RenderLink;
  // Override to return all operations (e.g. for an "API explorer" domain
  // that shouldn't be filtered by entity tags).
  allOperations?: boolean;
  // Restrict the domain to operationIds with a shared prefix when tags alone
  // are too coarse (for example admin_ or catalog_ surfaces).
  operationIdPrefix?: string;
  // Explicit operation ids for domains whose canonical list/detail routes do
  // not follow the default `<entity>_list` / first-path-param GET pattern.
  listOperationId?: string;
  detailOperationId?: string;
  getEntityHref?: (entityName: string, id: string, row: Record<string, unknown>) => string;
  getCommandHref?: (operationId: string, op: ResolvedOperation) => string;
  renderError?: (err: unknown, title: string) => ReactNode;
  kind?: "operations" | "configuration";
};

const defaultEntityHref = (domainKey: string, id: string) =>
  `/entity/${domainKey}/${encodeURIComponent(id)}`;
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
  operationIdPrefix,
  listOperationId,
  detailOperationId,
  getEntityHref,
  getCommandHref = defaultCommandHref,
  renderError = defaultRenderError,
  kind,
}: OperationCatalogProps) {
  const { operations, isLoading } = useOperations(client);
  const [view, setView] = useState<"table" | "endpoints">("table");

  const domainOps = useMemo(
    () =>
      (allOperations ? operations : filterOperationsByDomain(operations, entities)).filter((op) =>
        operationIdPrefix
          ? (op.operation.operationId ?? "").startsWith(operationIdPrefix)
          : true,
      ),
    [allOperations, entities, operationIdPrefix, operations],
  );

  const listEndpoint = useMemo(
    () =>
      listOperationId
        ? domainOps.find(
            (op) => op.method === "get" && op.operation.operationId === listOperationId,
          )
        : findListEndpoint(domainOps, entities),
    [domainOps, entities, listOperationId],
  );
  const detailEndpoint = useMemo(
    () =>
      detailOperationId
        ? domainOps.find(
            (op) => op.method === "get" && op.operation.operationId === detailOperationId,
          )
        : findDetailEndpointForList(domainOps, listEndpoint),
    [detailOperationId, domainOps, listEndpoint],
  );

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});
  const debouncedDraftFilters = useDebouncedRecord(draftFilters, 250);
  const listParameters = listEndpoint?.operation.parameters ?? [];

  const listQuery = useQuery<ExecutionResponse>({
    queryKey: ["operation-list", listEndpoint?.method, listEndpoint?.path, filters],
    queryFn: () =>
      client.executeCommand(listEndpoint!.path, listEndpoint!.method, packParameterValues(filters, listEndpoint!.operation.parameters ?? []), {
        Accept: "application/json",
      }),
    enabled: !!listEndpoint && view === "table",
    staleTime: 30_000,
    retry: 0,
  });

  const lookupQuery = useQuery<OperationLookupResponse>({
    queryKey: ["operation-lookup", listEndpoint?.method, listEndpoint?.path, debouncedDraftFilters],
    queryFn: async () =>
      (await client.lookupFilters?.(
        listEndpoint!.path,
        listEndpoint!.method,
        packParameterValues(debouncedDraftFilters, listParameters),
        { Accept: "application/json+clicky" },
      )) ?? { filters: {} },
    enabled: !!listEndpoint && view === "table" && !!client.lookupFilters,
    staleTime: 30_000,
    retry: 0,
  });

  const parsedListData = useMemo(() => parseJsonBody(listQuery.data), [listQuery.data]);
  const rows = useMemo(() => normalizeRows(parsedListData), [parsedListData]);
  const columns = useMemo(() => inferColumns(rows), [rows]);

  const actionOps = useMemo(
    () =>
      domainOps.filter(
        (op) =>
          op.method !== "get" &&
          !op.path.includes("{") &&
          !op.operation.parameters?.some((p) => p.in === "path" || isPositionalParam(p)),
      ),
    [domainOps],
  );

  const entityName = useMemo(() => {
    if (!listEndpoint) return "";
    const segments = listEndpoint.path.split("/").filter(Boolean);
    const tail = segments[0] === "api" && segments[1] === "v1" ? segments.slice(2) : segments;
    return tail[tail.length - 1] || "";
  }, [listEndpoint]);

  const getRowHref = useCallback(
    (row: Record<string, unknown>): string | undefined => {
      if (!detailEndpoint || !entityName) return undefined;
      const id = row["_id"] ?? row["id"] ?? row["ID"];
      if (id != null) {
        return getEntityHref
          ? getEntityHref(entityName, String(id), row)
          : defaultEntityHref(definition.key, String(id));
      }
      return undefined;
    },
    [definition.key, detailEndpoint, entityName, getEntityHref],
  );

  const filterBarConfig = useMemo(
    () =>
      parametersToFormConfig(listParameters, draftFilters, setDraftFilters, {
        includeLocations: ["query"],
        lookup: lookupQuery.data,
      }),
    [draftFilters, listParameters, lookupQuery.data],
  );

  const hasTable = !!listEndpoint;
  const showTable = hasTable && view === "table";
  const sectionLabel =
    kind === "configuration" || definition.key.startsWith("config-")
      ? "Configuration"
      : "Operations";

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
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {definition.description}
          </p>
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
              <Icon name="codicon:table" />
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
              <Icon name="codicon:list-flat" />
            </Button>
          </div>
        )}
      </div>

      {actionOps.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {actionOps.map((op) => {
            const commandName = op.operation.operationId || op.path;
            const tooltip = op.operation.description
              ? `${commandName} — ${op.operation.description}`
              : commandName;
            return renderLink({
              key: `${op.method}:${op.path}`,
              to: getCommandHref(op.operation.operationId ?? commandName, op),
              title: tooltip,
              className:
                "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              children: (
                <>
                  <Icon name="codicon:add" className="text-xs" />
                  {op.operation.summary || commandName}
                </>
              ),
            });
          })}
        </div>
      )}

      {showTable ? (
        <>
          {(filterBarConfig.filters.length > 0 || filterBarConfig.timeRange != null) && (
            <FilterBar
              autoSubmit={false}
              isPending={listQuery.isFetching}
              filters={filterBarConfig.filters}
              timeRange={filterBarConfig.timeRange}
              onApply={() => setFilters(draftFilters)}
            />
          )}
          {listQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} className="h-10" />
              ))}
            </div>
          ) : listQuery.isError ? (
            renderError(listQuery.error, `Failed to load ${listEndpoint?.path ?? ""}`)
          ) : rows.length > 0 ? (
            <DataTable
              data={rows}
              columns={columns}
              getRowHref={detailEndpoint ? getRowHref : undefined}
            />
          ) : listQuery.data ? (
            <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              No records returned
            </div>
          ) : null}
        </>
      ) : (
        <EndpointList
          operations={domainOps}
          definition={definition}
          renderLink={renderLink}
          getCommandHref={getCommandHref}
        />
      )}
    </div>
  );
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`.trim()} />;
}
