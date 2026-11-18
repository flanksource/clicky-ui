import { mkdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout } from "node:timers/promises";

export async function withPackageLock<T>(options: { libraryDir: string; run: () => Promise<T> }): Promise<T> {
  const root = resolve(await realpath(options.libraryDir), ".tmp/package-publications");
  const lock = resolve(root, "build.lock");
  await mkdir(root, { recursive: true });
  let missingOwner = 0;
  for (;;) {
    try { await mkdir(lock); break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
    try {
      const owner = JSON.parse(await readFile(resolve(lock, "owner.json"), "utf8")) as { pid: number };
      missingOwner = 0;
      if (!Number.isInteger(owner.pid) || owner.pid <= 0) throw new Error(`Invalid package build lock: ${lock}`);
      try { process.kill(owner.pid, 0); }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
        throw new Error(`Interrupted build left a lock at ${lock}; its owner ${owner.pid} has stopped. Remove that lock before rebuilding.`);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      if (++missingOwner > 20) throw new Error(`Package build lock has no owner: ${lock}. Confirm no build is running before removing it.`);
    }
    await setTimeout(250);
  }
  try {
    await writeFile(resolve(lock, "owner.json"), JSON.stringify({ pid: process.pid, started: new Date().toISOString() }));
    return await options.run();
  } finally { await rm(lock, { recursive: true, force: true }); }
}
