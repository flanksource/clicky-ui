import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { servePackages } from "../../../packages/page-runtime/src/dev/index.ts";

const root = dirname(fileURLToPath(import.meta.resolve("@flanksource/page-runtime/static/bootstrap.html")));
const port = Number(process.env.PAGE_RUNTIME_PORT ?? 5811);
const embedder = process.env.PAGE_HOST_ORIGIN ?? "http://localhost:5810";
const hostProfile = process.env.PAGE_HOST_PROFILE ?? "default";
if (!["default", "developer"].includes(hostProfile)) throw new Error(`Unknown page-host profile: ${hostProfile}`);
const converterOrigin = process.env.PAGE_ESM_SH_ORIGIN;
if (converterOrigin !== undefined) {
  if (hostProfile !== "developer") throw new Error("PAGE_ESM_SH_ORIGIN requires PAGE_HOST_PROFILE=developer");
  const converter = new URL(converterOrigin);
  if (!["http:", "https:"].includes(converter.protocol) || converter.username || converter.password || converter.origin !== converterOrigin) throw new Error("PAGE_ESM_SH_ORIGIN must be an http(s) origin without credentials, path, query or fragment");
}
if (Boolean(process.env.PAGE_PACKAGE_ORIGIN) !== Boolean(process.env.PAGE_REGISTRY)) throw new Error("Set both PAGE_PACKAGE_ORIGIN and PAGE_REGISTRY, or neither to serve workspace packages");
const packages = [new URL("../../../packages/ui/", import.meta.url), new URL("../../../../facet/", import.meta.url)].map((url) => fileURLToPath(url));
if (!process.env.PAGE_PACKAGE_ORIGIN) {
  for (const directory of packages) {
    for (const artifact of ["dist/runtime/importmap.json", "dist/runtime/barrels.json"]) await readFile(resolve(directory, artifact));
  }
}
const local = process.env.PAGE_PACKAGE_ORIGIN ? null : await servePackages({
  packages, port: Number(process.env.PAGE_PACKAGE_PORT ?? 5812),
  upstreamRegistry: process.env.PAGE_UPSTREAM_REGISTRY ?? "https://registry.npmjs.org",
  upstreamOrigin: process.env.PAGE_UPSTREAM_ORIGIN ?? "https://unpkg.com",
});
if (local) process.stdout.write(`Workspace package registry and origin: ${local.origin}\n`);
const profile = {
  runtimeDomain: `localhost:${port}`, embedders: [embedder],
  packageOrigin: local ? local.origin : process.env.PAGE_PACKAGE_ORIGIN,
  registry: local ? local.origin : process.env.PAGE_REGISTRY,
  managed: { "@flanksource/clicky-ui": "^0.3", "@flanksource/facet": "^0.1" },
  policy: { dependencies: "strict", allow: converterOrigin === undefined ? [] : ["react-copy-to-clipboard"] }, ...(converterOrigin === undefined ? {} : { convert: { origin: converterOrigin } }), minReleaseAgeDays: 7,
  network: { allow: ["https://fonts.googleapis.com/*", "https://fonts.gstatic.com/*"] },
  csp: { add: { "style-src": ["https://fonts.googleapis.com"], "font-src": ["https://fonts.gstatic.com", "data:"] } },
  links: hostProfile === "developer" ? "allow" : "deny", sources: ["host", "opfs", "folder", "url", "hash"], readinessTimeoutMs: 15000,
};
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".map": "application/json" };
await readFile(resolve(root, "sw.js"));
const server = createServer((request, response) => {
  void (async () => {
    const url = new URL(request.url ?? "/", `http://localhost:${port}`);
    if (url.pathname === "/profile.json") {
      response.writeHead(200, { "content-type": "application/json", "cache-control": "no-store", "access-control-allow-origin": embedder });
      response.end(JSON.stringify(profile)); return;
    }
    const path = resolve(root, url.pathname.startsWith("/frame/") ? "bootstrap.html" : decodeURIComponent(url.pathname).slice(1));
    if (!path.startsWith(`${root}${sep}`) || !types[extname(path)]) { response.writeHead(404); response.end("Runtime file not found"); return; }
    const bytes = await readFile(path);
    const etag = `"${createHash("sha256").update(bytes).digest("hex")}"`;
    const headers = { "content-type": types[extname(path)], "cache-control": "no-cache", "service-worker-allowed": "/", etag };
    if (request.headers["if-none-match"] === etag) { response.writeHead(304, headers); response.end(); return; }
    response.writeHead(200, headers);
    response.end(bytes);
  })().catch((error) => {
    response.writeHead(error.code === "ENOENT" ? 404 : 500, { "content-type": "text/plain" });
    response.end(error.message);
  });
});
server.listen(port, "localhost", () => process.stdout.write(`Runtime static origin: http://localhost:${port}\n`));
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => {
  server.closeAllConnections(); server.close();
  if (local) void local.close().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 1; });
});
