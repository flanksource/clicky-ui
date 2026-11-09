// @vitest-environment node
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { afterEach, expect, it, vi } from "vitest";
import { playgroundConnections } from "./connections-server";
import { GavelOwnershipError, type GavelEndpoint } from "./gavel-launch-server";

afterEach(() => vi.unstubAllGlobals());

const compatible = { paths: { "/api/launch/linters": { get: {} }, "/api/launch/lint/filter": { post: {} }, "/api/launch/lint/ignore": { post: {} } } };

/** Serves the plugin's middleware on loopback and fakes every backend probe with `gavelFailure()`. */
async function serveConnections(gavel: GavelEndpoint, gavelFailure: () => "http" | "network" | null) {
  let handler: ((req: IncomingMessage, res: ServerResponse) => void) | undefined;
  const plugin = playgroundConnections({ gavel, captainURL: "http://captain.local" });
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
    if (target.hostname === "127.0.0.1") return realFetch(input, init);
    expect(init?.signal).toBeInstanceOf(AbortSignal);
    const failure = target.hostname === "gavel.local" ? gavelFailure() : null;
    if (failure === "network") throw new TypeError("Connection refused");
    return Response.json(compatible, failure === "http" ? { status: 503, statusText: "Service Unavailable" } : { status: 200 });
  });
  vi.stubGlobal("fetch", probes);
  await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Connection test requires a TCP address");
  return {
    endpoint: `http://127.0.0.1:${address.port}/__playground/connections`,
    probes,
    close: () => new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done())),
  };
}

it("reports each backend independently and recovers without starting Gavel", async () => {
  const url = vi.fn(async () => "http://gavel.local");
  let failure: "http" | "network" | null = "http";
  const served = await serveConnections({ url, unreachable: () => false, generation: 0, close: async () => undefined }, () => failure);
  try {
    const { endpoint, probes } = served;
    const disconnected = await fetch(endpoint);
    expect(disconnected.headers.get("cache-control")).toBe("no-store");
    expect(await disconnected.json()).toEqual({ connections: [
      { name: "Gavel", url: "http://gavel.local", status: "incompatible", error: "Gavel at http://gavel.local has no usable OpenAPI document (HTTP 503). Rebuild and restart Gavel.", management: "external" },
      { name: "Captain", url: "http://captain.local", status: "connected", management: "external" },
    ] });
    failure = "network";
    expect(await (await fetch(endpoint)).json()).toMatchObject({ connections: [{ name: "Gavel", status: "disconnected", error: "Connection refused" }, { name: "Captain", status: "connected" }] });
    failure = null;
    expect(await (await fetch(endpoint)).json()).toEqual({ connections: [
      { name: "Gavel", url: "http://gavel.local", status: "connected", management: "external" },
      { name: "Captain", url: "http://captain.local", status: "connected", management: "external" },
    ] });
    expect(url).toHaveBeenCalledWith({ start: false });
    expect(probes.mock.calls.map(([input]) => String(input))).toContain("http://gavel.local/api/launch/openapi");
    expect(probes.mock.calls.map(([input]) => String(input))).toContain("http://captain.local/health");
    expect((await fetch(endpoint, { method: "POST" })).status).toBe(405);
    const unmanaged = await fetch(`${endpoint}/gavel/restart`, { method: "POST" });
    expect({ status: unmanaged.status, body: await unmanaged.json() }).toEqual({ status: 409, body: { error: "Gavel at http://gavel.local is run outside the playground (PLAYGROUND_GAVEL_URL); restart it where it was started." } });
  } finally {
    await served.close();
  }
});

it("starts and restarts only the Gavel server the playground manages", async () => {
  const STARTED_PID = 4242;
  let pid: number | undefined;
  let failure: "http" | "network" | null = "network";
  const restart = vi.fn(async () => {
    pid = STARTED_PID;
    failure = null;
    return "http://gavel.local";
  });
  const gavel: GavelEndpoint = { url: async () => "http://gavel.local", unreachable: () => false, generation: 0, close: async () => undefined, managed: { pid: () => pid, restart } };
  const served = await serveConnections(gavel, () => failure);
  try {
    const { endpoint } = served;
    expect(await (await fetch(endpoint)).json()).toMatchObject({ connections: [{ name: "Gavel", status: "disconnected", management: "on-demand" }, { name: "Captain", management: "external" }] });

    const restarted = await fetch(`${endpoint}/gavel/restart`, { method: "POST" });
    expect({ status: restarted.status, body: await restarted.json() }).toEqual({ status: 200, body: { connections: [
      { name: "Gavel", url: "http://gavel.local", status: "connected", management: "playground", pid: STARTED_PID },
      { name: "Captain", url: "http://captain.local", status: "connected", management: "external" },
    ] } });

    pid = undefined;
    expect(await (await fetch(endpoint)).json()).toMatchObject({ connections: [{ name: "Gavel", status: "connected", management: "external" }, { name: "Captain" }] });

    restart.mockRejectedValueOnce(new GavelOwnershipError("http://gavel.local"));
    const owned = await fetch(`${endpoint}/gavel/restart`, { method: "POST" });
    expect({ status: owned.status, body: await owned.json() }).toEqual({ status: 409, body: { error: new GavelOwnershipError("http://gavel.local").message } });

    restart.mockRejectedValueOnce(new Error("gavel launch serve exited (1) before http://gavel.local answered"));
    const failed = await fetch(`${endpoint}/gavel/restart`, { method: "POST" });
    expect({ status: failed.status, body: await failed.json() }).toEqual({ status: 502, body: { error: "gavel launch serve exited (1) before http://gavel.local answered" } });

    const captain = await fetch(`${endpoint}/captain/restart`, { method: "POST" });
    expect({ status: captain.status, body: await captain.json() }).toEqual({ status: 409, body: { error: "Captain at http://captain.local is run outside the playground; restart it where it was started." } });
    expect((await fetch(`${endpoint}/gavel/restart`)).status).toBe(405);
    expect((await fetch(`${endpoint}/gavel/stop`, { method: "POST" })).status).toBe(404);
    expect(restart).toHaveBeenCalledTimes(3);
  } finally {
    await served.close();
  }
});
