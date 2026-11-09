import { readFile, realpath } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPackageHandler } from "@flanksource/page-runtime/dev";
import type { RuntimeProfile } from "@flanksource/page-runtime/schema";
import { productionMiddleware } from "./production-middleware";
import { productionConfig } from "./production-config";
import { registerProductionApi } from "./production-api";
import { productionAssets } from "./production-assets";
import { productionBrowserRoutes } from "./production-browser-routes";
import { productionChanges } from "./production-changes";
import { productionProxy } from "./production-proxy";
import { readDependencyDefaults, registerDependencyDefaults } from "./runtime-dependencies-defaults";

export async function startProductionServer(options: { root: string; port: number; host: string; outDir?: string }) {
  const { root } = options;
  const outDir = options.outDir ?? resolve(root, "dist/browser");
  const config = await productionConfig(root);
  const runtime = dirname(fileURLToPath(import.meta.resolve("@flanksource/page-runtime/static/bootstrap.html")));
  const packages = [resolve(root, "../../packages/ui"), resolve(root, "../../packages/react-grab"), await realpath(resolve(root, "../../../facet"))];
  const packageHandler = await createPackageHandler({ packages, stateDir: resolve(root, ".tmp/package-origin"), upstreamRegistry: "https://registry.npmjs.org", upstreamOrigin: "https://unpkg.com" });
  const app = productionMiddleware();
  let invalidateMetadata = () => {};
  const watchedDirectories = [...new Set([resolve(root, "docs"), ...config.sourceRoots.map(source => source.directory)])];
  const changes = productionChanges({ roots: watchedDirectories, changed: () => invalidateMetadata(), packages: packageHandler });
  app.middlewares.use(changes.middleware);
  registerDependencyDefaults({ middlewares: app.middlewares, root });
  app.middlewares.use(productionBrowserRoutes({ root, sourceRoots: config.sourceRoots }));
  app.middlewares.use(productionProxy({ prefix: "/oipa-api", target: config.env.PLAYGROUND_OIPA_URL ?? "http://localhost:8020" }));
  const api = registerProductionApi({ ...app, ...config, root, script: await readFile(resolve(outDir, "bookmarklet.js"), "utf8"), events: { created: changes.changed, changed: changes.changed, deleted: changes.changed, folderCreated: changes.changed, folderDeleted: changes.changed } });
  invalidateMetadata = api.changed;
  let origin = "";
  app.middlewares.use((request, response, next) => {
    const url = new URL(request.url ?? "/", origin);
    if (url.pathname.startsWith("/packages/")) { request.url = request.url!.slice("/packages".length); void packageHandler.handle(request, response); return; }
    if (url.pathname === "/profile.json") {
      const generationOrigin = `${origin}/packages/_generations/${packageHandler.current().revision}`;
      const profile: RuntimeProfile = { runtimeDomain: new URL(origin).host, embedders: [origin], packageOrigin: generationOrigin, registry: generationOrigin, managed: { "@flanksource/clicky-ui": "^0.3", "@flanksource/facet": "^0.1" }, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: ["https://fonts.googleapis.com/*", "https://fonts.gstatic.com/*"] }, csp: { add: { "style-src": ["https://fonts.googleapis.com"], "font-src": ["https://fonts.gstatic.com", "data:"] } }, links: "allow", sources: ["host", "url"], readinessTimeoutMs: 15000 };
      const defaults = readDependencyDefaults({ root });
      profile.dependencies = defaults.profile;
      profile.policy = { dependencies: "strict", allow: [...new Set([...defaults.packageNames, ...Object.keys(defaults.workspace)])].sort() };
      response.writeHead(200, { "Content-Type": "application/json", "Cache-Control": "no-store" }).end(JSON.stringify(profile)); return;
    }
    const name = url.pathname.startsWith("/frame/") ? "bootstrap.html" : url.pathname.slice(1);
    if (!["bootstrap.html", "sw.js", "boot.js", "page-agent.js", "export-compiler.js", "devtools-hook.js"].includes(name)) { next(); return; }
    void readFile(resolve(runtime, name)).then(bytes => {
      response.writeHead(200, { "Content-Type": extname(name) === ".html" ? "text/html" : "text/javascript", "Cache-Control": "no-store", "Service-Worker-Allowed": "/frame/" }).end(bytes);
    }).catch(next);
  });
  app.middlewares.use(await productionAssets({ root, outDir, revision: changes.revision, browser: true }));
  await new Promise<void>((done, reject) => { app.server.once("error", reject); app.server.listen(options.port, options.host, done); });
  const address = app.server.address();
  if (!address || typeof address === "string") throw new Error("Playground server has no address");
  origin = `http://${options.host === "::1" ? "[::1]" : options.host}:${address.port}`;
  return { origin, async close() { changes.close(); packageHandler.close(); await api.close(); app.server.closeAllConnections(); await new Promise<void>((done, reject) => app.server.close(error => error ? reject(error) : done())); } };
}
