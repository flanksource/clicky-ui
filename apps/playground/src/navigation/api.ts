import { normalizeErrorDiagnostics, type ErrorDiagnostics } from "@flanksource/clicky-ui";
import { NAVIGATION_ROUTE, navigationSearch, type NavigationQuery, type NavigationResponse } from "./types";

/** A failed `GET /__playground/navigation`; `diagnostics` is what ActionError shows and copies. */
export class NavigationHttpError extends Error {
  constructor(
    readonly status: number,
    readonly diagnostics: ErrorDiagnostics,
  ) {
    super(diagnostics.message);
  }
}

export async function fetchNavigation(query: NavigationQuery, signal?: AbortSignal): Promise<NavigationResponse> {
  const endpoint = `${NAVIGATION_ROUTE}?${navigationSearch(query)}`;
  const context: Array<[string, string]> = [["Endpoint", endpoint]];
  const response = await fetch(endpoint, signal ? { signal } : undefined);
  const body = await response.text();
  const contentType = response.headers.get("content-type") ?? "Missing";
  context.push(["Status", String(response.status)], ["Content type", contentType]);
  const details = [{ label: "Response", value: body }];
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    throw new NavigationHttpError(response.status, { message: `Navigation request failed (${response.status}): the playground server did not answer with JSON`, context, details });
  }
  if (!response.ok) {
    const fallback = `Navigation request failed (${response.status})`;
    const diagnostics = normalizeErrorDiagnostics(value, fallback) ?? { message: fallback, context: [] };
    throw new NavigationHttpError(response.status, { ...diagnostics, context: [...diagnostics.context, ...context], details: [...(diagnostics.details ?? []), ...details] });
  }
  if (typeof value !== "object" || value === null || !Array.isArray((value as { children?: unknown }).children)) {
    throw new NavigationHttpError(response.status, { message: "Navigation response has no children array", context, details });
  }
  return value as NavigationResponse;
}
