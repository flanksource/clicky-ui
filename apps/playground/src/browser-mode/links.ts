import { connectLinkRuntime, createLinkHost, type StoredLink } from "@flanksource/page-runtime/host/link";
import type { PageLock, RuntimeProfile } from "@flanksource/page-runtime/schema";
import type { BrowserProject } from "./project";

/** Scope the runtime service worker is registered with; `clearPageRuntimeCache` unregisters exactly this scope. */
export const RUNTIME_WORKER_SCOPE = "/frame/";

export async function connectPageLinks(profile: RuntimeProfile) {
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: RUNTIME_WORKER_SCOPE, type: "module" });
  const worker = registration.installing ?? registration.waiting ?? registration.active;
  if (!worker) throw new Error("Runtime service worker registration has no worker");
  if (worker.state !== "activated") await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => { worker.removeEventListener("statechange", changed); reject(new Error("Runtime worker activation timed out")); }, 15000);
    const changed = () => {
      if (worker.state !== "activated" && worker.state !== "redundant") return;
      clearTimeout(timer); worker.removeEventListener("statechange", changed);
      if (worker.state === "activated") resolve(); else reject(new Error("Runtime worker became redundant"));
    };
    worker.addEventListener("statechange", changed);
  });
  const connection = await connectLinkRuntime({ runtimeOrigin: location.origin, profile, developerOverrides: true, relayPath: "/frame/_link-relay" });
  const host = createLinkHost({ profile, developerOverrides: true, transport: connection.request });
  return { host, async install(project: Extract<BrowserProject, { compatible: true }>, lock: PageLock, local: StoredLink[] = []) {
    for (const link of local) await host.install(link);
    for (const link of project.links) {
      if (link.source.kind !== "server") throw new Error("Playground requires server source links");
      await host.install({ ...link, source: { kind: "server", url: new URL(link.source.url, location.origin).href } });
    }
    const next = host.override({ lock, ids: project.links.map(link => link.id) });
    Object.assign(next.map.imports, project.aliases);
    return next;
  }, async close() { await host.close(); connection.close(); } };
}
