import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { expect, it } from "vitest";
import { startRuntimeTestServer } from "../testing/server.ts";

const exec = promisify(execFile);
it("tailwind boot preserves the frame's readiness sequence", async () => {
  const server = await startRuntimeTestServer();
  const session = `tailwind-boot-${process.pid}`;
  const browser = async (...args: string[]) => (await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2_000_000 })).stdout.trim();
  try {
    await browser("open", `${server.hostOrigin}/?case=ready`);
    await browser("wait", "--fn", 'document.title === "CASE-DONE"');
    const result = JSON.parse(await browser("get", "text", "#result"));
    expect(result.errors, JSON.stringify(result)).toEqual([]);
    expect(result.states).toEqual(["connecting", "booting", "mounted", "stylesheets", "fonts", "images", "hook", "diagrams", "quiescence", "ready"]);
  } finally { await browser("close"); await server.close(); }
});
