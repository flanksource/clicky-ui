const DEFAULT_PLUGIN_BASE_PATH = "/api/plugins";
const FALLBACK_BASE_URL = "http://plugin-ui-sdk.local";
const CONFIG_ID_QUERY_PARAM = "config_id";

/** Creates a Mission Control plugin client. */
export function createMissionControlPluginClient(options) {
  const mode = options.mode;
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const fetchImpl = options.fetch;
  const EventSourceImpl = options.EventSource;
  const defaultCredentials = credentialsForMode(mode);
  const pluginBasePath = joinURL(baseUrl, DEFAULT_PLUGIN_BASE_PATH);

  return {
    mode,
    baseUrl,

    New(pluginRef, configId) {
      const normalizedPluginRef = requirePathSegment(pluginRef, "pluginRef");
      const normalizedConfigId = normalizeOptionalString(configId);

      return {
        pluginRef: normalizedPluginRef,
        ...(normalizedConfigId ? { configId: normalizedConfigId } : {}),

        invoke(operation, bodyOrQueryParams, invokeOptions = {}) {
          const { proxy, method: configuredMethod, ...requestInit } = invokeOptions;
          const method = requestMethod(configuredMethod);
          const bodyless = isBodylessMethod(method);
          const query = bodyless ? requireQueryParams(bodyOrQueryParams) : undefined;
          const url = pluginOperationURL(
            {
              basePath: pluginBasePath,
              pluginRef: normalizedPluginRef,
              operation,
              ...(normalizedConfigId ? { configId: normalizedConfigId } : {}),
              ...(query ? { query } : {}),
            },
            proxy ? "proxy" : "invoke",
          );
          const headers = new Headers(requestInit.headers);
          const encodedBody = bodyless
            ? undefined
            : encodeBody(bodyOrQueryParams === undefined ? {} : bodyOrQueryParams, headers);

          return (fetchImpl ?? globalFetch())(url, {
            ...requestInit,
            method,
            credentials: requestInit.credentials ?? defaultCredentials,
            headers,
            ...(encodedBody !== undefined ? { body: encodedBody } : {}),
          });
        },

        stream(operation, query) {
          const url = pluginOperationURL(
            {
              basePath: pluginBasePath,
              pluginRef: normalizedPluginRef,
              operation,
              ...(normalizedConfigId ? { configId: normalizedConfigId } : {}),
              ...(query ? { query } : {}),
            },
            "proxy",
          );

          const EventSourceCtor = EventSourceImpl ?? globalEventSource();
          return new EventSourceCtor(url, { withCredentials: mode === "pass-through" });
        },
      };
    },
  };
}

export const createMissionControlClient = createMissionControlPluginClient;

function pluginOperationURL(args, endpoint) {
  const pluginRef = requirePathSegment(args.pluginRef, "pluginRef");
  const operation = requirePathSegment(args.operation, "operation");
  const url = new URL(
    `${args.basePath}/${encodeURIComponent(pluginRef)}/${endpoint}/${encodeURIComponent(operation)}`,
    fallbackBaseURL(),
  );

  if (args.configId) url.searchParams.set(CONFIG_ID_QUERY_PARAM, args.configId);
  appendQuery(url.searchParams, args.query);

  return stripFallbackOrigin(url);
}

function appendQuery(searchParams, query) {
  if (!query) return;

  for (const [key, value] of Object.entries(query)) {
    const queryKey = key === "configId" ? CONFIG_ID_QUERY_PARAM : key;
    for (const item of queryValues(value)) {
      if (item === null || item === undefined) continue;
      searchParams.append(queryKey, String(item));
    }
  }
}

function requireQueryParams(value) {
  if (value === undefined || value === null) return undefined;
  if (isPlainQueryParams(value)) return value;
  throw sdkError("GET and HEAD requests require query params as a plain object");
}

function isPlainQueryParams(value) {
  if (!value || typeof value !== "object") return false;
  if (isBodyInit(value)) return false;
  return Object.getPrototypeOf(value) === Object.prototype;
}

function queryValues(value) {
  return Array.isArray(value) ? value : [value];
}

function encodeBody(body, headers) {
  if (isBodyInit(body)) return body;

  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  return JSON.stringify(body);
}

function isBodyInit(value) {
  return (
    typeof value === "string" ||
    (typeof Blob !== "undefined" && value instanceof Blob) ||
    (typeof FormData !== "undefined" && value instanceof FormData) ||
    (typeof URLSearchParams !== "undefined" && value instanceof URLSearchParams) ||
    (typeof ArrayBuffer !== "undefined" && value instanceof ArrayBuffer) ||
    (typeof ArrayBuffer !== "undefined" && ArrayBuffer.isView(value)) ||
    (typeof ReadableStream !== "undefined" && value instanceof ReadableStream)
  );
}

function requestMethod(method) {
  return (method ?? "POST").toUpperCase();
}

function isBodylessMethod(method) {
  return method === "GET" || method === "HEAD";
}

function credentialsForMode(mode) {
  return mode === "pass-through" ? "include" : "same-origin";
}

function globalFetch() {
  if (typeof fetch === "undefined") {
    throw sdkError("fetch is not available in this environment");
  }
  return fetch;
}

function globalEventSource() {
  if (typeof EventSource === "undefined") {
    throw sdkError("EventSource is not available in this environment");
  }
  return EventSource;
}

function normalizeBaseUrl(baseUrl) {
  const trimmed = baseUrl.trim();
  if (!trimmed) throw sdkError("baseUrl is required");
  return trimTrailingSlash(trimmed);
}

function normalizeOptionalString(value) {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

function requirePathSegment(value, field) {
  const trimmed = value.trim();
  if (!trimmed) throw sdkError(`${field} is required`);
  if (trimmed.includes("/")) throw sdkError(`${field} must be a single path segment`);
  return trimmed;
}

function trimTrailingSlash(value) {
  return value.trim().replace(/\/+$/, "");
}

function joinURL(base, path) {
  return `${trimTrailingSlash(base)}/${path.replace(/^\/+/u, "")}`;
}

function fallbackBaseURL() {
  if (typeof window !== "undefined") return window.location.href;
  return FALLBACK_BASE_URL;
}

function stripFallbackOrigin(url) {
  if (url.origin === FALLBACK_BASE_URL) {
    return `${url.pathname}${url.search}`;
  }

  if (typeof window !== "undefined" && url.origin === window.location.origin) {
    return `${url.pathname}${url.search}`;
  }

  return url.toString();
}

function sdkError(message) {
  return new Error(`plugin-ui-sdk: ${message}`);
}
