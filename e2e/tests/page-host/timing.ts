import { mkdir, writeFile } from "node:fs/promises";
import { test as base, type Page, type TestInfo } from "@playwright/test";

type ResourceTiming = { name: string; startTime: number; duration: number };
type TimingEvent = { url: string; at: number; name?: string; message?: string; state?: string; error?: { phase: string; file: string; message: string }; records?: import("../../../packages/page-runtime/src/activity-schema").WorkerActivity[]; resources?: ResourceTiming[] };
export const test = base.extend<{ timing: TimingEvent[] }>({ timing: [async ({ page }, use, info) => {
  const timing = await recordTiming(page, info);
  await use(timing.events);
  await timing.finish();
}, { auto: true }] });

export async function recordTiming(page: Page, info: TestInfo) {
  const events: TimingEvent[] = [];
  await page.exposeFunction("recordRuntimeTiming", (value: TimingEvent) => { events.push(value); });
  await page.addInitScript((captureRequests: boolean) => {
    const record = (value: unknown) => (window as unknown as { recordRuntimeTiming: (value: unknown) => Promise<void> }).recordRuntimeTiming(value);
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) if (entry.name.startsWith("page-runtime:")) {
        void record({ url: location.pathname, at: performance.timeOrigin + entry.startTime, name: entry.name, duration: entry.duration });
        if (entry.name === "page-runtime:ready") void record({ url: location.href, at: performance.timeOrigin + entry.startTime, name: "resources", resources: performance.getEntriesByType("resource").map((resource) => ({ name: resource.name, startTime: resource.startTime, duration: resource.duration })) });
      }
    }).observe({ type: "mark", buffered: true });
    document.addEventListener("DOMContentLoaded", () => { void record({ url: location.pathname, at: performance.timeOrigin, name: "navigation", navigation: performance.getEntriesByType("navigation").map((entry) => entry.toJSON()) }); });
    window.addEventListener("message", (event) => {
      if (event.data?.bridge === "page-runtime-v1") void record({ url: location.pathname, at: Date.now(), message: event.data.message.type, state: event.data.message.state, error: event.data.message.error, ...(captureRequests ? { records: event.data.message.records } : {}) });
    });
    document.addEventListener("input", (event) => { if (event.isTrusted) void record({ url: location.pathname, at: performance.timeOrigin + performance.now(), name: "editor-input" }); }, true);
    if (window.parent !== window) {
      const recorded = new Set<string>();
      new MutationObserver(() => {
        for (const element of Array.from(document.querySelectorAll("#root h1, #root [data-link-edit]"))) {
          const name = `visible:${element.textContent}`;
          if (recorded.has(name)) continue;
          recorded.add(name);
          requestAnimationFrame(() => {
            if (element.isConnected && element.getBoundingClientRect().width > 0 && getComputedStyle(element).visibility === "visible") void record({ url: location.pathname, at: performance.timeOrigin + performance.now(), name });
          });
        }
      }).observe(document, { childList: true, subtree: true });
    }
  }, process.env.PAGE_HOST_TIMING_REQUESTS === "1");
  return { events, finish: async () => {
    const resources = events.flatMap((event) => event.resources ? [{ url: event.url, entries: event.resources }] : []);
    await mkdir("../.tmp/T-host-e2e/timings", { recursive: true });
    await writeFile(`../.tmp/T-host-e2e/timings/${info.testId.replaceAll(/[^a-z0-9-]/gi, "_")}.json`, JSON.stringify({ title: info.title, events, resources }, null, 2));
  } };
}
