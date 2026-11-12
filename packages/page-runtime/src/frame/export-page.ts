import type { CompilerPlugin, FrameConfig, PageLock } from "../schema.ts";
import { EXPORT_COMPILER_URL } from "../sw/runtime-module.ts";
import { waitForReadiness } from "./readiness.ts";

type ExportModule = { default: unknown; ready?: (() => Promise<void>) | Promise<void> };
type Mounted = { mounted: Promise<void>; unmount: () => void };

/** The remark plugins a page's libraries declare for exports, in library order. */
export function exportPlugins(lock: PageLock): CompilerPlugin[] {
  return Object.values(lock.compiler ?? {}).flatMap((plugins) => plugins.remark);
}

/**
 * Compiles a Markdown page with its libraries' export plugins, registers the result with the worker, and imports it.
 * Returns null when the live render already is the export: the page is not Markdown, or no library declares plugins.
 */
export async function exportPageModule<T extends ExportModule>(options: { config: FrameConfig; request: (message: unknown) => Promise<void> }): Promise<T | null> {
  const { config } = options;
  const plugins = exportPlugins(config.lock);
  if (!/\.mdx?$/.test(config.page) || !plugins.length) return null;
  const entry = new URL(config.entry, location.href);
  const raw = new URL(entry); raw.searchParams.set("raw", "");
  const [{ default: source }, { compileExportMdx }, ...loaded] = await Promise.all([
    import(raw.href) as Promise<{ default: string }>,
    import(EXPORT_COMPILER_URL) as Promise<typeof import("./export-compiler.ts")>,
    ...plugins.map((plugin) => import(plugin.module) as Promise<{ default: unknown }>),
  ]);
  const remark = plugins.map((plugin, index) => {
    const module = loaded[index]!;
    if (typeof module.default !== "function") throw new Error(`${plugin.module}: compiler plugin must default-export a function`);
    return plugin.options === undefined ? module.default : [module.default, plugin.options];
  });
  const code = await compileExportMdx({ path: config.page, code: source, remark });
  await options.request({ page: config.page, message: { type: "export-module", path: config.page, code } });
  const url = new URL(entry); url.searchParams.set("export", crypto.randomUUID());
  return await import(url.href) as T;
}

/**
 * Prepares export-only markup offscreen while the live page stays visible, then exposes it for snapshot/print.
 */
export async function withExportRender<T, M extends ExportModule>(options: { config: FrameConfig; root: HTMLElement; request: (message: unknown) => Promise<void>; mount: (module: M, root: HTMLElement) => Mounted; run: () => Promise<T> }): Promise<T> {
  const module = await exportPageModule<M>(options);
  if (!module) return options.run();
  const container = document.createElement("div");
  container.dataset.pageRuntimeExport = "";
  container.style.cssText = `position:fixed;left:-100000px;top:0;width:${options.root.getBoundingClientRect().width}px;pointer-events:none`;
  options.root.after(container);
  let mounted: Mounted | undefined;
  try {
    mounted = options.mount(module, container);
    await waitForReadiness({ root: container, mounted: mounted.mounted, ...(module.ready ? { hook: module.ready } : {}), timeoutMs: options.config.profile.readinessTimeoutMs, status: () => undefined });
    options.root.hidden = true; options.root.dataset.pageRuntimeLive = "";
    container.removeAttribute("style");
    return await options.run();
  } finally {
    mounted?.unmount(); container.remove();
    options.root.hidden = false; delete options.root.dataset.pageRuntimeLive;
  }
}
