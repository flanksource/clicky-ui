import { execFile } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { lstat, mkdir, mkdtemp, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { readManifest } from "./manifest.ts";
import { validateRuntime } from "./runtime.ts";
import { BUILD_ID, type PackageBuild } from "./schema.ts";
import { withPackageLock } from "./lock.ts";

export type Publication = PackageBuild & { directory: string };
export const publicationRoot = (libraryDir: string): string => resolve(libraryDir, ".tmp/package-publications");
export async function atomicJson(file: string, value: unknown): Promise<void> {
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${randomUUID()}`;
  try { await writeFile(temporary, JSON.stringify(value)); await rename(temporary, file); }
  finally { await rm(temporary, { force: true }); }
}
export async function readPublication(libraryDir: string): Promise<Publication> {
  const root = publicationRoot(libraryDir);
  const current = JSON.parse(await readFile(resolve(root, "current.json"), "utf8")) as PackageBuild;
  if (typeof current.build !== "string" || !BUILD_ID.test(current.build)) throw new Error(`${libraryDir}: invalid published build`);
  const directory = await realpath(resolve(root, "generations", current.build, "package"));
  const manifest = await readManifest(directory);
  if (manifest.name !== current.name || manifest.version !== current.version) throw new Error(`${libraryDir}: publication identity mismatch`);
  return { ...current, directory };
}

async function copyPublishable(libraryDir: string, directory: string): Promise<string[]> {
  const archive = resolve(directory, "..", "package.tgz");
  const { stdout } = await promisify(execFile)("pnpm", ["--config.ignoreScripts=true", "pack", "--json", "--out", archive], { cwd: libraryDir, env: process.env, maxBuffer: 16 * 1024 * 1024 });
  const packed = JSON.parse(stdout) as { files: { path: string }[] };
  if (!Array.isArray(packed.files) || !packed.files.length) throw new Error(`${libraryDir}: native package file list is empty`);
  const files = packed.files.map(file => file.path).sort();
  for (const path of files) {
    if (typeof path !== "string" || path.startsWith("/") || path.split(/[\\/]/).includes("..")) throw new Error(`Invalid publishable path: ${path}`);
  }
  const listed = await promisify(execFile)("tar", ["-tzf", archive], { maxBuffer: 16 * 1024 * 1024 });
  for (const path of listed.stdout.trim().split("\n")) if (!path.startsWith("package/") || path.split("/").includes("..")) throw new Error(`Invalid archive path: ${path}`);
  await promisify(execFile)("tar", ["-xzf", archive, "-C", dirname(directory)]);
  await rm(archive);
  for (const path of files) {
    const file = resolve(directory, path);
    if (!(await lstat(file)).isFile() || !(await realpath(file)).startsWith(`${directory}${sep}`)) throw new Error(`Invalid published file: ${path}`);
  }
  return files;
}

function exportedPaths(value: unknown): string[] {
  if (typeof value === "string") return value.startsWith("./") && !value.includes("*") ? [value.slice(2)] : [];
  return value && typeof value === "object" ? Object.values(value).flatMap(exportedPaths) : [];
}

export async function publishPackage(options: { libraryDir: string }): Promise<Publication> {
  return withPackageLock({ ...options, run: () => createPublication(options) });
}

export async function createPublication(options: { libraryDir: string }): Promise<Publication> {
  const libraryDir = await realpath(options.libraryDir);
  const root = publicationRoot(libraryDir);
  await mkdir(resolve(root, "generations"), { recursive: true });
  const staging = await realpath(await mkdtemp(resolve(root, "staging-")));
  const directory = resolve(staging, "package");
  try {
    const files = await copyPublishable(libraryDir, directory);
    const manifest = await readManifest(directory);
    for (const path of exportedPaths(manifest.exports)) if (!files.includes(path)) throw new Error(`${manifest.name}: missing exported file ${path}`);
    await validateRuntime({ directory, manifest, files: new Set(files) });
    const hash = createHash("sha256");
    for (const path of files) hash.update(JSON.stringify([path, createHash("sha256").update(await readFile(resolve(directory, path))).digest("hex")]));
    const build = hash.digest("hex");
    const entry = { name: manifest.name, version: manifest.version, build };
    await writeFile(resolve(staging, "publication.json"), JSON.stringify(entry));
    try { await rename(staging, resolve(root, "generations", build)); }
    catch (error) { if (!["ENOTEMPTY", "EEXIST"].includes((error as NodeJS.ErrnoException).code ?? "")) throw error; }
    await atomicJson(resolve(root, "current.json"), entry);
    return { ...entry, directory: await realpath(resolve(root, "generations", build, "package")) };
  } finally { await rm(staging, { recursive: true, force: true }); }
}

