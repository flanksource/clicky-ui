import { useEffect, useMemo, useState } from "react";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { MethodBadge } from "../data/MethodBadge";
import { ExecutionResult } from "./ExecutionResult";
import { FilterForm } from "./FilterForm";
import type { RenderLink } from "./EndpointList";
import {
  buildInitialParameterValues,
  packParameterValues,
  type ParameterValues,
} from "./formMetadata";
import type { ExecutionResponse } from "./types";
import { useOperationById, type OperationsApiClient } from "./useOperations";

export type OperationCommandPageProps = {
  client: OperationsApiClient;
  operationId?: string;
  initialValues?: ParameterValues;
  autoRun?: boolean;
  backHref?: string;
  backLabel?: string;
  renderLink?: RenderLink;
  commandRuntime?: ClickyCommandRuntime;
};

export function OperationCommandPage({
  client,
  operationId,
  initialValues = {},
  autoRun = false,
  backHref,
  backLabel = "Back",
  renderLink,
  commandRuntime,
}: OperationCommandPageProps) {
  const { operation, isLoading } = useOperationById(client, operationId);
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [error, setError] = useState("");
  const [hasAutoRun, setHasAutoRun] = useState(false);
  const parameters = operation?.operation.parameters ?? [];
  const parameterSignature = JSON.stringify(
    parameters.map((param) => ({
      name: param.name,
      in: param.in,
      required: param.required ?? false,
      default: param.schema?.default ?? null,
    })),
  );
  const operationKey = `${operation?.method ?? ""}:${operation?.path ?? ""}:${operation?.operation.operationId ?? ""}`;
  const effectiveInitialValues = useMemo(
    () =>
      operation
        ? buildInitialParameterValues(parameters, operation.method, {}, initialValues)
        : initialValues,
    [initialValues, operation?.method, parameterSignature],
  );

  async function executeOperation(values: ParameterValues) {
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

  useEffect(() => {
    setHasAutoRun(false);
    setResult(null);
    setError("");
  }, [autoRun, operationId]);

  useEffect(() => {
    if (!autoRun || !operation || hasAutoRun) {
      return;
    }

    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      return (effectiveInitialValues[param.name] ?? "").trim() === "";
    });
    if (missingRequired.length > 0) {
      return;
    }

    setHasAutoRun(true);
    void executeOperation(effectiveInitialValues);
  }, [autoRun, effectiveInitialValues, hasAutoRun, operationKey, parameterSignature]);

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
          parameters={parameters}
          initialValues={effectiveInitialValues}
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
          <ExecutionResult
            response={result}
            {...(commandRuntime ? { commandRuntime } : {})}
          />
        )}
      </section>
    </div>
  );
}
