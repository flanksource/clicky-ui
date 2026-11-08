import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { startLinkTestServer } from "./testing/server.ts";

const execute = promisify(execFile);

describe("file-server library link in Chromium", () => {
  it("keeps source imports on the development checkout's React runtime", async () => {
    const server = await startLinkTestServer();
    const session = `page-runtime-link-dev-${process.pid}`;
    let launched = false;
    const browser = (...args: string[]) => execute("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2000000 });
    try {
      await browser("open", server.hostOrigin); launched = true;
      expect(await server.next()).toMatchObject({ marker: "revision-0", reactInstances: 1, reactEvaluations: 1, controlLoads: 1 });
      expect((await server.next()).compiled).toEqual([]);
    } finally { try { if (launched) await browser("close"); } finally { await server.close(); } }
  });
  it("renders checkout React, persists links, reloads only linked frames and recompiles exactly one edited source module", async () => {
    const server = await startLinkTestServer();
    const session = `page-runtime-link-${process.pid}`;
    let launched = false;
    const browser = (...args: string[]) => execute("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2000000 });
    try {
      await browser("open", server.hostOrigin);
      launched = true;
      const cold = await server.next();
      const warm = await server.next();
      const edits = [];
      for (let revision = 1; revision <= 12; revision++) {
        const at = performance.timeOrigin + performance.now();
        await server.edit(revision);
        const result = await server.next();
        expect(result.marker).toBe(`revision-${revision}`);
        edits.push({ ...result, editMs: result.at - at });
      }
      expect(cold.reactInstances).toBe(1);
      expect(cold.reactEvaluations).toBe(1);
      expect(cold.compiled.length).toBeGreaterThan(0);
      expect(warm.compiled).toEqual([]);
      expect(edits.map((edit) => edit.compiled)).toEqual(Array.from({ length: 12 }, () => ["/link/checkout/src/data/Version.tsx"]));
      expect(edits.map(({ controlLoads, reactInstances, reactEvaluations, restored, deniedWithoutOverrides }) => ({ controlLoads, reactInstances, reactEvaluations, restored, deniedWithoutOverrides }))).toEqual(Array.from({ length: 12 }, () => ({ controlLoads: 1, reactInstances: 1, reactEvaluations: 1, restored: true, deniedWithoutOverrides: true })));
      const times = edits.map((edit) => edit.editMs).sort((a, b) => a - b);
      const results = { coldMs: cold.elapsed, coldModules: cold.compiled.length, warmMs: warm.elapsed, editP50Ms: times[5]!, editP95Ms: times[11]!, deniedWithoutOverrides: cold.deniedWithoutOverrides, oneModulePerEdit: true, reactInstances: cold.reactInstances, reactEvaluations: cold.reactEvaluations, edits };
      await mkdir(resolve("../../.tmp/H-link"), { recursive: true });
      await writeFile(resolve("../../.tmp/H-link/browser-results.json"), JSON.stringify(results, null, 2));
      const folder = await server.next();
      expect(folder).toMatchObject({ folderTransport: true, marker: "revision-12", restored: true, reactInstances: 1, reactEvaluations: 1, controlLoads: 1 });
      await writeFile(resolve("../../.tmp/H-link/browser-results.json"), JSON.stringify({ ...results, folder }, null, 2));
      expect(results.coldMs).toBeLessThanOrEqual(15000);
      expect(results.editP50Ms).toBeLessThanOrEqual(300);
      expect(Math.max(warm.elapsed, edits[0]!.elapsed, edits[1]!.elapsed)).toBeLessThan(1000);
      await browser("screenshot", resolve("../../.tmp/H-link/linked-frame.png"));
    } catch (error) {
      if (launched) {
        await writeFile(resolve("../../.tmp/H-link/browser-errors.json"), (await browser("errors", "--json")).stdout);
        await writeFile(resolve("../../.tmp/H-link/browser-console.json"), (await browser("console", "--json")).stdout);
        await writeFile(resolve("../../.tmp/H-link/browser-body.html"), (await browser("get", "html", "body")).stdout);
      }
      throw error;
    } finally { try { if (launched) await browser("close"); } finally { await server.close(); } }
  });
});
