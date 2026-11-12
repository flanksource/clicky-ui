// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { BuildLog } from "./BuildLog.tsx";
import type { BuildLogEntry } from "./build-log.ts";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
afterEach(() => { vi.useRealTimers(); document.body.innerHTML = ""; });

const startedAt = 5_000_000;
const entries: BuildLogEntry[] = [
  { label: "Resolve page dependencies", source: "host", offsetMs: 0, durationMs: 120 },
  { label: "booting", source: "frame", offsetMs: 120, durationMs: null },
];
const rows = () => [...document.querySelectorAll('[role="log"] li')].map(row => row.textContent);

function mount(live: boolean) {
  const element = document.createElement("div"); document.body.append(element);
  const root = createRoot(element);
  act(() => root.render(createElement(BuildLog, { entries, live, startedAt })));
  return root;
}

it("ticks the running step while live and freezes it once the load stops", () => {
  vi.useFakeTimers(); vi.setSystemTime(startedAt + 200);
  const root = mount(true);
  expect(rows()).toEqual(["+0.00shostResolve page dependencies120 ms", "+0.12sframebooting80 ms…"]);
  act(() => { vi.advanceTimersByTime(500); });
  expect(rows()[1]).toBe("+0.12sframebooting580 ms…");
  act(() => root.render(createElement(BuildLog, { entries, live: false, startedAt })));
  act(() => { vi.advanceTimersByTime(500); });
  expect(rows()[1]).toBe("+0.12sframebooting");
});

it("shows an error step's message", () => {
  const element = document.createElement("div"); document.body.append(element);
  act(() => createRoot(element).render(createElement(BuildLog, { entries: [{ label: "Frame failed", source: "frame", offsetMs: 40, durationMs: 0, error: "module not found" }], live: false })));
  expect(rows()).toEqual(["+0.04sframeFrame failed: module not found0 ms"]);
});
