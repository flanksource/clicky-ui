import { createServer } from "node:http";
import { cp, mkdir, mkdtemp, readFile, rename, symlink, writeFile } from "node:fs/promises";
import { execFile, spawn, type ChildProcess } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

async function start(command: string, args: string[], env: NodeJS.ProcessEnv, url: string): Promise<ChildProcess> {
  const process = spawn(command, args, { cwd: root, env: { ...globalThis.process.env, ...env }, stdio: ["ignore", "pipe", "pipe"] });
  let output = "";
  process.stdout!.on("data", (chunk: Buffer) => { output += chunk.toString(); });
  process.stderr!.on("data", (chunk: Buffer) => { output += chunk.toString(); });
  let failure: Error | undefined;
  process.on("error", (error) => { failure = error; });
  const until = Date.now() + 30000;
  while (Date.now() < until) {
    if (failure || process.exitCode !== null) throw new Error(`Could not start ${url}: ${failure?.message ?? output}`);
    try { if ((await fetch(url, { signal: AbortSignal.timeout(1000) })).ok) return process; } catch (error) { if (!(error instanceof TypeError) && !(error instanceof DOMException && error.name === "TimeoutError")) throw error; }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  process.kill("SIGTERM");
  throw new Error(`Server startup timed out: ${url}\n${output}`);
}

export async function linkFixture() {
  await mkdir(join(root, ".tmp/T-host-e2e"), { recursive: true });
  const checkout = await mkdtemp(join(root, ".tmp/T-host-e2e/checkout-"));
  for (const directory of ["src", "dist"]) await cp(join(root, "packages/ui", directory), join(checkout, directory), { recursive: true });
  await cp(join(root, "packages/ui/package.json"), join(checkout, "package.json"));
  await symlink(join(root, "packages/ui/node_modules"), join(checkout, "node_modules"), "dir");
  const version = join(checkout, "src/data/Version.tsx");
  const original = await readFile(version, "utf8");
  const edit = async (revision: number) => {
    await writeFile(`${version}.next`, `import * as linkedReact from "react";\nexport { linkedReact };\n${original.replace("{parts.length > 0 &&", `<span data-link-edit>revision-${revision}</span>{parts.length > 0 &&`)}`);
    await rename(`${version}.next`, version);
    return Date.now();
  };
  await edit(0);
  await writeFile(join(checkout, "link-entries.json"), JSON.stringify({ "@flanksource/clicky-ui/data": "src/data/Version.tsx" }));
  await writeFile(join(checkout, "link-defines.json"), JSON.stringify({ __CLICKY_COMMIT__: "linked-checkout", __CLICKY_TAG__: "local", __CLICKY_DATE__: "2026-11-06", __CLICKY_DIRTY__: true }));
  await promisify(execFile)("pnpm", ["--filter", "@flanksource/page-runtime", "exec", "tsx", "src/link/build-cli.ts", "--library", checkout, "--entries", join(checkout, "link-entries.json"), "--defines", join(checkout, "link-defines.json")], { cwd: root });
  const server = createServer((request, response) => {
    response.setHeader("access-control-allow-origin", "*"); response.setHeader("cache-control", "no-store");
    const path = resolve(checkout, `.${decodeURIComponent(new URL(request.url!, "http://localhost").pathname)}`);
    if (!path.startsWith(`${checkout}${sep}`)) { response.writeHead(403); response.end("Outside checkout"); return; }
    void readFile(path).then((bytes) => response.end(bytes), (error: NodeJS.ErrnoException) => { response.statusCode = error.code === "ENOENT" ? 404 : 500; response.end(error.message); });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address(); if (!address || typeof address === "string") throw new Error("No checkout server address");
  const children: ChildProcess[] = [];
  const close = async () => {
    for (const child of children) child.kill("SIGTERM");
    await Promise.all(children.map((child) => child.exitCode !== null || child.signalCode !== null ? Promise.resolve() : new Promise<void>((resolve) => child.once("exit", () => resolve()))));
    server.closeAllConnections(); await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  };
  try {
    children.push(await start("node", ["apps/page-host/dev/runtime-server.mjs"], { PAGE_HOST_PROFILE: "developer", PAGE_RUNTIME_PORT: "5821", PAGE_HOST_ORIGIN: "http://localhost:5820", PAGE_PACKAGE_PORT: "5822" }, "http://localhost:5821/profile.json"));
    children.push(await start("node", ["apps/page-host/node_modules/vite/bin/vite.js", "apps/page-host", "--port", "5820"], { VITE_PAGE_HOST_PROFILE: "developer", VITE_PAGE_RUNTIME_ORIGIN: "http://localhost:5821" }, "http://localhost:5820"));
    return { checkout, source: `http://127.0.0.1:${address.port}/`, edit, close };
  } catch (error) { await close(); throw error; }
}
