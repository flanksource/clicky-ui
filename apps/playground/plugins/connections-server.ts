import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import type { MiddlewareApp } from "./middleware";
import type { GavelEndpoint } from "./gavel-launch-server";
import { sendJson } from "./comments-server";
import { checkGavelCompatibility, GavelCompatibilityError } from "./gavel-compatibility";

/** A backend the playground reaches but never runs; Gavel and Captain are started where the developer runs them. */
export type BackendConnection = {
  name: "Gavel" | "Captain";
  url: string;
  status: "connected" | "incompatible" | "disconnected";
  error?: string;
};

async function probe(name: BackendConnection["name"], url: string, path: string): Promise<BackendConnection> {
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
  return Promise.all([probe("Gavel", await gavel.url(), "/api/launch/openapi"), probe("Captain", captainURL, "/health")]);
}

type ConnectionsOptions = { gavel: GavelEndpoint; captainURL: string };

export function registerConnectionsMiddleware({ middlewares, gavel, captainURL }: ConnectionsOptions & { middlewares: MiddlewareApp }): void {
  const handle = async (request: IncomingMessage, response: ServerResponse) => {
    const path = new URL(request.url ?? "/", "http://playground.local").pathname;
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
