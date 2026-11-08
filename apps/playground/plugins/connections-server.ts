import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type { MiddlewareApp } from "./middleware";
import { GavelOwnershipError, type GavelEndpoint } from "./gavel-launch-server";
import { sendJson } from "./comments-server";
import { checkGavelCompatibility, GavelCompatibilityError } from "./gavel-compatibility";

export type BackendConnection = {
  name: "Gavel" | "Captain";
  url: string;
  status: "connected" | "incompatible" | "disconnected";
  error?: string;
  /**
   * `playground`: the playground started the running server (`pid`) and can restart it.
   * `on-demand`: nothing is running; the playground starts the server when needed or on request.
   * `external`: another process runs the server, so the playground only checks it.
   */
  management: "playground" | "on-demand" | "external";
  pid?: number;
};

async function probe(name: BackendConnection["name"], url: string, path: string): Promise<Omit<BackendConnection, "management">> {
  try {
    if (name === "Gavel") await checkGavelCompatibility(url);
    else {
      const response = await fetch(new URL(path, url), { signal: AbortSignal.timeout(3000) });
      await response.body?.cancel();
      if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`.trim());
    }
    return { name, url, status: "connected" };
  } catch (cause) {
    return { name, url, status: cause instanceof GavelCompatibilityError ? "incompatible" : "disconnected", error: cause instanceof Error ? cause.message : String(cause) };
  }
}

async function connections(gavel: GavelEndpoint, captainURL: string): Promise<BackendConnection[]> {
  const [gavelState, captain] = await Promise.all([probe("Gavel", await gavel.url({ start: false }), "/api/launch/openapi"), probe("Captain", captainURL, "/health")]);
  const pid = gavel.managed?.pid();
  // With nothing of its own running, a server that still answers at the on-demand address is someone else's.
  const management = pid !== undefined ? { management: "playground" as const, pid } : { management: gavel.managed && gavelState.status === "disconnected" ? "on-demand" as const : "external" as const };
  return [{ ...gavelState, ...management }, { ...captain, management: "external" }];
}

async function restart(gavel: GavelEndpoint, captainURL: string, name: string, response: ServerResponse) {
  if (name === "captain") return sendJson(response, 409, { error: `Captain at ${captainURL} is run outside the playground; restart it where it was started.` });
  if (!gavel.managed) return sendJson(response, 409, { error: `Gavel at ${await gavel.url({ start: false })} is run outside the playground (PLAYGROUND_GAVEL_URL); restart it where it was started.` });
  try {
    await gavel.managed.restart();
  } catch (cause) {
    return sendJson(response, cause instanceof GavelOwnershipError ? 409 : 502, { error: cause instanceof Error ? cause.message : String(cause) });
  }
  sendJson(response, 200, { connections: await connections(gavel, captainURL) });
}

type ConnectionsOptions = { gavel: GavelEndpoint; captainURL: string };

export function registerConnectionsMiddleware({ middlewares, gavel, captainURL }: ConnectionsOptions & { middlewares: MiddlewareApp }): void {
  const handle = async (request: IncomingMessage, response: ServerResponse) => {
    const path = new URL(request.url ?? "/", "http://playground.local").pathname;
    const action = /^\/(gavel|captain)\/restart$/.exec(path);
    if (action) {
      if (request.method !== "POST") return sendJson(response, 405, { error: "Restarting a backend requires POST" });
      return restart(gavel, captainURL, action[1]!, response);
    }
    if (path !== "/") return sendJson(response, 404, { error: `Unknown connection route ${path}` });
    if (request.method !== "GET") return sendJson(response, 405, { error: "Connection status requires GET" });
    sendJson(response, 200, { connections: await connections(gavel, captainURL) });
  };
  middlewares.use("/__playground/connections", (request, response) => {
    handle(request, response).catch(cause => sendJson(response, 500, { error: cause instanceof Error ? cause.message : String(cause) }));
  });
}

export function playgroundConnections(options: ConnectionsOptions): Plugin {
  return { name: "playground-connections", configureServer(server) {
    registerConnectionsMiddleware({ ...options, middlewares: server.middlewares });
  } };
}
