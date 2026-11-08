import { createServer, type Server, type IncomingMessage, type ServerResponse } from "node:http";
import { createRequire } from "node:module";
import { readFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import type { HostMessage, PageLock, RuntimeProfile } from "../../schema.ts";
import { digest } from "../../sw/router.ts";
import { buildStatic } from "../../../scripts/build-static.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const require = createRequire(import.meta.url);
const runtime = "@acme/runtime@1.0.0/";
const REACT_NAMES = ["Children", "Component", "Fragment", "PureComponent", "StrictMode", "Suspense", "cloneElement", "createContext", "createElement", "createRef", "forwardRef", "isValidElement", "lazy", "memo", "startTransition", "useCallback", "useContext", "useDebugValue", "useDeferredValue", "useEffect", "useId", "useImperativeHandle", "useInsertionEffect", "useLayoutEffect", "useMemo", "useReducer", "useRef", "useState", "useSyncExternalStore", "useTransition", "version", "__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED"];

async function runtimeFiles(): Promise<Map<string, string>> {
  const bundles = await build({
    input: { react: "runtime:react", "react-dom": "runtime:react-dom", "react-dom-client": "runtime:react-dom/client", "jsx-runtime": "runtime:react/jsx-runtime", "jsx-dev-runtime": "runtime:react/jsx-dev-runtime", comments: resolve(root, "../ui/src/comments.ts") },
    platform: "browser",
    transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    plugins: [{ name: "test-runtime-set", resolveId(source, importer, options) {
      if (source.startsWith("runtime:") || source === "external:react") return source;
      if (source === "react" && importer !== "runtime:react") return options.kind === "require-call" ? "external:react" : { id: "react", external: true };
      return null;
    }, load(id) {
      if (id === "external:react") return 'import * as React from "react"; export * from "react"; export default React.default;';
      if (id.startsWith("runtime:")) {
        const specifier = id.slice(8);
        const path = require.resolve(specifier);
        const names = specifier === "react" ? REACT_NAMES : specifier === "react-dom/client" ? ["createRoot", "hydrateRoot"] : specifier === "react-dom" ? ["flushSync", "version"] : specifier.endsWith("jsx-dev-runtime") ? ["jsxDEV", "Fragment"] : ["jsx", "jsxs", "Fragment"];
        return `import ns from ${JSON.stringify(path)}; export default ns; ${names.map((name) => `export const ${name} = ns.${name};`).join("\n")}`;
      }
      return null;
    } }],
    output: { format: "es", dir: resolve(root, ".tmp/browser-fixture"), entryFileNames: "[name].js", chunkFileNames: "shared-[hash].js" }, write: false,
  });
  return new Map(bundles.output.filter((file) => file.type === "chunk").map((file) => [runtime + file.fileName, file.code]));
}

const PAGE = `import React, { useLayoutEffect } from "react";
import { shared as one } from "@acme/library-one";
import { shared as two } from "@acme/library-two";
import "./page.css";
export const ready = () => new Promise(resolve => setTimeout(resolve, 250));
export default function Page({data}: {data: string}) {
  useLayoutEffect(() => { setTimeout(() => { document.querySelector('[data-facet-diagram]').setAttribute('data-facet-ready','true'); document.querySelector('[data-facet-arrow]').setAttribute('data-facet-arrow-ready','true'); }, 200); }, []);
  return <main data-facet-diagram data-facet-ready="false" data-one-react={React === one && one === two} data-hook={Boolean(window.__REACT_DEVTOOLS_GLOBAL_HOOK__)}><h1>{data}</h1><img src="/image.svg" /><svg data-facet-arrow data-facet-arrow-ready="false" /></main>;
}`;
const SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10" /></svg>';
type Case = "ready" | "agent" | "review" | "resolve" | "fetch" | "compile" | "link" | "render" | "readiness";
async function listen(server: Server): Promise<string> {
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("server has no port");
  return `http://127.0.0.1:${address.port}`;
}

export async function startRuntimeTestServer(options: { local?: boolean } = {}) {
  const output = resolve(root, ".tmp/B-core/static"); await mkdir(output, { recursive: true });
  await buildStatic({ outDir: output, dev: true, version: `browser-${Date.now()}` });
  const hostBuild = await build({ input: resolve(root, options.local ? "src/frame/testing/local-host.tsx" : "src/frame/testing/host.ts"), transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } }, output: { format: "es" }, write: false });
  const hostCode = hostBuild.output.find((f) => f.type === "chunk"); if (!hostCode || hostCode.type !== "chunk") throw new Error("host fixture did not bundle");
  const hostScript = hostCode.code;
  const files = await runtimeFiles();
  files.set("@acme/library-one@1.0.0/index.js", 'import React from "react"; export const shared = React; export function StatCard() { return React.createElement("h2", {id:"library-heading",style:{padding:"32px",margin:"32px"}}, "Revenue"); }');
  files.set("@acme/library-two@1.0.0/index.js", 'import React from "react"; export const shared = React;');
  const integrity = Object.fromEntries(await Promise.all([...files].map(async ([path, code]) => [path, await digest(new TextEncoder().encode(code))])));
  const lock: PageLock = { lock: 2, packageOrigin: "http://127.0.0.1", page: "report.tsx", versions: { react: "18.3.1", "@acme/library-one": "1.0.0", "@acme/library-two": "1.0.0" }, map: { imports: { react: `/npm/${runtime}react.js`, "react-dom/client": `/npm/${runtime}react-dom-client.js`, "react/jsx-runtime": `/npm/${runtime}jsx-runtime.js`, "react/jsx-dev-runtime": `/npm/${runtime}jsx-dev-runtime.js`, "@acme/library-one": "/npm/@acme/library-one@1.0.0/index.js", "@acme/library-two": "/npm/@acme/library-two@1.0.0/index.js" }, scopes: {} }, integrity, remaps: {}, barrels: { modules: [], barrels: {} } };
  lock.map.imports["@flanksource/clicky-ui/comments"] = `/npm/${runtime}comments.js`;
  lock.map.imports["react-dom"] = `/npm/${runtime}react-dom.js`;
  let hostOrigin = ""; let runtimeOrigin = ""; let packageRequests = 0; let registryRequests = 0;
  const server = createServer((req, res) => { void (async () => {
    const url = new URL(req.url!, runtimeOrigin);
    if (options.local && ["/", "/host.js", "/case.json"].includes(url.pathname)) { handleHost(req, res); return; }
    if (url.pathname === "/__playground/probe" || url.pathname.startsWith("/src/host-")) { res.end("host-route"); return; }
    if (url.pathname === "/profile.json") {
      const profile: RuntimeProfile = { runtimeDomain: "127.0.0.1", embedders: [hostOrigin], packageOrigin: `${runtimeOrigin}/packages`, registry: `${runtimeOrigin}/registry`, managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 1500 };
      res.setHeader("content-type", "application/json"); res.end(JSON.stringify(profile)); return;
    }
    if (url.pathname.startsWith("/packages/")) { packageRequests++; const file = files.get(decodeURIComponent(url.pathname.slice(10))); if (file === undefined) { res.statusCode = 404; res.end("missing package"); } else res.end(file); return; }
    if (url.pathname.startsWith("/registry")) { registryRequests++; res.statusCode = 500; res.end("registry must not be used"); return; }
    if (url.pathname === "/image.svg" || url.pathname === "/delayed.css") { await new Promise((resolve) => setTimeout(resolve, 180)); res.setHeader("content-type", url.pathname.endsWith("svg") ? "image/svg+xml" : "text/css"); res.end(url.pathname.endsWith("svg") ? SVG : "h1 { color: rgb(1, 2, 3); }"); return; }
    const file = url.pathname.startsWith("/frame/") ? "bootstrap.html" : url.pathname.slice(1);
    if (!["bootstrap.html", "sw.js", "boot.js", "page-agent.js", "devtools-hook.js"].includes(file)) { res.statusCode = 404; res.end("missing"); return; }
    res.setHeader("content-type", file.endsWith("html") ? "text/html" : "text/javascript"); res.end(await readFile(resolve(output, file)));
  })().catch((error: unknown) => { res.statusCode = 500; res.end(String(error)); }); });
  runtimeOrigin = await listen(server);
  lock.packageOrigin = `${runtimeOrigin}/packages`;
  function handleHost(req: IncomingMessage, res: ServerResponse) {
    const url = new URL(req.url!, hostOrigin);
    if (url.pathname === "/host.js") { res.setHeader("content-type", "text/javascript"); res.end(hostScript); return; }
    if (url.pathname === "/case.json") {
      const name = url.searchParams.get("case") as Case;
      const ownLock = structuredClone(lock);
      let source = PAGE;
      if (name === "agent") source = 'import { StatCard } from "@acme/library-one";\nexport default function Page() {\n  return <StatCard />;\n}';
      if (name === "review") source = 'export default function Page() { return <article data-review-id="summary"><h1 data-review-content>Review summary</h1></article>; }';
      if (options.local) source = 'export default function Page() { return <svg width="240" height="120"><rect id="target" width={160} height={80} fill="red" /></svg>; }';
      if (name === "resolve") ownLock.page = "other.tsx";
      if (name === "fetch") ownLock.integrity["@acme/library-one@1.0.0/index.js"] = "sha384-invalid";
      if (name === "compile") source = "export default function Page() { return <div>";
      if (name === "link") source = 'import x from "forbidden-package"; export default function Page() { return <main>{x}</main>; }';
      if (name === "render") source = 'export default function Page() { throw new Error("render failure"); }';
      if (name === "readiness") source = 'export const ready = new Promise(() => {}); export default function Page() { return <main>waiting</main>; }';
      const open: Extract<HostMessage, { type: "open" }> = { type: "open", page: "report.tsx", lock: ownLock, manifest: { dependencies: {} }, files: { "report.tsx": source, "page.css": '@import url("/delayed.css"); main { display: block; }' } };
      res.setHeader("content-type", "application/json"); res.end(JSON.stringify({ origin: runtimeOrigin, open, name })); return;
    }
    res.setHeader("content-type", "text/html"); res.end('<!doctype html><html><head><title>RUNNING</title></head><body><script type="module" src="/host.js"></script></body></html>');
  }
  const host = createServer(handleHost);
  hostOrigin = options.local ? runtimeOrigin : await listen(host);
  return { hostOrigin, runtimeOrigin, counts: () => ({ packageRequests, registryRequests }), close: async () => { await Promise.all((options.local ? [server] : [server, host]).map((s) => new Promise<void>((resolve, reject) => { s.closeAllConnections(); s.close((error) => error ? reject(error) : resolve()); }))); } };
}
