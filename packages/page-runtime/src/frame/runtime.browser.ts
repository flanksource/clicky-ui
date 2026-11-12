import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startRuntimeTestServer } from "./testing/server.ts";

const exec = promisify(execFile);
const session = `page-runtime-B-${process.pid}`;
let server: Awaited<ReturnType<typeof startRuntimeTestServer>>;
let launched = false;
async function browser(...args: string[]): Promise<string> {
  const { stdout } = await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2_000_000 });
  return stdout.trim();
}
async function run(name: string) {
  await browser("open", `${server.hostOrigin}/?case=${name}`);
  launched = true;
  await browser("wait", "--fn", 'document.title === "CASE-DONE"');
  return JSON.parse(await browser("get", "text", "#result")) as { states: string[]; errors: Array<{ phase: string; message: string; file: string }>; elapsed?: number; snapshot?: { html: string }; before?: { html: string }; data?: { html: string }; css?: { html: string }; helper?: { html: string }; failure?: string };
}
beforeAll(async () => { server = await startRuntimeTestServer(); });
afterAll(async () => { try { if (launched) await browser("close"); } finally { await server?.close(); } });

describe("worker + frame + boot in real Chromium", () => {
  it("loads library base styles in their recipe layer so custom CSS overrides library utility classes", async () => {
    const result = await run("cascade");
    expect({ failure: result.failure, errors: result.errors }).toEqual({ failure: undefined, errors: [] });
    expect(result.snapshot?.html).toContain('data-color="rgb(91, 33, 182)"');
    expect(result.snapshot?.html).toContain('@layer components');
  });
  it("reconciles data and changed source graphs in one document while retaining unchanged layout DOM", async () => {
    const result = await run("updates");
    expect({ failure: result.failure, errors: result.errors, boots: result.states.filter(state => state === "booting").length }).toEqual({ failure: undefined, errors: [], boots: 1 });
    const attribute = (html: string | undefined, name: string) => html?.match(new RegExp(`${name}="([^"]+)"`))?.[1];
    expect(attribute(result.data?.html, "data-instance")).toBe(attribute(result.before?.html, "data-instance"));
    expect(attribute(result.css?.html, "data-instance")).toBe(attribute(result.data?.html, "data-instance"));
    expect(result.css?.html).toContain("outline-color: rgb(12, 34, 56)");
    expect(attribute(result.snapshot?.html, "data-document")).toBe(attribute(result.before?.html, "data-document"));
    expect(attribute(result.snapshot?.html, "data-layout")).toBe(attribute(result.helper?.html, "data-layout"));
    expect(result.snapshot?.html).toContain("Updated helper:Source data:Edited page");
  });
  it("uses one React, installs the hook first, and waits for every readiness state", async () => {
    const result = await run("ready");
    expect(result.failure).toBeUndefined();
    expect(result.errors).toEqual([]);
    expect(result.states).toEqual(["connecting", "booting", "mounted", "stylesheets", "fonts", "images", "hook", "diagrams", "quiescence", "ready"]);
    expect(result.snapshot?.html).toContain('data-one-react="true"');
    expect(result.snapshot?.html).toContain('data-hook="true"');
    expect(result.snapshot?.html).toContain('data-theme="dark"');
    expect(result.snapshot?.html).toContain('data-source="report.tsx:8:10"');
    expect(result.snapshot?.html).toContain("rgb(1, 2, 3)");
    expect(result.snapshot?.html).not.toContain("@import");
    expect(result.snapshot?.html).not.toContain("<script");
    expect(result.snapshot?.html).toContain("data:image/svg+xml;base64,");
    expect(result.elapsed).toBeGreaterThan(400);
    expect(server.counts().registryRequests).toBe(0);
  });
  it("exports a Markdown page through its libraries' declared remark plugins", async () => {
    const result = await run("markdown-export");
    expect({ failure: result.failure, errors: result.errors, ready: result.states.at(-1) }).toEqual({ failure: undefined, errors: [], ready: "ready" });
    expect({ kept: result.snapshot?.html.includes("Public summary."), removed: result.snapshot?.html.includes("Internal margin figures."), liveRootHidden: result.snapshot?.html.includes("data-page-runtime-live") }).toEqual({ kept: true, removed: false, liveRootHidden: false });
    expect(result.snapshot?.html).toContain('data-report-layout');
    expect(result.snapshot?.html).toContain('Report frame');
  });
  it.each(["resolve", "fetch", "compile", "link", "render", "readiness"])("reports the %s error phase with a source location", async (phase) => {
    const result = await run(phase);
    expect(result.failure).toBeUndefined();
    expect(result.errors[0]).toMatchObject({ phase });
    expect(result.errors[0]?.file).toBeTruthy();
    expect(result.states).not.toContain("ready");
    if (phase === "link") expect(result.errors[0]?.message).toMatch(/report.tsx:\d+:.*forbidden-package.*allowed packages:.*react/);
  });
  // WORKAROUND(agent-browser-oopif): agent-browser 0.38.1 cannot click or read CSS inside a cross-origin frame
  // (`frame iframe` → "Frame not found"); the frame itself mounts, renders and activates Pick (.tmp/N/verification.md).
  // Correct fix: agent-browser targets out-of-process frames, then remove the skip.
  // Ref: user decision 2026-11-06 to skip these two cases.
  it.skip.each([{ width: 1920, height: 1080 }, { width: 2560, height: 1440 }])("boots the agent and picks an unmarked library element at its original page call site in $width x $height", async (viewport) => {
    await browser("set", "viewport", String(viewport.width), String(viewport.height));
    const result = await run("agent");
    expect(result.errors).toEqual([]);
    expect(result.states.at(-1)).toBe("ready");
    await browser("click", "#pick");
    await browser("frame", "iframe");
    await browser("click", "#library-heading");
    await browser("frame", "main");
    await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("selection")');
    const events = JSON.parse(await browser("get", "text", "#events")) as Array<{ type: string; selection?: unknown }>;
    expect(events.find((event) => event.type === "selection")).toMatchObject({ selection: { element: { source: "report.tsx:3:10", componentName: "StatCard" } } });
    expect(result.snapshot?.html).not.toMatch(/data-page-agent|data-react-grab|<script/);
  });
});
