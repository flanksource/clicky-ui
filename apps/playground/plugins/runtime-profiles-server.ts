import type { MiddlewareApp, ErrorLogger } from "./middleware";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type {
  ResolvedRuntimeProfile,
  RuntimeProfileResolveRequest,
  RuntimePresetResolveRequest,
} from "../../../packages/ui/src/data/ai/runtime-profile";
import { normalizeToolCatalog } from "../../../packages/ui/src/data/ai/ChatWindow.tool-catalog";
import {
  loadRuntimeProfileModelCatalog,
  loadRuntimeProfilePermissionCatalog,
  loadRuntimeProfileRuntimeCatalog,
} from "./runtime-profiles-catalog";

export const RUNTIME_PROFILES_ROUTE = "/__playground/runtime-profiles/resolve";
export const RUNTIME_PRESETS_ROUTE = "/__playground/runtime-profiles/presets/resolve";
export const RUNTIME_PROFILES_RUNTIMES_ROUTE =
  "/__playground/runtime-profiles/runtimes";
export const RUNTIME_PROFILES_PERMISSIONS_ROUTE =
  "/__playground/runtime-profiles/permissions";
export const RUNTIME_PROFILES_MODELS_ROUTE =
  "/__playground/runtime-profiles/models";

export async function resolveRuntimeSelectionFromCaptain(
  resolveURL: string,
  request: RuntimeProfileResolveRequest | RuntimePresetResolveRequest,
): Promise<ResolvedRuntimeProfile> {
  const response = await fetch(resolveURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  const raw = await response.text();
  if (!response.ok) {
    throw new CaptainResolutionError(
      response.status,
      raw.trim() ||
        `Captain runtime profile request failed with ${response.status} ${response.statusText}`,
    );
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new Error(
      `Captain runtime profile response is not valid JSON: ${cause instanceof Error ? cause.message : String(cause)}`,
    );
  }
  return normalizeResolution(parsed);
}

function normalizeResolution(value: unknown): ResolvedRuntimeProfile {
  if (
    !isRecord(value) ||
    !isRecord(value.resolved) ||
    !Array.isArray(value.tools) ||
    !isRecord(value.permissions) ||
    !isRecord(value.permissionSupport) ||
    !Array.isArray(value.effectivePolicy)
  ) {
    throw new Error("Captain runtime profile response has an invalid shape");
  }
  const tools = normalizeToolCatalog(value.tools);
  if (tools.length !== value.tools.length) {
    throw new Error(
      "Captain runtime profile response contains an invalid tool",
    );
  }
  return { ...value, tools } as ResolvedRuntimeProfile;
}

export function registerRuntimeProfilesMiddleware({ middlewares, logger, modelsURL, permissionsURL, resolveURL, presetsResolveURL, runtimesURL }: {
  middlewares: MiddlewareApp;
  logger: ErrorLogger;
  modelsURL: string;
  permissionsURL: string;
  resolveURL: string;
  presetsResolveURL: string;
  runtimesURL: string;
}): void {
  let runtimesPromise:
    | ReturnType<typeof loadRuntimeProfileRuntimeCatalog>
    | undefined;
  const loadRuntimes = () => {
    runtimesPromise ??= loadRuntimeProfileRuntimeCatalog(runtimesURL).catch(
      (cause) => {
        runtimesPromise = undefined;
        throw cause;
      },
    );
    return runtimesPromise;
  };
  middlewares.use(
    RUNTIME_PROFILES_RUNTIMES_ROUTE,
    (request, response) => {
      void (async () => {
        try {
          if (request.method !== "GET") {
            sendJson(response, 405, {
              error: `GET ${RUNTIME_PROFILES_RUNTIMES_ROUTE} is required`,
            });
            return;
          }
          sendJson(response, 200, await loadRuntimes());
        } catch (error) {
          const detail = errorMessage(error);
          const message = `Unable to load Captain runtimes from ${runtimesURL}: ${detail}`;
          logger.error(`[runtime-profiles] ${message}`);
          sendJson(response, 502, { error: message });
        }
      })();
    },
  );
  middlewares.use(RUNTIME_PROFILES_MODELS_ROUTE, (request, response) => {
    void (async () => {
      try {
        if (request.method !== "GET") {
          sendJson(response, 405, {
            error: `GET ${RUNTIME_PROFILES_MODELS_ROUTE} is required`,
          });
          return;
        }
        sendJson(response, 200, await loadRuntimeProfileModelCatalog(modelsURL));
      } catch (error) {
        const message = `Unable to load Captain models from ${modelsURL}: ${errorMessage(error)}`;
        logger.error(`[runtime-profiles] ${message}`);
        sendJson(response, 502, { error: message });
      }
    })();
  });
  middlewares.use(
    RUNTIME_PROFILES_PERMISSIONS_ROUTE,
    (request, response) => {
      void (async () => {
        try {
          if (request.method !== "GET") {
            sendJson(response, 405, {
              error: `GET ${RUNTIME_PROFILES_PERMISSIONS_ROUTE} is required`,
            });
            return;
          }
          sendJson(
            response,
            200,
            await loadRuntimeProfilePermissionCatalog(
              permissionsURL,
              permissionTarget(request),
            ),
          );
        } catch (error) {
          const message = errorMessage(error);
          logger.error(`[runtime-profiles] ${message}`);
          sendJson(
            response,
            error instanceof RuntimeProfileRequestError ? 400 : 502,
            { error: message },
          );
        }
      })();
    },
  );
  for (const [route, upstream] of [[RUNTIME_PROFILES_ROUTE, resolveURL], [RUNTIME_PRESETS_ROUTE, presetsResolveURL]] as const) {
    middlewares.use(route, (request, response) => {
      void (async () => {
        try {
          if (request.method !== "POST") {
            sendJson(response, 405, {
              error: `POST ${route} is required`,
            });
            return;
          }
          sendJson(
            response,
            200,
            await resolveRuntimeSelectionFromCaptain(
              upstream,
              await readJsonBody(request),
            ),
          );
        } catch (error) {
          const message = errorMessage(error);
          logger.error(`[runtime-profiles] ${message}`);
          sendJson(
            response,
            error instanceof CaptainResolutionError
              ? error.status
              : error instanceof RuntimeProfileRequestError
                ? 400
                : 502,
            { error: message },
          );
        }
      })();
    });
  }
}

export function playgroundRuntimeProfiles({
  modelsURL,
  permissionsURL,
  resolveURL,
  presetsResolveURL,
  runtimesURL,
}: {
  modelsURL: string;
  permissionsURL: string;
  resolveURL: string;
  presetsResolveURL: string;
  runtimesURL: string;
}): Plugin {
  return {
    name: "playground-runtime-profiles",
    apply: "serve",
    configureServer(server) {
      registerRuntimeProfilesMiddleware({ middlewares: server.middlewares, logger: server.config.logger, modelsURL, permissionsURL, resolveURL, presetsResolveURL, runtimesURL });
    },
  };
}

function permissionTarget(request: IncomingMessage) {
  const query = new URL(request.url ?? "/", "http://playground").searchParams;
  const provider = query.get("provider")?.trim();
  const mode = query.get("mode")?.trim();
  if (!provider || !mode) {
    throw new RuntimeProfileRequestError(
      "permission catalog requires provider and mode",
    );
  }
  return { provider, mode };
}

async function readJsonBody(
  request: IncomingMessage,
): Promise<RuntimeProfileResolveRequest | RuntimePresetResolveRequest> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) throw new RuntimeProfileRequestError("request body is required");
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch (cause) {
    throw new RuntimeProfileRequestError(
      `request body is not valid JSON: ${errorMessage(cause)}`,
    );
  }
  if (!isRecord(parsed)) {
    throw new RuntimeProfileRequestError("request body must be a JSON object");
  }
  return parsed as RuntimeProfileResolveRequest | RuntimePresetResolveRequest;
}

function sendJson(
  response: ServerResponse,
  status: number,
  payload: unknown,
): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

class CaptainResolutionError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

class RuntimeProfileRequestError extends Error {}
