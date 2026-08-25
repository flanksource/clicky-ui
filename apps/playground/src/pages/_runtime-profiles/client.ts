import type {
  ResolvedRuntimeProfile,
  RuntimeProfileResolveRequest,
} from "./contract";
import {
  familiesFromRuntimeCatalog,
  type RuntimeCatalogFamily,
  type SpecRuntimeFamily,
} from "@flanksource/clicky-ui/ai";

const RESOLVE_ROUTE = "/__playground/runtime-profiles/resolve";
const RUNTIMES_ROUTE = "/__playground/runtime-profiles/runtimes";

export async function loadRuntimeProfileFamilies(
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

export async function resolveRuntimeProfile(
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
