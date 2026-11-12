import type { FrameConfig } from "../schema.ts";
import { baseStylesheets, loadLibraries } from "./tailwind/load.ts";
import { loadTailwind, prepareTailwind } from "./tailwind/runtime.ts";
import { createTailwindStore } from "./tailwind/store.ts";
import { insertBaseStyles } from "./tailwind/stylesheets.ts";
import { lazyRuntimeDb, tailwindCacheName } from "../storage/db.ts";
import type { TailwindActivity } from "../activity-schema.ts";

export type LoadedStyles = Awaited<ReturnType<typeof loadPageStyles>>;

/** A page opts in to runtime Tailwind with `export const meta = { tailwind: "dynamic" }`; anything else is an error. */
export function pageTailwind(options: { module: { meta?: unknown }; page: string }): boolean {
  const { meta } = options.module;
  if (meta === undefined) return false;
  if (meta === null || typeof meta !== "object" || Array.isArray(meta)) throw new Error(`${options.page}: meta must be an object`);
  const { tailwind } = meta as { tailwind?: unknown };
  if (tailwind === undefined) return false;
  if (tailwind === "dynamic") return true;
  throw new Error(`${options.page}: meta.tailwind must be "dynamic" or omitted, received ${JSON.stringify(tailwind)}`);
}

/** Every page: load the libraries' recipes and link their published base stylesheets, awaiting their load. */
export async function loadPageStyles(config: FrameConfig) {
  const styles = await loadLibraries({ config });
  performance.mark("page-runtime:recipes");
  const base = insertBaseStyles({ document, stylesheets: baseStylesheets({ libraries: styles.libraries, config }), timeoutMs: config.profile.readinessTimeoutMs });
  await base.ready;
  performance.mark("page-runtime:base-styles");
  return { ...styles, links: base.links };
}

export async function preparePageStyles(options: { config: FrameConfig; styles: LoadedStyles; module: { meta?: unknown }; onError: (error: unknown) => void; onActivity?: (activity: TailwindActivity) => void }) {
  const { config, styles } = options;
  const removeLinks = () => { for (const link of styles.links) link.remove(); };
  if (!pageTailwind({ module: options.module, page: config.page })) return { warm: false, ready: async () => {}, stop: removeLinks };
  const root = document.getElementById("root");
  if (!root) throw new Error("page root #root is missing");
  const activity = options.onActivity ? { onActivity: options.onActivity } : {};
  const compiling = loadTailwind({ ...styles, runtimeVersion: config.runtimeVersion, ...activity });
  const response = await fetch(`/__runtime/candidates?page=${encodeURIComponent(config.page)}`);
  if (!response.ok) throw new Error(`source candidates: HTTP ${response.status}`);
  await compiling;
  performance.mark("page-runtime:compiler");
  const store = createTailwindStore({
    db: lazyRuntimeDb({ onVersionChange: () => location.reload() }),
    cache: await caches.open(tailwindCacheName(config.runtimeVersion)), origin: location.origin, fetch: (input) => fetch(input),
  });
  const dynamic = await prepareTailwind({ ...styles, root, candidates: await response.json() as string[], runtimeVersion: config.runtimeVersion, store, timeoutMs: config.profile.readinessTimeoutMs, onError: options.onError, ...activity });
  return { warm: dynamic.warm, candidates: dynamic.candidates, ready: dynamic.ready, stop: () => { dynamic.stop(); removeLinks(); } };
}
