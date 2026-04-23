import { useState } from "react";
import { MethodBadge } from "../data/MethodBadge";
import { ExecutionResult } from "./ExecutionResult";
import { FilterForm } from "./FilterForm";
import type { RenderLink } from "./EndpointList";
import { packParameterValues } from "./formMetadata";
import type { ExecutionResponse } from "./types";
import { useOperationById, type OperationsApiClient } from "./useOperations";

export type OperationCommandPageProps = {
  client: OperationsApiClient;
  operationId?: string;
  backHref?: string;
  backLabel?: string;
  renderLink?: RenderLink;
};

export function OperationCommandPage({
  client,
  operationId,
  backHref,
  backLabel = "Back",
  renderLink,
}: OperationCommandPageProps) {
  const { operation, isLoading } = useOperationById(client, operationId);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [error, setError] = useState("");

  async function executeOperation(values: Record<string, string>) {
    if (!operation) {
      return;
    }

    setIsExecuting(true);
    setError("");

    try {
      const response = await client.executeCommand(
        operation.path,
        operation.method,
        packParameterValues(values, operation.operation.parameters ?? []),
        { Accept: "application/json+clicky" },
      );
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : String(err ?? "Unknown error"));
    } finally {
      setIsExecuting(false);
    }
  }

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

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading operation…</div>;
  }

  if (!operation) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">
          Unknown operation: <code>{operationId}</code>
        </div>
        {backLink}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        {backLink}
        <div className="flex items-center gap-3">
          <MethodBadge method={operation.method} />
          <code className="rounded-md bg-muted px-2 py-1 text-sm">{operation.path}</code>
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {operation.operation.summary || operation.operation.operationId || operation.path}
          </h1>
          {operation.operation.description && (
            <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
              {operation.operation.description}
            </p>
          )}
        </div>
      </div>

      <section className="rounded-xl border bg-card p-4">
        <div className="mb-4">
          <h2 className="text-lg font-medium">Request</h2>
          <p className="text-sm text-muted-foreground">
            Fill any required parameters, then execute the real endpoint.
          </p>
        </div>

        <FilterForm
          client={client}
          path={operation.path}
          method={operation.method}
          parameters={operation.operation.parameters ?? []}
          isSubmitting={isExecuting}
          onSubmit={executeOperation}
        />
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Response</h2>
        {error ? (
          <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : (
          <ExecutionResult response={result} />
        )}
      </section>
    </div>
  );
}
