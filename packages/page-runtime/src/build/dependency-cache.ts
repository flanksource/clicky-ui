import { createHash, randomUUID } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, open, readFile, rename, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { buildDependencyRuntime, type DependencyRuntime, type DependencyRuntimeOptions } from "./dependency-runtime.ts";

export type CachedDependencyRuntime = DependencyRuntime & { root: string };

export async function ensureDependencyRuntime(options: Omit<DependencyRuntimeOptions, "outDir"> & { cacheDir: string }): Promise<CachedDependencyRuntime> {
  const identity = createHash("sha256").update(JSON.stringify({ root: resolve(options.root), target: options.target, entries: [...new Set(options.entries)].sort(), exports: options.exports, external: options.external, lock: readFileSync(join(options.root, "pnpm-lock.yaml"), "utf8"), compiler: readFileSync(new URL(import.meta.url)), abi: process.versions.modules })).digest("hex");
  await mkdir(options.cacheDir, { recursive: true });
  const pointer = join(options.cacheDir, `${identity}.json`);
  const lock = `${pointer}.lock`;
  const deadline = Date.now() + 300_000;
  let handle;
  while (!handle) {
    try { handle = await open(lock, "wx"); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      if (Date.now() > deadline) throw new Error(`Timed out waiting for compiled runtime ${lock}`);
      await new Promise(done => setTimeout(done, 25));
    }
  }
  try {
    if (existsSync(pointer)) {
      const cached = JSON.parse(await readFile(pointer, "utf8")) as CachedDependencyRuntime;
      if (Object.entries(cached.inputs).every(([path, hash]) => existsSync(path) && createHash("sha256").update(readFileSync(path)).digest("hex") === hash)) return cached;
    }
    const root = join(options.cacheDir, `${identity}-${randomUUID()}`);
    const staging = `${root}.pending`;
    try {
      const runtime = await buildDependencyRuntime({ ...options, outDir: staging });
      await rename(staging, root);
      const result = { ...runtime, root };
      await writeFile(`${pointer}.pending`, JSON.stringify(result));
      await rename(`${pointer}.pending`, pointer);
      return result;
    } finally { await rm(staging, { recursive: true, force: true }); }
  } finally { await handle.close(); await rm(lock); }
}
