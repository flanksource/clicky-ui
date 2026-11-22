import { resolve } from "node:path";
import type { Plugin } from "vite";
import { serveRuntime } from "../../../packages/page-runtime/src/dev/index.ts";

/** The browser runtime stays cross-origin and uses this checkout's package publications. */
export function pageRuntime(options: { workspaceRoot: string; facetRoot: string }): Plugin {
  const { workspaceRoot, facetRoot } = options;
  return {
    name: "storybook-page-runtime",
    configureServer(server) {
      const origins = new Map<string, ReturnType<typeof serveRuntime>>();
      server.middlewares.use("/__page-runtime", (request, response) => {
        if (request.method !== "GET") { response.writeHead(405).end(); return; }
        const hostOrigin = `http://${request.headers.host}`;
        let runtime = origins.get(hostOrigin);
        if (!runtime) {
          runtime = serveRuntime({ hostOrigin, packages: [resolve(workspaceRoot, "packages/ui"), facetRoot], stateDir: resolve(workspaceRoot, ".tmp/storybook/runtime-packages"), upstreamRegistry: "https://registry.npmjs.org", upstreamOrigin: "https://unpkg.com" });
          origins.set(hostOrigin, runtime);
        }
        void runtime.then(({ origin, dependencies }) => {
          response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store" }).end(JSON.stringify({ runtimeOrigin: origin, manifest: { dependencies } }));
        }).catch((error: unknown) => {
          origins.delete(hostOrigin);
          response.writeHead(500, { "content-type": "text/plain" }).end(error instanceof Error ? error.message : String(error));
        });
      });
      server.httpServer?.once("close", () => {
        for (const runtime of origins.values()) void runtime.then(active => active.close()).catch(error => server.config.logger.error(String(error)));
      });
    },
  };
}
