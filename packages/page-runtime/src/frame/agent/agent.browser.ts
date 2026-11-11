import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startAgentTestServer } from "./testing/server.ts";
import type { AgentFrameMessage } from "../../schema.ts";

const exec = promisify(execFile);
const session = `page-runtime-G-${process.pid}`;
let server: Awaited<ReturnType<typeof startAgentTestServer>>;
let launched = false;
async function browser(...args: string[]) {
  const { stdout } = await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45_000, maxBuffer: 2_000_000 });
  return stdout.trim();
}
async function events() { return JSON.parse(await browser("get", "text", "#events")) as AgentFrameMessage[]; }
async function inspection() {
  await browser("click", "#inspect");
  return JSON.parse(await browser("get", "text", "#inspection")) as {
    pins: number; pinColor: string; lightPins: number; overlayInRoot: boolean; highlighted: boolean; position: { left: number; top: number }; overlay: boolean;
  };
}
async function open(viewport: { width: number; height: number }) {
  await browser("open", server.url); launched = true;
  await browser("set", "viewport", String(viewport.width), String(viewport.height));
  await browser("wait", "--fn", 'document.title === "AGENT-READY"');
  await browser("wait", "--fn", 'document.querySelector("#target") !== null');
}
beforeAll(async () => { server = await startAgentTestServer(); });
afterAll(async () => { try { if (launched) await browser("close"); } finally { await server?.close(); } });

describe.each([{ width: 1920, height: 1080 }, { width: 2560, height: 1440 }])("page agent in Chromium $width x $height", (viewport) => {
  it("picks a real runtime-set Modal portal and tracks its pin after removal", async () => {
    await browser("open", `${server.url}/?modal`); launched = true;
    await browser("set", "viewport", String(viewport.width), String(viewport.height));
    await browser("wait", '[role="dialog"] h2');
    await browser("click", "#pick"); await browser("click", '[role="dialog"] h2');
    await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("selection") || document.querySelector("#error").textContent !== ""');
    expect(await browser("get", "text", "#error")).toBe("");
    expect((await events()).find((message) => message.type === "selection")).toMatchObject({ selection: { anchor: expect.stringContaining('[role="dialog"][aria-label="Revenue"]'), element: { source: "modal-report.tsx:4:10", componentName: "Modal" } } });
    await browser("click", "#pins");
    await browser("wait", "--fn", 'document.querySelector("[data-page-agent]").shadowRoot.querySelector("button") !== null');
    expect(await inspection()).toMatchObject({ pins: 1, highlighted: false, overlayInRoot: false });
    const position = (await inspection()).position;
    await browser("click", "#modal-move");
    await browser("wait", "--fn", `JSON.parse(document.querySelector("#events").textContent).filter(message => message.type === "anchors").at(-1).anchors[0].rect.top > ${position.top + 20}`);
    expect((await inspection()).position.top).toBeCloseTo(position.top + 30, 0);
    await browser("screenshot", resolve(`../../.tmp/R-runtime-fixes/modal-${viewport.width}.png`));
    await browser("click", "#modal-remove");
    await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("orphaned")');
    expect((await events()).filter((message) => message.type === "anchors").at(-1)).toMatchObject({ anchors: [{ state: "orphaned", rect: null }] });
    expect((await inspection()).pins).toBe(0);
  });

  it("picks ordinary HTML with explicitly declared document URL context", async () => {
    await browser("open", `${server.url}/?external`); launched = true;
    await browser("set", "viewport", String(viewport.width), String(viewport.height));
    await browser("wait", "--fn", 'document.title === "AGENT-READY"');
    await browser("click", "#pick"); await browser("click", "#target");
    await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("selection")');
    expect((await events()).find((message) => message.type === "selection")).toMatchObject({ selection: { anchor: "#target", element: { source: `${server.url}/?external`, sourceContext: { mode: "external-document", url: `${server.url}/?external` } } } });
    expect(await browser("get", "text", "#error")).toBe("");
  });
  it("resolves a compiled composite call site inside a frame and exports without picker or agent hosts", async () => {
    await browser("open", `${server.url}/embedded`); launched = true;
    await browser("set", "viewport", String(viewport.width), String(viewport.height));
    await browser("frame", "#agent-frame");
    await browser("wait", "#target");
    await browser("click", "#pick"); await browser("click", "#target");
    expect((await events()).find((event) => event.type === "selection")).toMatchObject({ selection: { anchor: "#target", element: { source: "report.tsx:4:10", componentName: "StatCard" } } });
    await browser("click", "#pins");
    expect((await inspection()).pins).toBe(1);
    await browser("click", "#export");
    const snapshot = await browser("get", "text", "#snapshot");
    expect(snapshot).toMatch(/^<!doctype html>/);
    expect(snapshot).toContain('id="target"');
    expect(snapshot).not.toMatch(/data-page-agent|data-react-grab(?:=|\s|>)|<script/);
    expect(await browser("get", "text", "#error")).toBe("");
    await browser("frame", "main");
  });

  it("picks a library heading through the fork, renders isolated pins, and reports moved then orphaned anchors", async () => {
    await open(viewport);
    await browser("click", "#pick");
    await browser("click", "#target");
    await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("selection")');
    const picked = (await events()).find((message) => message.type === "selection");
    expect(picked).toMatchObject({ type: "selection", selection: { anchor: "#owner", element: { source: "report.tsx:8:3", componentName: "StatCard" } } });
    await browser("click", "#pins");
    await browser("wait", "--fn", 'document.querySelector("[data-page-agent]").shadowRoot.querySelector("button") !== null');
    const rendered = await inspection();
    expect(rendered).toMatchObject({ pins: 1, pinColor: "rgb(37, 99, 235)", lightPins: 0, overlayInRoot: false });
    const found = (await events()).filter((m) => m.type === "anchors").at(-1);
    expect(found).toMatchObject({ anchors: [{ anchor: "#owner", state: "found" }] });
    const box = found?.type === "anchors" ? found.anchors[0]?.rect : null;
    expect(rendered.position.left).toBeCloseTo(box!.left + box!.width, 0);
    expect(rendered.position.top).toBeCloseTo(box!.top, 0);
    await browser("click", "#focus-pin");
    expect((await events()).some((m) => m.type === "focus" && m.anchor === "#owner")).toBe(true);
    await browser("click", "#move");
    await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("moved")');
    expect((await events()).filter((m) => m.type === "anchors").at(-1)).toMatchObject({ anchors: [{ state: "moved" }] });
    await browser("click", "#remove");
    await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("orphaned")');
    expect((await events()).filter((m) => m.type === "anchors").at(-1)).toMatchObject({ anchors: [{ anchor: "#owner", state: "orphaned", rect: null }] });
    expect((await inspection()).pins).toBe(0);
    expect(await browser("get", "text", "#error")).toBe("");
  });

  it("bridges registered component anchors, scrolls, forwards shortcuts, and disposes observers", async () => {
    await open(viewport);
    await browser("click", "#registered-pin");
    await browser("click", "#scroll");
    await browser("wait", "--fn", "window.scrollY > 500");
    expect(await inspection()).toMatchObject({ pins: 1, highlighted: false });
    await browser("click", "#highlight");
    expect(await inspection()).toMatchObject({ pins: 1, highlighted: true });
    expect((await events()).filter((m) => m.type === "geometry").at(-1)).toMatchObject({ scrollY: expect.any(Number) });
    await browser("press", "Alt+c");
    await browser("press", "Escape");
    expect((await events()).filter((m) => m.type === "keys").map((m) => m.key)).toEqual(["c", "Escape"]);
    await browser("click", "#page");
    expect((await events()).filter((m) => m.type === "selection").at(-1)).toMatchObject({ selection: { anchor: "__document__", element: { source: "report.tsx:1:1" } } });
    await browser("click", "#dispose");
    expect((await inspection()).overlay).toBe(false);
  });
});
