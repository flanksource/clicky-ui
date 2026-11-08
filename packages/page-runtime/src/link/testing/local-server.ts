import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";

export async function startLocalLinkServer() {
  async function bundle(entry: string) {
    const output = await build({ input: fileURLToPath(new URL(entry, import.meta.url)), platform: "browser", resolve: { conditionNames: ["worker", "browser", "import", "default"] }, transform: { define: { "process.env.NODE_ENV": JSON.stringify("development"), "process.env": "{}" } }, output: { format: "iife" }, write: false });
    const chunk = output.output.find((item) => item.type === "chunk"); if (!chunk || chunk.type !== "chunk") throw new Error("Missing local link fixture bundle"); return chunk.code;
  }
  const worker = await bundle("./local-worker.ts");
  const client = await bundle("./local-client.ts");
  let revision = 0;
  const server = createServer((request, response) => {
    const path = new URL(request.url!, "http://fixture.invalid").pathname;
    if (path === "/frame/worker.js" || path === "/client.js") { response.setHeader("content-type", "text/javascript"); response.end(path === "/client.js" ? client : worker); return; }
    if (path === "/checkout/src/version.js") { response.end(`export const value = "revision-${revision}";`); return; }
    if (path === "/edit" && request.method === "POST") { revision++; response.end("ok"); return; }
    response.setHeader("content-type", "text/html");
    if (path === "/frame/setup") { response.end('<!doctype html><script>(async()=>{await navigator.serviceWorker.register("/frame/worker.js",{scope:"/frame/"});await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise(r=>navigator.serviceWorker.addEventListener("controllerchange",r,{once:true}));parent.postMessage("worker-ready",location.origin)})()</script>'); return; }
    if (path === "/frame/probe") { response.end('<!doctype html><script>async function read(){try{const r=await fetch("/link/checkout/src/version.js?page=page.tsx");parent.postMessage({code:await r.text(),compiled:r.headers.get("x-link-compiled")},location.origin)}catch(e){parent.postMessage({error:String(e)},location.origin)}}window.addEventListener("message",e=>{if(e.source===parent&&e.origin===location.origin&&e.data==="read")read()});read()</script>'); return; }
    response.end('<!doctype html><title>LOADING</title><h1>Local link</h1><pre id="result"></pre><pre id="error"></pre><iframe src="/frame/setup" hidden></iframe><script src="/client.js"></script>');
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("No local link server port");
  return { url: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((resolve, reject) => { server.closeAllConnections(); server.close((error) => error ? reject(error) : resolve()); }) };
}
