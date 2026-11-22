// @vitest-environment node
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { resolve } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { fixedGavel } from "./gavel-launch-server";
import { playgroundRepositoryDocuments } from "./repository-documents-server";

afterEach(() => vi.unstubAllGlobals());

it("rejects cross-origin workspace grants before proxying and forwards a trusted local origin", async () => {
  mkdirSync(resolve(".tmp"), { recursive: true });
  const dir = mkdtempSync(resolve(".tmp/workspace-proxy-"));
  const routes = new Map<string, (req: IncomingMessage, res: ServerResponse) => void>();
  const plugin = playgroundRepositoryDocuments({ dir, endpoint: fixedGavel("http://gavel.local") });
  (plugin.configureServer as (server: unknown) => void)({ middlewares: { use: (route: string, handler: (req: IncomingMessage, res: ServerResponse) => void) => routes.set(route, handler) } });
  const server = createServer((req, res) => {
    const handler = routes.get("/__playground/gavel");
    if (!handler) throw new Error("Gavel middleware missing");
    handler(req, res);
  });
  const realFetch = globalThis.fetch;
  const upstream = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
    expect(init?.headers).toMatchObject({ Origin: "http://gavel.local" });
    return Response.json({ roots: [], canManage: true });
  });
  vi.stubGlobal("fetch", (input: string | URL | Request, init?: RequestInit) => new URL(String(input)).host === "gavel.local" ? upstream(input, init) : realFetch(input, init));
  try {
    await new Promise<void>(done => server.listen(0, "127.0.0.1", done));
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server has no address");
    const origin = `http://127.0.0.1:${address.port}`;
    const denied = await fetch(`${origin}/api/workspace/access`, { headers: { Origin: "https://evil.example" } });
    expect(denied.status).toBe(403);
    expect(upstream).not.toHaveBeenCalled();
    const allowed = await fetch(`${origin}/api/workspace/access`, { headers: { Origin: origin } });
    expect(allowed.status).toBe(200);
    expect(upstream).toHaveBeenCalledOnce();
  } finally {
    await new Promise<void>((done, reject) => server.close(error => error ? reject(error) : done()));
    rmSync(dir, { recursive: true, force: true });
  }
});
