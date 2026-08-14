import { ErrorDetails } from "../data/diagnostics/ErrorDetails";
import {
  normalizeErrorDiagnostics,
  type ErrorDetailBlock,
  type ErrorDiagnostics,
} from "../data/diagnostics/error-diagnostics";

// renderOperationError is the default `renderError` for every operation
// surface: the failure keeps its status, URL, code and provider diagnostics
// instead of being flattened to a message, and one button copies the lot.
export function renderOperationError(err: unknown, title: string) {
  return <ErrorDetails title={title} diagnostics={operationErrorDiagnostics(err)} />;
}

// operationErrorDiagnostics turns whatever an operation call rejected with into
// the shape ErrorDetails renders. The HTTP client already captures status,
// method, url and the parsed body on OperationsApiClientError; a backend that
// answers with provider diagnostics (commons-db's profile execution does)
// carries the failing statement in there. Both are read by duck-typing rather
// than by importing the error class, because the same renderer has to cope with
// a plain Error, a string, and a server payload.
export function operationErrorDiagnostics(error: unknown): ErrorDiagnostics {
  const record = objectRecord(error);
  const message = error instanceof Error ? error.message : String(error ?? "");
  const responseData = record?.responseData;
  const responseBody = stringField(record, "responseBody");

  // Only a structured payload may restate the message; a plain-text body does
  // not, because the client already folded it into the message it threw.
  const base =
    normalizeErrorDiagnostics(responseData ?? error, message) ??
    ({ message: message || "Request failed", context: [] } satisfies ErrorDiagnostics);

  const provider = providerDiagnostics(responseData);
  const context: Array<[string, string]> = [
    ...requestContext(record),
    ...codeContext(responseData),
    ...providerContext(provider),
    ...base.context,
  ];

  const details = [
    ...providerDetails(provider),
    ...responseDetails(responseBody, base.message),
    ...(base.details ?? []),
  ];

  const stacktrace = base.stacktrace ?? (error instanceof Error ? error.stack : undefined);

  return {
    ...base,
    // The server's message beats the generic "<METHOD> <url> failed with <n>"
    // the client synthesizes, but an empty payload must not blank it out.
    message: base.message || message || "Request failed",
    context,
    raw: error,
    ...(details.length > 0 ? { details } : {}),
    ...(stacktrace !== undefined ? { stacktrace } : {}),
  };
}

type ProviderDiagnostics = {
  provider?: string;
  request?: { query?: string; arguments?: unknown; options?: unknown };
  response?: { durationMs?: number; returnedRows?: number };
};

function providerDiagnostics(responseData: unknown): ProviderDiagnostics | null {
  const record = objectRecord(responseData);
  const diagnostics = objectRecord(record?.diagnostics);
  if (!diagnostics) return null;
  return diagnostics as ProviderDiagnostics;
}

function requestContext(record: Record<string, unknown> | null): Array<[string, string]> {
  if (!record) return [];
  const entries: Array<[string, string]> = [];
  const method = stringField(record, "method");
  const url = stringField(record, "url");
  const status = record.status;
  if (method) entries.push(["Method", method]);
  if (url) entries.push(["URL", url]);
  if (typeof status === "number") entries.push(["Status", String(status)]);
  return entries;
}

function codeContext(responseData: unknown): Array<[string, string]> {
  const code = stringField(objectRecord(responseData), "code");
  return code ? [["Code", code]] : [];
}

function providerContext(diagnostics: ProviderDiagnostics | null): Array<[string, string]> {
  if (!diagnostics) return [];
  const entries: Array<[string, string]> = [];
  if (diagnostics.provider) entries.push(["Provider", diagnostics.provider]);
  const duration = diagnostics.response?.durationMs;
  if (typeof duration === "number") entries.push(["Duration", `${duration}ms`]);
  const rows = diagnostics.response?.returnedRows;
  if (typeof rows === "number") entries.push(["Rows", String(rows)]);
  return entries;
}

function providerDetails(diagnostics: ProviderDiagnostics | null): ErrorDetailBlock[] {
  if (!diagnostics?.request) return [];
  const blocks: ErrorDetailBlock[] = [];
  const query = diagnostics.request.query;
  if (typeof query === "string" && query.trim()) blocks.push({ label: "Query", value: query });
  const args = diagnostics.request.arguments;
  if (Array.isArray(args) && args.length > 0) {
    blocks.push({ label: "Arguments", value: JSON.stringify(args, null, 2) });
  }
  const options = objectRecord(diagnostics.request.options);
  if (options && Object.keys(options).length > 0) {
    blocks.push({ label: "Options", value: JSON.stringify(options, null, 2) });
  }
  return blocks;
}

// The raw body always travels unless it is verbatim the message already shown.
// Unpacking a payload into message/code/details is lossy by construction, and
// the point of this view is that nothing the server said stays hidden.
function responseDetails(responseBody: string | undefined, message: string): ErrorDetailBlock[] {
  if (!responseBody || responseBody === message) return [];
  return [{ label: "Response", value: responseBody }];
}

function objectRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function stringField(record: Record<string, unknown> | null, key: string): string | undefined {
  const value = record?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}
