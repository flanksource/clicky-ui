import { createLinkRoutes } from "../../sw/link-route.ts";
import { exampleLock } from "../testing-fixtures.ts";
import type { RuntimeProfile } from "../../schema.ts";

const worker = self as unknown as {
  location: Location; skipWaiting(): Promise<void>; clients: { claim(): Promise<void> };
  addEventListener(type: string, receive: (event: { request: Request; waitUntil(pending: Promise<unknown>): void; respondWith(pending: Promise<Response>): void }) => void): void;
};
const profile: RuntimeProfile = { runtimeDomain: "127.0.0.1", embedders: [worker.location.origin], packageOrigin: worker.location.origin, registry: `${worker.location.origin}/registry`, managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "allow", sources: ["host"], readinessTimeoutMs: 15000 };
const lock = exampleLock(); lock.map.imports.example = "/link/checkout/src/version.js";
const route = createLinkRoutes({ origin: worker.location.origin, version: "V-local", profile, caches, plugins: {} as never, load: async () => ({ lock, files: {} }) });
worker.addEventListener("install", (event) => event.waitUntil(worker.skipWaiting()));
worker.addEventListener("activate", (event) => event.waitUntil(worker.clients.claim()));
worker.addEventListener("fetch", (event) => {
  if (new URL(event.request.url).pathname === "/frame/setup") return;
  event.respondWith((async () => (await route(event.request)) ?? fetch(event.request))());
});
