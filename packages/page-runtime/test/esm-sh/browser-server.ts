import { createServer, type Server, type ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import type { Fragment } from "../../src/schema.ts";
import { digest } from "../../src/sw/integrity.ts";
import { contentSecurityPolicy } from "../../src/sw/router.ts";
import { FACET, MANIFESTS, PROFILE, UI, recordedModules, registryResponse } from "./fixtures.ts";

const root = fileURLToPath(new URL("../../", import.meta.url));
const require = createRequire(import.meta.url);
const runtime = `${UI}@0.3.0/dist/runtime/react@18.3.1/`;
const PAGE = `import React from "react";
import { createRoot } from "react-dom/client";
import CopyToClipboard from "react-copy-to-clipboard";
import { sharedReact } from "@flanksource/clicky-ui";
function Page() {
  const oneReact = sharedReact === React && Object.getPrototypeOf(CopyToClipboard.prototype) === React.PureComponent.prototype;
  React.useLayoutEffect(() => { document.title = "CONVERTED-DONE"; }, []);
  return React.createElement(CopyToClipboard, { text: "fixture" }, React.createElement("button", { id: "converted", "data-one-react": oneReact }, "Copy fixture"));
}
createRoot(document.querySelector("#root")).render(React.createElement(Page));`;

async function bundle(entry: string): Promise<string> {
  const worker = entry === "src/sw/worker.ts";
  const output = await build({ input: root + entry, platform: "browser", resolve: { conditionNames: ["worker", "browser", "import", "default"], alias: { "facet-redact": fileURLToPath(new URL("./redact.ts", import.meta.url)) } }, transform: { define: { __RUNTIME_VERSION__: '"esm-fixture"', "process.env.NODE_ENV": '"development"', "process.env": "{}" } }, output: { format: worker ? "iife" : "es", codeSplitting: false }, write: false });
  const chunk = output.output.find((item) => item.type === "chunk");
  if (!chunk || chunk.type !== "chunk") throw new Error(`${entry}: fixture bundle has no JavaScript`);
  return chunk.code;
}

async function reactFiles(): Promise<Map<string, string>> {
  const names = Object.keys(require("react") as Record<string, unknown>);
  const output = await build({
    input: { react: "fixture:react", client: "fixture:react-dom/client" }, platform: "browser",
    transform: { define: { "process.env.NODE_ENV": '"development"' } },
    plugins: [{ name: "fixture-react-singleton", resolveId(source, importer, options) {
      if (source.startsWith("fixture:")) return source;
      if (source === "react" && importer !== "fixture:react") return options.kind === "require-call" ? "fixture:require-react" : { id: source, external: true };
      return null;
    }, load(id) {
      if (id === "fixture:require-react") return 'import React from "react"; module.exports = React;';
      if (!id.startsWith("fixture:")) return null;
      const specifier = id.slice(8);
      return `import value from ${JSON.stringify(require.resolve(specifier))}; export default value; ${(specifier === "react" ? names : ["createRoot", "hydrateRoot"]).map((name) => `export const ${name} = value.${name};`).join("\n")}`;
    } }], output: { format: "es", entryFileNames: "[name].js", chunkFileNames: "shared-[hash].js" }, write: false,
  });
  return new Map(output.output.filter((item) => item.type === "chunk").map((item) => [runtime + item.fileName, item.code]));
}

async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("fixture server has no TCP address");
  return `http://127.0.0.1:${address.port}`;
}

function send(response: ServerResponse, source: string, type = "text/javascript"): void {
  response.writeHead(200, { "content-type": type, "content-length": Buffer.byteLength(source), "access-control-allow-origin": "*" }); response.end(source);
}

export async function startConvertedBrowserServer() {
  const modules = await recordedModules();
  const files = await reactFiles();
  const worker = await bundle("src/sw/worker.ts");
  const client = await bundle("test/esm-sh/browser-client.ts");
  files.set(`${UI}@0.3.0/index.js`, 'import React from "react"; export const sharedReact = React;');
  files.set(`${FACET}@0.1.0/index.js`, "export {};");
  const integrity = Object.fromEntries(await Promise.all([...files].map(async ([path, code]) => [path, await digest(new TextEncoder().encode(code))])));
  const ui: Fragment = { fragment: 1, name: UI, imports: { [UI]: `${UI}@0.3.0/index.js`, react: `${runtime}react.js`, "react-dom/client": `${runtime}client.js` }, scopes: { [`${UI}@0.3.0/`]: {} }, remaps: {}, aliases: {}, inherits: [], integrity };
  const facet: Fragment = { ...ui, name: FACET, imports: { [FACET]: `${FACET}@0.1.0/index.js` }, scopes: {}, integrity: {} };
  const converterRequests: string[] = []; const packageRequests: string[] = [];
  const converter = createServer((request, response) => {
    const path = request.url!; converterRequests.push(path);
    const source = modules.get(path);
    if (source === undefined) { response.writeHead(404); response.end(`unrecorded converter URL ${path}`); return; }
    send(response, source);
  });
  const converterOrigin = await listen(converter);
  let origin = "";
  const profile = { ...PROFILE, embedders: [], convert: { origin: converterOrigin } };
  const server = createServer((request, response) => { void (async () => {
    const url = new URL(request.url!, origin);
    if (url.pathname === "/profile.json") { send(response, JSON.stringify({ ...profile, packageOrigin: `${origin}/packages`, registry: `${origin}/registry` }), "application/json"); return; }
    if (url.pathname.startsWith("/registry/")) { const data = registryResponse(decodeURIComponent(url.pathname.slice(10))); send(response, await data.text(), "application/json"); return; }
    if (url.pathname.endsWith("barrels.json")) { send(response, JSON.stringify({ modules: [], barrels: {} }), "application/json"); return; }
    if (url.pathname.endsWith("importmap.json")) { send(response, JSON.stringify(url.pathname.includes(UI) ? ui : facet), "application/json"); return; }
    if (url.pathname.startsWith("/packages/")) {
      const path = decodeURIComponent(url.pathname.slice(10)); packageRequests.push(path);
      const source = files.get(path);
      if (source === undefined) throw new Error(`missing fixture package ${path}`);
      send(response, source); return;
    }
    if (url.pathname === "/sw.js") { response.setHeader("service-worker-allowed", "/"); send(response, worker); return; }
    if (url.pathname === "/client.js") { send(response, client); return; }
    if (url.pathname === "/open.json") { send(response, JSON.stringify({ type: "open", page: "report.js", manifest: { dependencies: { "react-copy-to-clipboard": MANIFESTS["react-copy-to-clipboard"]!.version } }, files: { "report.js": PAGE } }), "application/json"); return; }
    if (url.pathname !== "/") { response.writeHead(404); response.end(`unexpected fixture route ${url.pathname}`); return; }
    response.setHeader("content-security-policy", contentSecurityPolicy({ ...profile, packageOrigin: origin, registry: origin }, "fixture"));
    send(response, '<!doctype html><html><head><title>CONVERTED-RUNNING</title></head><body><div id="root"></div><pre id="result"></pre><script type="module" src="/client.js"></script></body></html>', "text/html");
  })().catch((error: unknown) => { response.writeHead(500); response.end(String(error)); }); });
  try { origin = await listen(server); }
  catch (error) { converter.closeAllConnections(); converter.close(); throw error; }
  return { origin, converterRequests, packageRequests, close: async () => { await Promise.all([server, converter].map((item) => new Promise<void>((resolve, reject) => { item.closeAllConnections(); item.close((error) => error ? reject(error) : resolve()); }))); } };
}
