import {
  familiesFromRuntimeCatalog,
  type AISpecRuntimePermissionCatalog,
  type ResolvedRuntimeProfile,
  type RuntimeCatalogFamily,
  type RuntimePermissionTarget,
  type RuntimeProfileResolveRequest,
  type RuntimeProfilesClient,
  type SpecRuntimeFamily,
} from "@flanksource/clicky-ui/ai";

const RESOLVE_ROUTE = "/__playground/runtime-profiles/resolve";
const RUNTIMES_ROUTE = "/__playground/runtime-profiles/runtimes";
const PERMISSIONS_ROUTE = "/__playground/runtime-profiles/permissions";

export const PLAYGROUND_RUNTIME_PROFILES_CLIENT: RuntimeProfilesClient = {
  resolve: resolveRuntimeProfile,
  loadFamilies: loadRuntimeProfileFamilies,
  loadPermissionCatalog: loadRuntimePermissionCatalog,
};

async function loadRuntimeProfileFamilies(
  signal?: AbortSignal,
): Promise<SpecRuntimeFamily[]> {
  const response = await fetch(RUNTIMES_ROUTE, {
    method: "GET",
    ...(signal ? { signal } : {}),
  });
  const payload = await readJsonResponse<RuntimeCatalogFamily[]>(
    response,
    RUNTIMES_ROUTE,
  );
  if (!Array.isArray(payload) || payload.length === 0) {
    throw new Error("Captain published no runtime capabilities");
  }
  return familiesFromRuntimeCatalog(payload);
}

async function resolveRuntimeProfile(
  body: RuntimeProfileResolveRequest,
  signal?: AbortSignal,
): Promise<ResolvedRuntimeProfile> {
  const response = await fetch(RESOLVE_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...(signal ? { signal } : {}),
  });
  return readJsonResponse<ResolvedRuntimeProfile>(
    response,
    `POST ${RESOLVE_ROUTE}`,
  );
}

async function loadRuntimePermissionCatalog(
  target: RuntimePermissionTarget,
  signal?: AbortSignal,
): Promise<AISpecRuntimePermissionCatalog> {
  const query = new URLSearchParams(target);
  const route = `${PERMISSIONS_ROUTE}?${query}`;
  const response = await fetch(route, {
    method: "GET",
    ...(signal ? { signal } : {}),
  });
  return readJsonResponse<AISpecRuntimePermissionCatalog>(response, route);
}

async function readJsonResponse<T>(
  response: Response,
  context: string,
): Promise<T> {
  if (
    !(response.headers.get("content-type") ?? "").includes("application/json")
  ) {
    throw new Error(
      "Runtime profiles only work under vite dev; the playground server is unavailable.",
    );
  }
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error ?? `${context} failed (${response.status})`);
  }
  return payload;
}
