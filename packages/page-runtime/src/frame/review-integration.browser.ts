import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";
import { startRuntimeTestServer } from "./testing/server.ts";
import type { ReviewFrameMessage } from "../host/index.ts";
import type { ActivityMessage } from "../activity-schema.ts";

const execute = promisify(execFile);
const session = `runtime-review-integration-${process.pid}`;
let server: Awaited<ReturnType<typeof startRuntimeTestServer>>;
let opened = false;
async function browser(...args: string[]) {
  return (await execute("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2_000_000 })).stdout.trim();
}
beforeAll(async () => { server = await startRuntimeTestServer(); });
afterAll(async () => { try { if (opened) await browser("close"); } finally { await server?.close(); } });

it("uses the host review adapter through the authenticated bridge and actual frame boot to enumerate, select and export review elements", async () => {
  await browser("open", `${server.hostOrigin}/?case=review`); opened = true;
  await browser("wait", "--fn", 'document.title === "CASE-DONE"');
  const result = JSON.parse(await browser("get", "text", "#result")) as { errors: unknown[]; failure?: string };
  expect(result.failure).toBeUndefined(); expect(result.errors).toEqual([]);
  await browser("click", "#review-show");
  await browser("wait", "--fn", 'JSON.parse(document.querySelector("#events").textContent).some(m => m.type === "review-state" && m.visible)');
  await browser("click", "#review-list");
  await browser("click", "#review-select");
  await browser("wait", "--fn", 'JSON.parse(document.querySelector("#events").textContent).some(m => m.type === "review-state" && m.selected === "summary")');
  await browser("click", "#review-export");
  await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("review-action-request")');
  const events = JSON.parse(await browser("get", "text", "#events")) as ReviewFrameMessage[];
  expect(events.find((message) => message.type === "review-state" && message.visible)).toMatchObject({ elements: [{ id: "summary", selection: { element: { source: expect.stringMatching(/^report\.tsx:1:/) } } }] });
  expect(events.find((message) => message.type === "review-action-request")).toMatchObject({ action: "export", element: { id: "summary" }, content: { html: expect.stringContaining("Review summary") } });
});

it.each(["compile", "fetch", "link"])("retains failed request diagnostics when %s fails before the first paint", async (phase) => {
  await browser("open", `${server.hostOrigin}/?case=${phase}`); opened = true;
  await browser("wait", "--fn", 'document.title === "CASE-DONE" && JSON.parse(document.querySelector("#activity").textContent || "[]").some(m => m.records.some(r => r.error))');
  const result = JSON.parse(await browser("get", "text", "#result")) as { errors: Array<{ phase: string }>; failure?: string };
  expect(result.failure).toBeUndefined(); expect(result.errors[0]?.phase).toBe(phase);
  const messages = JSON.parse(await browser("get", "text", "#activity")) as ActivityMessage[];
  const failed = messages.flatMap((message) => message.records).find((record) => record.error?.phase === phase);
  expect(failed).toBeDefined(); expect(failed!.totalMs).toBeGreaterThan(0);
  if (phase === "compile") expect(failed!.compileMs).toBeGreaterThan(0);
  if (phase === "fetch") {
    expect(failed!.error?.message).toContain("integrity mismatch");
    expect(failed!.unavailable).not.toContain("integrity");
  }
});
