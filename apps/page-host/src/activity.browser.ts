import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, expect, it } from "vitest";
import { STARTER } from "./starter";
import type { Project } from "./project";

const exec = promisify(execFile);
const session = `host-activity-${process.pid}`;
const directory = fileURLToPath(new URL("../", import.meta.url));
const artifacts = fileURLToPath(new URL("../../../.tmp/U-runtime-activity/", import.meta.url));
const host = "http://localhost:5910"; const runtime = "http://localhost:5911";
const processes: ChildProcess[] = [];
let output = ""; let opened = false;
async function browser(...args: string[]) {
  return (await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 8_000_000 })).stdout.trim();
}
function start(command: string, args: string[], env: Record<string, string>) {
  const child = spawn(command, args, { cwd: directory, env: { ...process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
  processes.push(child);
  child.stdout?.on("data", (data: Buffer) => { output += data.toString(); });
  child.stderr?.on("data", (data: Buffer) => { output += data.toString(); });
  return child;
}
async function listening(url: string) {
  for (let attempt = 0; attempt < 300; attempt++) {
    if (processes.some((child) => child.exitCode !== null)) throw new Error(`activity test server exited: ${output}`);
    try { if ((await fetch(url)).ok) return; } catch (error) {
      if (!(error instanceof TypeError)) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`activity test server did not start: ${output}`);
}
beforeAll(async () => {
  await mkdir(artifacts, { recursive: true });
  start("node", ["dev/runtime-server.mjs"], { PAGE_RUNTIME_PORT: "5911", PAGE_PACKAGE_PORT: "5912", PAGE_HOST_ORIGIN: host });
  start("pnpm", ["exec", "vite", "dev", "--port", "5910", "--strictPort"], { VITE_PAGE_RUNTIME_ORIGIN: runtime });
  await Promise.all([listening(host), listening(`${runtime}/profile.json`)]);
});
afterAll(async () => {
  try { if (opened) await browser("close"); }
  finally { for (const child of processes) child.kill("SIGTERM"); await writeFile(`${artifacts}activity-server.log`, output); }
});

it("shows library origins and sizes, filters npm requests, and draws ready timelines in both desktop layouts", async () => {
  const versions = Object.fromEntries(await Promise.all([new URL("../../../packages/ui/package.json", import.meta.url), new URL("../../../../facet/package.json", import.meta.url)].map(async (path) => { const pkg = JSON.parse(await readFile(path, "utf8")) as { name: string; version: string }; return [pkg.name, pkg.version]; })));
  const project: Project = { ...STARTER, files: { ...STARTER.files, "package.json": JSON.stringify({ dependencies: versions }) } };
  const hash = deflateSync(new TextEncoder().encode(JSON.stringify(project))).toString("base64url");
  await browser("set", "viewport", "1920", "1080"); opened = true;
  await browser("open", `${host}/#page=${hash}`);
  await browser("wait", "--fn", 'document.querySelector("[data-testid=preview-status]")?.textContent === "ready"');
  await browser("click", "[data-testid=runtime-activity] summary");
  await browser("click", '[data-testid=runtime-activity] [role=tab]:nth-child(1)');
  const libraries = await browser("get", "text", "[data-testid=runtime-activity]");
  await writeFile(`${artifacts}libraries.txt`, libraries);
  await browser("screenshot", `${artifacts}libraries-1920.png`);
  for (const name of ["@flanksource/clicky-ui", "@flanksource/facet", "react@"]) expect(libraries).toContain(name);
  const profile = await (await fetch(`${runtime}/profile.json`)).json() as { packageOrigin: string };
  expect(libraries).toContain(profile.packageOrigin);
  expect(libraries).toMatch(/\d+ (?:B|KB|MB)/);
  await browser("click", '[data-testid=runtime-activity] [role=tab]:nth-child(4)');
  const summary = await browser("get", "text", "[data-testid=runtime-activity]");
  expect(summary).toMatch(/react/i); expect(summary).toContain("18.3.1");
  await browser("click", '[data-testid=runtime-activity] [role=tab]:nth-child(2)');
  await writeFile(`${artifacts}requests-snapshot.txt`, await browser("snapshot", "-i"));
  await browser("click", '[data-testid=runtime-activity] [role=combobox]');
  await writeFile(`${artifacts}filter-snapshot.txt`, await browser("snapshot", "-i"));
  await browser("click", '[role=listbox][aria-label="Kind"] [role=option]:nth-child(4)');
  const requests = await browser("get", "text", "[data-testid=runtime-activity]");
  expect(requests).toContain("npm"); expect(requests).not.toContain("frame + import map");
  const kinds = JSON.parse(await browser("eval", 'Array.from(document.querySelectorAll("[data-testid=runtime-activity] tbody tr[tabindex]")).map(row => row.querySelector("td").textContent.trim())')) as string[];
  expect(kinds.length).toBeGreaterThan(0); expect([...new Set(kinds)]).toEqual(["npm"]);
  await browser("click", '[data-testid=runtime-activity] tbody tr[tabindex="0"]');
  expect(await browser("get", "text", '[aria-label="Request details"]')).toContain("server-timing");
  await browser("screenshot", `${artifacts}requests-1920.png`);
  await browser("click", '[data-testid=runtime-activity] [role=tab]:nth-child(3)');
  const timeline = await browser("get", "text", "[data-testid=runtime-activity]");
  expect(timeline).toContain("ready"); expect(timeline).toContain("Tailwind");
  for (const [width, height] of [[1920, 1080], [2560, 1440]]) {
    await browser("set", "viewport", String(width), String(height));
    await browser("screenshot", `${artifacts}host-${width}.png`);
    expect(await browser("eval", "document.documentElement.scrollWidth <= innerWidth")).toBe("true");
  }
  await browser("focus", '[aria-label="Source editor"]');
  await browser("press", process.platform === "darwin" ? "Meta+A" : "Control+A");
  await browser("press", "Backspace");
  await browser("keyboard", "inserttext", project.files["diagram.tsx"]!.replace("Deployment path", "Activity edited"));
  await browser("wait", "--fn", 'document.querySelector("[data-testid=preview-status]")?.textContent === "ready" && !document.querySelector("[data-testid=runtime-activity]").textContent.includes("No edit in this load")');
  const editedTimeline = await browser("get", "text", "[data-testid=runtime-activity]");
  expect(editedTimeline).toMatch(/Last edit → visible reload: \d/);
  await browser("click", '[data-testid=runtime-activity] [role=tab]:nth-child(4)');
  expect(await browser("get", "text", "[data-testid=runtime-activity]")).toContain("Previous load");
  await writeFile(`${artifacts}panel-evidence.json`, JSON.stringify({ libraries, requests, timeline, editedTimeline, summary }, null, 2));
});
