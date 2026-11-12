import type { BridgeEnvelope, FrameConfig, JsonValue, RuntimeError, RuntimePhase, RuntimeProfile } from "../schema.ts";
import { createFrameBridge, workerRequest } from "./bridge.ts";
import { waitForReadiness } from "./readiness.ts";
import { exportHtml } from "./export.ts";
import { withExportRender } from "./export-page.ts";
import { runtimeError } from "../sw/errors.ts";
import { validateProfile } from "../sw/profile.ts";
import { validateFrameMessage } from "../host/validation.ts";
import { loadPageStyles, pageTailwind, preparePageStyles } from "./boot-styles.ts";
import type { PageAgent } from "./agent/index.ts";
import { PAGE_AGENT_URL } from "../sw/runtime-module.ts";
import { createFrameActivity } from "./activity.ts";
import { mountPage, type PageModule, type PageLayout, type ReactRuntime } from "./mount-page.ts";

export type PageStyles = Awaited<ReturnType<typeof preparePageStyles>>;

function detail(error: unknown, phase: RuntimePhase, file: string): RuntimeError {
  if (error && typeof error === "object" && "pageRuntime" in error) return error.pageRuntime as RuntimeError;
  return runtimeError({ error, phase, file });
}

export async function ensureController(options: { timeoutMs?: number } = {}): Promise<boolean> {
  if (!("serviceWorker" in navigator)) throw new Error("navigator.serviceWorker is unavailable");
  const controlled = navigator.serviceWorker.controller;
  await navigator.serviceWorker.register("/sw.js", { scope: "/frame/" });
  const registration = await withTimeout(navigator.serviceWorker.ready, options.timeoutMs ?? 15000, "service worker activation timeout");
  const active = registration.installing ?? registration.waiting ?? registration.active;
  if (!active) throw new Error("service worker registration has no active worker");
  if (active.state !== "activated") await withTimeout(new Promise<void>((resolve, reject) => active.addEventListener("statechange", () => {
    if (active.state === "activated") resolve();
    if (active.state === "redundant") reject(new Error("service worker installation failed"));
  })), options.timeoutMs ?? 15000, "service worker activation timeout");
  if (controlled && navigator.serviceWorker.controller === active) return true;
  const url = new URL(location.href);
  if (url.searchParams.has("runtime-reloaded")) throw new Error("service worker does not control frame after one reload");
  url.searchParams.set("runtime-reloaded", "1"); location.replace(url); return false;
}

export async function bootFrame(): Promise<void> {
  performance.mark("page-runtime:boot");
  let phase: RuntimePhase = "resolve";
  let config: FrameConfig | undefined;
  let lockAnnounced = false;
  const announceLock = () => { if (config && !lockAnnounced) { bridge.send({ type: "lock", lock: config.lock }); lockAnnounced = true; } };
  let ready = false;
  let agent: PageAgent | undefined;
  let styles: PageStyles | undefined;
  let unmount: (() => void) | undefined;
  let updateData: ((value: JsonValue) => Promise<void>) | undefined;
  let updateSources: ((files: Record<string, string | null>) => Promise<void>) | undefined;
  let latestData: JsonValue = null;
  let exportMount: ((module: PageModule, root: HTMLElement) => { mounted: Promise<void>; unmount: () => void }) | undefined;
  let receiveData!: (data: JsonValue) => void;
  const data = new Promise<JsonValue>((resolve) => { receiveData = resolve; });
  const bridge = createFrameBridge({ receive: (envelope) => { void receive(envelope).catch((error: unknown) => report(error, envelope.id)); }, error: (error) => report(error) });
  const report = (error: unknown, re?: string) => { bridge.send({ type: "error", error: detail(error, phase, config?.page ?? location.pathname) }, re ? { re } : undefined); };
  const activity = createFrameActivity({ send: (message) => bridge.send(message), error: report });
  let controlled = false; let activitySubscribed = false;
  const subscribeActivity = () => {
    if (activitySubscribed) return;
    activitySubscribed = true;
    void workerRequest({ message: "subscribe-activity", load: activity.load, navigationStart: activity.navigationStart }, 15000).catch(report);
  };
  const dispose = () => { ready = false; unmount?.(); unmount = undefined; exportMount = undefined; agent?.dispose(); agent = undefined; styles?.stop(); styles = undefined; };
  window.addEventListener("pagehide", () => { activity.stop(); dispose(); bridge.dispose(); }, { once: true });
  async function receive(envelope: BridgeEnvelope) {
    const m = envelope.message;
    if (m.type === "open") {
      phase = "resolve"; await workerRequest({ message: m }, 15000);
      const url = new URL(location.href);
      if (url.searchParams.has("runtime-opened")) location.reload();
      else { url.searchParams.set("runtime-opened", "1"); location.replace(url); }
    }
    else if (m.type === "sources") {
      if (!config || !updateSources) throw new Error("page is not mounted for source updates");
      ready = false; phase = "compile";
      performance.mark("page-runtime:sources");
      await workerRequest({ page: config.page, message: m }, 15000);
      if ("data" in m) latestData = m.data!;
      await updateSources(m.files);
      ready = true;
      bridge.send({ type: "status", state: "ready" }, envelope.id ? { re: envelope.id } : undefined);
    }
    else if (m.type === "reload") location.reload();
    else if (m.type === "theme") { document.documentElement.dataset.theme = m.theme; document.documentElement.dataset.density = m.density; }
    else if (m.type === "data") {
      latestData = m.data; receiveData(m.data);
      if (updateData) {
        ready = false; phase = "render";
        await updateData(m.data);
        ready = true;
        bridge.send({ type: "status", state: "ready" }, envelope.id ? { re: envelope.id } : undefined);
      }
    }
    else if (m.type === "mode" || m.type === "pick" || m.type === "page" || m.type === "pins" || m.type === "highlight" || m.type === "scroll" || m.type === "design-override" || m.type === "design-write" || m.type === "design-write-result" || m.type === "review-remove" || m.type === "review-list" || m.type === "review-select" || m.type === "review-visibility" || m.type === "review-action") {
      if (!agent) throw new Error("page agent is not ready");
      agent.receive(m);
    }
    else if (m.type === "capture-vocabulary") {
      const reference = envelope.id ? { re: envelope.id } : undefined;
      if (!ready || !agent) {
        bridge.send({ type: "error", error: { phase: "render", message: "page is not ready for vocabulary capture", file: config?.page ?? location.pathname } }, reference);
        return;
      }
      bridge.send(await agent.captureVocabulary({ ready }), reference);
    }
    else if (m.type === "export") {
      if (!ready || !config || !exportMount) throw new Error("page is not ready for export");
      const reference = envelope.id ? { re: envelope.id } : undefined;
      const root = document.getElementById("root");
      if (!(root instanceof HTMLElement)) throw new Error("frame root is missing");
      await withExportRender({ config, root, mount: exportMount, request: (message) => workerRequest(message, 15000), run: async () => {
        if (m.format === "print") { window.print(); bridge.send({ type: "status", state: "ready" }, reference); }
        else bridge.send({ type: "snapshot", html: await exportHtml() }, reference);
      } });
    }
  }
  try {
    const element = document.getElementById("page-runtime-config");
    if (element) config = JSON.parse(element.textContent!) as FrameConfig;
    let profile: RuntimeProfile;
    if (config) profile = validateProfile(config.profile);
    else {
      const profileResponse = await withTimeout(fetch("/profile.json", { cache: "no-store" }), 15000, "profile fetch timeout");
      if (!profileResponse.ok) throw new Error(`profile.json: HTTP ${profileResponse.status}`);
      profile = validateProfile(await profileResponse.json());
    }
    const host = new URLSearchParams(location.hash.slice(1)).get("host");
    if (!host || !profile.embedders.includes(host)) throw new Error(`host ${host} is not in profile.embedders`);
    const navigationError = document.getElementById("page-runtime-error");
    if (navigationError) {
      const error = JSON.parse(navigationError.textContent!) as RuntimeError;
      throw Object.assign(new Error(error.message), { pageRuntime: error });
    }
    if (!await ensureController({ timeoutMs: profile.readinessTimeoutMs })) { bridge.dispose(); return; }
    controlled = true;
    if (!config || !new URL(location.href).searchParams.has("runtime-opened")) { bridge.send({ type: "status", state: "connecting" }); return; }
    bridge.send({ type: "status", state: "booting" });
    performance.mark("page-runtime:controlled");
    phase = "link";
    let rejectModule!: (error: Error) => void;
    const moduleFailure = new Promise<never>((_, reject) => { rejectModule = reject; });
    const workerError = (event: MessageEvent<unknown>) => {
      if (event.source !== navigator.serviceWorker.controller) return;
      if (!event.data || typeof event.data !== "object" || !("type" in event.data) || event.data.type !== "error") return;
      const message = validateFrameMessage(event.data);
      if (message.type === "error") rejectModule(Object.assign(new Error(message.error.message), { pageRuntime: message.error }));
    };
    navigator.serviceWorker.addEventListener("message", workerError);
    let pageModule: PageModule;
    let libraryStyles: Awaited<ReturnType<typeof loadPageStyles>>;
    let pageData: JsonValue;
    let agentModule: typeof import("./page-agent.js");
    let reactRuntime: ReactRuntime;
    try { [pageModule, libraryStyles, pageData, agentModule, reactRuntime] = await Promise.race([Promise.all([
      import(config.entry) as Promise<PageModule>, loadPageStyles(config),
      withTimeout(data, config.profile.readinessTimeoutMs, "data bridge timeout"),
      import(`${PAGE_AGENT_URL}${new URL(config.entry, location.href).search}`) as Promise<typeof import("./page-agent.js")>,
      Promise.all([import("react"), import("react-dom/client"), import("react-dom")]),
    ]), moduleFailure]); }
    finally { navigator.serviceWorker.removeEventListener("message", workerError); }
    let layout = config.layout ? await import(config.layout) as PageLayout : undefined;
    for (const module of [pageModule, layout]) if (module?.meta !== undefined && (module.meta === null || typeof module.meta !== "object" || Array.isArray(module.meta))) throw new Error(`${config.page}: meta must be an object`);
    performance.mark("page-runtime:module");
    performance.mark("page-runtime:libraries");
    activity.resolve(config, { react: reactRuntime[0].version, "react-dom": reactRuntime[2].version });
    if (typeof pageModule.default !== "function" && typeof pageModule.default !== "object") throw new Error(`${config.page}: missing default React component`);
    const styledModule = layout?.meta === undefined ? pageModule : { ...pageModule, meta: { ...layout.meta as object, ...pageModule.meta as object } };
    let pageStyles = await preparePageStyles({ config, styles: libraryStyles, module: styledModule, onError: (error) => { ready = false; report(error); }, onActivity: activity.tailwind });
    let dynamicStyles = pageTailwind({ module: styledModule, page: config.page });
    styles = pageStyles;
    performance.mark("page-runtime:styles");
    const pageRoot = document.getElementById("root");
    if (!(pageRoot instanceof HTMLElement)) throw new Error("frame root is missing");
    performance.mark("page-runtime:agent");
    const { startPageAgent, PageAgentProvider } = agentModule;
    agent = startPageAgent({ root: pageRoot, page: config.page, ...(config.lock.pageSources ? { pageSources: config.lock.pageSources } : {}), send: (message) => bridge.send(message), error: report });
    phase = "render";
    const pageAgent = agent; const runtime = reactRuntime;
    const wrap = (children: import("react").ReactNode) => runtime[0].createElement(PageAgentProvider, { agent: pageAgent, children });
    const mountedPage = mountPage({ module: pageModule, ...(layout ? { layout } : {}), runtime, data: pageData, file: config.page, root: pageRoot, wrap });
    updateSources = async (files) => {
      const revision = crypto.randomUUID();
      const revised = (path: string) => { const url = new URL(path, location.href); url.searchParams.set("revision", revision); return url.href; };
      const paths = Object.keys(files);
      if (paths.length && paths.every(path => path.endsWith(".css"))) {
        for (const path of paths) {
          const url = new URL(`/src/${path.split("/").map(encodeURIComponent).join("/")}`, location.href);
          const links = [...document.querySelectorAll<HTMLLinkElement>("link[data-page-runtime-stylesheet]")].filter(link => link.dataset.pageRuntimeStylesheet === url.pathname);
          if (files[path] === null) { for (const link of links) link.remove(); }
          else if (links.length) { url.searchParams.set("module", ""); const module = await import(revised(url.href)) as { default: Promise<CSSStyleSheet> }; await module.default; }
        }
        if (!updateData) throw new Error("page is not mounted for CSS updates");
        await updateData(latestData); return;
      }
      const entry = revised(config!.entry);
      const nextModule = await import(entry) as PageModule;
      const nextLayout = config!.layout && Object.keys(files).some(path => path !== config!.page) ? await import(revised(config!.layout)) as PageLayout : layout;
      for (const module of [nextModule, nextLayout]) if (module?.meta !== undefined && (module.meta === null || typeof module.meta !== "object" || Array.isArray(module.meta))) throw new Error(`${config!.page}: meta must be an object`);
      if (typeof nextModule.default !== "function" && typeof nextModule.default !== "object") throw new Error(`${config!.page}: missing default React component`);
      const nextStyled = { meta: { ...nextLayout?.meta as object, ...nextModule.meta as object } };
      const nextDynamic = pageTailwind({ module: nextStyled, page: config!.page });
      if (nextDynamic !== dynamicStyles) {
        const nextStyles = await preparePageStyles({ config: config!, styles: await loadPageStyles(config!), module: nextStyled, onError: report, onActivity: activity.tailwind });
        pageStyles.stop(); pageStyles = nextStyles; styles = nextStyles; dynamicStyles = nextDynamic;
      }
      phase = "render";
      await mountedPage.replace({ module: nextModule, ...(nextLayout ? { layout: nextLayout } : {}), data: latestData });
      pageModule = nextModule; layout = nextLayout; config!.entry = entry;
      if (config!.layout && nextLayout) config!.layout = revised(config!.layout);
      phase = "readiness";
      await waitForReadiness({ root: pageRoot, mounted: pageStyles.ready(), ...(pageModule.ready ? { hook: pageModule.ready } : {}), timeoutMs: config!.profile.readinessTimeoutMs, status: () => undefined });
      await pageStyles.ready(); activity.schedule();
    };
    updateData = async (value) => {
      await mountedPage.update(value);
      phase = "readiness";
      await waitForReadiness({ root: pageRoot, mounted: pageStyles.ready(), ...(pageModule.ready ? { hook: pageModule.ready } : {}), timeoutMs: config!.profile.readinessTimeoutMs, status: () => undefined });
      await pageStyles.ready();
    };
    unmount = mountedPage.unmount;
    latestData = pageData;
    const page = config.page;
    exportMount = (module, root) => {
      if (typeof module.default !== "function" && typeof module.default !== "object") throw new Error(`${page}: export compile has no default React component`);
      return mountPage({ module, ...(layout ? { layout } : {}), runtime, data: latestData, file: page, root, wrap });
    };
    performance.mark("page-runtime:render");
    requestAnimationFrame(() => requestAnimationFrame(() => { performance.mark("page-runtime:visible"); subscribeActivity(); activity.schedule(); }));
    phase = "readiness";
    await waitForReadiness({ root: pageRoot, mounted: mountedPage.mounted.then(() => pageStyles.ready()), ...(pageModule.ready ? { hook: pageModule.ready } : {}), timeoutMs: config.profile.readinessTimeoutMs, status: (state) => { if (state !== "ready") bridge.send({ type: "status", state }); } });
    await pageStyles.ready();
    announceLock();
    ready = true;
    performance.mark("page-runtime:ready");
    bridge.send({ type: "status", state: "ready" });
    activity.schedule();
  } catch (error) { if (controlled) subscribeActivity(); dispose(); announceLock(); report(error); }
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(message)), timeoutMs); })]); }
  finally { clearTimeout(timer); }
}
