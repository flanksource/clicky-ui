import { connectLinkRuntime } from "../../host/link/transport.ts";
import { exampleLink } from "../testing-fixtures.ts";

async function run() {
  await new Promise<void>((resolve) => { window.addEventListener("message", (event) => { if (event.origin === location.origin && event.data === "worker-ready") resolve(); }); });
  const connection = await connectLinkRuntime({ runtimeOrigin: location.origin, profile: { links: "allow" }, developerOverrides: true, relayPath: "/frame/_link-relay" });
  const link = exampleLink(); link.source = { kind: "server", url: `${location.origin}/checkout/` }; link.build.modules["src/version.js"] = { resolutions: {} };
  await connection.request({ type: "install", link });
  const probe = document.createElement("iframe"); probe.src = "/frame/probe"; document.body.append(probe);
  const reads: Array<{ code: string; compiled: string }> = [];
  await new Promise<void>((resolve, reject) => {
    window.addEventListener("message", (event) => {
      if (event.origin !== location.origin || event.source !== probe.contentWindow) return;
      void (async () => {
        if (event.data.error) throw new Error(event.data.error);
        reads.push(event.data);
        if (reads.length === 1) probe.contentWindow!.postMessage("read", location.origin);
        else if (reads.length === 2) {
          await fetch("/edit", { method: "POST" });
          await connection.request({ type: "invalidate", id: link.id, paths: ["src/version.js"] });
          probe.contentWindow!.postMessage("read", location.origin);
        } else resolve();
      })().catch(reject);
    });
  });
  const scopes = (await navigator.serviceWorker.getRegistrations()).map((registration) => new URL(registration.scope).pathname);
  document.getElementById("result")!.textContent = JSON.stringify({ shellControlled: Boolean(navigator.serviceWorker.controller), scopes, reads });
  connection.close(); document.title = "LINK-READY";
}
void run().catch((error: unknown) => { document.getElementById("error")!.textContent = String(error); document.title = "LINK-ERROR"; });
