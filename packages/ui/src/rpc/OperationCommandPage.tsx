import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FilterBar } from "../components/FilterBar";
import type {
  ClickyCommandRuntime,
  ClickyNode,
  ClickyRow,
  ClickyTableRowClick,
  ClickyTableRowHref,
} from "../data/Clicky";
import { MethodBadge } from "../data/MethodBadge";
import { AcceptPicker, type OperationPreviewMode } from "./AcceptPicker";
import { CommandForm, pathParamNames, submitValue } from "./CommandForm";
import { CommandOutput } from "./CommandOutput";
import type { RenderLink } from "./EndpointList";
import {
  buildInitialParameterValues,
  packParameterValues,
  parametersToFormConfig,
  pruneParameterValues,
  titleCase,
  useDebouncedRecord,
  type ParameterValues,
} from "./formMetadata";
import { InlineError } from "./InlineError";
import { OperationActionDialog } from "./OperationActionDialog";
import {
  isPositionalParam,
  type ExecutionResponse,
  type OpenAPIParameter,
  type ResolvedOperation,
} from "./types";
import { useOperationById, type OperationsApiClient } from "./useOperations";

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

export function OperationCommandPage({
  client,
  operationId,
  operation: providedOperation,
  operations = providedOperation ? [providedOperation] : [],
  initialValues = {},
  autoRun = false,
  backHref,
  backLabel = "Back",
  renderLink,
  onNavigate,
  hideLockedPathFilters = Boolean(providedOperation),
  className,
}: OperationCommandPageProps) {
  const lookup = useOperationById(client, providedOperation ? undefined : operationId);
  const operation = providedOperation ?? lookup.operation;
  const isLoading = providedOperation ? false : lookup.isLoading;
  const [accept, setAccept] = useState("application/clicky+json");
  const [previewMode, setPreviewMode] = useState<OperationPreviewMode>("hidden");
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<ExecutionResponse | null>(null);
  const [error, setError] = useState<unknown>(null);
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
        ? buildInitialParameterValues(
            parameters,
            operation.method,
            {},
            stripRunnerParams(initialValues),
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
    () => (operation ? findRelatedOperations(operation, operations, lockedPathValues) : []),
    [lockedPathValues, operation, operations],
  );

  async function executeOperation(values: ParameterValues) {
    if (!operation) return;

    setIsExecuting(true);
    setError(null);

    try {
      const response = await client.executeCommand(
        operation.path,
        operation.method,
        packParameterValues(values, operation.operation.parameters ?? []),
        { Accept: accept },
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
  }, [autoRun, operationKey]);

  useEffect(() => {
    if (!autoRun || !operation || hasAutoRun) return;
    if (operation.method.toUpperCase() === "GET" && parameters.length > 0) return;

    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      return (effectiveInitialValues[param.name] ?? "").trim() === "";
    });
    if (missingRequired.length > 0) return;

    setHasAutoRun(true);
    void executeOperation(effectiveInitialValues);
  }, [accept, autoRun, effectiveInitialValues, hasAutoRun, operationKey, parameterSignature]);

  const getRowDetailHref = useCallback<ClickyTableRowHref>(
    (row) => {
      if (!detailOperation) return undefined;
      const id = getClickyRowId(row);
      if (!id) return undefined;
      return hrefForOperation(detailOperation, [], { id });
    },
    [detailOperation],
  );

  const handleTableRowClick = useCallback<ClickyTableRowClick>(
    (row) => {
      const href = getRowDetailHref(row);
      if (href) onNavigate?.(href);
    },
    [getRowDetailHref, onNavigate],
  );

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
    return <div className="text-sm text-muted-foreground">Loading operation...</div>;
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
  const preview = buildOperationPreview(operation, effectiveInitialValues, accept, previewMode);

  return (
    <div className={className ?? "min-w-0 flex-1 space-y-6 p-6"}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {backLink}
          <div className="flex items-center gap-3">
            <MethodBadge method={method} />
            <h1 className="truncate text-xl font-bold">{op.summary || op.operationId || path}</h1>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{path}</p>
          {op.operationId && op.summary && (
            <p className="mt-2 font-mono text-xs text-muted-foreground">{op.operationId}</p>
          )}
          {op.description && op.description !== op.summary && (
            <p className="mt-1 text-sm text-muted-foreground">{op.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <div>
            <div className="mb-1 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Accept
            </div>
            <AcceptPicker
              value={accept}
              onChange={setAccept}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            />
          </div>
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
                    defaultAccept={accept}
                    {...(onNavigate ? { onNavigateAction: onNavigate } : {})}
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>

      <section className="space-y-3">
        {method.toUpperCase() === "GET" ? (
          parameters.length > 0 && (
            <OperationQueryFilterBar
              client={client}
              path={path}
              method={method}
              parameters={parameters}
              initialValues={effectiveInitialValues}
              lockedValues={lockedPathValues}
              hideLocked={hideLockedPathFilters}
              autoSubmit={autoRun}
              isSubmitting={isExecuting}
              onSubmit={executeOperation}
            />
          )
        ) : (
          <div className="rounded-lg border p-4">
            <CommandForm
              parameters={parameters}
              onExecute={(params) => executeOperation(params)}
              isPending={isExecuting}
              method={method}
              path={path}
              accept={accept}
              initialValues={effectiveInitialValues}
            />
          </div>
        )}

        {preview && (
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs">{preview}</pre>
        )}
      </section>

      {error ? (
        <InlineError title={`Failed to load ${path} as ${accept}`} error={error} />
      ) : result ? (
        <div role="region" aria-label="Response body">
          <CommandOutput
            response={result}
            bare
            {...(detailOperation
              ? {
                  getTableRowHref: getRowDetailHref,
                  onTableRowClick: handleTableRowClick,
                  isTableRowClickable: (row: ClickyRow) => Boolean(getRowDetailHref(row)),
                }
              : {})}
          />
        </div>
      ) : null}
    </div>
  );
}

type OperationQueryFilterBarProps = {
  client: OperationsApiClient;
  path: string;
  method: string;
  parameters: OpenAPIParameter[];
  initialValues: ParameterValues;
  lockedValues?: ParameterValues;
  hideLocked?: boolean;
  autoSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (values: ParameterValues) => void | Promise<void>;
};

function OperationQueryFilterBar({
  client,
  path,
  method,
  parameters,
  initialValues,
  lockedValues = {},
  hideLocked = false,
  autoSubmit,
  isSubmitting,
  onSubmit,
}: OperationQueryFilterBarProps) {
  const [values, setValues] = useState<ParameterValues>(initialValues);
  const [error, setError] = useState("");
  const debouncedValues = useDebouncedRecord(values, 250);
  const resetKey = useMemo(
    () => `${method}:${path}:${JSON.stringify(initialValues)}:${JSON.stringify(lockedValues)}`,
    [initialValues, lockedValues, method, path],
  );
  const lastSubmitted = useRef("");

  useEffect(() => {
    setValues(initialValues);
    setError("");
    lastSubmitted.current = "";
  }, [resetKey]);

  const lookupQuery = useQuery({
    queryKey: ["operation-query-lookup", method, path, debouncedValues],
    queryFn: async () =>
      (await client.lookupFilters?.(
        path,
        method,
        packParameterValues(debouncedValues, parameters),
        { Accept: "application/json+clicky" },
      )) ?? { filters: {} },
    enabled: !!client.lookupFilters && parameters.some((param) => param.in === "query"),
    staleTime: 30_000,
    retry: 0,
  });

  const formConfig = useMemo(
    () =>
      parametersToFormConfig(parameters, values, setValues, {
        lookup: lookupQuery.data,
        lockedValues,
        hideLocked,
      }),
    [hideLocked, lockedValues, lookupQuery.data, parameters, values],
  );

  async function handleSubmit(nextValues: ParameterValues = values) {
    const missingRequired = parameters.filter((param) => {
      if (!param.required) return false;
      const value = lockedValues[param.name] ?? nextValues[param.name] ?? "";
      return value.trim() === "";
    });

    if (missingRequired.length > 0) {
      setError(
        `Missing required fields: ${missingRequired.map((param) => titleCase(param.name)).join(", ")}`,
      );
      return;
    }

    setError("");
    await onSubmit(pruneParameterValues({ ...nextValues, ...lockedValues }));
  }

  useEffect(() => {
    if (!autoSubmit) return;
    const next = pruneParameterValues({ ...debouncedValues, ...lockedValues });
    const signature = JSON.stringify(next);
    if (lastSubmitted.current === signature) return;
    lastSubmitted.current = signature;
    void handleSubmit(debouncedValues);
  }, [autoSubmit, debouncedValues, lockedValues]);

  if (formConfig.filters.length === 0 && formConfig.timeRange == null) {
    return (
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">This operation does not require input.</p>
        <button
          type="button"
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          disabled={isSubmitting}
          onClick={() => handleSubmit()}
        >
          {isSubmitting ? "Executing..." : "Execute request"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <FilterBar
        autoSubmit={autoSubmit}
        filters={formConfig.filters}
        {...(!autoSubmit ? { onApply: () => handleSubmit() } : {})}
        applyLabel="Execute request"
        isPending={isSubmitting}
        {...(formConfig.timeRange ? { timeRange: formConfig.timeRange } : {})}
      />
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
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
      return method === "GET" || method === "POST" || method === "PUT" || method === "DELETE";
    })
    .map((related) => {
      const method = related.method.toUpperCase();
      const href = method === "GET" ? hrefForOperation(related, [], pathValues) : undefined;
      return {
        operation: related,
        label: operationLabel(related),
        ...(href ? { href } : {}),
      };
    })
    .filter((related) => related.operation.method.toUpperCase() !== "GET" || related.href);
}

function findDetailOperation(current: ResolvedOperation, operations: ResolvedOperation[]) {
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

function hrefForOperation(
  operation: ResolvedOperation,
  args: string[] = [],
  flags: Record<string, string> = {},
): string | undefined {
  let route = apiPathToRoutePath(operation.path);
  const consumedFlags = new Set<string>();

  pathParamNames(operation.path).forEach((name, index) => {
    const value = flags[name] ?? args[index];
    if (!value) return;
    consumedFlags.add(name);
    route = route.replace(`:${name}`, encodeURIComponent(value));
  });

  if (route.includes(":")) return undefined;

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(flags)) {
    if (value && !consumedFlags.has(key)) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${route}?${query}` : route;
}

function apiPathToRoutePath(path: string): string {
  const cliPath = path
    .trim()
    .replace(/^\/api\/v1\/?/, "")
    .replace(/^\/+/, "")
    .replace(/\/+$/, "");
  if (!cliPath) return "/";
  return `/${cliPath.replace(/\{([^}]+)\}/g, ":$1")}`;
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

function buildOperationPreview(
  operation: ResolvedOperation,
  values: ParameterValues,
  accept: string,
  mode: OperationPreviewMode,
) {
  if (mode === "hidden") return "";
  if (mode === "cli") return buildCliPreview(operation, values);
  return buildCurlPreview(operation, values, accept);
}

function buildCurlPreview(operation: ResolvedOperation, values: ParameterValues, accept: string) {
  const params = operation.operation.parameters ?? [];
  const parts = [`curl -X ${operation.method.toUpperCase()}`];
  if (accept !== "application/json") parts.push(`-H "Accept: ${accept}"`);
  let url = operation.path;
  const queryParts: string[] = [];
  for (const param of params) {
    const value = submitValue(param, values[param.name]);
    if (!value) continue;
    if (param.in === "path") {
      url = url.replace(`{${param.name}}`, encodeURIComponent(value));
    } else if (param.in === "query") {
      queryParts.push(`${encodeURIComponent(param.name)}=${encodeURIComponent(value)}`);
    }
  }
  if (queryParts.length > 0) url += `?${queryParts.join("&")}`;
  parts.push(`"${url}"`);
  return parts.join(" ");
}

function buildCliPreview(operation: ResolvedOperation, values: ParameterValues) {
  const command = operation.operation["x-clicky"]?.command;
  if (!command) return buildCurlPreview(operation, values, "application/json");
  const params = operation.operation.parameters ?? [];
  const positionalNames = new Set(params.filter(isPositionalParam).map((param) => param.name));
  const parts = [command.replaceAll("/", " ")];
  for (const param of params) {
    const value = submitValue(param, values[param.name]);
    if (!value) continue;
    if (param.in === "path" || positionalNames.has(param.name)) {
      parts.push(shellQuote(value));
      continue;
    }
    parts.push(`--${param.name}`, shellQuote(value));
  }
  return parts.join(" ");
}

function shellQuote(value: string) {
  if (/^[a-zA-Z0-9_./:@-]+$/.test(value)) return value;
  return `'${value.replaceAll("'", "'\\''")}'`;
}

function stripRunnerParams(values: ParameterValues): ParameterValues {
  const next: ParameterValues = {};
  for (const [key, value] of Object.entries(values)) {
    if (key === "autoRun") continue;
    next[key] = value;
  }
  return next;
}

function getClickyRowId(row: ClickyRow) {
  const candidates = ["_id", "id", "ID", "guid", "GUID"];
  for (const key of candidates) {
    const value = clickyNodeText(row.cells[key]);
    if (value) return value;
  }
  return undefined;
}

function clickyNodeText(node: ClickyNode | undefined): string {
  if (!node) return "";
  if (node.plain) return node.plain;
  if (node.text) return node.text;
  if (node.source) return node.source;
  if (node.children) return node.children.map(clickyNodeText).join("");
  if (node.items) return node.items.map(clickyNodeText).join(" ");
  if (node.fields) return node.fields.map((field) => clickyNodeText(field.value)).join(" ");
  return "";
}
