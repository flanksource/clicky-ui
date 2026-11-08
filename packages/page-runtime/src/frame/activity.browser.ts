import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";
import { startRuntimeTestServer } from "./testing/server.ts";
import type { ActivityMessage } from "../activity-schema.ts";

const exec = promisify(execFile);
const session = `runtime-activity-${process.pid}`;
let server: Awaited<ReturnType<typeof startRuntimeTestServer>>;
let opened = false;
async function browser(...args: string[]) {
  return (await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 4_000_000 })).stdout.trim();
}
beforeAll(async () => { server = await startRuntimeTestServer(); });
afterAll(async () => { try { if (opened) await browser("close"); } finally { await server?.close(); } });

it("reports real page source, generated import map, npm network then cache, and boot phases ending in ready", async () => {
  await browser("open", `${server.hostOrigin}/?case=ready`); opened = true;
  await browser("wait", "--fn", 'document.title === "CASE-DONE" && document.querySelector("#activity").textContent.includes("ready") && JSON.parse(document.querySelector("#activity").textContent).some(m => m.records.some(r => r.kind === "frame"))');
  const cold = JSON.parse(await browser("get", "text", "#activity")) as ActivityMessage[];
  const result = JSON.parse(await browser("get", "text", "#result")) as { errors: Array<{ phase: string; message: string }> };
  if (result.errors.length) throw new Error(JSON.stringify(result.errors));
  const records = cold.flatMap((message) => message.records);
  expect(records.find((record) => record.kind === "frame")?.generated).toContain("import map");
  expect(records.find((record) => record.kind === "src" && record.url.includes("report.tsx"))).toMatchObject({ source: "compiled", status: 200 });
  expect(records.find((record) => record.kind === "npm" && record.source === "network")).toMatchObject({ origin: expect.stringContaining("/packages/"), decodedBytes: expect.any(Number), headers: { "server-timing": expect.stringContaining("integrity;dur=") } });
  expect(cold.flatMap((message) => message.timeline).map((mark) => mark.phase)).toEqual(expect.arrayContaining(["controlled", "libraries", "module", "styles", "agent", "render", "ready"]));
  const load = cold.at(-1)!.load;
  await browser("click", "#reload");
  await browser("wait", "--fn", `JSON.parse(document.querySelector("#activity").textContent).some(m => m.load !== ${JSON.stringify(load)} && m.timeline.some(t => t.phase === "ready"))`);
  const warm = (JSON.parse(await browser("get", "text", "#activity")) as ActivityMessage[]).filter((message) => message.load !== load);
  expect(warm.flatMap((message) => message.records).some((record) => record.kind === "npm" && record.source === "cache" && record.transferredBytes === 0)).toBe(true);
  expect(warm.flatMap((message) => message.timeline).at(-1)?.phase).toBe("ready");
});
