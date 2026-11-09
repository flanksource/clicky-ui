import { existsSync } from "node:fs";
import { readFile, realpath, stat } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { parseEnv } from "node:util";
import { sourceRoots, type SourceRoot } from "./source-roots";

async function environment(root: string) {
  const env: Record<string, string> = {};
  for (const name of [".env", ".env.local", ".env.development", ".env.development.local"]) {
    try { Object.assign(env, parseEnv(await readFile(resolve(root, name), "utf8"))); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  }
  for (const [key, value] of Object.entries(process.env)) if (value !== undefined) env[key] = value;
  return env;
}

export async function vocabularyOptions(options: { root: string; sourceRoots?: readonly SourceRoot[]; pagesDir?: string }) {
  const env = await environment(options.root);
  const pagesDir = options.pagesDir ?? resolve(options.root, "src/pages");
  const local = resolve(dirname(pagesDir), "vocabularies");
  const list = (name: string) => (env[name] ?? "").split(",").map(value => value.trim()).filter(Boolean);
  const roots = [...(existsSync(local) ? [local] : []), ...list("PLAYGROUND_VOCABULARY_DIRS")];
  if (options.sourceRoots) return { roots, pagesDir, sourceRoots: options.sourceRoots };
  const directories = [dirname(pagesDir), ...list("PLAYGROUND_EXTERNAL_ROOTS"), ...roots];
  for (const alias of list("PLAYGROUND_EXTERNAL_ALIASES")) {
    const separator = alias.indexOf("=");
    if (separator <= 0) throw new Error(`Invalid PLAYGROUND_EXTERNAL_ALIASES entry ${alias}`);
    const path = alias.slice(separator + 1);
    if (!isAbsolute(path)) throw new Error(`Source alias must be absolute: ${alias}`);
    directories.push((await stat(path)).isDirectory() ? path : dirname(path));
  }
  const canonical = [...new Set(await Promise.all(directories.map(async directory => {
    if (!isAbsolute(directory) || !(await stat(directory)).isDirectory()) throw new Error(`Source root must be an existing absolute directory: ${directory}`);
    return realpath(directory);
  })))];
  return { roots, pagesDir, sourceRoots: sourceRoots(canonical.map((directory, index) => ({ directory, url: `/__playground/source-roots/${index}/` }))) };
}

export async function productionConfig(root: string) {
  const env = await environment(root);
  const vocabulary = await vocabularyOptions({ root });
  return { env, sourceRoots: [...vocabulary.sourceRoots], vocabularyRoots: vocabulary.roots };
}
