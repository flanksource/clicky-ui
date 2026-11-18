// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { PageFrame } from "./PageFrame.tsx";
import { exampleLock } from "../link/testing-fixtures.ts";
import type { BridgeOptions } from "./bridge.ts";
const runtime = vi.hoisted(() => ({ options: undefined as BridgeOptions | undefined, send: vi.fn() }));
vi.mock("./bridge.ts", () => ({ createBridge: (options: BridgeOptions) => { runtime.options = options; return { send: runtime.send, dispose: vi.fn() }; } }));

it("keeps the iframe and sends the latest bootstrap data while manual updates are controlled through its bridge", async () => {
  const element = document.createElement("div"); document.body.append(element);
  const root = createRoot(element);
  const props = { runtimeOrigin: "https://runtime.example", open: { page: "report.mdx", manifest: { dependencies: {} }, files: {} }, theme: { theme: "light", density: "compact" } as const, dataUpdates: false, data: { title: "first" }, onError: vi.fn() };
  try {
    await act(() => root.render(createElement(PageFrame, props)));
    const frame = element.querySelector("iframe");
    runtime.send.mockClear();
    await act(() => root.render(createElement(PageFrame, { ...props, data: { title: "latest" } })));
    expect({ sameFrame: element.querySelector("iframe") === frame, calls: runtime.send.mock.calls }).toEqual({ sameFrame: true, calls: [] });
    const message = { bridge: "page-runtime-v1" as const, session: runtime.options!.session, message: { type: "status" as const, state: "booting" as const } };
    runtime.options!.onMessage(message); runtime.options!.onMessage(message);
    expect(runtime.send).toHaveBeenCalledWith({ type: "data", data: { title: "latest" } });
  } finally { await act(() => root.unmount()); element.remove(); }
});

it("reports a changed lock once and avoids persisting an unchanged lock on every reload", async () => {
  const element = document.createElement("div"); document.body.append(element);
  const root = createRoot(element);
  const lock = exampleLock();
  const onMessage = vi.fn();
  const props = { runtimeOrigin: "https://runtime.example", open: { page: lock.page, lock, manifest: { dependencies: {} }, files: {} }, theme: { theme: "light", density: "compact" } as const, data: null, onError: vi.fn(), onMessage };
  try {
    await act(() => root.render(createElement(PageFrame, props)));
    runtime.options!.onMessage({ bridge: "page-runtime-v1", session: runtime.options!.session, message: { type: "lock", lock: structuredClone(lock) } });
    expect(onMessage).not.toHaveBeenCalled();
    const changed = { ...lock, versions: { ...lock.versions, react: "19.0.0" } };
    runtime.options!.onMessage({ bridge: "page-runtime-v1", session: runtime.options!.session, message: { type: "lock", lock: changed } });
    expect(onMessage).toHaveBeenCalledWith({ type: "lock", lock: changed });
  } finally { await act(() => root.unmount()); element.remove(); }
});

it("requires explicit local same-origin embedding and preserves the frame URL and sandbox", async () => {
  const element = document.createElement("div"); document.body.append(element);
  const root = createRoot(element);
  const props = { runtimeOrigin: location.origin, open: { page: "report.tsx", manifest: { dependencies: {} }, files: {} }, theme: { theme: "light", density: "compact" } as const, data: null, onError: vi.fn() };
  try {
    await expect(act(async () => root.render(createElement(PageFrame, props)))).rejects.toThrow(/separate runtime origin/);
    await act(() => root.render(createElement(PageFrame, { ...props, origin: "same-origin-local" })));
    const frame = element.querySelector("iframe")!;
    expect(new URL(frame.src).origin).toBe(location.origin);
    expect(new URL(frame.src).pathname).toBe("/frame/report.tsx");
    expect(frame.getAttribute("sandbox")).toBe("allow-scripts allow-same-origin allow-modals");
  } finally { await act(() => root.unmount()); element.remove(); }
});
