import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { MethodBadge } from "../data/MethodBadge";
import { Modal } from "../overlay/Modal";
import { filterOperationsByDomain, findDetailEndpointForList, findListEndpoint } from "./classify";
import {
  filterOperationsBySurface,
  findSurfaceDetailOperation,
  findSurfaceEntityActions,
  findSurfaceListOperation,
} from "./clickyMetadata";
import { ExecutionResult } from "./ExecutionResult";
import { FilterForm } from "./FilterForm";
import { packParameterValues } from "./formMetadata";
import type { RenderLink } from "./EndpointList";
import type { DomainDefinition, ExecutionResponse, ResolvedOperation } from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";

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
};

function defaultRenderError(err: unknown, title: string) {
  const message = err instanceof Error ? err.message : String(err ?? "");
  return (
    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
      <div className="font-medium">{title}</div>
      {message && <div className="mt-1 whitespace-pre-wrap text-xs opacity-80">{message}</div>}
    </div>
  );
}

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
  renderError = defaultRenderError,
  commandRuntime,
}: OperationEntityPageProps) {
  const { operations, isLoading } = useOperations(client);
  const [activeAction, setActiveAction] = useState<ResolvedOperation | null>(null);
  const [actionResult, setActionResult] = useState<ExecutionResponse | null>(null);
  const [actionError, setActionError] = useState("");
  const [isExecutingAction, setIsExecutingAction] = useState(false);
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
      await detailQuery.refetch();
    } catch (err) {
      setActionResult(null);
      setActionError(err instanceof Error ? err.message : String(err ?? "Unknown error"));
    } finally {
      setIsExecutingAction(false);
    }
  }

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
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {definition.title}: {id}
            </h1>
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{definition.description}</p>
          </div>
        </div>
        {actionOps.length > 0 && (
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {actionOps.map((op) => (
              <Button
                key={`${op.method}:${op.path}`}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveAction(op);
                  setActionResult(null);
                  setActionError("");
                }}
              >
                {op.operation.summary || op.operation.operationId || op.path}
              </Button>
            ))}
          </div>
        )}
      </div>

      {detailQuery.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading detail…</div>
      ) : detailQuery.isError ? (
        renderError(detailQuery.error, `Failed to load ${resolvedDetailEndpoint.path}`)
      ) : (
        <section className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-medium">Entity detail</h2>
          <ExecutionResult
            response={detailQuery.data ?? null}
            {...(commandRuntime ? { commandRuntime } : {})}
          />
        </section>
      )}

      <Modal
        open={activeAction != null}
        onClose={() => setActiveAction(null)}
        title={activeAction?.operation.summary || activeAction?.operation.operationId || "Action"}
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
              lockedValues={{ [idParameterName]: id }}
              hideLocked
              enableLookup={false}
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
