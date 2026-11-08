import React from "react";
import { createRoot } from "react-dom/client";
import { prepareTailwind, type TailwindOptions } from "../runtime.ts";
import { waitForReadiness } from "../../readiness.ts";
import { insertBaseLinks, insertCss } from "../stylesheets.ts";
import { createTailwindStore } from "../store.ts";
import { openRuntimeDb, result, tailwindCacheName } from "../../../storage/db.ts";
import type { Snapshot } from "./compare.ts";

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
type Options = Pick<TailwindOptions, "libraries" | "loaders" | "candidates"> & { base: string[]; pages: Record<string, () => Promise<{ default: React.ComponentType<{ data: unknown }> }>>; data: unknown };

async function snapshot(root: HTMLElement): Promise<Snapshot> {
  await frame(); await document.fonts.ready;
  for (const animation of document.getAnimations()) {
    if (animation instanceof CSSTransition) animation.finish();
    else { animation.pause(); animation.currentTime = 0; }
  }
  for (const svg of root.querySelectorAll("svg")) { svg.pauseAnimations(); svg.setCurrentTime(0); }
  await frame();
  const elements = [document.body, root, ...root.querySelectorAll("*")];
  return {
    selectors: elements.map((element) => `${element.tagName}.${element.getAttribute("class") ?? ""}`),
    styles: elements.map((element) => { const style = getComputedStyle(element); return Array.from(style, (property) => `${property}:${style.getPropertyValue(property)}`); }),
  };
}

// The harness has no service worker, so the store reads generated CSS straight from the cache the worker would serve it from.
async function freshStorage(runtimeVersion: string) {
  await new Promise<void>((resolve, reject) => { const request = indexedDB.deleteDatabase("page-runtime"); request.onsuccess = () => resolve(); request.onerror = () => reject(request.error); });
  await caches.delete(tailwindCacheName(runtimeVersion));
  const cache = await caches.open(tailwindCacheName(runtimeVersion));
  const db = openRuntimeDb();
  const store = createTailwindStore({ db: () => db, cache, origin: location.origin, fetch: async (url) => (await cache.match(String(url))) ?? new Response("missing", { status: 404, headers: { "x-page-runtime-error": "fetch" } }) });
  return { store, db, cache };
}

async function storageState(storage: Awaited<ReturnType<typeof freshStorage>>) {
  const records = await result((await storage.db).transaction("tailwind").objectStore("tailwind").getAll());
  const candidateRecords = await result((await storage.db).transaction("candidates").objectStore("candidates").getAll());
  const response = records[0] ? await storage.cache.match(records[0].url) : undefined;
  const body = response ? await response.text() : "";
  const legacy = (await Promise.all((await caches.keys()).map(async (name) => (await (await caches.open(name)).keys()).filter((request) => request.url.includes("/__runtime/candidates/")).length))).reduce((sum, count) => sum + count, 0);
  return {
    records: records.length, candidateRecords: candidateRecords.length, legacyCandidateEntries: legacy,
    contentType: response?.headers.get("content-type") ?? null, cachedBytes: new TextEncoder().encode(body).byteLength, recordBytes: records[0]?.bytes ?? null, kilobytes: Math.round(body.length / 1024),
    domClasses: records[0]?.domClasses ?? [],
  };
}

async function probes(options: Options & { root: HTMLElement }) {
  const runtimeVersion = "probe";
  const storage = await freshStorage(runtimeVersion);
  await insertBaseLinks({ document, urls: options.base, timeoutMs: 15000 }).ready;
  const errors: string[] = [];
  const prepare = () => prepareTailwind({ ...options, candidates: ["w-[137px]"], runtimeVersion, store: storage.store, timeoutMs: 5000, onError: (error) => errors.push(String(error)) });
  let runtime = await prepare();
  const source = document.createElement("div"); source.className = "w-[137px]"; options.root.append(source);
  const sourceWidth = source.getBoundingClientRect().width;
  const dynamic = document.createElement("div"); dynamic.className = `w-[${Math.floor(200 + 37)}px]`; options.root.append(dynamic);
  await frame(); const dynamicWidth = dynamic.getBoundingClientRect().width;
  dynamic.className = `w-[${Math.floor(300 + 19)}px]`;
  await frame(); const changedWidth = dynamic.getBoundingClientRect().width;
  const overlay = document.createElement("aside"); overlay.className = "w-[991px]"; document.body.append(overlay);
  const host = document.createElement("div"); options.root.append(host);
  const shadow = host.attachShadow({ mode: "open" });
  const shadowProbe = document.createElement("div"); shadowProbe.className = "w-[992px]"; shadow.append(shadowProbe);
  await frame(); await runtime.ready();
  const excluded = !runtime.candidates.has("w-[991px]") && !runtime.candidates.has("w-[992px]");
  const generated = document.getElementById("runtime-tailwind")!.textContent!;
  const baseInGenerated = /box-sizing|--color-red-500|\.bg-red-500|@import/.test(generated);
  const cold = await storageState(storage);
  runtime.stop(); options.root.replaceChildren(); overlay.remove();
  runtime = await prepare();
  const warm = runtime.warm;
  let layoutWidth = 0;
  const mounted = new Promise<void>((resolve) => {
    function Page() { React.useLayoutEffect(() => { layoutWidth = options.root.firstElementChild!.getBoundingClientRect().width; resolve(); }, []); return React.createElement("div", { className: "w-[137px]" }); }
    createRoot(options.root).render(React.createElement(Page));
  });
  await mounted; await runtime.ready();
  const warmStorage = await storageState(storage);
  runtime.stop();
  const began = performance.now();
  const importedSheet = insertCss({ document, css: '@import "/delayed.css";', timeoutMs: 5000 });
  await importedSheet.ready;
  const imported = performance.now() - began;
  let importFailed = false;
  try { await insertCss({ document, previous: importedSheet.style, css: '@import "/missing.css";', timeoutMs: 5000 }).ready; } catch { importFailed = true; }
  return { sourceWidth, dynamicWidth, changedWidth, excluded, warm, layoutWidth, imported, importFailed, errors, baseInGenerated, generatedKilobytes: Math.round(generated.length / 1024), cold, warmStorage };
}

// A page that never opts in: the base links alone style it and no runtime style element exists.
async function plainProbe(options: Options & { root: HTMLElement }) {
  await insertBaseLinks({ document, urls: options.base, timeoutMs: 15000 }).ready;
  const safelisted = document.createElement("div"); safelisted.className = "bg-red-500"; options.root.append(safelisted);
  await frame();
  const color = getComputedStyle(safelisted).backgroundColor;
  return { runtimeStyle: document.getElementById("runtime-tailwind") !== null, baseLinks: document.querySelectorAll("link[data-page-runtime-base]").length, color, styled: color !== "rgba(0, 0, 0, 0)" && color !== "" };
}

export async function run(options: Options): Promise<unknown> {
  const root = document.getElementById("root")!;
  const params = new URLSearchParams(location.search);
  if (params.has("probe")) return probes({ ...options, root });
  if (params.has("plain")) return plainProbe({ ...options, root });
  const name = params.get("page")!;
  const load = options.pages[name]; if (!load) throw new Error(`unknown page ${name}`);
  const module = await load();
  let runtime: Awaited<ReturnType<typeof prepareTailwind>> | undefined;
  await insertBaseLinks({ document, urls: options.base, timeoutMs: 15000 }).ready;
  if (params.get("mode") === "reference") {
    const response = await fetch(`/reference/${name}`);
    if (!response.ok) throw new Error(await response.text());
    await insertCss({ document, css: await response.text(), timeoutMs: 15000 }).ready;
  } else {
    const storage = await freshStorage("parity");
    runtime = await prepareTailwind({ ...options, root, runtimeVersion: "parity", store: storage.store, timeoutMs: 15000, onError: (error) => { throw error; } });
  }
  const mounted = new Promise<void>((resolve) => {
    function Page() { React.useLayoutEffect(resolve, []); return React.createElement(module.default, { data: options.data }); }
    createRoot(root).render(React.createElement(Page));
  });
  await waitForReadiness({ root, mounted, timeoutMs: 15000, status: () => {} });
  await runtime?.ready();
  const rendered = await snapshot(root);
  if (runtime) {
    const response = await fetch(`/reference/${name}`, { method: "POST", body: root.outerHTML });
    if (!response.ok) throw new Error(await response.text());
  }
  return rendered;
}
