import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ClickyCommandRuntime } from "../data/Clicky";
import { MethodBadge } from "../data/MethodBadge";
import { CommandForm } from "./CommandForm";
import { pathParamNames, submitValue } from "./command-form-utils";
import type { RenderLink } from "./EndpointList";
import {
  buildInitialParameterValues,
  dataTablePaginationFromForm,
  packParameterValues,
  parametersToFormConfig,
  pruneParameterValues,
  titleCase,
  useDebouncedRecord,
  type ParameterValues,
} from "./formMetadata";
import { InlineError } from "./InlineError";
import { OperationActionDialog } from "./OperationActionDialog";
import { OperationResultView } from "./OperationResultView";
import { hrefForOperation } from "./rowNavigation";
import type {
  ExecutionResponse,
  OpenAPIParameter,
  ResolvedOperation,
} from "./types";
import { useOperationById, type OperationsApiClient } from "./useOperations";

// All operation results are fetched as clicky documents; the in-result View
// menu re-fetches other formats on demand via the response's requestUrl.
const RESULT_ACCEPT = "application/clicky+json";

export type OperationCommandPageProps = {
  client: OperationsApiClient;
  operationId?: string;
  operation?: ResolvedOperation;
  operations?: ResolvedOperation[];
  initialValues?: ParameterValues;
  autoRun?: boolean;
  backHref?: string;
  backLabel?: string;
  renderLink?: RenderLink;
  commandRuntime?: ClickyCommandRuntime;
  onNavigate?: (href: string) => void;
  hideLockedPathFilters?: boolean;
  className?: string;
};

const EMPTY_PARAMETER_VALUES: ParameterValues = {};

export function OperationCommandPage({
  client,
  operationId,
  operation: providedOperation,
  operations = providedOperation ? [providedOperation] : [],
  initialValues = EMPTY_PARAMETER_VALUES,
  autoRun,
  backHref,
  backLabel = "Back",
  renderLink,
  onNavigate,
  commandRuntime,
  hideLockedPathFilters = Boolean(providedOperation),
  className,
}: OperationCommandPageProps) {
  const lookup = useOperationById(
    client,
    providedOperation ? undefined : operationId,
  );
  const operation = providedOperation ?? lookup.operation;
  const isLoading = providedOperation ? false : lookup.isLoading;
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [hasAutoRun, setHasAutoRun] = useState(false);
  const parameters = operation?.operation.parameters ?? [];
  const isGet = (operation?.method ?? "").toUpperCase() === "GET";
  const effectiveAutoRun = operation ? (autoRun ?? isGet) : false;
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
        ? buildInitialParameterValues(
            parameters,
            operation.method,
            {},
            {
              ...readQueryParameterValuesFromUrl(parameters),
              ...stripRunnerParams(initialValues),
            },
          )
        : stripRunnerParams(initialValues),
    [initialValues, operation?.method, parameterSignature],
  );
  const pathParameters = parameters.filter((param) => param.in === "path");
  const lockedPathValues = useMemo<ParameterValues>(() => {
    const values: ParameterValues = {};
    for (const param of pathParameters) {
      const value = effectiveInitialValues[param.name];
      if (typeof value === "string" && value.trim() !== "") {
        values[param.name] = value;
      }
    }
    return values;
  }, [effectiveInitialValues, pathParameters]);
  const detailOperation = useMemo(
    () => (operation ? findDetailOperation(operation, operations) : undefined),
    [operation, operations],
  );
  const relatedOperations = useMemo(
    () =>
      operation
        ? findRelatedOperations(operation, operations, lockedPathValues)
        : [],
    [lockedPathValues, operation, operations],
  );

  // GET-mode parameter state: filter values + pagination cursor are driven
  // by the page so they can flow natively into the result table's in-table
  // FilterBar and pagination footer (via OperationResultView's filterConfig).
  const [values, setValues] = useState<ParameterValues>(effectiveInitialValues);
  useEffect(() => {
    setValues(effectiveInitialValues);
  }, [effectiveInitialValues]);
  const debouncedValues = useDebouncedRecord(values, 250);

  useEffect(() => {
    if (!isGet || !operation) return;
    writeQueryParameterValuesToUrl(debouncedValues, parameters);
  }, [isGet, operationKey, debouncedValues, parameterSignature]);

  const lookupQuery = useQuery({
    queryKey: [
      "operation-query-lookup",
      operation?.method,
      operation?.path,
      debouncedValues,
    ],
    queryFn: async () => {
      if (!operation) return { filters: {} };
      return (
        (await client.lookupFilters?.(
          operation.path,
          operation.method,
          packParameterValues(debouncedValues, parameters),
          { Accept: "application/json+clicky" },
        )) ?? { filters: {} }
      );
    },
    enabled:
      isGet &&
      !!operation &&
      !!client.lookupFilters &&
      parameters.some((param) => param.in === "query"),
    staleTime: 30_000,
    retry: 0,
  });

  const formConfig = useMemo(() => {
    if (!isGet) return { filters: [] };
    return parametersToFormConfig(parameters, values, setValues, {
      lookup: lookupQuery.data,
      lockedValues: lockedPathValues,
      hideLocked: hideLockedPathFilters,
    });
  }, [
    isGet,
    parameters,
    values,
    lookupQuery.data,
    lockedPathValues,
    hideLockedPathFilters,
  ]);

  const dataTablePagination = useMemo(
    () => dataTablePaginationFromForm(formConfig.pagination, result),
    [formConfig.pagination, result],
  );

  // Ref tracking the last submitted parameter signature so the
  // auto-submit-on-debounced-change effect coordinates against the same
  // "have I already fired this set of values" check.
  const lastSubmittedSignature = useRef("");

  async function executeOperation(values: ParameterValues) {
    if (!operation) return;

    setIsExecuting(true);
    setError(null);

    try {
      const response = await client.executeCommand(
        operation.path,
        operation.method,
        packParameterValues(values, operation.operation.parameters ?? []),
        { Accept: RESULT_ACCEPT },
      );
      setResult(response);
    } catch (err) {
      setResult(null);
      setError(err);
    } finally {
      setIsExecuting(false);
    }
  }

  useEffect(() => {
    setHasAutoRun(false);
    setResult(null);
    setError(null);
    lastSubmittedSignature.current = "";
  }, [effectiveAutoRun, operationKey]);

  useEffect(() => {
    if (!effectiveAutoRun || !operation || hasAutoRun) return;
    // Auto-run a GET as long as every required parameter has a value. Optional
    // params (limit/offset, filter chips, etc.) get their defaults; the
    // sidebar's "click → instant table" flow depends on this not bailing just
    // because the operation declares any parameters at all.
    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      return (effectiveInitialValues[param.name] ?? "").trim() === "";
    });
    if (missingRequired.length > 0) return;

    setHasAutoRun(true);
    lastSubmittedSignature.current = JSON.stringify(
      pruneParameterValues(effectiveInitialValues),
    );
    void executeOperation(effectiveInitialValues);
  }, [
    effectiveAutoRun,
    effectiveInitialValues,
    hasAutoRun,
    operationKey,
    parameterSignature,
  ]);

  // GET re-runs on debounced filter/pagination changes once the initial
  // auto-run has fired; non-GETs keep their explicit-submit behavior.
  useEffect(() => {
    if (!isGet || !operation || !hasAutoRun) return;
    const merged = { ...debouncedValues, ...lockedPathValues };
    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      return (merged[param.name] ?? "").trim() === "";
    });
    if (missingRequired.length > 0) return;
    const signature = JSON.stringify(pruneParameterValues(merged));
    if (lastSubmittedSignature.current === signature) return;
    lastSubmittedSignature.current = signature;
    void executeOperation(merged);
  }, [
    isGet,
    hasAutoRun,
    debouncedValues,
    lockedPathValues,
    parameterSignature,
  ]);

  const backLink =
    backHref == null ? null : renderLink ? (
      renderLink({
        to: backHref,
        className: "text-sm text-primary underline-offset-4 hover:underline",
        children: backLabel,
      })
    ) : (
      <a
        href={backHref}
        className="text-sm text-primary underline-offset-4 hover:underline"
      >
        {backLabel}
      </a>
    );

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading operation...</div>
    );
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

  const { path, method, operation: op } = operation;

  return (
    <div className={className ?? "min-w-0 flex-1 space-y-6 p-6"}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {backLink}
          <div className="flex items-center gap-3">
            <MethodBadge method={method} />
            <h1 className="truncate text-xl font-bold">
              {op.summary || op.operationId || path}
            </h1>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{path}</p>
          {op.operationId && op.summary && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {op.operationId}
            </p>
          )}
          {op.description && op.description !== op.summary && (
            <p className="mt-1 text-sm text-muted-foreground">
              {op.description}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          {relatedOperations.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2">
              {relatedOperations.map((related) =>
                related.href ? (
                  renderLink ? (
                    renderLink({
                      key: `${related.operation.method}:${related.operation.path}`,
                      to: related.href,
                      className:
                        "inline-flex h-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground",
                      children: related.label,
                    })
                  ) : (
                    <a
                      key={`${related.operation.method}:${related.operation.path}`}
                      href={related.href}
                      className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      {related.label}
                    </a>
                  )
                ) : (
                  <OperationActionDialog
                    key={`${related.operation.method}:${related.operation.path}`}
                    operation={related.operation}
                    client={client}
                    initialValues={lockedPathValues}
                    label={related.label}
                    defaultAccept={RESULT_ACCEPT}
                    {...(onNavigate ? { onNavigateAction: onNavigate } : {})}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>

      {method.toUpperCase() !== "GET" && (
        <section className="space-y-3">
          <div className="rounded-lg border p-4">
            <CommandForm
              parameters={parameters}
              onExecute={(params) => executeOperation(params)}
              isPending={isExecuting}
              method={method}
              path={path}
              accept={RESULT_ACCEPT}
              initialValues={effectiveInitialValues}
            />
          </div>
        </section>
      )}

      {error ? (
        <InlineError title={`Failed to load ${path}`} error={error} />
      ) : isExecuting || result ? (
        <OperationResultView
          response={result}
          loading={isExecuting}
          loadingMessage="Loading execution results…"
          ariaLabel="Response body"
          detailOperation={detailOperation}
          {...(commandRuntime ? { commandRuntime } : {})}
          {...(isGet && effectiveAutoRun
            ? {
                filterConfig: {
                  filters: formConfig.filters,
                  ...(formConfig.timeRange
                    ? { timeRange: formConfig.timeRange }
                    : {}),
                },
              }
            : {})}
          {...(isGet && effectiveAutoRun && dataTablePagination
            ? { pagination: dataTablePagination }
            : {})}
        />
      ) : null}
    </div>
  );
}

type RelatedOperation = {
  operation: ResolvedOperation;
  label: string;
  href?: string;
};

function findRelatedOperations(
  current: ResolvedOperation,
  operations: ResolvedOperation[],
  pathValues: Record<string, string>,
): RelatedOperation[] {
  if (current.method.toUpperCase() !== "GET") return [];
  if (!pathTemplateSatisfied(current.path, pathValues)) return [];

  const basePath = current.path.replace(/\/+$/, "");
  return operations
    .filter((candidate) => {
      if (candidate === current) return false;
      if (!candidate.path.startsWith(`${basePath}/`)) return false;
      if (!pathTemplateSatisfied(candidate.path, pathValues)) return false;
      const method = candidate.method.toUpperCase();
      return (
        method === "GET" ||
        method === "POST" ||
        method === "PUT" ||
        method === "DELETE"
      );
    })
    .map((related) => {
      const method = related.method.toUpperCase();
      const href =
        method === "GET"
          ? hrefForOperation(related, [], pathValues)
          : undefined;
      return {
        operation: related,
        label: operationLabel(related),
        ...(href ? { href } : {}),
      };
    })
    .filter(
      (related) =>
        related.operation.method.toUpperCase() !== "GET" || related.href,
    );
}

function findDetailOperation(
  current: ResolvedOperation,
  operations: ResolvedOperation[],
) {
  const method = current.method.toUpperCase();
  const detailPath = `${current.path.replace(/\/+$/, "")}/{id}`;
  return operations.find(
    (candidate) =>
      candidate.method.toUpperCase() === method &&
      candidate.path === detailPath &&
      candidate.operation.parameters?.some(
        (param) => param.in === "path" && param.name === "id" && param.required,
      ),
  );
}

function pathTemplateSatisfied(path: string, values: Record<string, string>) {
  return pathParamNames(path).every((name) => Boolean(values[name]));
}

function operationLabel(operation: ResolvedOperation): string {
  const actionName =
    operation.operation["x-clicky"]?.actionName ||
    operation.path.split("/").filter(Boolean).at(-1) ||
    operation.operation.operationId ||
    operation.method;
  return titleCase(actionName.replace(/[_-]+/g, " "));
}

function stripRunnerParams(values: ParameterValues): ParameterValues {
  const next: ParameterValues = {};
  for (const [key, value] of Object.entries(values)) {
    if (key === "autoRun" || key.startsWith("__")) continue;
    next[key] = value;
  }
  return next;
}

function readQueryParameterValuesFromUrl(
  parameters: OpenAPIParameter[],
): ParameterValues {
  if (typeof window === "undefined") return {};
  const queryParamNames = new Set(
    parameters.filter((param) => param.in === "query").map((p) => p.name),
  );
  if (queryParamNames.size === 0) return {};

  const values: ParameterValues = {};
  const search = new URLSearchParams(window.location.search);
  for (const name of queryParamNames) {
    const value = search.get(name);
    if (value != null && value !== "") {
      values[name] = value;
    }
  }
  return values;
}

function writeQueryParameterValuesToUrl(
  values: ParameterValues,
  parameters: OpenAPIParameter[],
) {
  if (typeof window === "undefined") return;
  const queryParameters = parameters.filter((param) => param.in === "query");
  if (queryParameters.length === 0) return;

  const search = new URLSearchParams(window.location.search);
  for (const param of queryParameters) {
    const value = submitValue(param, values[param.name]);
    if (value == null) {
      search.delete(param.name);
    } else {
      search.set(param.name, value);
    }
  }

  const query = search.toString();
  const next = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (next !== current) {
    window.history.replaceState(window.history.state, "", next);
  }
}
