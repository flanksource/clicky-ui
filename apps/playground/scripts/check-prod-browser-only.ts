import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const execute = promisify(execFile);
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const session = `playground-browser-only-${process.pid}`;
const browser = (...args: string[]) => execute("agent-browser", ["--engine", "chrome", "--session", session, ...args], { timeout: 60000, maxBuffer: 4000000 });
const server = spawn(process.execPath, ["scripts/playground-prod.mjs", "--port", "0", "--host", "127.0.0.1"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
let launched = false;
let logs = "";
server.stderr.on("data", chunk => { logs += String(chunk); });
try {
  const origin = await new Promise<string>((done, reject) => {
    const timer = setTimeout(() => reject(new Error(`Playground startup timed out\n${logs}`)), 120000);
    server.stdout.on("data", chunk => {
      logs += String(chunk);
      const match = /Browser-only playground: (http:\/\/[^\s]+)/.exec(logs);
      if (match) { clearTimeout(timer); done(match[1]!); }
    });
    server.once("error", reject);
    server.once("exit", code => { clearTimeout(timer); reject(new Error(`Playground exited ${code}\n${logs}`)); });
  });
  const shell = await fetch(origin);
  const html = await shell.text();
  if (shell.headers.get("x-playground-server") !== "node" || /\/@vite|\/@fs|[?&]t=/.test(html)) throw new Error("Production shell is not browser-only");
  await browser("open", `${origin}/?page=welcome`); launched = true;
  await browser("wait", "--fn", 'document.querySelector("[data-testid=playground-frame-status]")?.textContent === "ready" || Boolean(document.querySelector("[aria-label=\\\"Page error\\\"]"))');
  const body = (await browser("get", "text", "body")).stdout;
  if (body.includes("This playground page failed")) throw new Error(`Welcome frame failed: ${body}`);
  const state = (await browser("get", "text", "[data-testid=playground-frame-status]")).stdout.trim();
  if (state !== "ready") throw new Error(`Welcome frame did not reach readiness: ${state}`);
  const requests = (await browser("network", "requests", "--json")).stdout;
  if (/\/@vite|\/@fs|[?&]t=/.test(requests)) throw new Error("Production browser requested a Vite URL");
  for (const path of ["/@vite/client", "/@fs/private/source.tsx", "/src/pages/welcome.tsx"]) if ((await fetch(origin + path)).status !== 404) throw new Error(`Production server served ${path}`);
  await mkdir(resolve(root, "../../.tmp/J-playground-prod"), { recursive: true });
  await writeFile(resolve(root, "../../.tmp/J-playground-prod/browser-only-requests.json"), requests);
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 2560, height: 1440 }]) {
    await browser("set", "viewport", String(viewport.width), String(viewport.height));
    await browser("screenshot", "--full", resolve(root, `../../.tmp/J-playground-prod/welcome-${viewport.width}.png`));
  }
  process.stdout.write("Browser-only production: Node responses, frame ready, no Vite request URLs\n");
} finally {
  if (launched) await browser("close");
  server.kill("SIGTERM");
  await new Promise<void>(done => { if (server.exitCode !== null) done(); else server.once("exit", () => done()); });
}
