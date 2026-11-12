import type { FrameConfig, FrameMessage } from "../schema.ts";
import type { ActivityMessage, RuntimeResolution, TailwindActivity, WorkerActivity } from "../activity-schema.ts";
import { validateActivity } from "../activity-schema.ts";
import { inspectStyles } from '../styles.ts';

export function runtimeResolution(options: { config: FrameConfig; importMap: string }): RuntimeResolution {
  const { config } = options;
  const baseNames = ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "react-dom/client", "scheduler", "@tanstack/react-query", "jotai"];
  const base = Object.fromEntries(baseNames.flatMap((name) => config.lock.map.imports[name] ? [[name, config.lock.map.imports[name]!]] : []));
  const react = /\/npm\/(?:react|@flanksource\/clicky-ui)@([^/]+)/.exec(config.lock.map.imports.react ?? "");
  const versions = { ...config.lock.versions };
  // Converted React lives inside clicky-ui's runtime set; report React's actual runtime version separately in boot.
  if (react && config.lock.map.imports.react?.startsWith("/npm/react@")) versions.react = react[1]!;
  return { versions, base, managed: Object.keys(config.profile.managed), importMapBytes: new TextEncoder().encode(options.importMap).byteLength, scopes: Object.keys(config.lock.map.scopes).length };
}

export function createFrameActivity(options: { send: (message: FrameMessage) => void; error: (error: Error) => void }) {
  const load = crypto.randomUUID(); const navigationStart = performance.timeOrigin;
  let runtime: RuntimeResolution | undefined;
  let builds: TailwindActivity[] = [];
  let records: WorkerActivity[] = [];
  let timer: ReturnType<typeof setTimeout> | undefined;
  const snapshot = (): ActivityMessage => ({ type: "activity", load, navigationStart, records: [], timeline: performance.getEntriesByType("mark").filter((mark) => mark.name.startsWith("page-runtime:")).slice(-64).map((mark) => ({ phase: mark.name.slice(13), atMs: mark.startTime })), tailwind: builds.splice(0, 32), ...(runtime ? { runtime } : {}) });
  const flush = () => {
    clearTimeout(timer); timer = undefined;
    const message = { ...snapshot(), styles: inspectStyles(document) }; const pending = records; records = [];
    options.send({ ...message, records: pending.slice(0, 32) });
    for (let index = 32; index < pending.length; index += 32) options.send({ type: "activity", load, navigationStart, records: pending.slice(index, index + 32), timeline: [], tailwind: [] });
  };
  const schedule = () => { timer ??= setTimeout(flush, 40); };
  const receive = (event: MessageEvent<unknown>) => {
    if (event.source !== navigator.serviceWorker.controller) return;
    if (!event.data || typeof event.data !== "object" || !("type" in event.data) || event.data.type !== "activity") return;
    try {
      const message = validateActivity(event.data);
      if (message.load !== load || message.navigationStart !== navigationStart) throw new Error("worker activity belongs to a different frame load");
      records.push(...message.records); schedule();
    } catch (error) { options.error(error instanceof Error ? error : new Error(String(error))); }
  };
  navigator.serviceWorker.addEventListener("message", receive);
  return {
    load, navigationStart, flush, schedule,
    resolve: (config: FrameConfig, versions: Record<string, string>) => {
      const map = document.querySelector('script[type="importmap"]');
      if (!map?.textContent) throw new Error("frame import map is missing");
      runtime = runtimeResolution({ config, importMap: map.textContent }); Object.assign(runtime.versions, versions);
    },
    tailwind: (build: TailwindActivity) => { builds.push(build); if (builds.length === 32) flush(); else schedule(); },
    stop: () => { clearTimeout(timer); navigator.serviceWorker.removeEventListener("message", receive); builds = []; records = []; },
  };
}
