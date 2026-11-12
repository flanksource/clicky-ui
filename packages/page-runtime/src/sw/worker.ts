import { compile } from "@mdx-js/mdx";
import { BASE_PLUGINS } from "./compiler.ts";
import { createRouter, type RuntimeRouter } from "./router.ts";
import { validateProfile } from "./profile.ts";
import { runtimeError } from "./errors.ts";
import { createActivityBatcher } from "./activity.ts";
import { createPageClients } from "./page-clients.ts";
import { cleanupLegacyStorage } from "./legacy-storage.ts";
import type { WorkerActivity } from "../activity-schema.ts";

type LifetimeEvent = Event & { waitUntil(promise: Promise<unknown>): void };
type WorkerEvent = LifetimeEvent & { request: Request; clientId: string; resultingClientId: string; respondWith(response: Promise<Response>): void };
type WorkerMessage = LifetimeEvent & { data: unknown; source: { id: string; url: string } | null; ports: MessagePort[] };
type WorkerScope = {
  location: Location; skipWaiting(): Promise<void>;
  clients: { claim(): Promise<void>; get(id: string): Promise<{ id: string; url: string; postMessage(value: unknown): void } | undefined>; matchAll(options: { type: "all"; includeUncontrolled: boolean }): Promise<{ id: string }[]> };
  addEventListener(type: "install" | "activate", listener: (e: LifetimeEvent) => void): void;
  addEventListener(type: "fetch", listener: (e: WorkerEvent) => void): void;
  addEventListener(type: "message", listener: (e: WorkerMessage) => void): void;
};
declare const __RUNTIME_VERSION__: string;
const scope = self as unknown as WorkerScope;
const activityRequests = new WeakMap<Request, WorkerEvent>();
const activityClients = new Map<string, { load: string; navigationStart: number }>();
const earlyActivity = new Map<string, WorkerActivity[]>();
const activity = createActivityBatcher({ send: async (id, records) => {
  const client = await scope.clients.get(id);
  if (!client) { activityClients.delete(id); earlyActivity.delete(id); return; }
  const subscription = activityClients.get(id);
  if (subscription) client.postMessage({ type: "activity", ...subscription, records, timeline: [], tailwind: [] });
  else earlyActivity.set(id, [...(earlyActivity.get(id) ?? []), ...records]);
} });
const pageClients = createPageClients({ origin: scope.location.origin, clients: scope.clients });
let router: Promise<RuntimeRouter> | undefined;
function load(): Promise<RuntimeRouter> {
  router ??= (async () => {
    const response = await fetch("/profile.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`profile.json: HTTP ${response.status}`);
    return createRouter({ origin: scope.location.origin, version: __RUNTIME_VERSION__, profile: validateProfile(await response.json()), plugins: BASE_PLUGINS, caches, onActivity: ({ request, record }) => {
      const event = activityRequests.get(request);
      if (!event) throw new Error("worker activity request context is missing");
      const id = event.resultingClientId || event.clientId;
      if (id) event.waitUntil(activity.push({ client: id, record }));
    } });
  })();
  return router;
}
// MDX is statically bundled: service workers cannot load more compiler code after install.
void compile;
scope.addEventListener("install", (event) => event.waitUntil(Promise.all([load(), scope.skipWaiting()])));
scope.addEventListener("activate", (event) => event.waitUntil(Promise.all([scope.clients.claim(), cleanupLegacyStorage({ caches, origin: scope.location.origin, version: __RUNTIME_VERSION__ })])));
scope.addEventListener("message", (event) => {
  if (!event.source || new URL(event.source.url).origin !== scope.location.origin) return;
  event.waitUntil((async () => {
    const port = event.ports[0];
    if (!port) throw new Error("runtime worker message requires reply port");
    try {
      const value = event.data as { page?: unknown; message?: unknown };
      if (value?.message === "subscribe-activity") {
        const subscription = event.data as { load: unknown; navigationStart: unknown };
        if (typeof subscription.load !== "string" || subscription.load.length > 256 || typeof subscription.navigationStart !== "number" || !Number.isFinite(subscription.navigationStart) || subscription.navigationStart < 0) throw new Error("invalid activity subscription");
        const id = event.source!.id;
        for (const previous of new Set([...earlyActivity.keys(), ...activityClients.keys()])) if (previous !== id && !await scope.clients.get(previous)) { earlyActivity.delete(previous); activityClients.delete(previous); }
        activityClients.set(id, { load: subscription.load, navigationStart: subscription.navigationStart });
        const records = earlyActivity.get(id) ?? []; earlyActivity.delete(id);
        await Promise.all(records.map((record) => activity.push({ client: id, record })));
        port.postMessage({ ok: true }); return;
      }
      const loaded = await load();
      const exportMessage = value?.message as { type?: unknown } | undefined;
      if (typeof value?.page === "string" && exportMessage?.type === "export-module") await loaded.exportModule(value.page, value.message);
      else if (typeof value?.page === "string") await loaded.update(value.page, value.message); else await loaded.message(value?.message);
      port.postMessage({ ok: true });
    } catch (error) { port.postMessage({ ok: false, error: runtimeError({ error, phase: "resolve", file: new URL(event.source!.url).pathname }) }); }
  })());
});
scope.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin === scope.location.origin && !/^\/(frame|src|npm|esm|link|__runtime)\//.test(url.pathname) && !["/boot.js", "/devtools-hook.js", "/page-agent.js", "/profile.json"].includes(url.pathname)) return;
  event.respondWith((async () => {
    const { request, client, owner } = await pageClients.request(event);
    activityRequests.set(request, event);
    const response = await (await load()).route(request, { onError: (error) => client?.postMessage({ type: "error", error }) });
    event.waitUntil(pageClients.served({ event, owner, response }));
    return response;
  })());
});
