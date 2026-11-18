// @vitest-environment node
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { afterEach, expect, it, vi } from "vitest";
import { playgroundConnections } from "./connections-server";
import { fixedGavel } from "./gavel-launch-server";

afterEach(() => vi.unstubAllGlobals());

const compatible = { paths: { "/api/launch/linters": { get: {} }, "/api/launch/lint/filter": { post: {} }, "/api/launch/lint/ignore": { post: {} } } };

/** Serves the plugin's middleware on loopback and fakes every backend probe with `gavelFailure()`. */
async function serveConnections(gavelURL: string, gavelFailure: () => "http" | "network" | null) {
  let handler: ((req: IncomingMessage, res: ServerResponse) => void) | undefined;
  const plugin = playgroundConnections({ gavel: fixedGavel(gavelURL), captainURL: "http://captain.local" });
  (plugin.configureServer as (server: unknown) => void)?.({
    middlewares: { use: (route: string, middleware: typeof handler) => {
      expect(route).toBe("/__playground/connections");
      handler = middleware;
    } },
  });
  expect(handler).toBeTypeOf("function");
  // Connect hands a mounted middleware the URL below its route, as Vite's dev server does.
  const server = createServer((req, res) => {
    req.url = req.url!.slice("/__playground/connections".length) || "/";
    handler!(req, res);
  });
  const realFetch = globalThis.fetch;
  const probes = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const target = new URL(String(input));
    if (target.hostname === "127.0.0.1" && target.port === String(address.port)) return realFetch(input, init);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    const failure = target.hostname === new URL(gavelURL).hostname ? gavelFailure() : null;
    if (failure === "network") throw new TypeError("Connection refused");
    return Response.json(compatible, failure === "http" ? { status: 503, statusText: "Service Unavailable" } : { status: 200 });
  });
  vi.stubGlobal("fetch", probes);
  await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  const bound = server.address();
  if (!bound || typeof bound === "string") throw new Error("Connection test requires a TCP address");
  const address = bound;
  return {
    endpoint: `http://127.0.0.1:${address.port}/__playground/connections`,
    probes,
    close: () => new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done())),
  };
}

it("reports each backend independently and recovers", async () => {
  let failure: "http" | "network" | null = "http";
  const served = await serveConnections("http://gavel.local", () => failure);
  try {
    const { endpoint, probes } = served;
    const incompatible = await fetch(endpoint);
    expect(incompatible.headers.get("cache-control")).toBe("no-store");
    expect(await incompatible.json()).toEqual({ connections: [
      { name: "Gavel", url: "http://gavel.local", status: "incompatible", error: "Gavel at http://gavel.local has no usable OpenAPI document (HTTP 503). Rebuild and restart Gavel." },
      { name: "Captain", url: "http://captain.local", status: "connected" },
    ] });
    failure = "network";
    expect(await (await fetch(endpoint)).json()).toMatchObject({ connections: [{ name: "Gavel", status: "disconnected", error: "Connection refused" }, { name: "Captain", status: "connected" }] });
    failure = null;
    expect(await (await fetch(endpoint)).json()).toEqual({ connections: [
      { name: "Gavel", url: "http://gavel.local", status: "connected" },
      { name: "Captain", url: "http://captain.local", status: "connected" },
    ] });
    const probed = probes.mock.calls.map(([input]) => String(input));
    expect(probed).toContain("http://gavel.local/api/launch/openapi");
    expect(probed).toContain("http://captain.local/health");
    expect((await fetch(endpoint, { method: "POST" })).status).toBe(405);
  } finally {
    await served.close();
  }
});

it("no longer starts or restarts a backend", async () => {
  const served = await serveConnections("http://gavel.local", () => null);
  try {
    for (const path of ["/gavel/restart", "/captain/restart"]) {
      const response = await fetch(`${served.endpoint}${path}`, { method: "POST" });
      expect({ path, status: response.status }).toEqual({ path, status: 404 });
    }
  } finally {
    await served.close();
  }
});

it("probes gavel at the address the endpoint names, the default launch address included", async () => {
  const served = await serveConnections("http://127.0.0.1:9330", () => null);
  try {
    await fetch(served.endpoint);
    expect(served.probes.mock.calls.map(([input]) => String(input))).toContain("http://127.0.0.1:9330/api/launch/openapi");
  } finally {
    await served.close();
  }
});
