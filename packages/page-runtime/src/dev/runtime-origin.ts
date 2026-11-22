import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { RuntimeProfile } from "../schema.ts";
import { createPackageHandler, type PackageOriginOptions } from "./index.ts";

// This module runs from src/ in the workspace and from a bundle in dist/node/ when installed, so locate the package root.
function packageAssets(): string {
  for (let dir = dirname(fileURLToPath(import.meta.url)); dir !== dirname(dir); dir = dirname(dir)) {
    if (existsSync(join(dir, "package.json")) && existsSync(join(dir, "dist/static"))) return join(dir, "dist/static");
  }
  throw new Error("Cannot find the built page-runtime assets; run the page-runtime build");
}

export type RuntimeOriginOptions = PackageOriginOptions & { hostOrigin: string; assetsDir?: string };

/** Serves built browser assets and local package publications on a separate loopback origin. */
export async function serveRuntime(options: RuntimeOriginOptions): Promise<{ origin: string; dependencies: Record<string, string>; close: () => Promise<void> }> {
  const host = new URL(options.hostOrigin);
  if (host.origin !== options.hostOrigin || !["http:", "https:"].includes(host.protocol) || !["localhost", "127.0.0.1", "[::1]"].includes(host.hostname)) throw new Error("Local page runtime requires an exact loopback origin");
  const assetsDir = options.assetsDir ?? packageAssets();
  const assets = new Map(await Promise.all(["bootstrap.html", "sw.js", "boot.js", "page-agent.js", "editing.js", "export-compiler.js", "devtools-hook.js"].map(async (file) => [file, await readFile(resolve(assetsDir, file))] as const)));
  const packages = await createPackageHandler(options);
  const dependencies = () => Object.fromEntries(Object.entries(packages.current().packages).map(([name, entry]) => [name, entry.version]));
  let origin: string;
  const server = createServer((request, response) => {
    try {
      const path = new URL(request.url ?? "/", "http://localhost").pathname;
      if (path.startsWith("/_generations/")) { void packages.handle(request, response); return; }
      if (request.method !== "GET" && request.method !== "HEAD") { response.writeHead(405).end(); return; }
      if (path === "/profile.json") {
        const packageOrigin = `${origin}/_generations/${packages.current().revision}`;
        const profile: RuntimeProfile = {
          runtimeDomain: new URL(origin).host, embedders: [host.origin], packageOrigin, registry: packageOrigin, managed: dependencies(),
          policy: { dependencies: "strict" }, minReleaseAgeDays: 0,
          network: { allow: ["https://fonts.googleapis.com/*", "https://fonts.gstatic.com/*"] },
          csp: { add: { "style-src": ["https://fonts.googleapis.com"], "font-src": ["'self'", "data:", "https://fonts.gstatic.com"] } },
          links: "deny", sources: ["host"], readinessTimeoutMs: 30000,
        };
        response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" }).end(request.method === "HEAD" ? undefined : JSON.stringify(profile));
        return;
      }
      const file = path.startsWith("/frame/") ? "bootstrap.html" : path.slice(1);
      const asset = assets.get(file);
      if (!asset) { response.writeHead(404).end("Runtime asset not found"); return; }
      response.writeHead(200, { "content-type": file.endsWith(".html") ? "text/html; charset=utf-8" : "text/javascript; charset=utf-8", "cache-control": "no-store", ...(file === "sw.js" ? { "service-worker-allowed": "/frame/" } : {}) });
      response.end(request.method === "HEAD" ? undefined : asset);
    } catch (error) {
      response.writeHead(500, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" }).end(request.method === "HEAD" ? undefined : error instanceof Error ? error.message : String(error));
    }
  });
  try { await new Promise<void>((done, fail) => { server.once("error", fail); server.listen(0, "127.0.0.1", done); }); }
  catch (error) { packages.close(); throw error; }
  origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { origin, get dependencies() { return dependencies(); }, close: () => new Promise<void>((done, fail) => {
    packages.close();
    server.closeAllConnections();
    server.close((error) => error ? fail(error) : done());
  }) };
}
