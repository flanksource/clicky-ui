import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { mkdir, mkdtemp, cp, symlink, readFile, writeFile, rename } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import { ResolverFactory } from "rolldown/experimental";
import type { PageLock, RuntimeProfile } from "../../schema.ts";
import { buildLinkRuntime } from "../build.ts";
import { composeLinkOverrides } from "../overrides.ts";
import { integrityOf, packageOf } from "../../build/trace.ts";
import { moduleUrl } from "../../sw/compiler.ts";

export type LinkRecord = { marker: string; at: number; elapsed: number; compiled: string[]; controlLoads: number; reactInstances: number; reactEvaluations: number; restored: boolean; deniedWithoutOverrides: boolean; folderTransport: boolean };
const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../../../..");
const here = dirname(fileURLToPath(import.meta.url));

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("No server port");
  return `http://127.0.0.1:${address.port}`;
}
async function bundle(entry: string): Promise<string> {
  const result = await build({ input: entry, platform: "browser", resolve: { conditionNames: ["worker", "browser", "import", "default"] }, transform: { define: { "process.env.NODE_ENV": JSON.stringify("development"), "process.env": "{}" } }, output: { format: "iife" }, write: false });
  const chunk = result.output.find((file) => file.type === "chunk"); if (!chunk || chunk.type !== "chunk") throw new Error("Missing test bundle"); return chunk.code;
}
function serve(handle: (request: IncomingMessage, response: ServerResponse) => Promise<void>): Server {
  return createServer((request, response) => { void handle(request, response).catch((error: unknown) => { response.statusCode = 500; response.end(String(error)); }); });
}

export async function startLinkTestServer() {
  await mkdir(join(root, ".tmp/H-link"), { recursive: true });
  const checkout = await mkdtemp(join(root, ".tmp/H-link/checkout-"));
  await cp(join(root, "packages/ui/src"), join(checkout, "src"), { recursive: true });
  await symlink(join(root, "packages/ui/node_modules"), join(checkout, "node_modules"), "dir");
  await writeFile(join(checkout, "package.json"), JSON.stringify({ name: "@flanksource/clicky-ui", version: "9.0.0", type: "module", sideEffects: ["**/*.css"], exports: { "./data": "./dist/Version.js" } }));
  const original = 'import * as __linkProbeReact from "react";\n' + await readFile(join(checkout, "src/data/Version.tsx"), "utf8") + '\nexport const linkedVersionReact = __linkProbeReact.default;\n';
  const tablePath = join(checkout, "src/data/DataTable.tsx");
  await writeFile(tablePath, 'import * as __linkProbeReact from "react";\n' + await readFile(tablePath, "utf8") + '\nexport const linkedTableReact = __linkProbeReact.default;\n');
  const edit = async (revision: number) => {
    const path = join(checkout, "src/data/Version.tsx");
    const marker = '<span data-link-edit>revision-' + revision + '</span>';
    await writeFile(path + ".next", original.replace("{parts.length > 0 &&", marker + "{parts.length > 0 &&"));
    await rename(path + ".next", path);
  };
  await edit(0);
  await writeFile(join(checkout, "src/link-data.ts"), 'export { Version, linkedVersionReact } from "./data/Version"; export { DataTable, linkedTableReact } from "./data/DataTable";');
  const dist = await build({ input: join(checkout, "src/link-data.ts"), platform: "browser", external: (source) => !source.startsWith(".") && !isAbsolute(source), output: { dir: join(checkout, "dist"), format: "es", preserveModules: true, preserveModulesRoot: join(checkout, "src"), entryFileNames: "[name].js" } });
  const entry = dist.output.find((file) => file.type === "chunk" && file.isEntry);
  if (!entry) throw new Error("Missing Version dist fixture");
  await writeFile(join(checkout, "package.json"), JSON.stringify({ name: "@flanksource/clicky-ui", version: "9.0.0", type: "module", sideEffects: ["**/*.css"], exports: { "./data": `./dist/${entry.fileName}` } }));
  const built = await buildLinkRuntime({ libraryDir: checkout, outDir: join(checkout, "dist/runtime"), entries: { "@flanksource/clicky-ui/data": "src/link-data.ts" }, defines: { __CLICKY_COMMIT__: "checkout-commit", __CLICKY_TAG__: "local", __CLICKY_DATE__: "2026-01-01", __CLICKY_DIRTY__: false } });
  const target = built.fragment.imports.react!;
  const path = join(checkout, target.slice(`${built.library}@${built.version}/`.length));
  const code = "globalThis.__LINK_REACT_EVALUATIONS__ = (globalThis.__LINK_REACT_EVALUATIONS__ ?? 0) + 1;\n" + await readFile(path, "utf8");
  await writeFile(path, code); built.fragment.integrity[target] = integrityOf(code);
  await writeFile(join(checkout, "dist/runtime/link.json"), JSON.stringify(built));
  const source = serve(async (request, response) => {
    response.setHeader("access-control-allow-origin", "*"); response.setHeader("cache-control", "no-store");
    const path = resolve(checkout, "." + decodeURIComponent(new URL(request.url!, "http://localhost").pathname));
    if (!path.startsWith(checkout + sep)) { response.statusCode = 403; response.end("outside checkout"); return; }
    try { response.end(await readFile(path)); } catch (error) { response.statusCode = 404; response.end(String(error)); }
  });
  const sourceOrigin = await listen(source);
  let hostOrigin = ""; let runtimeOrigin = "";
  const profile: RuntimeProfile = { runtimeDomain: "127.0.0.1", embedders: [], packageOrigin: "http://127.0.0.1", registry: "http://127.0.0.1/registry", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 15000 };
  const baseLock: PageLock = { lock: 2, packageOrigin: profile.packageOrigin, page: "page.tsx", versions: { "@flanksource/clicky-ui": "1.0.0" }, map: { imports: {}, scopes: {} }, integrity: {}, remaps: {}, barrels: { modules: [], barrels: {} } };
  const lock = composeLinkOverrides({ lock: baseLock, links: [{ id: "checkout", build: built, source: { kind: "server", url: sourceOrigin } }], profile, developerOverrides: true });
  const resolver = new ResolverFactory({ conditionNames: ["browser", "import", "module", "default"], extensions: [".js", ".mjs"], symlinks: true });
  const runtimeFiles = new Map<string, string>();
  // Transitive packages are only resolvable from the packages that depend on them, so each one is looked up
  // from the checkout and every package directory found so far, and must match the traced version.
  const packageDirs = [checkout];
  const pending = Object.keys(built.fragment.integrity).filter((path) => !path.startsWith(`${built.library}@${built.version}/`));
  while (pending.length) {
    const found = pending.filter((path) => {
      const match = /^(@[^/]+\/[^@]+|[^@]+)@([^/]+)\/(.*)$/.exec(path); if (!match) throw new Error(`Invalid package path ${path}`);
      for (const base of packageDirs) {
        const result = resolver.sync(base, match[1]!);
        if (!result.path) continue;
        const pkg = packageOf(result.path);
        if (pkg.version !== match[2]) continue;
        runtimeFiles.set(path, join(pkg.dir, match[3]!));
        if (!packageDirs.includes(pkg.dir)) packageDirs.push(pkg.dir);
        return true;
      }
      return false;
    });
    if (!found.length) throw new Error(`Missing dependency manifests: ${pending.join(", ")}`);
    for (const path of found) pending.splice(pending.indexOf(path), 1);
  }
  const workerCode = await bundle(join(here, "worker.ts"));
  const clientCode = await bundle(join(here, "client.ts"));
  const runtime = serve(async (request, response) => {
    const url = new URL(request.url!, runtimeOrigin); response.setHeader("cache-control", "no-store");
    if (url.pathname === "/worker.js") { response.setHeader("content-type", "text/javascript"); response.end(workerCode); return; }
    if (url.pathname === "/profile.json") { response.setHeader("content-type", "application/json"); response.end(JSON.stringify(profile)); return; }
    if (url.pathname.startsWith("/packages/")) { const file = runtimeFiles.get(decodeURIComponent(url.pathname.slice(10))); if (!file) throw new Error(`Missing package ${url.pathname}`); response.end(await readFile(file)); return; }
    response.setHeader("content-type", "text/html");
    if (url.pathname === "/setup") { response.end(`<!doctype html><script>navigator.serviceWorker.addEventListener("message",e=>parent.postMessage(e.data,${JSON.stringify(hostOrigin)}));window.addEventListener("message",e=>{if(e.source!==parent||e.origin!==${JSON.stringify(hostOrigin)})return;navigator.serviceWorker.controller.postMessage(e.data,e.ports)});(async()=>{await navigator.serviceWorker.register("/worker.js");await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener("controllerchange",r,{once:true}));parent.postMessage("runtime-ready",${JSON.stringify(hostOrigin)})})()</script>`); return; }
    if (url.pathname === "/control") { response.end(`<!doctype html><p>Unlinked control</p><script>parent.postMessage("control-ready",${JSON.stringify(hostOrigin)})</script>`); return; }
    if (url.pathname === "/test-frame") {
      const map = { imports: Object.fromEntries(Object.entries(lock.map.imports).map(([name, target]) => [name, moduleUrl(target)])), scopes: Object.fromEntries(Object.entries(lock.map.scopes).map(([scope, table]) => [scope, Object.fromEntries(Object.entries(table).map(([name, target]) => [name, moduleUrl(target)]))])) };
      response.end(`<!doctype html><html><head><script type="importmap">${JSON.stringify(map)}</script></head><body><div id="root"></div><script type="module">try{await import("/src/page.tsx?page=page.tsx");const ready=()=>{const marker=document.querySelector("[data-link-edit]");if(marker&&document.querySelectorAll("tbody tr").length===2)requestAnimationFrame(()=>requestAnimationFrame(()=>parent.postMessage({marker:marker.textContent,at:performance.timeOrigin+performance.now(),reactInstances:globalThis.reactInstances,reactEvaluations:globalThis.__LINK_REACT_EVALUATIONS__},${JSON.stringify(hostOrigin)})));else requestAnimationFrame(ready)};ready()}catch(e){parent.postMessage({error:String(e)},${JSON.stringify(hostOrigin)})}</script></body></html>`); return;
    }
    response.statusCode = 404; response.end("missing runtime test page");
  });
  runtimeOrigin = await listen(runtime); profile.packageOrigin = `${runtimeOrigin}/packages`;
  baseLock.packageOrigin = profile.packageOrigin; lock.packageOrigin = profile.packageOrigin;
  const records: LinkRecord[] = []; const errors: string[] = [];
  const host = serve(async (request, response) => {
    if (request.url === "/client.js") { response.setHeader("content-type", "text/javascript"); response.end(clientCode); return; }
    if (request.url === "/record") { const chunks = []; for await (const chunk of request) chunks.push(chunk); const record = JSON.parse(Buffer.concat(chunks).toString()); if (record.error) errors.push(record.error); else records.push(record); response.end("ok"); return; }
    response.setHeader("content-type", "text/html"); response.end(`<!doctype html><h1>Linked checkout</h1><button id="folder">Link folder</button><p id="status">File-server link</p><iframe id="setup" hidden></iframe><iframe id="linked" style="width:900px;height:400px"></iframe><iframe id="control"></iframe><script type="application/json" id="config">${JSON.stringify({ runtimeOrigin, sourceOrigin, profile, lock: baseLock, build: built }).replaceAll("<", "\\u003c")}</script><script src="/client.js"></script>`);
  });
  hostOrigin = await listen(host); profile.embedders = [hostOrigin];
  return { hostOrigin, checkout, edit, async next(): Promise<LinkRecord> {
    const deadline = Date.now() + 30000;
    while (!records.length) { if (errors.length) throw new Error(errors.join("\n")); if (Date.now() > deadline) throw new Error("Timed out waiting for linked frame"); await new Promise((resolve) => setTimeout(resolve, 25)); }
    return records.shift()!;
  }, async close() { await Promise.all([host, runtime, source].map((server) => new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve())))); } };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const server = await startLinkTestServer();
  process.stdout.write(`Link verification host: ${server.hostOrigin}\nFolder to select: ${server.checkout}\n`);
  process.once("SIGINT", () => { void server.close(); });
  process.once("SIGTERM", () => { void server.close(); });
}
