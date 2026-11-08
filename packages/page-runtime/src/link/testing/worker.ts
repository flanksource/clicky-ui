import { createRouter } from "../../sw/router.ts";
import { BASE_PLUGINS } from "../../sw/compiler.ts";
import { createPageClients } from "../../sw/page-clients.ts";
import type { RuntimeProfile } from "../../schema.ts";

const worker = self as unknown as {
  location: Location; skipWaiting(): Promise<void>;
  clients: { claim(): Promise<void>; get(id: string): Promise<{ id: string; url: string } | undefined>; matchAll(options?: { type: "all"; includeUncontrolled: boolean }): Promise<Array<{ id: string; postMessage(value: unknown): void }>> };
  addEventListener(type: string, listener: (event: { request: Request; clientId: string; resultingClientId: string; data: { stats?: boolean; message?: unknown }; ports: MessagePort[]; waitUntil(promise: Promise<unknown>): void; respondWith(promise: Promise<Response>): void }) => void): void;
};
const router = fetch("/profile.json").then(async (response) => createRouter({ origin: worker.location.origin, version: "link-browser", profile: await response.json() as RuntimeProfile, caches, plugins: BASE_PLUGINS }));
const pageClients = createPageClients({ origin: worker.location.origin, clients: worker.clients });
let compiled: string[] = [];
worker.addEventListener("install", (event) => event.waitUntil(worker.skipWaiting()));
worker.addEventListener("activate", (event) => event.waitUntil(worker.clients.claim()));
worker.addEventListener("message", (event) => event.waitUntil((async () => {
  try {
    if (event.data.stats) { event.ports[0]!.postMessage({ compiled }); compiled = []; }
    else { await (await router).message(event.data.message); event.ports[0]!.postMessage({ ok: true }); }
  } catch (error) { event.ports[0]!.postMessage({ error: String(error) }); }
})()));
worker.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== worker.location.origin || !/^\/(src|link|npm|frame)\//.test(url.pathname)) return;
  event.respondWith((async () => {
    const { request, owner } = await pageClients.request(event);
    const response = await (await router).route(request, { onError: (error) => { void worker.clients.matchAll().then((clients) => { for (const client of clients) client.postMessage({ error: `${error.phase}: ${error.file}: ${error.message}` }); }); } });
    if (response.headers.get("x-link-compiled") === "1") compiled.push(url.pathname);
    event.waitUntil(pageClients.served({ event, owner, response }));
    return response;
  })());
});
