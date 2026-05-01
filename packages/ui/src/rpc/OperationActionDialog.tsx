import { useState } from "react";
import { Button } from "../components/button";
import { Icon } from "../data/Icon";
import { Modal } from "../overlay/Modal";
import { CommandForm } from "./CommandForm";
import { CommandOutput } from "./CommandOutput";
import { InlineError } from "./InlineError";
import type { ExecutionResponse, ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";

export type OperationActionDialogProps = {
  operation: ResolvedOperation;
  client: OperationsApiClient;
  initialValues: Record<string, string>;
  label: string;
  defaultAccept?: string;
  onNavigateAction?: (href: string) => void;
};

export function OperationActionDialog({
  operation,
  client,
  initialValues,
  label,
  defaultAccept = "application/clicky+json",
  onNavigateAction,
}: OperationActionDialogProps) {
  const [open, setOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [response, setResponse] = useState<ExecutionResponse | null>(null);
  const [error, setError] = useState<unknown>(null);

  async function handleExecute(params: Record<string, string>, headers: Record<string, string>) {
    if (onNavigateAction) {
      const href = hrefForOperationAction(operation.path, params);
      if (!href) return;
      const separator = href.includes("?") ? "&" : "?";
      onNavigateAction(`${href}${separator}autoRun=1`);
      return;
    }

    setIsExecuting(true);
    setError(null);
    setResponse(null);
    try {
      const result = await client.executeCommand(operation.path, operation.method, params, headers);
      setResponse(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsExecuting(false);
    }
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Icon name="codicon:play" />
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={label} size="lg">
        <div className="space-y-4">
          <CommandForm
            parameters={operation.operation.parameters ?? []}
            onExecute={handleExecute}
            isPending={isExecuting}
            method={operation.method}
            path={operation.path}
            accept={defaultAccept}
            initialValues={initialValues}
          />

          {error ? (
            <InlineError title={`Failed to execute ${operation.path}`} error={error} />
          ) : response ? (
            <CommandOutput response={response} />
          ) : null}
        </div>
      </Modal>
    </>
  );
}

function hrefForOperationAction(path: string, params: Record<string, string>): string | undefined {
  const nextParams = { ...params };
  const args = parseArgsParam(params.args);
  let route = apiPathToRoutePath(path);

  for (const [index, name] of pathParamNames(path).entries()) {
    const value = nextParams[name] || args[index];
    if (!value) return undefined;
    route = route.replace(`:${name}`, encodeURIComponent(value));
    delete nextParams[name];
    if (!nextParams[name] && value === args[index]) {
      delete nextParams.args;
    }
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(nextParams)) {
    if (value && key !== "autoRun") search.set(key, value);
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

function pathParamNames(path: string): string[] {
  return [...path.matchAll(/\{([^}]+)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name));
}

function parseArgsParam(value: string | undefined): string[] {
  if (!value) return [];
  const trimmed = value.trim();
  if (!trimmed || trimmed === "[]" || trimmed.toLowerCase() === "null") return [];
  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    // Fall back to comma-delimited args below.
  }
  return trimmed
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
