import { randomUUID } from "@flanksource/clicky-ui/utils";
import type { BridgeEnvelope, FrameConfig, FrameMessage, JsonValue, PageLock, RuntimePhase } from "../schema.ts";
import { workerRequest } from "./bridge.ts";
import { exportHtml } from "./export.ts";
import { exportPageModule } from "./export-page.ts";
import { loadPageStyles, preparePageStyles } from "./boot-styles.ts";
import { mountPage, type PageModule, type PageLayout, type ReactRuntime } from "./mount-page.ts";
import { waitForReadiness } from "./readiness.ts";
import { RuntimeFailure, runtimeError } from "../sw/errors.ts";

export function renderLibraryKey(lock: PageLock): string {
  const { page: _page, ...libraries } = lock;
  return JSON.stringify(libraries, (_key, value: unknown) => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return value;
    const entries = Object.entries(value);
    return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));
  });
}

export function frameRenderJobs(initial: FrameConfig | undefined) {
  let prepared: FrameConfig | undefined;
  const libraryKey = initial ? renderLibraryKey(initial.lock) : undefined;
  let runtime: Promise<ReactRuntime> | undefined;
  let busy = false;

  return async (envelope: BridgeEnvelope): Promise<FrameMessage> => {
    if (busy) throw new Error("a render is already running");
    busy = true;
    try {
      const message = envelope.message;
      if (message.type === "prepare-render") {
        prepared = undefined;
        const candidate = await workerRequest<FrameConfig>({ message: { type: "open", ...message.open } }, 30000);
        const key = renderLibraryKey(candidate.lock);
        const navigate = libraryKey !== key;
        if (!navigate) prepared = candidate;
        return { type: "prepared-render", lock: candidate.lock, navigate, runtimeVersion: candidate.runtimeVersion };
      }
      if (message.type !== "render" || !prepared) throw new Error("prepare a compatible page before rendering");
      const config = prepared;
      prepared = undefined;
      runtime ??= Promise.all([import("react"), import("react-dom/client"), import("react-dom")]);
      return await renderDocument({ config, runtime, data: message.data });
    } finally {
      busy = false;
    }
  };
}

async function renderDocument(options: { config: FrameConfig; runtime: Promise<ReactRuntime>; data: JsonValue }): Promise<FrameMessage> {
  const { config, data } = options;
  const revision = randomUUID();
  const revised = (path: string) => {
    const module = new URL(path, location.href);
    module.searchParams.set("revision", revision);
    return module.href;
  };
  const root = document.getElementById("root");
  if (!root) throw new Error("render frame is missing its root");
  const base = document.createElement("base");
  base.href = new URL(".", revised(config.entry)).href;
  const head = new Set(document.head.children);
  const sheets = document.adoptedStyleSheets;
  document.head.prepend(base);
  let mounted: ReturnType<typeof mountPage> | undefined;
  let styles: Awaited<ReturnType<typeof preparePageStyles>> | undefined;
  let styleError: unknown;
  let phase: RuntimePhase = "link";
  try {
    const started = performance.now();
    const entry = revised(config.entry);
    const exportConfig = { ...config, entry };
    const layoutUrl = config.layout ? revised(config.layout) : undefined;
    const page = exportPageModule<PageModule>({ config: exportConfig, request: message => workerRequest(message, 15000) })
      .then(module => module ?? import(entry) as Promise<PageModule>);
    const [module, layout, runtime] = await Promise.all([
      page,
      layoutUrl ? import(layoutUrl) as Promise<PageLayout> : undefined,
      options.runtime,
    ]);
    const modulesMs = performance.now() - started;
    phase = "render";
    styles = await preparePageStyles({ config, styles: await loadPageStyles(config), module: { meta: { ...layout?.meta as object, ...module.meta as object } }, onError: error => { styleError = error; } });
    const mount = (page: PageModule, target: HTMLElement) => mountPage({ module: page, ...(layout ? { layout } : {}), runtime, data, file: config.page, root: target, wrap: children => children, send: () => undefined });
    mounted = mount(module, root);
    await mounted.mounted;
    phase = "readiness";
    await waitForReadiness({ root, mounted: mounted.mounted.then(() => styles!.ready()), ...(module.ready ? { hook: module.ready } : {}), timeoutMs: config.profile.readinessTimeoutMs, status: () => undefined });
    if (styleError) throw styleError;
    const ready = performance.now();
    const html = await exportHtml();
    return { type: "rendered", html, modulesMs, readinessMs: ready - started - modulesMs, snapshotMs: performance.now() - ready };
  } catch (error) {
    throw new RuntimeFailure(runtimeError({ error, phase, file: config.page }));
  } finally {
    mounted?.unmount();
    styles?.stop();
    for (const element of document.head.querySelectorAll(":scope > *")) if (!head.has(element)) element.remove();
    document.adoptedStyleSheets = sheets;
  }
}
