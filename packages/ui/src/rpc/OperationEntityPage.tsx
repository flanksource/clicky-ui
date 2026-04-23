import { useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "../components/button";
import { MethodBadge } from "../data/MethodBadge";
import { Modal } from "../overlay/Modal";
import {
  filterOperationsByDomain,
  findDetailEndpointForList,
  findListEndpoint,
  parseJsonBody,
} from "./classify";
import { FilterForm } from "./FilterForm";
import { packParameterValues } from "./formMetadata";
import type { RenderLink } from "./EndpointList";
import type { DomainDefinition, ResolvedOperation } from "./types";
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
  backHref?: string;
  backLabel?: string;
  renderError?: (err: unknown, title: string) => ReactNode;
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

function renderBody(resultText: string) {
  if (!resultText) return "";
  const parsed = parseJsonBody({ success: true, exit_code: 0, stdout: resultText });
  if (parsed != null) {
    return JSON.stringify(parsed, null, 2);
  }
  return resultText;
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
  backHref,
  backLabel = "Back",
  renderError = defaultRenderError,
}: OperationEntityPageProps) {
  const { operations, isLoading } = useOperations(client);
  const [activeAction, setActiveAction] = useState<ResolvedOperation | null>(null);
  const [actionResultText, setActionResultText] = useState("");
  const [actionError, setActionError] = useState("");
  const [isExecutingAction, setIsExecutingAction] = useState(false);

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
    () => {
      const explicitList = listOperationId
        ? domainOps.find(
            (op) => op.method === "get" && op.operation.operationId === listOperationId,
          )
        : undefined;
      return explicitList ?? findListEndpoint(domainOps, entities);
    },
    [domainOps, entities, listOperationId],
  );

  const resolvedDetailEndpoint = useMemo(
    () =>
      detailOperationId
        ? domainOps.find(
            (op) => op.method === "get" && op.operation.operationId === detailOperationId,
          )
        : findDetailEndpointForList(domainOps, listEndpoint),
    [detailOperationId, domainOps, listEndpoint],
  );

  const idParameterName = useMemo(
    () =>
      resolvedDetailEndpoint?.operation.parameters?.find((param) => param.in === "path")?.name ??
      "id",
    [resolvedDetailEndpoint],
  );
  const detailValues = useMemo(
    () => (id ? { [idParameterName]: id } : {}),
    [id, idParameterName],
  );
  const actionOps = useMemo(
    () =>
      resolvedDetailEndpoint == null
        ? []
        : domainOps.filter(
            (op) => op.method !== "get" && op.path.startsWith(`${resolvedDetailEndpoint.path}/`),
          ),
    [domainOps, resolvedDetailEndpoint],
  );

  const detailQuery = useQuery({
    queryKey: ["entity-detail", definition.key, id, resolvedDetailEndpoint?.path],
    queryFn: async () =>
      client.executeCommand(
        resolvedDetailEndpoint!.path,
        resolvedDetailEndpoint!.method,
        detailValues,
        { Accept: "application/json" },
      ),
    enabled: !!resolvedDetailEndpoint && !!id,
    staleTime: 30_000,
    retry: 0,
  });

  const backLink =
    backHref == null
      ? null
      : renderLink
        ? renderLink({
            to: backHref,
            className: "text-sm text-primary underline-offset-4 hover:underline",
            children: backLabel,
          })
        : (
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
      );
      setActionResultText(response.stdout || response.output || response.message || "");
      await detailQuery.refetch();
    } catch (err) {
      setActionResultText("");
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
      <div className="space-y-2">
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
        <div className="flex flex-wrap gap-2">
          {actionOps.map((op) => (
            <Button
              key={`${op.method}:${op.path}`}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setActiveAction(op);
                setActionResultText("");
                setActionError("");
              }}
            >
              {op.operation.summary || op.operation.operationId || op.path}
            </Button>
          ))}
        </div>
      )}

      {detailQuery.isLoading ? (
        <div className="text-sm text-muted-foreground">Loading detail…</div>
      ) : detailQuery.isError ? (
        renderError(detailQuery.error, `Failed to load ${resolvedDetailEndpoint.path}`)
      ) : (
        <section className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-medium">Entity detail</h2>
          <pre
            aria-label="Response body"
            className="mt-3 overflow-auto rounded-md bg-muted p-4 text-xs"
          >
            {renderBody(detailQuery.data?.stdout || detailQuery.data?.output || detailQuery.data?.message || "")}
          </pre>
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
            ) : actionResultText ? (
              <pre
                aria-label="Response body"
                className="overflow-auto rounded-md bg-muted p-4 text-xs"
              >
                {renderBody(actionResultText)}
              </pre>
            ) : null}
          </div>
        )}
      </Modal>
    </div>
  );
}
