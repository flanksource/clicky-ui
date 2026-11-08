import type { ComponentType, ReactNode } from "react";
import type { BridgeEnvelope, FrameConfig, JsonValue, RuntimeError, RuntimePhase, RuntimeProfile } from "../schema.ts";
import { createFrameBridge, workerRequest } from "./bridge.ts";
import { waitForReadiness } from "./readiness.ts";
import { exportHtml } from "./export.ts";
import { withExportRender } from "./export-page.ts";
import { runtimeError } from "../sw/errors.ts";
import { validateProfile } from "../sw/profile.ts";
import { validateFrameMessage } from "../host/validation.ts";
import { loadPageStyles, preparePageStyles } from "./boot-styles.ts";
import type { PageAgent } from "./agent/index.ts";
import { PAGE_AGENT_URL } from "../sw/runtime-module.ts";
import { createFrameActivity } from "./activity.ts";

/** `meta.tailwind` is `"dynamic"` for a page that builds Tailwind at runtime; it is validated when the page's styles are prepared. */
export type PageModule = { default: ComponentType<{ data: JsonValue }>; ready?: (() => Promise<void>) | Promise<void>; meta?: unknown };
export type PageStyles = Awaited<ReturnType<typeof preparePageStyles>>;
type ReactRuntime = [typeof import("react"), typeof import("react-dom/client"), typeof import("react-dom")];

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
  let updateData: ((value: JsonValue) => void) | undefined;
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
    else if (m.type === "sources") { performance.mark("page-runtime:sources"); await workerRequest({ page: config?.page, message: m }, 15000); performance.mark("page-runtime:invalidated"); location.reload(); }
    else if (m.type === "reload") location.reload();
    else if (m.type === "theme") { document.documentElement.dataset.theme = m.theme; document.documentElement.dataset.density = m.density; }
    else if (m.type === "data") { latestData = m.data; receiveData(m.data); updateData?.(m.data); }
    else if (m.type === "mode" || m.type === "pick" || m.type === "page" || m.type === "pins" || m.type === "highlight" || m.type === "scroll" || m.type === "design-override" || m.type === "design-write" || m.type === "design-write-result" || m.type === "review-list" || m.type === "review-select" || m.type === "review-visibility" || m.type === "review-action") {
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
    performance.mark("page-runtime:module");
    performance.mark("page-runtime:libraries");
    activity.resolve(config, { react: reactRuntime[0].version, "react-dom": reactRuntime[2].version });
    if (typeof pageModule.default !== "function" && typeof pageModule.default !== "object") throw new Error(`${config.page}: missing default React component`);
    const pageStyles = await preparePageStyles({ config, styles: libraryStyles, module: pageModule, onError: (error) => { ready = false; report(error); }, onActivity: activity.tailwind });
    styles = pageStyles;
    performance.mark("page-runtime:styles");
    const pageRoot = document.getElementById("root");
    if (!(pageRoot instanceof HTMLElement)) throw new Error("frame root is missing");
    performance.mark("page-runtime:agent");
    const { startPageAgent, PageAgentProvider } = agentModule;
    agent = startPageAgent({ root: pageRoot, page: config.page, ...(config.lock.pageSources ? { pageSources: config.lock.pageSources } : {}), send: (message) => bridge.send(message), error: report });
    phase = "render";
    const mountedPage = mountPage({ module: pageModule, runtime: reactRuntime, agent, provider: PageAgentProvider, data: pageData, file: config.page, root: pageRoot, subscribe: (update) => { updateData = update; } });
    unmount = mountedPage.unmount;
    latestData = pageData;
    const page = config.page; const pageAgent = agent; const runtime = reactRuntime;
    exportMount = (module, root) => {
      if (typeof module.default !== "function" && typeof module.default !== "object") throw new Error(`${page}: export compile has no default React component`);
      return mountPage({ module, runtime, agent: pageAgent, provider: PageAgentProvider, data: latestData, file: page, root, subscribe: () => undefined });
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

function mountPage(options: { module: PageModule; runtime: ReactRuntime; agent: PageAgent; provider: typeof import("./page-agent.js")["PageAgentProvider"]; data: JsonValue; file: string; root: HTMLElement; subscribe: (update: (value: JsonValue) => void) => void }): { mounted: Promise<void>; unmount: () => void } {
  const [React, { createRoot }, { flushSync }] = options.runtime;
  let resolve!: () => void; let reject!: (error: unknown) => void;
  const mounted = new Promise<void>((yes, no) => { resolve = yes; reject = no; });
  class Boundary extends React.Component<{ children: ReactNode }, { failed: boolean }> {
    override state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    override componentDidCatch(error: Error) { reject(Object.assign(error, { pageRuntime: detail(error, "render", options.file) })); }
    override render() { return this.state.failed ? null : this.props.children; }
  }
  function Mounted() {
    const [data, setData] = React.useState(options.data);
    React.useLayoutEffect(() => { options.subscribe(setData); resolve(); }, []);
    return React.createElement(options.module.default, { data });
  }
  const renderer = createRoot(options.root);
  flushSync(() => renderer.render(React.createElement(Boundary, null, React.createElement(options.provider, { agent: options.agent, children: React.createElement(Mounted) }))));
  return { mounted, unmount: () => renderer.unmount() };
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([promise, new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error(message)), timeoutMs); })]); }
  finally { clearTimeout(timer); }
}
