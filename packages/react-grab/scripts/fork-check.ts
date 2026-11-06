import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyForkFiles } from "./fork-integrity.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const checkout = resolve(packageRoot, "../../.tmp/react-grab-upstream/src");
const read = (path: string) => readFileSync(resolve(packageRoot, path), "utf8");
const metadata = new Map(read("UPSTREAM").trim().split("\n").map((line) => {
  const match = /^(repository|tag|commit): (.+)$/.exec(line);
  if (!match) throw new Error(`Invalid UPSTREAM line: ${line}`);
  return [match[1], match[2]] as [string, string];
}));
const repository = metadata.get("repository");
const tag = metadata.get("tag");
const commit = metadata.get("commit");
if (metadata.size !== 3 || !repository?.startsWith("https://github.com/") || !tag || !commit?.match(/^[a-f0-9]{40}$/)) {
  throw new Error("UPSTREAM requires an HTTPS GitHub repository, tag and full commit SHA");
}
if (!existsSync(checkout)) {
  mkdirSync(dirname(checkout), { recursive: true });
  execFileSync("git", ["clone", "--no-checkout", "--filter=blob:none", repository, checkout], { stdio: "inherit" });
}
const git = (args: string[]) => execFileSync("git", ["-C", checkout, ...args], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }).trimEnd();
if (git(["rev-parse", `${tag}^{commit}`]) !== commit) throw new Error(`UPSTREAM tag ${tag} does not resolve to ${commit}`);
const upstreamPaths = git(["ls-tree", "-r", "--name-only", commit]).split("\n");
const prefix = "packages/react-grab/";
const required = ["LICENSE", "README.md", "tsconfig.json", "solid-babel-plugin.ts", "solid-source-location-babel-plugin.ts", "scripts/css-rem-to-px.ts"];
const upstream = new Map<string, string>();
for (const path of upstreamPaths) {
  if (!path.startsWith(prefix)) continue;
  const relative = path.slice(prefix.length);
  if (relative.startsWith("src/") || (relative.startsWith("tests/") && relative !== "tests/perf-instrumentation.test.ts") || required.includes(relative)) {
    upstream.set(relative, execFileSync("git", ["-C", checkout, "show", `${commit}:${path}`], { encoding: "utf8" }));
  }
}

function readLocalFiles(directory = ""): Map<string, string> {
  const files = new Map<string, string>();
  for (const entry of readdirSync(resolve(packageRoot, directory), { withFileTypes: true })) {
    if (["node_modules", "dist", ".tmp", ".gavel", ".vitest", ".DS_Store", "FORK.md"].includes(entry.name)) continue;
    const path = directory ? `${directory}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      for (const [child, source] of readLocalFiles(path)) files.set(child, source);
    } else if (entry.isFile()) files.set(path, read(path));
    else throw new Error(`Unexpected non-file in fork: ${path}`);
  }
  return files;
}

const changes = new Map<string, string>();
for (const line of read("FORK.md").split("\n")) {
  const match = /^\| `([^`]+)` \| `([a-f0-9]{64})` \| (.+) \| (.+) \|$/.exec(line);
  if (!match) continue;
  if (changes.has(match[1])) throw new Error(`Duplicate FORK.md entry: ${match[1]}`);
  changes.set(match[1], match[2]);
}
const local = readLocalFiles();
for (const field of [repository, tag, commit, "Copyright (c) 2025 Aiden Bai", "MIT"]) {
  if (!read("NOTICE.md").includes(field)) throw new Error(`NOTICE.md omits ${field}`);
}
for (const path of upstream.keys()) {
  if (path === "LICENSE") continue;
  const source = local.get(path);
  if (!source?.split("\n")[0]?.includes(`Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): ${prefix}${path}`)) {
    throw new Error(`Missing upstream provenance header: ${path}`);
  }
}
for (const path of changes.keys()) {
  if (!local.has(path)) throw new Error(`FORK.md lists a missing file: ${path}`);
}
process.stdout.write(`Fork verified: ${verifyForkFiles({ upstream, local, changes })} files against ${repository}@${commit}\n`);
