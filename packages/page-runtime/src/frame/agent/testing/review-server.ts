import { createServer } from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { build } from "rolldown";

export async function startReviewTestServer() {
  const result = await build({ input: fileURLToPath(new URL("./review-client.ts", import.meta.url)), platform: "browser", tsconfig: false,
    resolve: { alias: { "@flanksource/clicky-ui/comments": fileURLToPath(new URL("../../../../../ui/src/comments.ts", import.meta.url)) } },
    transform: { define: { "process.env.NODE_ENV": JSON.stringify("development") } }, output: { format: "es", codeSplitting: false }, write: false });
  const chunk = result.output.find((item) => item.type === "chunk" && item.isEntry);
  if (!chunk || chunk.type !== "chunk") throw new Error("Review fixture did not bundle");
  const controls = ["show", "hide", "rejected", "select", "approve", "export", "delete", "pins", "move-target", "move", "remove", "pick", "dispose"].map((id) => `<button id="${id}">${id}</button>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>LOADING</title><style>body{margin:24px}#root{margin-top:100px;min-height:1600px}#summary{width:400px;height:200px;border:1px solid}#controls{position:fixed;top:0}pre{white-space:pre-wrap}</style></head><body><div id="controls" data-react-grab-ignore>${controls}</div><main id="root"><article id="summary" data-review-id="summary" data-source="reports/revenue.tsx:1:1#0@012345abcdef"><h2 id="target">Revenue summary</h2><div data-review-content><svg width="100" height="60"><rect width="100" height="60" fill="blue"/></svg></div></article></main><pre id="error"></pre><pre id="events"></pre><script>window.addEventListener("error",e=>{document.getElementById("error").textContent=String(e.error?.stack??e.message)});window.addEventListener("unhandledrejection",e=>{document.getElementById("error").textContent=String(e.reason?.stack??e.reason)})</script><script type="module" src="./agent.js"></script></body></html>`;
  const directory = resolve("../../.tmp/V-runtime-for-j/file-document");
  await mkdir(directory, { recursive: true });
  for (const output of result.output) {
    if (output.type !== "chunk") throw new Error(`Unexpected review fixture asset ${output.fileName}`);
    await writeFile(resolve(directory, output.fileName), output.code);
  }
  await writeFile(resolve(directory, "agent.js"), chunk.code);
  await writeFile(resolve(directory, "report.html"), html);
  const server = createServer((request, response) => {
    const output = result.output.find((item) => `/${item.fileName}` === request.url);
    response.setHeader("content-type", request.url === "/agent.js" || output ? "text/javascript" : "text/html");
    response.end(request.url === "/agent.js" ? chunk.code : output?.type === "chunk" ? output.code : html);
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("Review server has no port");
  return { url: `http://127.0.0.1:${address.port}`, file: pathToFileURL(resolve(directory, "report.html")).href, close: () => new Promise<void>((resolve, reject) => { server.closeAllConnections(); server.close((error) => error ? reject(error) : resolve()); }) };
}
