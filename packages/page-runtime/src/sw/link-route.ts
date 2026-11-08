import type { FrameConfig } from "../schema.ts";
import type { StoredLink, LinkCommand } from "../link/types.ts";
import { assertLinksAllowed, linkUrl, validateLink } from "../link/validation.ts";
import { linksInLock } from "../link/overrides.ts";
import { createLinkStore } from "../link/storage.ts";
import { compileLinkModule, compileLinkSource, rewriteLinkImports, rewriteLinkModule } from "./link-compiler.ts";
import { DEV_SHIM, DEV_SHIM_URL } from "./compile.ts";
import { frameDocument, contentSecurityPolicy } from "./router.ts";
import { moduleUrl, requestModuleUrl } from "./compiler.ts";
import { createFolderSourceReader } from "./link-folder.ts";
import { createLinkCache } from "./link-cache.ts";
import { linkRelayDocument } from "./link-relay.ts";
import { lazyRuntimeDb, putCandidates } from "../storage/db.ts";
import { digest } from "./integrity.ts";
import { CONTENT_TYPES, extensionOf } from "./content-types.ts";
import { RuntimeFailure } from "./errors.ts";
import type { RouterOptions } from "./router.ts";
import { PAGE_AGENT_URL, pageAgentSource } from "./runtime-module.ts";
import { sourceCandidates } from "./candidates.ts";
import { isPageModule, pageSourceModule, validatePageSourceLinks, type PageSourceLock } from "../link/page-sources.ts";
import { byteLength } from "./activity.ts";
import { cachedLinkActivity, createLinkActivity, linkActivityResponse, type LinkActivity } from "./link-activity.ts";
import { readLinkedSource } from "./link-source.ts";

type Page = { lock: PageSourceLock; files: Record<string, string> };
export const LINK_CONTEXT_HEADER = "x-link-context";
type Options = RouterOptions & { load(page: string): Promise<Page>; store?: ReturnType<typeof createLinkStore>; database?: () => Promise<IDBDatabase> };

export function createLinkRoutes(options: Options) {
  const storage = options.store ?? createLinkStore();
  const database = options.database ?? lazyRuntimeDb(options.indexedDB ? { factory: options.indexedDB } : {});
  const output = createLinkCache(options.caches.open(`page-runtime-${options.version}-links-source-sizes`));
  const prefix = `${options.origin}/__runtime/link-cache/`;
  const loadedLinks = new Map<string, Promise<StoredLink>>();
  const contexts = new Map<string, { saved: Page; links: StoredLink[]; config?: FrameConfig }>();
  let contextKeys = new WeakMap<Page, { paths: string; pending: Promise<{ links: StoredLink[]; id: string }> }>();
  const buildDigests = new WeakMap<StoredLink, Promise<string>>();
  const buildDigest = (link: StoredLink) => {
    let pending = buildDigests.get(link);
    if (!pending) { pending = digest(new TextEncoder().encode(JSON.stringify(link.build))); buildDigests.set(link, pending); }
    return pending;
  };
  const moduleGraphs = new Map<string, Set<string>>();
  const usedFiles = new Map<string, Record<string, string>>();
  const readFolder = createFolderSourceReader();
  const getLink = (id: string) => {
    let link = loadedLinks.get(id);
    if (!link) { link = storage.get(id); loadedLinks.set(id, link); void link.catch(() => loadedLinks.delete(id)); }
    return link;
  };
  async function control(request: Request): Promise<Response> {
    if (request.method !== "POST") throw new Error("Link control requires POST");
    if (request.headers.get("origin") && request.headers.get("origin") !== options.origin) throw new Error("Link control requires the runtime origin");
    const body = await request.json() as { developerOverrides: boolean; command: LinkCommand };
    assertLinksAllowed({ profile: options.profile, developerOverrides: body.developerOverrides });
    const command = body.command;
    if (command.type === "install") {
      validateLink(command.link);
      const link = command.link;
      if (link.source.kind === "folder" && !link.source.session) throw new Error("Folder link requires a host source channel");
      await storage.put(link);
      loadedLinks.set(link.id, Promise.resolve(link));
      usedFiles.delete(link.id);
      contexts.clear();
      contextKeys = new WeakMap();
      moduleGraphs.clear();
      await invalidate(link.id);
    } else if (command.type === "files") {
      await getLink(command.id);
      return Response.json({ ok: true, files: usedFiles.get(command.id) ?? {} });
    } else if (command.type === "invalidate") {
      await getLink(command.id);
      for (const path of command.paths) linkUrl(command.id, path);
      await invalidate(command.id, command.paths);
    } else if (command.type === "remove") { await storage.remove(command.id); loadedLinks.delete(command.id); usedFiles.delete(command.id); contexts.clear(); contextKeys = new WeakMap(); moduleGraphs.clear(); await invalidate(command.id); }
    else throw new Error("Unknown link control command");
    return Response.json({ ok: true });
  }
  async function invalidate(id: string, paths?: string[]): Promise<void> {
    linkUrl(id, "package.json");
    const cache = output;
    const starts = paths?.map((path) => `${prefix}${id}/${encodeURIComponent(path)}?`);
    await Promise.all((await cache.keys()).filter((key) => starts ? starts.some((start) => key.url.startsWith(start)) : key.url.startsWith(`${prefix}${id}/`)).map((key) => cache.delete(key)));
  }
  // Page modules are cached whole per page context. Library modules are cached compiled but not yet
  // rewritten, keyed only by their own source and link build, so every page shares them; each page
  // then rewrites the imports through its own import map.
  async function serve({ request, saved, links, contextId, metrics }: { request: Request; saved: Page; links: StoredLink[]; contextId: string; metrics: LinkActivity }): Promise<Response> {
    const url = new URL(request.url);
    const owner = links.find((link) => url.pathname.startsWith(`/link/${link.id}/`));
    const path = owner ? decodeURIComponent(url.pathname.slice(`/link/${owner.id}/`.length)) : decodeURIComponent(url.pathname.slice(5));
    if (owner) linkUrl(owner.id, path);
    if (url.pathname.startsWith("/link/") && !owner) throw new Error(`${url.pathname}: link is not enabled for this page`);
    const query = new URLSearchParams([...url.searchParams].filter(([key]) => key !== "page" && key !== "link-context")).toString();
    const library = !isPageModule({ path: url.pathname, lock: saved.lock });
    const pageSource = !owner && url.pathname.startsWith("/src/");
    const identity = owner ? (library ? `&build=${encodeURIComponent(await buildDigest(owner))}` : "") : `&integrity=${encodeURIComponent(saved.lock.integrity[path] ?? "")}`;
    const scope = library ? "library" : contextId;
    const key = pageSource ? undefined : `${prefix}${owner?.id ?? "page"}/${encodeURIComponent(path)}?context=${encodeURIComponent(scope)}&query=${encodeURIComponent(query)}${identity}`;
    const cache = output;
    const record = (response: Response) => {
      if (owner?.build.modules[path]) {
        const hash = response.headers.get("x-link-source-hash");
        if (!hash) throw new Error(`Linked cache entry ${path} is missing its source hash`);
        const files = usedFiles.get(owner.id) ?? {}; files[path] = hash; usedFiles.set(owner.id, files);
      }
    };
    if (owner?.source.kind === "server") metrics.origin = new URL(path.split("/").map(encodeURIComponent).join("/"), owner.source.url.replace(/\/?$/, "/")).href;
    else if (!owner && !url.pathname.startsWith("/src/")) metrics.origin = `${saved.lock.packageOrigin.replace(/\/$/, "")}/${path}`;
    let entry = key ? await cache.match(key) : undefined;
    let compiledNow = false;
    if (!entry) {
      const bytes = await readLinkedSource({ owner, path, source: url.pathname.startsWith("/src/"), files: saved.files, lock: saved.lock, metrics, fetch: options.fetch ?? fetch, readFolder });
      const module = /\.(tsx?|jsx?|mdx?|mjs|cjs)$/.test(path) || url.searchParams.has("module") || url.searchParams.has("raw") || url.searchParams.has("url") || request.destination === "script";
      const sourceHash = await digest(new Uint8Array(bytes));
      const contentKey = `${options.origin}/__runtime/link-content/${encodeURIComponent(scope)}/${encodeURIComponent(url.pathname)}/${encodeURIComponent(sourceHash)}?query=${encodeURIComponent(query)}${identity}`;
      entry = await cache.match(contentKey);
      if (entry && key) await cache.put(key, entry.response.clone());
      if (!entry) {
        const code = new TextDecoder().decode(bytes);
        const compileOptions = { path: url.pathname, code, lock: saved.lock, sources: Object.keys(saved.files), links, query: url.searchParams, plugins: options.plugins, metrics };
        const result = !module ? { code: bytes, imports: false } : library ? await compileLinkSource(compileOptions) : { code: await compileLinkModule(compileOptions), imports: false };
        const size = typeof result.code === "string" ? byteLength(result.code) : result.code.byteLength;
        const response = new Response(result.code as BodyInit, { headers: { "content-type": module ? "text/javascript; charset=utf-8" : CONTENT_TYPES[extensionOf(path)] ?? "application/octet-stream", "content-length": String(size), "x-link-source-bytes": String(bytes.byteLength), "x-link-imports": result.imports ? "1" : "0", "x-link-source-hash": sourceHash, "x-page-candidates": encodeURIComponent(JSON.stringify(sourceCandidates({ path, code }))) } });
        await cache.put(contentKey, response.clone());
        if (key) await cache.put(key, response.clone());
        entry = { response, layer: "memory" };
        compiledNow = true;
        metrics.outputBytes = size;
      }
    }
    record(entry.response);
    if (!compiledNow) cachedLinkActivity({ ...entry, metrics });
    const headers = new Headers(entry.response.headers); headers.set("x-link-compiled", compiledNow ? "1" : "0");
    const rememberCandidates = async () => {
      if (!url.pathname.startsWith("/src/") && !owner?.build.modules[path]) return;
      const candidates = JSON.parse(decodeURIComponent(headers.get("x-page-candidates")!)) as string[];
      await putCandidates(await database(), { page: saved.lock.page, module: url.pathname, sourceHash: headers.get("x-link-source-hash")!, candidates });
    };
    if (headers.get("x-link-imports") !== "1") { if (compiledNow) await rememberCandidates(); return new Response(entry.response.body, { headers }); }
    const linkedKey = `${options.origin}/__runtime/link-rewritten/${encodeURIComponent(contextId)}/${encodeURIComponent(url.pathname)}/${encodeURIComponent(headers.get("x-link-source-hash")!)}?query=${encodeURIComponent(query)}${identity}`;
    const rewritten = await cache.match(linkedKey);
    if (rewritten) {
      metrics.outputBytes = Number(rewritten.response.headers.get("content-length")); headers.set("content-length", String(metrics.outputBytes));
      return new Response(rewritten.response.body, { headers });
    }
    await rememberCandidates();
    const code = await rewriteLinkModule({ path: url.pathname, code: await entry.response.text(), lock: saved.lock, links, sources: Object.keys(saved.files), metrics });
    metrics.outputBytes = byteLength(code); headers.set("content-length", String(metrics.outputBytes));
    await cache.put(linkedKey, new Response(code, { headers: { "content-length": String(metrics.outputBytes) } }));
    return new Response(code, { headers });
  }
  return async (request: Request): Promise<Response | undefined> => {
    const url = new URL(request.url);
    if (url.pathname === "/frame/__runtime-link-relay" || url.pathname === "/frame/_link-relay") return new Response(linkRelayDocument({ embedders: options.profile.embedders, allowed: options.profile.links === "allow" }), { headers: { "content-type": "text/html; charset=utf-8" } });
    if (url.pathname === "/link/_control") {
      try { return await control(request); } catch (error) { return new Response(String(error), { status: 403 }); }
    }
    const frame = url.pathname.startsWith("/frame/");
    if (!/^\/(src|npm|link|frame)\//.test(url.pathname) && url.pathname !== DEV_SHIM_URL && url.pathname !== PAGE_AGENT_URL) return undefined;
    const page = url.searchParams.get("page") ?? (frame ? decodeURIComponent(url.pathname.slice(7)) : null);
    if (frame && !(await (await options.caches.open(`page-runtime-${options.version}-pages`)).match(`${options.origin}/__runtime/pages/${encodeURIComponent(page!)}`))) return undefined;
    if (!page) { if (url.pathname.startsWith("/link/")) throw new RuntimeFailure({ phase: "link", file: url.pathname, message: "Linked module requires a page context" }); return undefined; }
    const metrics = createLinkActivity();
    try {
      const requested = url.searchParams.get("link-context");
      const saved = await options.load(page);
      const ids = linksInLock(saved.lock);
      if (!ids.length && !url.pathname.startsWith("/link/")) return undefined;
      const paths = JSON.stringify(Object.keys(saved.files).sort());
      let key = contextKeys.get(saved);
      if (!key || key.paths !== paths) {
        const pending = (async () => {
          const links = await Promise.all(ids.map(getLink));
          validatePageSourceLinks({ lock: saved.lock, links });
          return { links, id: await digest(new TextEncoder().encode(JSON.stringify({ lock: { ...saved.lock, integrity: Object.keys(saved.lock.integrity).sort() }, paths, builds: links.map((link) => link.build) }))) };
        })();
        key = { paths, pending };
        contextKeys.set(saved, key);
        void pending.catch(() => { if (contextKeys.get(saved)?.pending === pending) contextKeys.delete(saved); });
      }
      const resolved = await key.pending;
      const contextId = resolved.id;
      if (requested && requested !== contextId) throw new Error("Page link context changed; reload the frame");
      let context = contexts.get(contextId);
      if (!context) { context = { saved, links: resolved.links }; contexts.set(contextId, context); }
      else if (context.saved !== saved) { context.saved = saved; context.links = resolved.links; delete context.config; }
      if (context.saved.lock.page !== page) throw new Error("Link context belongs to a different page");
      assertLinksAllowed({ profile: options.profile, developerOverrides: context.links.length > 0 });
      if (frame) {
        context.config ??= { page, entry: moduleUrl(pageSourceModule({ page, roots: context.saved.lock.pageSources ?? [] }) ?? `/src/${page}`), lock: context.saved.lock, profile: { ...options.profile, packageOrigin: context.saved.lock.packageOrigin }, runtimeVersion: options.version };
        const document = frameDocument({ config: context.config, preload: moduleGraphs.get(contextId) ?? [] });
        return new Response(document.html, { headers: { "content-type": "text/html; charset=utf-8", "content-length": String(byteLength(document.html)), "content-security-policy": contentSecurityPolicy(context.config.profile, document.nonce), [LINK_CONTEXT_HEADER]: contextId } });
      }
      if (url.pathname === DEV_SHIM_URL || url.pathname === PAGE_AGENT_URL) {
        metrics.source = "generated"; metrics.generated = url.pathname === DEV_SHIM_URL ? "JSX development shim" : "page agent module";
        let source = DEV_SHIM;
        if (url.pathname === PAGE_AGENT_URL) {
          metrics.source = "network"; metrics.origin = `${options.origin}/page-agent.js`; metrics.transferredBytes = null;
          const start = performance.now();
          try { source = await pageAgentSource({ origin: options.origin, fetch: async (input, init) => {
            const response = await (options.fetch ?? fetch)(input, init);
            metrics.transferredBytes = response.headers.has("content-length") ? Number(response.headers.get("content-length")) : null;
            return response;
          } }); } finally { metrics.fetchMs = performance.now() - start; }
        }
        metrics.decodedBytes = byteLength(source);
        const sourceHash = await digest(new TextEncoder().encode(source));
        const key = `${options.origin}/__runtime/link-generated/${encodeURIComponent(contextId)}/${encodeURIComponent(url.pathname)}/${encodeURIComponent(sourceHash)}`;
        const cached = await output.match(key);
        if (cached) {
          cachedLinkActivity({ ...cached, metrics });
          const headers = new Headers(cached.response.headers); headers.set("x-link-compiled", "0");
          return linkActivityResponse({ response: new Response(cached.response.body, { headers }), metrics });
        }
        const start = performance.now();
        let code: string;
        try { code = await rewriteLinkImports({ code: source, path: url.pathname, lock: context.saved.lock, links: context.links, sources: [] }); }
        finally { metrics.rewriteMs = performance.now() - start; }
        metrics.outputBytes = byteLength(code);
        const response = new Response(code, { headers: { "content-type": "text/javascript; charset=utf-8", "content-length": String(metrics.outputBytes), "x-link-source-bytes": String(metrics.decodedBytes), "x-link-compiled": "1" } });
        await output.put(key, response.clone());
        return linkActivityResponse({ response, metrics });
      }
      const response = await serve({ request, saved: context.saved, links: context.links, contextId, metrics });
      if (response.headers.get("content-type")?.startsWith("text/javascript")) {
        let graph = moduleGraphs.get(contextId);
        if (!graph) { graph = new Set(); moduleGraphs.set(contextId, graph); }
        graph.add(requestModuleUrl(url));
      }
      return linkActivityResponse({ response, metrics });
    } catch (error) {
      const failure = new RuntimeFailure({ phase: "link", file: url.pathname, message: String(error) });
      failure.activity = metrics;
      throw failure;
    }
  };
}
