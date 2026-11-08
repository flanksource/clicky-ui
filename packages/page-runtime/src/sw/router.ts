import type { FrameConfig, HostMessage, PageLock, RuntimeError, RuntimePolicy, RuntimeProfile } from "../schema.ts";
import { validateHostMessage, validateSourcePath, validateLock } from "../host/validation.ts";
import { compilePage, moduleUrl, requestModuleUrl, rewriteImports } from "./compiler.ts";
import type { MdxPlugins } from "./compile.ts";
import { DEV_SHIM, DEV_SHIM_URL } from "./compile.ts";
import { CONTENT_TYPES, extensionOf } from "./content-types.ts";
import { runtimeError, RuntimeFailure } from "./errors.ts";
import { permitsNetwork, validateProfile } from "./profile.ts";
import { resolvePage } from "./resolver.ts";
import { stylesheetModule } from "./module-transform.ts";
import { digest, verifyIntegrity } from "./integrity.ts";
import { createLinkRoutes } from "./link-route.ts";
import { PAGE_AGENT_URL, pageAgentSource } from "./runtime-module.ts";
import type { WorkerActivity } from "../activity-schema.ts";
import { activityResponse, applyLinkActivity, byteLength, createRequestActivity } from "./activity.ts";
import { convertedFile, converterUrl, rewriteConvertedImports } from "./converted.ts";
import { candidatesForPage, lazyRuntimeDb, putCandidates, tailwindCacheName } from "../storage/db.ts";
export { digest, verifyIntegrity } from "./integrity.ts";

export type RouterOptions = { origin: string; version: string; profile: RuntimeProfile; plugins: MdxPlugins; caches: CacheStorage; indexedDB?: IDBFactory; fetch?: typeof fetch; onActivity?: (event: { request: Request; record: WorkerActivity }) => void };
type StoredPage = { lock: PageLock; files: Record<string, string>; manifest: Extract<HostMessage, { type: "open" }>["manifest"]; policy?: RuntimePolicy };
const JS = { "content-type": "text/javascript; charset=utf-8" };
const serial = (value: unknown) => JSON.stringify(value).replaceAll("<", "\\u003c");
const frameMetadata = new WeakMap<FrameConfig, { map: string; config: string }>();

export function frameDocument(options: { config?: FrameConfig; preload?: Iterable<string>; error?: RuntimeError } = {}): { html: string; nonce: string } {
  const { config } = options;
  const error = options.error ? `<script type="application/json" id="page-runtime-error">${serial(options.error)}</script>` : "";
  const nonce = crypto.randomUUID();
  let metadata = config ? frameMetadata.get(config) : undefined;
  if (config && !metadata) {
    const map = { imports: Object.fromEntries(Object.entries(config.lock.map.imports).map(([k, v]) => [k, moduleUrl(v)])), scopes: Object.fromEntries(Object.entries(config.lock.map.scopes).map(([scope, table]) => [scope, Object.fromEntries(Object.entries(table).map(([k, v]) => [k, moduleUrl(v)]))])) };
    metadata = { map: serial(map), config: serial(config) }; frameMetadata.set(config, metadata);
  }
  const preload = [...(options.preload ?? [])].map((url) => `<link rel="modulepreload" href="${url.replaceAll("&", "&amp;").replaceAll('"', "&quot;")}">`).join("");
  return { nonce, html: `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><script src="/devtools-hook.js"></script>${metadata ? `<script type="importmap" nonce="${nonce}">${metadata.map}</script><script type="application/json" id="page-runtime-config">${metadata.config}</script>` : ""}${error}${preload}</head><body><div id="root"></div><script type="module" nonce="${nonce}" src="/boot.js"></script></body></html>` };
}

export function contentSecurityPolicy(profile: RuntimeProfile, nonce: string): string {
  const directives: Record<string, string[]> = { "script-src": ["'self'", `'nonce-${nonce}'`], "style-src": ["'self'", "'unsafe-inline'"], "img-src": ["'self'", "data:", "blob:"], "connect-src": ["'self'", profile.packageOrigin, profile.registry, ...profile.network.allow.map((v) => new URL(v).origin)], "frame-ancestors": profile.embedders };
  if (profile.convert) directives["connect-src"]!.push(profile.convert.origin);
  for (const [name, values] of Object.entries(profile.csp.add)) directives[name] = [...(directives[name] ?? []), ...values];
  return Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`).join("; ");
}

export function createRouter(options: RouterOptions) {
  const profile = validateProfile(options.profile); const fetcher = options.fetch ?? fetch;
  const store = options.caches.open(`page-runtime-${options.version}-pages`);
  const output = options.caches.open(`page-runtime-${options.version}-compiled`);
  const packages = options.caches.open(`page-runtime-${options.version}-packages`);
  const pages = new Map<string, Promise<StoredPage>>();
  const modules = new WeakMap<PageLock, Map<string, Promise<{ response: Response; activity: WorkerActivity }>>>();
  const moduleGraph = new WeakMap<PageLock, Set<string>>();
  const frameConfigs = new WeakMap<PageLock, FrameConfig>();
  const rememberModule = (url: URL, lock: PageLock) => {
    let graph = moduleGraph.get(lock);
    if (!graph) { graph = new Set(); moduleGraph.set(lock, graph); }
    graph.add(requestModuleUrl(url));
  };
  const tailwind = options.caches.open(tailwindCacheName(options.version));
  const database = lazyRuntimeDb(options.indexedDB ? { factory: options.indexedDB } : {});
  const linkRoute = createLinkRoutes({ ...options, load, database });
  const key = (page: string) => `${options.origin}/__runtime/pages/${encodeURIComponent(page)}`;
  async function load(page: string): Promise<StoredPage> {
    let pending = pages.get(page);
    if (!pending) {
      pending = (async () => {
        const response = await (await store).match(key(page));
        if (!response) throw new RuntimeFailure({ phase: "resolve", file: page, message: `page ${page} has not been opened by its host` });
        const saved = await response.json() as StoredPage;
        if (saved.lock.lock !== 2) {
          if (!saved.policy) throw new RuntimeFailure({ phase: "resolve", file: page, message: `${page} was stored without its host policy, so it cannot be re-resolved without guessing one (the served profile policy is not the host's); reopen the page from its host, or clear the page runtime cache and try again` });
          saved.lock = await resolvePage({ page, profile: { ...profile, policy: saved.policy }, manifest: saved.manifest, fetch: fetcher });
          await (await store).put(key(page), Response.json(saved));
        }
        validateLock(saved.lock);
        return saved;
      })();
      pages.set(page, pending);
      void pending.catch(() => { if (pages.get(page) === pending) pages.delete(page); });
    }
    return pending;
  }
  async function message(value: unknown): Promise<void> {
    const m = validateHostMessage(value);
    if (m.type !== "open") throw new Error("worker requires open message");
    validateSourcePath(m.page);
    const previous = await (await store).match(key(m.page));
    const saved = previous ? await previous.json() as StoredPage : undefined;
    const policy = m.policy ?? profile.policy;
    const existing = m.lock ?? (saved?.lock.lock === 2 && serial(saved.manifest) === serial(m.manifest) && saved.policy && serial(saved.policy) === serial(policy) ? saved.lock : undefined);
    const lock = await resolvePage({ page: m.page, profile: { ...profile, policy }, manifest: m.manifest, ...(existing ? { lock: existing } : {}), fetch: fetcher });
    const savedPage: StoredPage = { lock, files: m.files, manifest: m.manifest, policy };
    await (await store).put(key(m.page), Response.json(savedPage));
    pages.set(m.page, Promise.resolve(savedPage));
  }
  async function update(page: string, value: unknown): Promise<void> {
    const m = validateHostMessage(value);
    if (m.type !== "sources") throw new Error("worker requires sources message");
    const saved = await load(page);
    for (const [path, code] of Object.entries(m.files)) if (code === null) delete saved.files[path]; else saved.files[path] = code;
    await (await store).put(key(page), Response.json(saved));
  }
  async function compiled(url: URL, saved: StoredPage, activity: WorkerActivity): Promise<Response> {
    const path = decodeURIComponent(url.pathname.slice("/src/".length)); validateSourcePath(path);
    const code = saved.files[path];
    if (code === undefined) throw new RuntimeFailure({ phase: "fetch", file: path, message: `source ${path} does not exist` });
    activity.decodedBytes = byteLength(code); activity.source = "compiled";
    const asModule = url.searchParams.has("module") || /\.(tsx?|jsx?|mdx?|mjs)$/.test(path) || url.searchParams.has("raw") || url.searchParams.has("url");
    if (!asModule) { activity.outputBytes = activity.decodedBytes; return new Response(code, { headers: { "content-type": CONTENT_TYPES[extensionOf(path)] ?? "application/octet-stream" } }); }
    const hash = await digest(new TextEncoder().encode(serial({ code, lock: saved.lock, query: [...url.searchParams], paths: Object.keys(saved.files) })));
    const cacheKey = `${options.origin}/__runtime/compiled/${encodeURIComponent(hash)}`;
    const hit = await (await output).match(cacheKey);
    if (hit) { activity.source = "cache"; activity.cache = "storage"; activity.outputBytes = hit.headers.has("content-length") ? Number(hit.headers.get("content-length")) : (await hit.clone().arrayBuffer()).byteLength; return hit; }
    let result;
    try { result = await compilePage({ path: `${url.pathname}${url.search}`, code, lock: saved.lock, sources: Object.keys(saved.files), plugins: options.plugins, activity }); }
    catch (error) { throw error instanceof RuntimeFailure ? error : new RuntimeFailure(runtimeError({ error, phase: "compile", file: path })); }
    activity.outputBytes = byteLength(result.code);
    if (/\.(css|json)$/.test(path) || url.searchParams.has("raw") || url.searchParams.has("url")) { activity.source = "generated"; activity.generated = extensionOf(path) + " module"; }
    const response = new Response(result.code, { headers: { ...JS, "content-length": String(activity.outputBytes), "x-page-candidates": encodeURIComponent(JSON.stringify(result.candidates)) } });
    await (await output).put(cacheKey, response.clone());
    await putCandidates(await database(), { page: saved.lock.page, module: url.pathname, sourceHash: hash, candidates: result.candidates });
    return response;
  }
  async function packageFile(options_: { url: URL; saved: StoredPage; request: Request; activity: WorkerActivity }): Promise<Response> {
    const { url, saved, request, activity } = options_;
    const converted = url.pathname.startsWith("/esm/");
    const path = decodeURIComponent(converted ? url.pathname.slice(1) : url.pathname.slice("/npm/".length));
    const conversion = converted ? convertedFile(path) : undefined;
    if (conversion && !profile.convert) throw new RuntimeFailure({ phase: "fetch", file: path, message: `${conversion.root}: converter is not configured` });
    const expected = saved.lock.integrity[path];
    if (!expected) throw new RuntimeFailure({ phase: "fetch", file: path, message: `${path} is not part of the page's library set` });
    const upstream = conversion ? converterUrl({ ...conversion, origin: profile.convert!.origin }) : `${saved.lock.packageOrigin.replace(/\/$/, "")}/${path}`;
    const cacheKey = `${options.origin}/__runtime/package/${encodeURIComponent(expected)}/${conversion ? `${encodeURIComponent(profile.convert!.origin)}/` : ""}${path}`;
    let original = await (await packages).match(cacheKey);
    activity.cache = original ? "storage" : "miss"; activity.source = original ? "cache" : "network";
    activity.origin = upstream;
    let bytes: Uint8Array<ArrayBuffer>;
    if (!original) {
      const fetching = performance.now();
      try {
        original = await fetcher(activity.origin, { mode: "cors", credentials: "omit", redirect: "error" });
        activity.transferredBytes = original.headers.has("content-length") ? Number(original.headers.get("content-length")) : null;
        if (!original.ok) throw new RuntimeFailure({ phase: "fetch", file: path, message: `${conversion ? "converter" : "package origin"} returned HTTP ${original.status} for ${path}` });
        bytes = new Uint8Array(await original.clone().arrayBuffer()); activity.decodedBytes = bytes.byteLength;
      } finally { activity.fetchMs = performance.now() - fetching; }
      const checking = performance.now();
      try { await verifyIntegrity(bytes, expected, path); }
      catch (error) {
        if (!conversion || !(error instanceof RuntimeFailure)) throw error;
        throw new RuntimeFailure({ phase: "fetch", file: path, message: `${conversion.root}: integrity mismatch for ${path}; re-resolve the page's lock, or pin the converter to a fixed self-hosted esm.sh image` });
      } finally { activity.integrityMs = performance.now() - checking; }
      await (await packages).put(cacheKey, original.clone());
    } else bytes = new Uint8Array(await original.arrayBuffer());
    activity.decodedBytes = bytes.byteLength;
    const ext = extensionOf(path); const text = new TextDecoder().decode(bytes);
    const respond = (code: string, generated?: string) => {
      activity.outputBytes = byteLength(code); if (generated) activity.generated = generated;
      const headers = new Headers(original.headers); headers.delete("content-encoding"); headers.set("content-type", JS["content-type"]); headers.set("content-length", String(activity.outputBytes)); headers.set("x-page-integrity", expected);
      return new Response(code, { headers });
    };
    if (url.searchParams.has("raw")) return respond(`export default ${JSON.stringify(text)};`, "raw module");
    if (url.searchParams.has("url")) return respond(`export default ${JSON.stringify(moduleUrl(url.pathname))};`, "URL module");
    if ([".js", ".mjs"].includes(ext)) {
      const code = conversion ? await rewriteConvertedImports({ code: text, ...conversion }) : text;
      return respond(await rewriteImports({ code, path: url.pathname, lock: saved.lock, sources: Object.keys(saved.files), activity }));
    }
    if (url.searchParams.has("module") || request.destination === "script") {
      if (ext === ".json") return respond(`export default ${JSON.stringify(JSON.parse(text))};`, "JSON module");
      if (ext === ".css") return respond(stylesheetModule(text, moduleUrl(url.pathname)), "stylesheet module");
      throw new Error(`${path}: cannot serve ${ext} as module`);
    }
    activity.outputBytes = bytes.byteLength;
    const headers = new Headers(original.headers); headers.delete("content-encoding"); headers.set("content-length", String(bytes.byteLength)); headers.set("content-type", CONTENT_TYPES[ext] ?? "application/octet-stream"); headers.set("x-page-integrity", expected);
    return new Response(bytes, { headers });
  }
  async function serve(request: Request, activity: WorkerActivity, onError?: (error: ReturnType<typeof runtimeError>) => void): Promise<Response> {
    const url = new URL(request.url);
    const page = url.searchParams.get("page") ?? (url.pathname.startsWith("/frame/") ? decodeURIComponent(url.pathname.slice(7)) : null);
    try {
      if (activity.kind === "npm" && !activity.package) throw new Error(`invalid npm request: ${url.pathname}`);
      if (url.origin !== options.origin) {
        if (!permitsNetwork(profile, url.href)) { activity.error = { phase: "fetch", message: `egress denied: ${url.href}` }; activity.outputBytes = byteLength(activity.error.message); return new Response(activity.error.message, { status: 403 }); }
        return await networkResponse(request, activity);
      }
      const linked = await linkRoute(request);
      if (linked) {
        activity.source = activity.kind === "frame" ? "generated" : linked.headers.get("x-link-compiled") === "0" ? "cache" : activity.kind === "npm" ? "network" : "compiled";
        activity.cache = activity.source === "cache" ? "memory" : "miss";
        activity.outputBytes = linked.headers.has("content-length") ? Number(linked.headers.get("content-length")) : (await linked.clone().arrayBuffer()).byteLength;
        if (activity.kind === "frame") { activity.generated = "frame + import map"; activity.decodedBytes = activity.outputBytes; }
        else if (!applyLinkActivity({ response: linked, record: activity })) {
          activity.unavailable = ["fetch", "integrity", "compile", "rewrite", "cache-layer"];
          if (activity.kind === "npm" && page) activity.origin = `${(await load(page)).lock.packageOrigin.replace(/\/$/, "")}/${decodeURIComponent(url.pathname.slice(5))}`;
          activity.transferredBytes = null;
        }
        return linked;
      }
      if (url.pathname.startsWith("/frame/")) {
        const exists = await (await store).match(key(page!));
        const saved = exists ? await load(page!) : undefined;
        let config = saved ? frameConfigs.get(saved.lock) : undefined;
        if (saved && !config) { config = { page: page!, entry: moduleUrl(`/src/${page}`), lock: saved.lock, profile: { ...profile, packageOrigin: saved.lock.packageOrigin }, runtimeVersion: options.version }; frameConfigs.set(saved.lock, config); }
        const document = frameDocument({ ...(config ? { config } : {}), ...(saved ? { preload: moduleGraph.get(saved.lock) ?? [] } : {}) });
        activity.generated = "frame + import map"; activity.outputBytes = byteLength(document.html); activity.decodedBytes = activity.outputBytes;
        return new Response(document.html, { headers: { "content-type": "text/html; charset=utf-8", "content-security-policy": contentSecurityPolicy(config?.profile ?? profile, document.nonce) } });
      }
      if (["/boot.js", "/devtools-hook.js", "/page-agent.js", "/profile.json"].includes(url.pathname)) {
        return await networkResponse(request, activity);
      }
      if (/^\/__runtime\/tailwind\/[a-f0-9]{64}\.css$/.test(url.pathname)) {
        const hit = await (await tailwind).match(`${options.origin}${url.pathname}`);
        if (!hit) {
          const message = `no generated stylesheet is cached for ${url.pathname}`;
          activity.error = { phase: "fetch", message }; activity.outputBytes = byteLength(message);
          return new Response(message, { status: 404, headers: { "x-page-runtime-error": "fetch" } });
        }
        activity.source = "cache"; activity.cache = "storage"; activity.generated = "Tailwind stylesheet";
        activity.outputBytes = hit.headers.has("content-length") ? Number(hit.headers.get("content-length")) : (await hit.clone().arrayBuffer()).byteLength; activity.decodedBytes = activity.outputBytes;
        return hit;
      }
      if (!page) throw new Error(`${url.pathname}: missing page context`);
      const saved = await load(page);
      if (url.pathname === PAGE_AGENT_URL || url.pathname === DEV_SHIM_URL) {
        const started = performance.now();
        const original = url.pathname === PAGE_AGENT_URL ? await pageAgentSource({ origin: options.origin, fetch: fetcher }) : DEV_SHIM;
        if (url.pathname === PAGE_AGENT_URL) { activity.fetchMs = performance.now() - started; activity.origin = `${options.origin}/page-agent.js`; activity.source = "network"; activity.transferredBytes = null; }
        else activity.generated = "JSX development shim";
        const code = await rewriteImports({ code: original, path: url.pathname, lock: saved.lock, sources: [], activity });
        activity.decodedBytes = byteLength(original); activity.outputBytes = byteLength(code);
        return new Response(code, { headers: JS });
      }
      if (url.pathname === "/__runtime/candidates") {
        const candidates = await candidatesForPage(await database(), page);
        const body = JSON.stringify([...new Set(candidates.flatMap((record) => record.candidates))]); activity.outputBytes = byteLength(body); activity.decodedBytes = activity.outputBytes; activity.generated = "source candidates";
        return new Response(body, { headers: { "content-type": "application/json" } });
      }
      if (url.pathname.startsWith("/src/")) {
        const response = await compiled(url, saved, activity);
        if (response.headers.get("content-type")?.startsWith("text/javascript")) rememberModule(url, saved.lock);
        return response;
      }
      if (url.pathname.startsWith("/npm/") || url.pathname.startsWith("/esm/")) {
        let table = modules.get(saved.lock);
        if (!table) { table = new Map(); modules.set(saved.lock, table); }
        const id = `${url.href}:${request.destination}`;
        let pending = table.get(id);
        const hit = Boolean(pending);
        if (!pending) { pending = packageFile({ url, saved, request, activity }).then((response) => ({ response, activity })); table.set(id, pending); void pending.catch(() => table.delete(id)); }
        const cached = await pending;
        if (hit) { activity.source = "cache"; activity.cache = "memory"; activity.origin = cached.activity.origin; activity.generated = cached.activity.generated; activity.decodedBytes = cached.activity.decodedBytes; activity.outputBytes = cached.activity.outputBytes; }
        const response = cached.response.clone();
        if (response.headers.get("content-type")?.startsWith("text/javascript")) rememberModule(url, saved.lock);
        return response;
      }
      activity.outputBytes = byteLength("unknown runtime route");
      activity.error = { phase: "fetch", message: `unknown runtime route: ${url.pathname}` };
      return new Response("unknown runtime route", { status: 404 });
    } catch (error) {
      if (error instanceof RuntimeFailure && error.activity) Object.assign(activity, error.activity);
      const detail = runtimeError({ error, phase: "fetch", file: url.pathname });
      activity.error = { phase: detail.phase, message: detail.message.slice(0, 4096) };
      onError?.(detail);
      if (request.mode === "navigate") {
        const document = frameDocument({ error: detail });
        activity.outputBytes = byteLength(document.html);
        return new Response(document.html, { status: 500, headers: { "content-type": "text/html; charset=utf-8", "content-security-policy": contentSecurityPolicy(profile, document.nonce), "x-page-runtime-error": detail.phase } });
      }
      const body = `throw Object.assign(new Error(${serial(detail.message)}), { pageRuntime: ${serial(detail)} });`;
      activity.outputBytes = byteLength(body);
      return new Response(body, { status: 200, headers: { ...JS, "x-page-runtime-error": detail.phase } });
    }
  }
  async function networkResponse(request: Request, activity: WorkerActivity): Promise<Response> {
    const started = performance.now(); activity.source = "network"; activity.origin = request.url;
    try {
      const response = await fetcher(request);
      activity.transferredBytes = response.headers.has("content-length") ? Number(response.headers.get("content-length")) : null;
      if (response.type === "opaque" || response.type === "opaqueredirect") return response;
      if (!response.ok) activity.error = { phase: "fetch", message: `HTTP ${response.status}: ${request.url}` };
      const body = await response.arrayBuffer(); activity.decodedBytes = body.byteLength; activity.outputBytes = body.byteLength;
      const headers = new Headers(response.headers); headers.delete("content-encoding"); headers.set("content-length", String(body.byteLength));
      return new Response([204, 205, 304].includes(response.status) || request.method === "HEAD" ? null : body, { status: response.status, statusText: response.statusText, headers });
    } finally { activity.fetchMs = performance.now() - started; }
  }
  async function route(request: Request, callbacks: { onError?: (error: ReturnType<typeof runtimeError>) => void } = {}): Promise<Response> {
    const start = performance.now(); const activity = createRequestActivity(request.url);
    const response = activityResponse({ response: await serve(request, activity, callbacks.onError), record: activity, start });
    options.onActivity?.({ request, record: activity });
    return response;
  }
  return { route, message, update };
}
export type RuntimeRouter = ReturnType<typeof createRouter>;
export type OpenPageMessage = Extract<HostMessage, { type: "open" }>;
