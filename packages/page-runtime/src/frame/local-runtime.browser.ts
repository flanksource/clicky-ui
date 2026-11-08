import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";
import { startRuntimeTestServer } from "./testing/server.ts";

const exec = promisify(execFile);
const session = `page-runtime-P-local-${process.pid}`;
let server: Awaited<ReturnType<typeof startRuntimeTestServer>>;
let launched = false;
async function browser(...args: string[]) {
  return (await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2000000 })).stdout.trim();
}
beforeAll(async () => { server = await startRuntimeTestServer({ local: true }); });
afterAll(async () => { try { if (launched) await browser("close"); } finally { await server?.close(); } });
it.each([{ width: 1920, height: 1080 }, { width: 2560, height: 1440 }])("keeps the local host outside worker scope and executes Design in its frame at $width x $height", async (viewport) => {
  await browser("open", server.hostOrigin); launched = true;
  await browser("set", "viewport", String(viewport.width), String(viewport.height));
  await browser("wait", "--fn", 'document.title === "LOCAL-READY" || Boolean(document.querySelector("#error")?.textContent)').catch(async (error: unknown) => { throw new Error(`${String(error)}\nBrowser errors: ${await browser("errors")}\nEvents: ${await browser("get", "text", "body")}`); });
  expect(await browser("get", "text", "#error")).toBe("");
  await browser("click", "#inspect");
  await browser("wait", "--fn", 'document.querySelector("#inspection").textContent.includes("target")');
  const { target } = JSON.parse(await browser("get", "text", "#inspection")) as { target: { x: number; y: number } };
  await browser("click", "#design");
  await browser("mouse", "move", String(target.x), String(target.y));
  await browser("mouse", "down"); await browser("mouse", "up");
  await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("design-selection")');
  await browser("click", "#preview");
  await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("design-override-result")');
  await browser("click", "#write");
  await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("design-write-result")');
  await browser("click", "#inspect");
  await browser("wait", "--fn", 'document.querySelector("#inspection").textContent.includes(\'"fill":"blue"\')');
  expect(JSON.parse(await browser("get", "text", "#inspection"))).toMatchObject({ hostControlled: false, frameControlled: true, scopes: ["/frame/"], probe: "host-route", hostSource: "host-route", fill: "blue", width: "180", write: { page: "report", source: expect.stringMatching(/^report\.tsx:1:\d+#0@[0-9a-f]{12}$/), edit: { kind: "attributes", values: { fill: "blue", width: 180 } } } });
  expect(await browser("get", "text", "#error")).toBe("");
  expect(await browser("get", "text", "#events")).toContain('"ok":true');
});
