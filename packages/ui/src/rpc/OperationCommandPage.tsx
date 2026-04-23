import { useEffect, useMemo, useState } from "react";
import { Button } from "../components/button";
import { MethodBadge } from "../data/MethodBadge";
import { parseJsonBody } from "./classify";
import type { RenderLink } from "./EndpointList";
import type { OpenAPIParameter } from "./types";
import { useOperationById, type OperationsApiClient } from "./useOperations";

export type OperationCommandPageProps = {
  client: OperationsApiClient;
  operationId?: string;
  backHref?: string;
  backLabel?: string;
  renderLink?: RenderLink;
};

function titleCase(value: string) {
  return value
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function defaultValueForParameter(param: OpenAPIParameter, method: string): string {
  if (method.toUpperCase() === "GET" && param.in === "query" && !param.required) {
    return "";
  }
  const fallback = param.in === "path" ? "" : undefined;
  const value = param.schema?.default ?? fallback;
  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }
  if (Array.isArray(value) || (value != null && typeof value === "object")) {
    return "";
  }
  if (value == null) {
    return "";
  }
  return String(value);
}

function pruneValues(values: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== ""),
  );
}

export function OperationCommandPage({
  client,
  operationId,
  backHref,
  backLabel = "Back",
  renderLink,
}: OperationCommandPageProps) {
  const { operation, isLoading } = useOperationById(client, operationId);
  const parameters = operation?.operation.parameters ?? [];

  const [values, setValues] = useState<Record<string, string>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [resultText, setResultText] = useState("");
  const [error, setError] = useState("");

  const initialValues = useMemo(
    () =>
      Object.fromEntries(
        parameters.map((param) => [
          param.name,
          defaultValueForParameter(param, operation?.method ?? "GET"),
        ]),
      ),
    [operation?.method, parameters],
  );

  useEffect(() => {
    setValues(initialValues);
    setResultText("");
    setError("");
  }, [initialValues, operationId]);

  const parsedResult = useMemo(
    () => (resultText ? parseJsonBody({ success: true, exit_code: 0, stdout: resultText }) : null),
    [resultText],
  );

  const renderedResult = useMemo(() => {
    if (!resultText) {
      return "";
    }
    if (parsedResult != null) {
      return JSON.stringify(parsedResult, null, 2);
    }
    return resultText;
  }, [parsedResult, resultText]);

  async function executeOperation() {
    if (!operation) {
      return;
    }

    const missingRequired = parameters.filter(
      (param) => param.required && values[param.name].trim() === "",
    );
    if (missingRequired.length > 0) {
      setError(
        `Missing required fields: ${missingRequired.map((param) => titleCase(param.name)).join(", ")}`,
      );
      return;
    }

    setIsExecuting(true);
    setError("");

    try {
      const response = await client.executeCommand(
        operation.path,
        operation.method,
        pruneValues(values),
      );
      setResultText(response.stdout || response.output || response.message || "");
    } catch (err) {
      setResultText("");
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
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-medium">Request</h2>
            <p className="text-sm text-muted-foreground">
              Fill any required parameters, then execute the real endpoint.
            </p>
          </div>
          <Button type="button" onClick={executeOperation} disabled={isExecuting}>
            {isExecuting ? "Executing…" : "Execute request"}
          </Button>
        </div>

        {parameters.length === 0 ? (
          <div className="text-sm text-muted-foreground">This operation does not require input.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {parameters.map((param) => {
              const label = titleCase(param.name);
              const fieldId = `param-${param.name}`;
              const type = param.schema?.type;

              return (
                <div key={`${param.in}:${param.name}`} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <label htmlFor={fieldId} className="font-medium">
                      {label}
                    </label>
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
                      {param.in}
                    </span>
                    {param.required && (
                      <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] uppercase text-destructive">
                        Required
                      </span>
                    )}
                  </div>

                  {type === "boolean" ? (
                    <label className="flex h-10 items-center gap-3 rounded-md border px-3">
                      <input
                        id={fieldId}
                        aria-label={label}
                        type="checkbox"
                        checked={values[param.name] === "true"}
                        onChange={(event) =>
                          setValues((current) => ({
                            ...current,
                            [param.name]: event.target.checked ? "true" : "false",
                          }))
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        {param.description || label}
                      </span>
                    </label>
                  ) : param.schema?.enum ? (
                    <select
                      id={fieldId}
                      aria-label={label}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={values[param.name] ?? ""}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [param.name]: event.target.value,
                        }))
                      }
                    >
                      {!param.required && <option value="">Unset</option>}
                      {param.schema.enum.map((value) => (
                        <option key={String(value)} value={String(value)}>
                          {String(value)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      id={fieldId}
                      aria-label={label}
                      type={type === "integer" || type === "number" ? "number" : "text"}
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      placeholder={param.description || label}
                      value={values[param.name] ?? ""}
                      onChange={(event) =>
                        setValues((current) => ({
                          ...current,
                          [param.name]: event.target.value,
                        }))
                      }
                    />
                  )}

                  {param.description && (
                    <p className="text-xs text-muted-foreground">{param.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-lg font-medium">Response</h2>
        {error ? (
          <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            {error}
          </div>
        ) : renderedResult ? (
          <pre
            aria-label="Response body"
            className="mt-3 overflow-auto rounded-md bg-muted p-4 text-xs"
          >
            {renderedResult}
          </pre>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">No response yet.</p>
        )}
      </section>
    </div>
  );
}
