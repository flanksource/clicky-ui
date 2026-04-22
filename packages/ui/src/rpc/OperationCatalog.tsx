import {
  useCallback,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import {
  FilterBar,
  type FilterBarFilter,
} from "../components/FilterBar";
import { DataTable, inferColumns } from "../data/DataTable";
import { Icon } from "../data/Icon";
import { MethodBadge } from "../data/MethodBadge";
import {
  filterOperationsByDomain,
  findDetailEndpoint,
  findListEndpoint,
  normalizeRows,
  parseJsonBody,
} from "./classify";
import { EndpointList, type RenderLink } from "./EndpointList";
import {
  isPositionalParam,
  type DomainDefinition,
  type ExecutionResponse,
  type OpenAPIParameter,
  type ResolvedOperation,
} from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";

export type OperationCatalogProps = {
  definition: DomainDefinition;
  entities: string[];
  client: OperationsApiClient;
  renderLink: RenderLink;
  // Override to return all operations (e.g. for an "API explorer" domain
  // that shouldn't be filtered by entity tags).
  allOperations?: boolean;
  getEntityHref?: (entityName: string, id: string, row: Record<string, unknown>) => string;
  getCommandHref?: (operationId: string, op: ResolvedOperation) => string;
  renderError?: (err: unknown, title: string) => ReactNode;
  kind?: "operations" | "configuration";
};

const defaultEntityHref = (entityName: string, id: string) =>
  `/entity/${entityName}/${encodeURIComponent(id)}`;
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
  getEntityHref = defaultEntityHref,
  getCommandHref = defaultCommandHref,
  renderError = defaultRenderError,
  kind,
}: OperationCatalogProps) {
  const { operations, isLoading } = useOperations(client);
  const [view, setView] = useState<"table" | "endpoints">("table");

  const domainOps = useMemo(
    () =>
      allOperations
        ? operations
        : filterOperationsByDomain(operations, entities),
    [allOperations, entities, operations],
  );

  const listEndpoint = useMemo(
    () => findListEndpoint(domainOps, entities),
    [domainOps, entities],
  );
  const detailEndpoint = useMemo(() => findDetailEndpoint(domainOps), [domainOps]);

  const [filters, setFilters] = useState<Record<string, string>>({});
  const [draftFilters, setDraftFilters] = useState<Record<string, string>>({});

  const listQuery = useQuery<ExecutionResponse>({
    queryKey: ["operation-list", listEndpoint?.method, listEndpoint?.path, filters],
    queryFn: () =>
      client.executeCommand(
        listEndpoint!.path,
        listEndpoint!.method,
        packFilters(filters, listEndpoint!.operation.parameters ?? []),
        { Accept: "application/json" },
      ),
    enabled: !!listEndpoint && view === "table",
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
    const match = listEndpoint.path.match(/\/api\/v1\/([^/]+)/);
    return match?.[1] || "";
  }, [listEndpoint]);

  const getRowHref = useCallback(
    (row: Record<string, unknown>): string | undefined => {
      if (!detailEndpoint || !entityName) return undefined;
      const id = row["_id"] ?? row["id"] ?? row["ID"];
      if (id != null) {
        return getEntityHref(entityName, String(id), row);
      }
      return undefined;
    },
    [detailEndpoint, entityName, getEntityHref],
  );

  const listParameters = listEndpoint?.operation.parameters ?? [];
  const filterBarFilters = useMemo(
    () => parametersToFilters(listParameters, draftFilters, setDraftFilters),
    [listParameters, draftFilters],
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
          {filterBarFilters.length > 0 && (
            <FilterBar
              autoSubmit={false}
              isPending={listQuery.isFetching}
              filters={filterBarFilters}
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

// parametersToFilters maps OpenAPI query parameters to FilterBar filter
// definitions. Positional params (name === "args" or description hints) are
// packed into the `args` field at submit time by packFilters; they are also
// editable as text filters so operators can fill them in.
function parametersToFilters(
  parameters: OpenAPIParameter[],
  values: Record<string, string>,
  setValues: (next: Record<string, string>) => void,
): FilterBarFilter[] {
  const emitFilters: FilterBarFilter[] = [];

  for (const param of parameters) {
    if (param.in !== "query") continue;

    const value = values[param.name] ?? "";
    const onChange = (next: string | boolean) => {
      const stringValue = typeof next === "boolean" ? (next ? "true" : "false") : next;
      setValues({ ...values, [param.name]: stringValue });
    };

    const schema = param.schema;

    if (schema?.enum) {
      emitFilters.push({
        key: param.name,
        kind: "enum",
        label: param.name,
        value,
        options: schema.enum.map((item) => ({
          value: String(item),
          label: String(item),
        })),
        onChange: (v) => onChange(v),
      });
      continue;
    }

    if (schema?.type === "boolean") {
      emitFilters.push({
        key: param.name,
        kind: "boolean",
        label: param.name,
        value: value === "true",
        onChange: (v) => onChange(v),
      });
      continue;
    }

    emitFilters.push({
      key: param.name,
      kind: "text",
      label: param.name,
      value,
      placeholder: param.description ?? param.name,
      onChange: (v) => onChange(v),
    });
  }

  return emitFilters;
}

// packFilters collapses user-entered parameter values into the shape the
// clicky-rpc execute endpoint expects: positional params become a
// comma-joined `args` field, non-empty query params pass through by name.
function packFilters(
  values: Record<string, string>,
  parameters: OpenAPIParameter[],
): Record<string, string> {
  const positionalNames = new Set(
    parameters.filter(isPositionalParam).map((p) => p.name),
  );
  const params: Record<string, string> = {};
  const args: string[] = [];
  for (const [key, value] of Object.entries(values)) {
    if (!value) continue;
    if (positionalNames.has(key)) {
      args.push(value);
    } else {
      params[key] = value;
    }
  }
  if (args.length > 0) params.args = args.join(",");
  return params;
}
