import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const upstreamRoot = resolve(packageRoot, "../../.tmp/react-grab-upstream/src");
const commit = "332732ab11f8aed6e588424bac9a0b226aef0ded";
const prefix = "packages/react-grab/";
const testsOnly = process.argv.includes("--tests-only");
const files = execFileSync("git", ["-C", upstreamRoot, "ls-tree", "-r", "--name-only", commit, prefix], { encoding: "utf8" }).trim().split("\n");

for (const upstreamPath of files) {
  const path = upstreamPath.slice(prefix.length);
  const isTest = path.startsWith("tests/") && path !== "tests/perf-instrumentation.test.ts";
  if (testsOnly ? !isTest : !(isTest || path.startsWith("src/") || ["LICENSE", "README.md", "tsconfig.json", "solid-babel-plugin.ts", "solid-source-location-babel-plugin.ts", "scripts/css-rem-to-px.ts"].includes(path))) continue;
  let source = execFileSync("git", ["-C", upstreamRoot, "show", `${commit}:${upstreamPath}`], { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 });
  const destination = resolve(packageRoot, path);
  if (path !== "LICENSE") {
    const attribution = `Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): ${upstreamPath}`;
    source = (path.endsWith(".md") ? `<!-- ${attribution} -->\n` : path.endsWith(".css") ? `/* ${attribution} */\n` : `// ${attribution}\n`) + source;
  }
  if (isTest) source = source.replaceAll('"vite-plus/test"', '"vitest"');
  mkdirSync(dirname(destination), { recursive: true });
  // This importer is for the initial fork; do not overwrite subsequent local edits.
  try {
    if (readFileSync(destination, "utf8") !== source) throw new Error(`Existing local edits: ${path}`);
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    writeFileSync(destination, source, { flag: "wx" });
  }
}
