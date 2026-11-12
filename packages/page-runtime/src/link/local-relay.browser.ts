import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";
import { startLocalLinkServer } from "./testing/local-server.ts";

it("installs, caches and invalidates through a local relay while only /frame/ is controlled", async () => {
  const server = await startLocalLinkServer();
  const execute = promisify(execFile);
  const session = `page-runtime-V-link-${process.pid}`;
  let launched = false;
  const browser = async (...args: string[]) => (await execute("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2000000 })).stdout.trim();
  try {
    await browser("open", server.url); launched = true;
    await browser("wait", "--fn", 'document.title === "LINK-READY" || document.title === "LINK-ERROR"');
    expect(await browser("get", "text", "#error")).toBe("");
    expect(JSON.parse(await browser("get", "text", "#result"))).toEqual({ shellControlled: false, scopes: ["/frame/"], reads: [
      { code: expect.stringContaining('"revision-0"'), compiled: "1" },
      { code: expect.stringContaining('"revision-0"'), compiled: "0" },
      { code: expect.stringContaining('"revision-1"'), compiled: "1" },
    ] });
  } finally { try { if (launched) await browser("close"); } finally { await server.close(); } }
});
