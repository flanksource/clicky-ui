export class GavelCompatibilityError extends Error {}

const REBUILD = "Rebuild gavel from its checkout (`make install`) and restart it.";

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
  await checkGavelDeliveryRoutes(url);
}

/**
 * The playground sends threads to agents and routes new comments through
 * gavel's shared delivery (`/agent-sessions`, `/{id}/deliver`, `/routes`).
 * Those arrived together and are not in the OpenAPI document, so this asks for
 * the route list without a scope: a gavel that has them refuses that (400, or
 * 403 where the host authorizes first), while an older one reads `routes` as a
 * comment id and answers 404, and a host that did not opt in answers 501.
 */
export async function checkGavelDeliveryRoutes(url: string): Promise<void> {
  const response = await fetch(new URL("/api/v1/comments/routes", url), { signal: AbortSignal.timeout(3000) });
  if (response.status === 400 || response.status === 403) return;
  if (response.status === 501)
    throw new GavelCompatibilityError(`Gavel at ${url} runs comments without agent delivery (HTTP 501 from GET /api/v1/comments/routes). Start it as \`gavel launch serve\`, or set PLAYGROUND_GAVEL_URL to a server that has it.`);
  throw new GavelCompatibilityError(`Gavel at ${url} predates agent delivery: GET /api/v1/comments/routes answered HTTP ${response.status}. ${REBUILD}`);
}
