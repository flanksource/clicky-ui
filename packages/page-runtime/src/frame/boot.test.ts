// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import type { BridgeEnvelope, FrameConfig, HostMessage } from "../schema.ts";

const fixture = vi.hoisted(() => ({
  receive: undefined as ((value: BridgeEnvelope) => void) | undefined,
  send: vi.fn(), disposeBridge: vi.fn(), receiveAgent: vi.fn(), disposeAgent: vi.fn(), stopStyles: vi.fn(),
  start: vi.fn(), prepare: vi.fn(), mounted: vi.fn(), ready: vi.fn(),
}));
vi.mock("./bridge.ts", () => ({
  createFrameBridge: (options: { receive: (value: BridgeEnvelope) => void }) => { fixture.receive = options.receive; return { send: fixture.send, dispose: fixture.disposeBridge }; },
  workerRequest: vi.fn(async () => undefined),
}));
vi.mock("./boot-styles.ts", async (original) => ({ ...await original<typeof import("./boot-styles.ts")>(), loadPageStyles: vi.fn(), preparePageStyles: fixture.prepare }));
vi.mock("/__runtime/page-agent.js", () => ({ startPageAgent: fixture.start, PageAgentProvider: ({ children }: { children: unknown }) => children }));
vi.mock("./readiness.ts", () => ({ waitForReadiness: fixture.ready }));
vi.mock("../sw/profile.ts", () => ({ validateProfile: (profile: unknown) => profile }));
import { bootFrame } from "./boot.ts";
import { exampleLock } from "../link/testing-fixtures.ts";
import { workerRequest } from "./bridge.ts";

function command(message: HostMessage) { fixture.receive!({ bridge: "page-runtime-v1", session: "test", message }); }

beforeEach(() => {
  vi.clearAllMocks();
  performance.clearMarks();
  vi.stubGlobal("requestAnimationFrame", vi.fn());
  history.replaceState(null, "", `${location.pathname}?runtime-opened=1`);
  location.hash = new URLSearchParams({ host: "https://host.example" }).toString();
  const worker = { state: "activated" };
  Object.defineProperty(navigator, "serviceWorker", { configurable: true, value: { controller: worker, register: vi.fn(), ready: Promise.resolve({ active: worker }), addEventListener: vi.fn(), removeEventListener: vi.fn() } });
  const profile = { embedders: ["https://host.example"], readinessTimeoutMs: 1000, managed: {} };
  const config = { profile, lock: exampleLock(), page: "report.tsx", entry: pathToFileURL(resolve("src/frame/testing/boot-page.ts")).href } as FrameConfig;
  document.body.innerHTML = '<div id="root"></div><script id="page-runtime-config" type="application/json"></script><script type="importmap">{"imports":{}}</script>';
  document.getElementById("page-runtime-config")!.textContent = JSON.stringify(config);
  vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ ok: true, json: async () => url === "/profile.json" ? profile : [] })));
  fixture.prepare.mockImplementation(async () => { fixture.mounted("styles"); return { stop: fixture.stopStyles, ready: async () => {} }; });
  fixture.start.mockImplementation(() => { fixture.mounted("agent"); return { receive: fixture.receiveAgent, dispose: fixture.disposeAgent }; });
  fixture.ready.mockImplementation(async ({ mounted }: { mounted: Promise<void> }) => { await mounted; fixture.mounted("ready"); });
});
afterEach(() => { window.dispatchEvent(new Event("pagehide")); vi.unstubAllGlobals(); });

it("waits for this frame's host open before importing a page left in worker storage", async () => {
  history.replaceState(null, "", `${location.pathname}${location.hash}`);
  await bootFrame();
  expect({ messages: fixture.send.mock.calls, agentStarts: fixture.start.mock.calls }).toEqual({ messages: [[{ type: "status", state: "connecting" }]], agentStarts: [] });
});

it("reports a worker-embedded navigation error to the host without importing the page", async () => {
  const error = { phase: "link", file: "/frame/report.tsx", message: "Error: report.tsx: additional package entities is forbidden by policy none" };
  document.body.innerHTML = `<div id="root"></div><script type="application/json" id="page-runtime-error">${JSON.stringify(error)}</script>`;
  await bootFrame();
  expect({ messages: fixture.send.mock.calls, registered: vi.mocked(navigator.serviceWorker.register).mock.calls, agentStarts: fixture.start.mock.calls }).toEqual({ messages: [[{ type: "error", error }, undefined]], registered: [], agentStarts: [] });
});

it("starts the agent after styles and before mounting, routes commands, and disposes on pagehide", async () => {
  fixture.ready.mockImplementationOnce(async ({ mounted }: { mounted: Promise<void> }) => {
    await mounted;
    expect(fixture.send.mock.calls.filter(([message]) => message.type === "lock")).toEqual([]);
    fixture.mounted("ready");
  });
  const boot = bootFrame();
  command({ type: "data", data: null });
  await boot;
  const failures = fixture.send.mock.calls.filter(([message]) => message.type === "error").map(([message]) => message.error.message);
  if (failures.length) throw new Error(failures.join("\n"));
  expect(fixture.send.mock.calls[0]![0]).toEqual({ type: "status", state: "booting" });
  expect(fixture.send.mock.calls.filter(([message]) => message.type !== "activity").slice(-2).map(([message]) => message.type === "status" ? message.state : message.type)).toEqual(["lock", "ready"]);
  expect(navigator.serviceWorker.register).toHaveBeenCalledWith("/sw.js", { scope: "/frame/" });
  expect(fixture.send.mock.calls.filter(([message]) => message.type === "error")).toEqual([]);
  expect(fixture.mounted.mock.calls.map(([stage]) => stage)).toEqual(["styles", "agent", "ready"]);
  expect(document.getElementById("root")!.textContent).toBe("Report");
  const commands: HostMessage[] = [{ type: "mode", mode: "off" }, { type: "pick" }, { type: "page" }, { type: "pins", anchors: [] }, { type: "highlight", anchor: null }, { type: "scroll", anchor: "total" }, { type: "mode", mode: "design" }, { type: "design-override", requestId: "preview", source: "report.tsx:2:3#0@012345abcdef", props: { fill: "blue" } }, { type: "design-write", requestId: "write", page: "report", source: "report.tsx:2:3#0@012345abcdef", edit: { kind: "delete" } }, { type: "design-write-result", requestId: "write", result: { status: "invalid", error: "read-only fixture" } }];
  commands.forEach(command);
  const reviews: HostMessage[] = [{ type: "review-list", requestId: "list" }, { type: "review-select", requestId: "select", id: null }, { type: "review-visibility", requestId: "visibility", visible: true, showRejected: false }, { type: "review-action", requestId: "action", id: "summary", action: "approved" }];
  reviews.forEach(command);
  const removal: HostMessage = { type: "review-remove", requestId: "removal", id: "summary", removed: true };
  command(removal);
  expect(fixture.receiveAgent.mock.calls).toEqual([...commands, ...reviews, removal].map((message) => [message]));
  window.dispatchEvent(new Event("pagehide"));
  expect([fixture.disposeAgent.mock.calls.length, fixture.stopStyles.mock.calls.length, fixture.disposeBridge.mock.calls.length]).toEqual([1, 1, 1]);
});

it("passes the lock's page roots into the page agent", async () => {
  const element = document.getElementById("page-runtime-config")!;
  const config = JSON.parse(element.textContent!) as FrameConfig;
  const pageSources = [{ link: "pages", root: "src/pages", prefix: "", editable: true }];
  element.textContent = JSON.stringify({ ...config, lock: { ...config.lock, pageSources } });
  const boot = bootFrame(); command({ type: "data", data: null }); await boot;
  expect(fixture.start).toHaveBeenCalledWith(expect.objectContaining({ pageSources }));
});

it("mounts the host layout around the native page entry and includes its style metadata", async () => {
  const element = document.getElementById("page-runtime-config")!;
  const config = JSON.parse(element.textContent!);
  element.textContent = JSON.stringify({ ...config, layout: pathToFileURL(resolve("src/frame/testing/boot-layout.ts")).href });
  const boot = bootFrame(); command({ type: "data", data: null }); await boot;
  expect(document.querySelector('[data-layout="true"]')?.textContent).toBe("Report");
  expect(fixture.prepare).toHaveBeenCalledWith(expect.objectContaining({ module: expect.objectContaining({ meta: { tailwind: "dynamic" } }) }));
});

it("acknowledges a data update after readiness without registering another worker or restarting the agent", async () => {
  const boot = bootFrame(); command({ type: "data", data: null }); await boot;
  fixture.send.mockClear();
  fixture.receive!({ bridge: "page-runtime-v1", session: "test", id: "data-update", message: { type: "data", data: { title: "Updated" } } });
  await vi.waitFor(() => expect(fixture.send).toHaveBeenCalledWith({ type: "status", state: "ready" }, { re: "data-update" }));
  expect([fixture.ready.mock.calls.length, fixture.start.mock.calls.length, vi.mocked(navigator.serviceWorker.register).mock.calls.length]).toEqual([2, 1, 1]);
});

it("reports an agent command before startup instead of dropping it", async () => {
  const boot = bootFrame(); command({ type: "pick" }); command({ type: "data", data: null });
  await boot;
  expect(fixture.send.mock.calls).toContainEqual([expect.objectContaining({ type: "error", error: expect.objectContaining({ message: expect.stringContaining("page agent is not ready") }) }), undefined]);
});

it("acknowledges source replacement in the existing document without restarting its worker or agent", async () => {
  const boot = bootFrame(); command({ type: "data", data: null }); await boot;
  const root = document.getElementById("root");
  fixture.send.mockClear();
  fixture.receive!({ bridge: "page-runtime-v1", session: "test", id: "source-update", message: { type: "sources", files: { "report.tsx": "export default function Page() { return 'Updated'; }" } } });
  await vi.waitFor(() => expect(fixture.send).toHaveBeenCalledWith({ type: "status", state: "ready" }, { re: "source-update" }));
  expect({ sameRoot: document.getElementById("root") === root, workerStarts: vi.mocked(navigator.serviceWorker.register).mock.calls.length, agentStarts: fixture.start.mock.calls.length }).toEqual({ sameRoot: true, workerStarts: 1, agentStarts: 1 });
});

it("retains worker diagnostics until after the first paint instead of delivering them on the render path", async () => {
  const boot = bootFrame(); command({ type: "data", data: null }); await boot;
  expect(workerRequest).not.toHaveBeenCalled();
  const callbacks = vi.mocked(requestAnimationFrame).mock.calls;
  callbacks[0]![0](0);
  callbacks[1]![0](0);
  expect(workerRequest).toHaveBeenCalledWith(expect.objectContaining({ message: "subscribe-activity" }), 15000);
});
