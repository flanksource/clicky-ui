import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";
import { compileScript } from "../../../sw/compile.ts";
import type { Fragment } from "../../../schema.ts";

export async function startAgentTestServer() {
  const library = fileURLToPath(new URL("../../../../../ui/", import.meta.url));
  const fragment = JSON.parse(await readFile(resolve(library, "dist/runtime/importmap.json"), "utf8")) as Fragment;
  const prefix = `${fragment.name}@`;
  const styles = await readFile(resolve(library, "dist/styles.css"), "utf8");
  const bundle = await build({
    input: fileURLToPath(new URL("./client.ts", import.meta.url)), platform: "browser", tsconfig: false,
    transform: { jsx: { runtime: "automatic" }, define: { "process.env.NODE_ENV": JSON.stringify("development") } },
    plugins: [{ name: "page-callsite", resolveId(source) {
      if (source === "@flanksource/clicky-ui/comments") return resolve(library, "src/comments.ts");
      if (source === "@flanksource/clicky-ui/components") return resolve(library, "dist/overlay/Modal.js");
      const url = fragment.imports[source];
      if (url?.startsWith(prefix)) return resolve(library, url.slice(url.indexOf("/", prefix.length) + 1));
      return null;
    }, transform(code, id) {
      const path = id.endsWith("/callsite.tsx") ? "report.tsx" : id.endsWith("/modal.tsx") ? "modal-report.tsx" : null;
      if (!path) return;
      return { code: compileScript({ path, extension: ".tsx", code }) };
    } }],
    onLog(level, log, handler) { if (log.code === "UNRESOLVED_IMPORT") throw new Error(log.message); handler(level, log); },
    output: { format: "es", codeSplitting: false }, write: false,
  });
  const code = bundle.output.find((file) => file.type === "chunk");
  if (!code || code.type !== "chunk") throw new Error("agent fixture did not bundle");
  const hostBundle = await build({
    input: fileURLToPath(new URL("./vocabulary-host.ts", import.meta.url)), platform: "browser", tsconfig: false,
    output: { format: "es", codeSplitting: false }, write: false,
  });
  const hostCode = hostBundle.output.find((file) => file.type === "chunk");
  if (!hostCode || hostCode.type !== "chunk") throw new Error("vocabulary host fixture did not bundle");
  const server = createServer((req, res) => {
    if (req.url === "/vocabulary") {
      res.setHeader("content-type", "text/html");
      res.end('<!doctype html><html><head><title>LOADING</title></head><body><button id="capture">Capture vocabulary</button><pre id="capture-result"></pre><pre id="capture-error"></pre><iframe src="/?vocabulary" style="width:100%;height:600px"></iframe><script type="module" src="/vocabulary-host.js"></script></body></html>'); return;
    }
    if (req.url === "/vocabulary-host.js") { res.setHeader("content-type", "text/javascript"); res.end(hostCode.code); return; }
    if (req.url === "/embedded") {
      res.setHeader("content-type", "text/html");
      res.end('<!doctype html><html><body><iframe id="agent-frame" src="/?callsite" style="width:100%;height:900px;border:0"></iframe></body></html>'); return;
    }
    if (req.url === "/agent.js") { res.setHeader("content-type", "text/javascript"); res.end(code.code); return; }
    if (req.url === "/styles.css") { res.setHeader("content-type", "text/css"); res.end(styles); return; }
    res.setHeader("content-type", "text/html");
    res.end(`<!doctype html><html><head><title>LOADING</title>${req.url && /modal|vocabulary/.test(req.url) ? '<link rel="stylesheet" href="/styles.css">' : ""}<style>
      body{margin:24px}#root{margin-top:100px;min-height:2400px}main{width:300px;padding:24px}h2{height:40px}
      button{background:rgb(255,0,0)!important;color:black!important}#registered{margin-top:1400px}
      #controls{position:fixed;top:8px;left:8px;z-index:2147483645}pre{white-space:pre-wrap}
    </style></head><body><div id="controls" data-react-grab-ignore>
      ${["pick", "pins", "move", "remove", "modal-move", "modal-remove", "registered-pin", "highlight", "scroll", "page", "dispose", "inspect", "focus-pin", "export"].map((id) => `<button id="${id}">${id}</button>`).join("")}
    </div><div id="root"></div><pre id="events"></pre><pre id="error"></pre><pre id="inspection"></pre><pre id="snapshot"></pre><script type="module" src="/agent.js"></script></body></html>`);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("agent server has no port");
  return { url: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((resolve, reject) => {
    server.closeAllConnections(); server.close((error) => error ? reject(error) : resolve());
  }) };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = await startAgentTestServer();
  process.stdout.write(`Page agent fixture: ${server.url}\n`);
  process.once("SIGINT", () => { void server.close().then(() => process.exit(0)); });
}
