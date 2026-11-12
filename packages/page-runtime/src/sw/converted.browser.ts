import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { afterAll, beforeAll, expect, it } from "vitest";
import { startConvertedBrowserServer } from "../../test/esm-sh/browser-server.ts";

const exec = promisify(execFile);
const session = `esm-sh-${process.pid}`;
let server: Awaited<ReturnType<typeof startConvertedBrowserServer>> | undefined;
let launched = false;
async function browser(...args: string[]): Promise<string> {
  return (await exec("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 45000, maxBuffer: 2_000_000 })).stdout.trim();
}
beforeAll(async () => { server = await startConvertedBrowserServer(); });
afterAll(async () => { try { if (launched) await browser("close"); } finally { await server?.close(); } });

it("renders recorded CommonJS conversion in Chromium with the managed React singleton and a local-only converter", async () => {
  if (!server) throw new Error("converter fixture server was not started");
  launched = true;
  await browser("open", `${server.origin}/?page=report.js`);
  await browser("wait", "--fn", 'document.title === "CONVERTED-DONE" || document.title === "CONVERTED-ERROR"');
  expect(await browser("get", "text", "#result")).toBe("");
  expect(await browser("get", "text", "#converted")).toBe("Copy fixture");
  expect(await browser("get", "attr", "#converted", "data-one-react")).toBe("true");
  expect(new Set(server.converterRequests)).toEqual(new Set([
    "/*react-copy-to-clipboard@5.1.1?dev&target=es2022", "/*react-copy-to-clipboard@5.1.1/es2022/react-copy-to-clipboard.development.mjs",
    "/*copy-to-clipboard@3.3.3?dev&target=es2022", "/*copy-to-clipboard@3.3.3/es2022/copy-to-clipboard.development.mjs",
    "/*toggle-selection@1.0.6?dev&target=es2022", "/*toggle-selection@1.0.6/es2022/toggle-selection.development.mjs",
  ]));
  expect(server.packageRequests.filter((path) => path.endsWith("/react.js"))).toHaveLength(1);
  expect(server.packageRequests.some((path) => path.startsWith("react@"))).toBe(false);
});
