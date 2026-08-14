import { useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { MethodBadge } from "../data/MethodBadge";
import { filterOperationsByDomain, findDetailEndpointForList, findListEndpoint } from "./classify";
import {
  filterOperationsBySurface,
  findSurfaceDetailOperation,
  findSurfaceEntityActions,
  findSurfaceListOperation,
} from "./clickyMetadata";
import { resolveSurfaceIcon } from "./surfaceIconMap";
import { ExecutionResult } from "./ExecutionResult";
import { OperationActionBar } from "./OperationActionBar";
import { renderOperationError } from "./operationErrorDiagnostics";
import { type FormActionsRenderer } from "./SchemaActionForm";
import type { RenderLink } from "./EndpointList";
import type { PreExtension, PostExtension } from "../components/json-schema-form-types";
import type { DomainDefinition } from "./types";
import type { ExecutionResponse } from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";

export type EntityDetailBodyRenderContext = {
  id: string;
  surfaceKey?: string;
  entity?: Record<string, unknown>;
  response: ExecutionResponse | null;
  defaultView: ReactNode;
};

export type EntityDetailBodyRenderer = (context: EntityDetailBodyRenderContext) => ReactNode;

export type EntityDetailHeaderRenderContext = {
  id: string;
  surfaceKey?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultHeader: ReactNode;
};

export type EntityDetailHeaderRenderer = (context: EntityDetailHeaderRenderContext) => ReactNode;

export type OperationEntityPageProps = {
  id?: string;
  definition: DomainDefinition;
  entities: string[];
  client: OperationsApiClient;
  renderLink?: RenderLink;
  allOperations?: boolean;
  operationIdPrefix?: string;
  listOperationId?: string;
  detailOperationId?: string;
  surfaceKey?: string;
  backHref?: string;
  backLabel?: string;
  renderError?: (err: unknown, title: string) => ReactNode;
  commandRuntime?: ClickyCommandRuntime;
  // Custom JsonSchemaForm field extensions forwarded to the edit form.
  formPre?: PreExtension[];
  formPost?: PostExtension[];
  // Optional extra footer actions for the edit form (e.g. a connection "Test"
  // button).
  formActions?: FormActionsRenderer;
  actionLabels?: Record<string, string>;
  /**
   * Replaces the detail body after the entity has loaded while leaving the
   * explorer-owned heading and entity actions in place. Hosts can use this for
   * connection browsers and other entity-specific workspaces.
   */
  entityDetailBodyRenderer?: EntityDetailBodyRenderer;
  /**
   * Replaces the explorer-owned "{title}: {id}" heading while leaving the back
   * link, method badge, and entity actions in place. Hosts use this for compact
   * entity summaries (e.g. a connection's name, endpoint, and server version).
   */
  entityDetailHeaderRenderer?: EntityDetailHeaderRenderer;
};

export function OperationEntityPage({
  id,
  definition,
  entities,
  client,
  renderLink,
  allOperations = false,
  operationIdPrefix,
  listOperationId,
  detailOperationId,
  surfaceKey,
  backHref,
  backLabel = "Back",
  renderError = renderOperationError,
  commandRuntime,
  formPre,
  formPost,
  formActions,
  actionLabels,
  entityDetailBodyRenderer,
  entityDetailHeaderRenderer,
}: OperationEntityPageProps) {
  const { operations, isLoading } = useOperations(client);
  const surfaceOps = useMemo(
    () => filterOperationsBySurface(operations, surfaceKey),
    [operations, surfaceKey],
  );
  const useSurfaceMetadata = surfaceOps.length > 0;

  const domainOps = useMemo(() => {
    if (useSurfaceMetadata) {
      return surfaceOps;
    }

    return (allOperations ? operations : filterOperationsByDomain(operations, entities)).filter(
      (op) =>
        operationIdPrefix ? (op.operation.operationId ?? "").startsWith(operationIdPrefix) : true,
    );
  }, [allOperations, entities, operationIdPrefix, operations, surfaceOps, useSurfaceMetadata]);

  const listEndpoint = useMemo(() => {
    if (useSurfaceMetadata) {
      return findSurfaceListOperation(domainOps, surfaceKey);
    }

    const explicitList = listOperationId
      ? domainOps.find((op) => op.method === "get" && op.operation.operationId === listOperationId)
      : undefined;
    return explicitList ?? findListEndpoint(domainOps, entities);
  }, [domainOps, entities, listOperationId, surfaceKey, useSurfaceMetadata]);

  const resolvedDetailEndpoint = useMemo(() => {
    if (useSurfaceMetadata) {
      return findSurfaceDetailOperation(domainOps, surfaceKey);
    }

    return detailOperationId
      ? domainOps.find(
          (op) => op.method === "get" && op.operation.operationId === detailOperationId,
        )
      : findDetailEndpointForList(domainOps, listEndpoint);
  }, [detailOperationId, domainOps, listEndpoint, surfaceKey, useSurfaceMetadata]);

  const idParameterName = useMemo(
    () =>
      resolvedDetailEndpoint?.operation.parameters?.find((param) => param.in === "path")?.name ??
      "id",
    [resolvedDetailEndpoint],
  );
  const detailValues = useMemo(() => (id ? { [idParameterName]: id } : {}), [id, idParameterName]);
  const actionOps = useMemo(() => {
    if (useSurfaceMetadata) {
      return findSurfaceEntityActions(domainOps, surfaceKey);
    }

    return resolvedDetailEndpoint == null
      ? []
      : domainOps.filter(
          (op) => op.method !== "get" && op.path.startsWith(`${resolvedDetailEndpoint.path}/`),
        );
  }, [domainOps, resolvedDetailEndpoint, surfaceKey, useSurfaceMetadata]);

  const detailQuery = useQuery({
    queryKey: ["entity-detail", definition.key, id, resolvedDetailEndpoint?.path],
    queryFn: async () =>
      client.executeCommand(
        resolvedDetailEndpoint!.path,
        resolvedDetailEndpoint!.method,
        detailValues,
        { Accept: "application/json+clicky" },
      ),
    enabled: !!resolvedDetailEndpoint && !!id,
    staleTime: 30_000,
    retry: 0,
  });

  // Raw (non-clicky) detail used to pre-fill the schema-driven edit form. Only
  // resources whose detail endpoint returns a plain object (e.g. connections)
  // prefill; others (e.g. a profile detail that returns rows) start blank.
  const rawDetailQuery = useQuery({
    queryKey: ["entity-detail-raw", definition.key, id, resolvedDetailEndpoint?.path],
    queryFn: async () =>
      client.executeCommand(resolvedDetailEndpoint!.path, resolvedDetailEndpoint!.method, detailValues, {
        Accept: "application/json",
      }),
    enabled: !!resolvedDetailEndpoint && !!id,
    staleTime: 30_000,
    retry: 0,
  });
  const editInitialValue = useMemo(() => {
    const parsed = rawDetailQuery.data?.parsed;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : undefined;
  }, [rawDetailQuery.data]);

  const backLink =
    backHref == null ? null : renderLink ? (
      renderLink({
        to: backHref,
        className: "text-sm text-primary underline-offset-4 hover:underline",
        children: backLabel,
      })
    ) : (
      <a href={backHref} className="text-sm text-primary underline-offset-4 hover:underline">
        {backLabel}
      </a>
    );

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading entity…</div>;
  }

  if (!resolvedDetailEndpoint || !id) {
    return (
      <div className="space-y-4">
        {backLink}
        <div className="text-sm text-muted-foreground">Unknown entity detail route.</div>
      </div>
    );
  }

  const defaultDetailBody = (
    <section className="rounded-xl border bg-card p-4">
      <h2 className="text-lg font-medium">Entity detail</h2>
      <ExecutionResult
        response={detailQuery.data ?? null}
        {...(commandRuntime ? { commandRuntime } : {})}
      />
    </section>
  );

  const defaultHeader = (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">
        {definition.title}: {id}
      </h1>
      <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{definition.description}</p>
    </div>
  );
  const SurfaceIcon = resolveSurfaceIcon(definition.icon);
  const surfaceIcon = SurfaceIcon ? <SurfaceIcon className="h-6 w-6 shrink-0" /> : undefined;
  const entityHeader =
    entityDetailHeaderRenderer?.({
      id,
      ...(surfaceKey ? { surfaceKey } : {}),
      title: definition.title,
      ...(definition.description ? { description: definition.description } : {}),
      ...(surfaceIcon ? { icon: surfaceIcon } : {}),
      defaultHeader,
    }) ?? defaultHeader;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          {backLink}
          <div className="flex items-center gap-3">
            <MethodBadge method={resolvedDetailEndpoint.method} />
            <code className="rounded-md bg-muted px-2 py-1 text-sm">
              {resolvedDetailEndpoint.path}
            </code>
          </div>
          {entityHeader}
        </div>
      </div>

      {!rawDetailQuery.isLoading && (
        <OperationActionBar
          actions={actionOps}
          client={client}
          getLockedValues={() => ({ [idParameterName]: id })}
          onExecuted={async () => {
            await Promise.all([detailQuery.refetch(), rawDetailQuery.refetch()]);
          }}
          hideLockedInForm
          {...(editInitialValue ? { initialValue: editInitialValue } : {})}
          {...(commandRuntime ? { commandRuntime } : {})}
          {...(formPre ? { formPre } : {})}
          {...(formPost ? { formPost } : {})}
          {...(formActions ? { formActions } : {})}
          {...(actionLabels ? { actionLabels } : {})}
        />
      )}

      {detailQuery.isLoading ? (
        <section className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-medium">Entity detail</h2>
          <ExecutionResult loading loadingMessage="Loading entity detail…" />
        </section>
      ) : detailQuery.isError ? (
        renderError(detailQuery.error, `Failed to load ${resolvedDetailEndpoint.path}`)
      ) : (
        entityDetailBodyRenderer?.({
          id,
          ...(surfaceKey ? { surfaceKey } : {}),
          ...(editInitialValue ? { entity: editInitialValue } : {}),
          response: detailQuery.data ?? null,
          defaultView: defaultDetailBody,
        }) ?? defaultDetailBody
      )}
    </div>
  );
}
