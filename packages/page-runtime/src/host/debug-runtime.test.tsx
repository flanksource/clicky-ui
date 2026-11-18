// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { DebugClient, DebugConsoleDock, DebugStore } from "@flanksource/clicky-ui/devtools";
import { debugRuntimes } from "@flanksource/clicky-ui/data";
import { PageFrame } from "./PageFrame.tsx";
import type { BridgeOptions } from "./bridge.ts";
import { createRequestActivity } from "../sw/activity.ts";

const channels = vi.hoisted(() => [] as BridgeOptions[]);
vi.mock("./bridge.ts", () => ({ createBridge: (options: BridgeOptions) => { channels.push(options); return { send: vi.fn(), dispose: vi.fn() }; } }));

it("delivers frame failures to the shared console and unregisters disposed runtimes", async () => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  window.history.replaceState(null, "", "/?__debug_open=1&__debug_tab=runtimes");
  const element = document.createElement("div");
  document.body.append(element);
  const root = createRoot(element);
  const client = new DebugClient();
  vi.spyOn(client, "clear").mockResolvedValue();
  const stream = Object.assign(new EventTarget(), { close() {}, onopen: null, onerror: null });
  try {
    await act(() => root.render(createElement("div", null,
      createElement(DebugConsoleDock, { store: new DebugStore(), client, defaultOpen: true, createEventSource: () => stream as unknown as EventSource }),
      ...["Report.tsx", "Dashboard.mdx"].map(page => createElement(PageFrame, { key: page, runtimeOrigin: "https://runtime.example", open: { page, files: {}, manifest: { dependencies: {} } }, theme: { theme: "light", density: "compact" }, data: null, onError: vi.fn() })),
    )));
    expect(debugRuntimes().map(runtime => runtime.label)).toEqual(["Report.tsx", "Dashboard.mdx"]);
    const channel = channels.at(-2)!;
    await act(async () => {
      channel.onMessage({ bridge: "page-runtime-v1", session: channel.session, message: { type: "activity", load: "report", navigationStart: Date.now(), records: [createRequestActivity("https://runtime.example/src/Report.tsx")], timeline: [], tailwind: [] } });
      channel.onMessage({ bridge: "page-runtime-v1", session: channel.session, message: { type: "error", error: { phase: "compile", file: "Report.tsx", line: 8, message: "Unexpected token" } } });
      await import("./RuntimeDebugPanel.tsx");
    });
    expect(element.textContent).toContain("compile: Report.tsx:8: Unexpected token");
    expect(element.textContent).toContain("Requests1");
    await act(() => element.querySelector<HTMLButtonElement>('[aria-label="Clear captures"]')!.click());
    expect(element.textContent).not.toContain("Requests1");
    await act(() => [...element.querySelectorAll("button")].find(button => button.textContent?.includes("Dashboard.mdx"))!.click());
    await vi.waitFor(() => expect(element.querySelector('[aria-label="Runtime diagnostics: Dashboard.mdx"]')).not.toBeNull());
    expect(element.querySelector('[role="alert"]')).toBeNull();
  } finally {
    await act(() => root.unmount());
    element.remove();
    window.history.replaceState(null, "", "/");
  }
  expect(debugRuntimes()).toEqual([]);
});
