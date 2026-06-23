import type { JsonSchemaObject } from "../components/json-schema-form-types";
import type {
  ExecutionPagination,
  ExecutionResponse,
  OpenAPISpec,
  OperationLookupFilter,
  OperationLookupResponse,
} from "./types";
import type { OperationsApiClient } from "./useOperations";

type MaybePromise<T> = T | Promise<T>;

export type OperationApiClientContext = {
  path: string;
  method: string;
};

export type OperationDefaultParams = (context: {
  path: string;
  method: string;
  params: Record<string, string>;
}) => MaybePromise<Record<string, string>>;

export type OperationHeadersProvider = (
  headers: Headers,
  context: OperationApiClientContext,
) => MaybePromise<HeadersInit | void>;

export type CreateOperationsApiClientOptions = {
  baseUrl?: string;
  openApiPath?: string;
  credentials?: RequestCredentials;
  fetch?: typeof fetch;
  prepareHeaders?: OperationHeadersProvider;
  defaultParams?: OperationDefaultParams;
};

export class OperationsApiClientError extends Error {
  status: number | undefined;
  method: string | undefined;
  url: string | undefined;
  responseBody: string | undefined;
  responseData: unknown;
  responseHeaders: Record<string, string> | undefined;

  constructor(
    message: string,
    options: {
      status?: number;
      method?: string;
      url?: string;
      responseBody?: string;
      responseData?: unknown;
      responseHeaders?: Record<string, string>;
    } = {},
  ) {
    super(message);
    this.name = "OperationsApiClientError";
    this.status = options.status;
    this.method = options.method;
    this.url = options.url;
    this.responseBody = options.responseBody;
    this.responseData = options.responseData;
    this.responseHeaders = options.responseHeaders;
  }
}

export interface SharedOperationsApiClient extends OperationsApiClient {
  lookupFilterOptions(
    path: string,
    method: string,
    filterKey: string,
    query: string,
    extraParams?: Record<string, string>,
  ): Promise<OperationLookupFilter>;
  executeCommandBody(
    path: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<ExecutionResponse>;
  getSchema(path: string): Promise<JsonSchemaObject | undefined>;
  submitForm(
    path: string,
    method: string,
    body: Record<string, unknown>,
    headers?: Record<string, string>,
  ): Promise<ExecutionResponse>;
}

export function createOperationsApiClient(
  options: CreateOperationsApiClientOptions = {},
): SharedOperationsApiClient {
  const fetcher = options.fetch ?? fetch;
  const openApiPath = options.openApiPath ?? "/api/openapi.json";

  async function makeHeaders(
    base: HeadersInit | undefined,
    context: OperationApiClientContext,
  ): Promise<Headers> {
    const headers = new Headers(base);
    const prepared = await options.prepareHeaders?.(headers, context);
    return prepared ? new Headers(prepared) : headers;
  }

  async function request(
    path: string,
    method: string,
    init: Omit<RequestInit, "method" | "headers" | "credentials"> & {
      headers?: HeadersInit;
      requestUrl?: string;
    } = {},
  ): Promise<Response> {
    const url = joinUrl(options.baseUrl, path);
    const headers = await makeHeaders(init.headers, { path, method });
    return fetcher(url, {
      ...init,
      method,
      headers,
      ...(options.credentials ? { credentials: options.credentials } : {}),
    });
  }

  async function getOpenAPISpec(): Promise<OpenAPISpec> {
    const response = await request(openApiPath, "GET", {
      headers: { Accept: "application/json" },
    });
    const parsed = await readResponseBody(response, "json");
    if (!response.ok) {
      throw errorFromResponse(response, "GET", openApiPath, parsed);
    }
    return parsed.data as OpenAPISpec;
  }

  async function withDefaults(path: string, method: string, params: Record<string, string>) {
    return (await options.defaultParams?.({ path, method, params })) ?? params;
  }

  return {
    getOpenAPISpec,

    async executeCommand(path, method, params, headers) {
      const upper = method.toUpperCase();
      const resolved = resolvePathParams(path, params);
      const scoped = await withDefaults(resolved.path, upper, resolved.params);
      const accept = headerValue(headers, "Accept");

      if (upper === "GET") {
        const requestUrl = appendQuery(resolved.path, scoped);
        const response = await request(requestUrl, upper, {
          ...(headers ? { headers } : {}),
          requestUrl,
        });
        return parseExecutionResponse(response, await readResponseBody(response, responseKind(accept)), {
          method: upper,
          requestUrl,
        });
      }

      const response = await request(resolved.path, upper, {
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(scoped),
      });
      return parseExecutionResponse(response, await readResponseBody(response, responseKind(accept)), {
        method: upper,
        requestUrl: resolved.path,
      });
    },

    async executeCommandBody(path, body, headers) {
      const accept = headerValue(headers, "Accept");
      const response = await request(path, "POST", {
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      return parseExecutionResponse(response, await readResponseBody(response, responseKind(accept)), {
        method: "POST",
        requestUrl: path,
      });
    },

    // getSchema fetches a resource's JSON Schema via content negotiation
    // (Accept: application/schema+json on the same endpoint). It returns
    // undefined when the resource serves no schema (the request falls through to
    // its data representation), so callers can fall back to a parameter form.
    async getSchema(path) {
      const response = await request(path, "GET", {
        headers: { Accept: "application/schema+json" },
      });
      if (!response.ok) return undefined;
      const contentType = response.headers.get("Content-Type") || "";
      if (!contentType.toLowerCase().includes("schema")) return undefined;
      const parsed = await readResponseBody(response, "json");
      const data = parsed.data;
      return data && typeof data === "object" ? (data as JsonSchemaObject) : undefined;
    },

    // submitForm sends a nested JSON body with the given HTTP method (POST to
    // create, PUT to update). Unlike executeCommand it preserves nested objects
    // and arrays — the server reads the raw body (clicky's RequestFromContext),
    // so connection `properties` and profile `provider`/`params`/`columns`
    // survive intact.
    async submitForm(path, method, body, headers) {
      const upper = method.toUpperCase();
      const response = await request(path, upper, {
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      });
      return parseExecutionResponse(response, await readResponseBody(response, "json"), {
        method: upper,
        requestUrl: path,
      });
    },

    async lookupFilters(path, method, params, headers) {
      const upper = method.toUpperCase();
      const resolved = resolvePathParams(path, params);

      if (upper === "GET") {
        const requestUrl = appendQuery(resolved.path, { ...resolved.params, __lookup: "filters" });
        const response = await request(requestUrl, "GET", {
          headers: { Accept: "application/json+clicky", ...headers },
        });
        if (response.status === 404) return { filters: {} };
        const parsed = await readResponseBody(response, "json");
        if (!response.ok) throw errorFromResponse(response, "GET", requestUrl, parsed);
        return (parsed.data as OperationLookupResponse | undefined) ?? { filters: {} };
      }

      const response = await request(appendQuery(resolved.path, { __lookup: "filters" }), upper, {
        headers: {
          Accept: "application/json+clicky",
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(resolved.params),
      });
      if (response.status === 404) return { filters: {} };
      const parsed = await readResponseBody(response, "json");
      if (!response.ok) throw errorFromResponse(response, upper, resolved.path, parsed);
      return (parsed.data as OperationLookupResponse | undefined) ?? { filters: {} };
    },

    async lookupFilterOptions(path, method, filterKey, query, extraParams) {
      const upper = method.toUpperCase();
      const resolved = resolvePathParams(path, {});
      const queryParams = {
        ...(extraParams ?? {}),
        __lookup: "filters",
        __lookup_filter: filterKey,
        __lookup_q: query,
      };

      const requestPath = appendQuery(resolved.path, queryParams);
      const response = await request(requestPath, upper, {
        headers: { Accept: "application/json+clicky" },
      });
      const parsed = await readResponseBody(response, "json");
      if (!response.ok) throw errorFromResponse(response, upper, requestPath, parsed);
      return ((parsed.data as OperationLookupResponse | undefined)?.filters?.[filterKey] ??
        {}) as OperationLookupFilter;
    },
  };
}

function responseKind(accept?: string): "json" | "text" | "blob" {
  if (!accept) return "json";
  const normalized = accept.toLowerCase();
  if (normalized.includes("application/pdf")) return "blob";
  if (
    normalized.includes("text/") ||
    normalized.includes("application/x-yaml") ||
    normalized.includes("application/yaml")
  ) {
    return "text";
  }
  return "json";
}

type ParsedBody = {
  data: unknown;
  text: string;
  blob?: Blob;
  contentType: string;
};

async function readResponseBody(response: Response, kind: "json" | "text" | "blob"): Promise<ParsedBody> {
  const contentType = response.headers.get("Content-Type") || "";
  if (kind === "blob") {
    const blob = await response.blob();
    return { data: undefined, text: "[binary]", blob, contentType };
  }

  const text = await response.text();
  if (kind === "text" || !shouldParseJson(text, contentType)) {
    return { data: text, text, contentType };
  }

  try {
    return { data: JSON.parse(text) as unknown, text, contentType };
  } catch {
    return { data: text, text, contentType };
  }
}

function parseExecutionResponse(
  response: Response,
  parsed: ParsedBody,
  context: { method: string; requestUrl: string },
): ExecutionResponse {
  const headers = responseHeaders(response.headers);
  const data = parsed.data;
  const stdout =
    parsed.blob != null
      ? "[binary]"
      : typeof data === "string"
        ? data
        : parsed.text || JSON.stringify(data, null, 2);
  const clickyEnvelope = isClickyEnvelope(data);

  if (!response.ok && !clickyEnvelope) {
    throw errorFromResponse(response, context.method, context.requestUrl, parsed);
  }

  const clickyError = errorFromClickyEnvelope(data);
  const successHeader = headers["x-execution-success"];
  const success = successHeader == null ? response.ok && !clickyError : successHeader !== "false";
  const exitCode = parseInt(headers["x-exit-code"] ?? (success ? "0" : "1"), 10);
  const cli = headers["x-cli-command"];
  const error = headers["x-error"] || clickyError;
  const pagination = paginationFromHeaders(headers);

  return {
    success,
    stdout,
    output: stdout,
    exit_code: Number.isFinite(exitCode) ? exitCode : success ? 0 : 1,
    contentType: parsed.contentType || headers["content-type"] || "application/json",
    requestUrl: context.requestUrl,
    responseHeaders: headers,
    ...(pagination ? { pagination } : {}),
    ...(cli ? { cli } : {}),
    ...(error ? { error } : {}),
    ...(parsed.blob ? { blob: parsed.blob } : {}),
    ...(parsed.blob == null && typeof data !== "string" ? { parsed: data } : {}),
  };
}

function errorFromResponse(
  response: Response,
  method: string,
  url: string,
  parsed: ParsedBody,
): OperationsApiClientError {
  const headers = responseHeaders(response.headers);
  const message =
    headers["x-error"] ||
    messageFromBody(parsed.data) ||
    `${method} ${url} failed with ${response.status}: ${
      parsed.text || response.statusText
    }`;
  return new OperationsApiClientError(message, {
    status: response.status,
    method,
    url,
    responseBody: parsed.text,
    responseData: parsed.data,
    responseHeaders: headers,
  });
}

function resolvePathParams(
  path: string,
  params: Record<string, string>,
): { path: string; params: Record<string, string> } {
  const queryParams = { ...params };
  let resolvedPath = path;
  const placeholders = [...path.matchAll(/\{([^{}]+)\}/g)]
    .map((match) => match[1])
    .filter((name): name is string => Boolean(name));
  const argValues = parseArgsParam(params.args);
  let consumedArgs = false;
  const consumedDirectValues: string[] = [];

  for (const [index, name] of placeholders.entries()) {
    const directValue = queryParams[name];
    const fallbackValue = directValue || argValues[index];
    if (!fallbackValue) continue;

    resolvedPath = resolvedPath.replace(`{${name}}`, encodeURIComponent(fallbackValue));
    delete queryParams[name];
    if (!directValue && argValues[index]) consumedArgs = true;
    if (directValue) consumedDirectValues[index] = directValue;
  }

  const argsDuplicateResolvedPath =
    argValues.length > 0 &&
    argValues.length === consumedDirectValues.filter(Boolean).length &&
    argValues.every((value, index) => value === consumedDirectValues[index]);

  if (consumedArgs || argsDuplicateResolvedPath) {
    delete queryParams.args;
  }

  return { path: resolvedPath, params: stripRunnerParams(queryParams) };
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

function stripRunnerParams(params: Record<string, string>) {
  const next = { ...params };
  delete next.autoRun;
  delete next.__autoRun;
  return next;
}

function appendQuery(path: string, params: Record<string, string>) {
  const query = new URLSearchParams(pruneParams(params)).toString();
  if (!query) return path;
  return `${path}${path.includes("?") ? "&" : "?"}${query}`;
}

function pruneParams(params: Record<string, string>) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== ""));
}

function joinUrl(baseUrl: string | undefined, path: string) {
  if (!baseUrl || /^https?:\/\//i.test(path)) return path;
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function headerValue(headers: Record<string, string> | undefined, name: string) {
  const wanted = name.toLowerCase();
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (key.toLowerCase() === wanted) return value;
  }
  return undefined;
}

function responseHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}

function paginationFromHeaders(headers: Record<string, string>): ExecutionPagination | undefined {
  const pagination: ExecutionPagination = {};
  const total = integerHeader(headers["x-total-count"]);
  const limit = integerHeader(headers["x-page-limit"]);
  const offset = integerHeader(headers["x-page-offset"]);

  if (total !== undefined) pagination.total = total;
  if (limit !== undefined) pagination.limit = limit;
  if (offset !== undefined) pagination.offset = offset;

  return Object.keys(pagination).length > 0 ? pagination : undefined;
}

function integerHeader(value: string | undefined): number | undefined {
  if (value == null || value.trim() === "") return undefined;
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function shouldParseJson(text: string, contentType: string) {
  const trimmed = text.trim();
  return (
    trimmed !== "" &&
    (contentType.toLowerCase().includes("json") ||
      trimmed.startsWith("{") ||
      trimmed.startsWith("["))
  );
}

function isClickyEnvelope(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const body = data as Record<string, unknown>;
  return body.version != null && body.node != null && typeof body.node === "object";
}

function readClickyText(node: unknown): string | undefined {
  if (!node || typeof node !== "object") return undefined;
  const n = node as Record<string, unknown>;
  if (typeof n.plain === "string" && n.plain !== "") return n.plain;
  if (typeof n.text === "string" && n.text !== "") return n.text;
  if (Array.isArray(n.children)) {
    for (const child of n.children) {
      const text = readClickyText(child);
      if (text) return text;
    }
  }
  return undefined;
}

function errorFromClickyEnvelope(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const node = (data as Record<string, unknown>).node;
  if (!node || typeof node !== "object") return undefined;
  const n = node as Record<string, unknown>;
  if (n.kind !== "map" || !Array.isArray(n.fields)) return undefined;

  let errorText: string | undefined;
  let failed = false;
  for (const field of n.fields) {
    if (!field || typeof field !== "object") continue;
    const f = field as Record<string, unknown>;
    if (f.name === "Error") errorText = readClickyText(f.value);
    if (f.name === "Success" && readClickyText(f.value) === "false") failed = true;
  }
  return failed ? errorText : undefined;
}

function messageFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const body = data as Record<string, unknown>;
  if (typeof body.error === "string" && body.error) return body.error;
  if (typeof body.message === "string" && body.message) return body.message;
  return errorFromClickyEnvelope(data);
}
