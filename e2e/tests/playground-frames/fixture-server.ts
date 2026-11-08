import { mkdir, mkdtemp, realpath, rm, symlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { startProductionServer } from "../../../apps/playground/plugins/production-node";

const repository = fileURLToPath(new URL("../../../", import.meta.url));
const temporary = resolve(repository, ".tmp/J-playground-prod");
await mkdir(temporary, { recursive: true });
const fixture = await realpath(await mkdtemp(resolve(temporary, "interaction-")));
const workspace = resolve(fixture, "workspace");
const root = resolve(workspace, "apps/playground");
const comments = spawn("go", ["run", "./comments/testhost"], { cwd: resolve(repository, "../gavel"), detached: true, stdio: ["ignore", "pipe", "pipe"] });
const commentsUrl = await new Promise<string>((done, reject) => {
  let output = "";
  let errors = "";
  const timer = setTimeout(() => reject(new Error(`Gavel comments fixture timed out: ${errors}`)), 120000);
  comments.stderr.on("data", chunk => { errors += String(chunk); });
  comments.stdout.on("data", chunk => {
    output += String(chunk);
    const line = output.split("\n").find(line => line.startsWith('{"url":'));
    if (line) { clearTimeout(timer); done((JSON.parse(line) as { url: string }).url); }
  });
  comments.once("error", reject);
  comments.once("exit", code => { clearTimeout(timer); reject(new Error(`Gavel comments fixture exited ${code}: ${errors}`)); });
});
for (const path of ["src/pages", "src/vocabularies", "docs", "dist", ".playground"]) await mkdir(resolve(root, path), { recursive: true });
await mkdir(resolve(root, "src/vocabularies/shapes"));
await writeFile(resolve(root, "src/vocabularies/shapes/catalog.ts"), 'export default [{catalog:"shapes",type:"shape",id:"rectangle",label:"Rectangle",description:"Fixture shape",references:["fixture.md"]}];');
await writeFile(resolve(root, "src/vocabularies/shapes/Preview.tsx"), 'export default () => <div>Fixture shapes</div>;');
await mkdir(resolve(workspace, "packages"), { recursive: true });
await symlink(resolve(repository, "packages/ui"), resolve(workspace, "packages/ui"));
await symlink(resolve(repository, "packages/react-grab"), resolve(workspace, "packages/react-grab"));
await symlink(resolve(repository, "../facet"), resolve(fixture, "facet"));
await symlink(resolve(repository, "apps/playground/node_modules"), resolve(root, "node_modules"));
await symlink(resolve(repository, "apps/playground/src/browser-mode"), resolve(root, "src/browser-mode"));
await symlink(resolve(repository, "apps/playground/dist/browser"), resolve(root, "dist/browser"));
await writeFile(resolve(root, ".env.local"), `PLAYGROUND_GAVEL_URL=${commentsUrl}\nPLAYGROUND_CAPTAIN_URL=http://127.0.0.1:1\n`);
await writeFile(resolve(root, "src/pages/frame-fixture.tsx"), 'export const meta = {title:"Frame fixture"}; export default function Fixture() { return <main><h1>Frame fixture</h1><button id="action">Review action</button><svg data-review-id="shape" width="240" height="120"><rect id="shape" role="img" tabIndex={0} aria-label="Editable shape" width={160} height={80} fill="red" /></svg></main>; }');
const page = { slug: "frame-fixture", file: "src/pages/frame-fixture.tsx", compatible: true, files: ["src/pages/frame-fixture.tsx"], issues: [] };
await writeFile(resolve(root, "docs/browser-mode-compatibility.json"), JSON.stringify({ version: 1, configuration: { aliases: {}, externalRoots: [], libraryImports: [] }, pages: [page] }));
const server = await startProductionServer({ root, host: "127.0.0.1", port: 0 });
process.stdout.write(`${JSON.stringify({ origin: server.origin, root })}\n`);
for (const signal of ["SIGTERM", "SIGINT"] as const) process.once(signal, () => {
  if (comments.pid) process.kill(-comments.pid, "SIGTERM");
  void server.close().then(() => rm(fixture, { recursive: true, force: true })).catch(error => { process.stderr.write(String(error)); process.exitCode = 1; });
});
