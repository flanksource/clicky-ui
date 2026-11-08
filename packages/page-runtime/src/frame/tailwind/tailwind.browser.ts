import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startTailwindServer } from "./testing/server.ts";
import { compare, type Snapshot } from "./testing/compare.ts";
import { parityPages } from "./testing/pages.ts";

const exec = promisify(execFile);
const session = `page-runtime-E-${process.pid}`;
let server: Awaited<ReturnType<typeof startTailwindServer>>;
let opened = false;
async function browser(...args: string[]) {
  const { stdout } = await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 128_000_000 });
  return stdout.trim();
}
async function run(path: string) {
  await browser("open", `${server.url}/${path}`); opened = true;
  await browser("wait", "--fn", 'document.title === "DONE"');
  const result = JSON.parse(await browser("get", "text", "#result"));
  if (result.error) throw new Error(`${result.error}\n${result.stack}`);
  return result;
}
beforeAll(async () => {
  server = await startTailwindServer();
  await browser("open", "about:blank"); opened = true;
  await browser("set", "viewport", "1920", "1080");
});
afterAll(async () => { try { if (opened) await browser("close"); } finally { await server?.close(); } });

describe("tailwind Chromium", () => {
  it("styles source candidates before layout effects, runtime classes before paint, excludes overlays and warms from Cache Storage", async () => {
    const result = await run("?probe=1");
    expect(result, JSON.stringify(result)).toMatchObject({ sourceWidth: 137, dynamicWidth: 237, changedWidth: 319, excluded: true, warm: true, layoutWidth: 137, importFailed: true, errors: [] });
    expect(result.imported).toBeGreaterThanOrEqual(180);
  });
  it("keeps base rules out of the generated stylesheet and stores it as a few-KB text/css response with agreeing IndexedDB metadata", async () => {
    const result = await run("?probe=1");
    expect(result.baseInGenerated).toBe(false);
    expect(result.generatedKilobytes).toBeLessThan(20);
    expect(result.cold).toMatchObject({ records: 1, candidateRecords: 0, legacyCandidateEntries: 0, contentType: "text/css; charset=utf-8" });
    expect(result.cold.cachedBytes).toBe(result.cold.recordBytes);
    expect(result.cold.kilobytes).toBeLessThan(20);
  });
  it("warms from the stored record, adding the DOM classes the cold load discovered without a second entry", async () => {
    const result = await run("?probe=1");
    expect(result.warm).toBe(true);
    expect(result.warmStorage).toMatchObject({ records: 1, legacyCandidateEntries: 0 });
    expect(result.cold.domClasses).toEqual(expect.arrayContaining(["w-[237px]", "w-[319px]"]));
  });
  it("styles a page that does not opt in from the base links alone, with no runtime style element", async () => {
    const result = await run("?plain=1");
    expect(result).toMatchObject({ runtimeStyle: false, styled: true });
    expect(result.baseLinks).toBeGreaterThanOrEqual(1);
  });
  it.each(parityPages)("matches facet's v4 build in two fresh renders: %s", async (name) => {
    const runtime = await run(`?page=${name}&mode=runtime`) as Snapshot;
    const reference = await run(`?page=${name}&mode=reference`) as Snapshot;
    const differences = compare(runtime, reference).differences;
    expect(differences, JSON.stringify(differences.slice(0, 12))).toEqual([]);
    expect(runtime.selectors.length).toBeGreaterThan(10);
  });
  it.each(["LiveDiagram", "DataFlowDiagram"])("keeps styled diagram measurements at 2560x1440: %s", async (name) => {
    await browser("set", "viewport", "2560", "1440");
    try {
      const runtime = await run(`?page=${name}&mode=runtime`) as Snapshot;
      const reference = await run(`?page=${name}&mode=reference`) as Snapshot;
      const differences = compare(runtime, reference).differences;
      expect(differences, JSON.stringify(differences.slice(0, 12))).toEqual([]);
    } finally { await browser("set", "viewport", "1920", "1080"); }
  });
});
