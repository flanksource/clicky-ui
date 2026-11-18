import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const args = process.argv.slice(2);
if (!args.includes("--no-build")) {
  const result = spawnSync("pnpm", ["exec", "tsx", "--tsconfig", "tsconfig.server.json", "plugins/production-build.ts"], { cwd: root, stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
const server = spawn("pnpm", ["exec", "tsx", "--tsconfig", "tsconfig.server.json", "plugins/production-cli.ts", ...args.filter(arg => arg !== "--no-build")], { cwd: root, stdio: "inherit", env: { ...process.env, NODE_ENV: "production" } });
for (const signal of ["SIGINT", "SIGTERM"]) process.once(signal, () => server.kill(signal));
server.once("error", error => { throw error; });
server.once("exit", code => { process.exitCode = code ?? 1; });
