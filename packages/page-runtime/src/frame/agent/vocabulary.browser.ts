import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";
import type { BridgeEnvelope, FrameMessage } from "../../schema.ts";
import { startAgentTestServer } from "./testing/server.ts";

const exec = promisify(execFile);
const session = `page-runtime-vocabulary-${process.pid}`;
let server: Awaited<ReturnType<typeof startAgentTestServer>>;
let launched = false;
async function browser(...args: string[]) {
  const { stdout } = await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45_000, maxBuffer: 2_000_000 });
  return stdout.trim();
}
beforeAll(async () => { server = await startAgentTestServer(); });
afterAll(async () => { try { if (launched) await browser("close"); } finally { await server?.close(); } });

it("captures two VocabularyPreview blocks in a frame and excludes the agent shadow root", async () => {
  await browser("open", `${server.url}/vocabulary`); launched = true;
  await browser("wait", "--fn", 'document.title === "VOCABULARY-READY"');
  await browser("click", "#capture");
  await browser("wait", "--fn", 'document.querySelector("#capture-result").textContent !== "" || document.querySelector("#capture-error").textContent !== ""');
  expect(await browser("get", "text", "#capture-error")).toBe("");
  const reply = JSON.parse(await browser("get", "text", "#capture-result")) as BridgeEnvelope<Extract<FrameMessage, { type: "vocabulary-previews" }>>;
  expect(reply.re).toEqual(expect.any(String));
  expect(reply.message).toEqual({ type: "vocabulary-previews", images: [
    { id: "circle", image: expect.stringMatching(/^data:image\/webp;base64,/), width: 120, height: 80 },
    { id: "square", image: expect.stringMatching(/^data:image\/webp;base64,/), width: 80, height: 60 },
  ] });
});
