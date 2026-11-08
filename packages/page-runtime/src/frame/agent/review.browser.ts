import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { beforeAll, afterAll, expect, it } from "vitest";
import { startReviewTestServer } from "./testing/review-server.ts";
import type { AgentFrameMessage } from "../../schema.ts";

const execute = promisify(execFile);
const session = `page-runtime-V-review-${process.pid}`;
let server: Awaited<ReturnType<typeof startReviewTestServer>>;
let launched = false;
async function browser(...args: string[]) { return (await execute("agent-browser", ["--engine", "chrome", "--allow-file-access", "--session", session, ...args], { timeout: 45000, maxBuffer: 2000000 })).stdout.trim(); }
async function events(): Promise<AgentFrameMessage[]> { return JSON.parse(await browser("get", "text", "#events")); }
beforeAll(async () => { server = await startReviewTestServer(); });
afterAll(async () => { try { if (launched) await browser("close"); } finally { await server?.close(); } });

it.each([{ width: 1920, height: 1080 }, { width: 2560, height: 1440 }])("enumerates, selects and forwards review actions with current source and geometry at $width", async (viewport) => {
  await browser("open", server.url); launched = true;
  await browser("set", "viewport", String(viewport.width), String(viewport.height));
  await browser("wait", "--fn", 'document.title === "REVIEW-READY" || document.querySelector("#error").textContent !== ""');
  expect(await browser("get", "text", "#error")).toBe("");
  await browser("click", "#show");
  const initial = (await events()).find((m) => m.type === "review-state");
  expect(initial).toMatchObject({ visible: true, elements: [{ id: "summary", selection: { element: { source: "reports/revenue.tsx:1:1#0@012345abcdef" }, rect: { width: 402, height: 202 } } }] });
  await browser("click", "#select"); await browser("click", "#approve");
  expect((await events()).find((m) => m.type === "review-action-request")).toMatchObject({ action: "approved", element: { id: "summary" } });
  await browser("click", "#export");
  const exported = (await events()).filter((m) => m.type === "review-action-request").at(-1);
  expect(exported).toMatchObject({ action: "export", content: { html: expect.stringContaining("<svg") } });
  await browser("click", "#rejected");
  expect(await browser("get", "attr", "[data-review-content]", "data-show-rejected")).toBe("true");
  const beforeMove = (await events()).filter((m) => m.type === "review-state").at(-1);
  if (beforeMove?.type !== "review-state") throw new Error("Review state is missing before movement");
  await browser("click", "#move");
  await browser("wait", "--fn", `JSON.parse(document.querySelector("#events").textContent).filter(m=>m.type==="review-state").at(-1).elements[0].selection.rect.top === ${beforeMove.elements[0]!.selection.rect.top + 50}`);
  await browser("screenshot", resolve(`../../.tmp/V-runtime-for-j/review-${viewport.width}.png`));
  await browser("click", "#remove");
  await browser("wait", "--fn", 'JSON.parse(document.querySelector("#events").textContent).filter(m=>m.type==="review-state").at(-1).elements.length === 0');
  expect(await browser("get", "text", "#error")).toBe("");
});

it("picks a file document with explicit opaque-origin context and preserves its canonical URL", async () => {
  await browser("open", server.file); launched = true;
  await browser("wait", "--fn", 'document.title === "REVIEW-READY" || document.querySelector("#error").textContent !== ""');
  expect(await browser("get", "text", "#error")).toBe("");
  await browser("click", "#pick"); await browser("click", "#target");
  await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("selection")');
  expect((await events()).find((m) => m.type === "selection")).toMatchObject({ selection: { element: { source: server.file, sourceContext: { mode: "external-document", url: server.file } } } });
  expect(await browser("get", "text", "#error")).toBe("");
});

it("deleting a review root reports resolved nested feedback anchors and excludes unrelated pins", async () => {
  await browser("open", server.url); launched = true;
  await browser("wait", "--fn", 'document.title === "REVIEW-READY"');
  await browser("click", "#show"); await browser("click", "#pins");
  await browser("click", "#delete");
  await browser("wait", "--fn", 'document.querySelector("#events").textContent.includes("containedAnchors") || document.querySelector("#error").textContent !== ""');
  expect(await browser("get", "text", "#error")).toBe("");
  expect((await events()).find((message) => message.type === "review-action-request" && message.action === "delete")).toMatchObject({
    action: "delete", element: { id: "summary" },
    containedAnchors: ['[data-review-id="summary"]', "#target", "#old-target", "registered-feedback"],
  });
  await browser("click", "#move-target"); await browser("click", "#delete");
  expect((await events()).filter((message) => message.type === "review-action-request" && message.action === "delete").at(-1)).toMatchObject({ containedAnchors: ['[data-review-id="summary"]'] });
});
