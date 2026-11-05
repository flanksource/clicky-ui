export class GavelCompatibilityError extends Error {}

export async function checkGavelCompatibility(url: string): Promise<void> {
  const response = await fetch(new URL("/api/launch/openapi", url), { signal: AbortSignal.timeout(3000) });
  const body = await response.text();
  if (!response.ok || !response.headers.get("content-type")?.includes("application/json"))
    throw new GavelCompatibilityError(`Gavel at ${url} has no usable OpenAPI document (HTTP ${response.status}). Rebuild and restart Gavel.`);
  let document: { paths?: Record<string, Record<string, unknown>> };
  try { document = JSON.parse(body); }
  catch { throw new GavelCompatibilityError(`Gavel at ${url} returned invalid OpenAPI JSON. Rebuild and restart Gavel.`); }
  const required = [ ["get", "/api/launch/linters"], ["post", "/api/launch/lint/filter"], ["post", "/api/launch/lint/ignore"] ] as const;
  const missing = required.filter(([method, path]) => !document?.paths?.[path]?.[method]).map(([method, path]) => `${method.toUpperCase()} ${path}`);
  if (missing.length) throw new GavelCompatibilityError(`Gavel at ${url} is incompatible; missing ${missing.join(", ")}. Rebuild and restart Gavel.`);
}
