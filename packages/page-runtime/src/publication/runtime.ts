import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import type { BarrelIndex, Fragment } from "../schema.ts";
import type { PackageManifest } from "./manifest.ts";

export async function validateRuntime(options: { directory: string; manifest: PackageManifest; files: Set<string> }): Promise<void> {
  const { directory, manifest, files } = options;
  const expected = manifest.exports !== undefined && JSON.stringify(manifest.exports).includes("dist/runtime/");
  if (!expected && !files.has("dist/runtime/importmap.json")) return;
  if (!files.has("dist/runtime/importmap.json") || !files.has("dist/runtime/barrels.json")) throw new Error(`${manifest.name}: runtime importmap.json and barrels.json must both exist`);
  const fragment = JSON.parse(await readFile(resolve(directory, "dist/runtime/importmap.json"), "utf8")) as Fragment;
  const barrels = JSON.parse(await readFile(resolve(directory, "dist/runtime/barrels.json"), "utf8")) as BarrelIndex;
  if (fragment.fragment !== 1 || fragment.name !== manifest.name || !fragment.integrity || !fragment.imports || !fragment.scopes || !fragment.remaps || !fragment.aliases || !Array.isArray(fragment.inherits)) throw new Error(`${manifest.name}: invalid runtime fragment`);
  if (!Array.isArray(barrels.modules) || barrels.modules.some(value => typeof value !== "string") || !barrels.barrels || typeof barrels.barrels !== "object") throw new Error(`${manifest.name}: invalid barrel index`);
  for (const table of Object.values(barrels.barrels)) for (const value of Object.values(table)) {
    const index = Array.isArray(value) ? value[0] : value;
    if (!Number.isInteger(index) || index < 0 || index >= barrels.modules.length) throw new Error(`${manifest.name}: invalid barrel module index`);
  }
  const prefix = `${manifest.name}@${manifest.version}/`;
  for (const [url, integrity] of Object.entries(fragment.integrity)) {
    if (!url.startsWith(prefix)) continue;
    const path = url.slice(prefix.length);
    if (!files.has(path)) throw new Error(`${manifest.name}: missing integrity file ${path}`);
    const hash = `sha384-${createHash("sha384").update(await readFile(resolve(directory, path))).digest("base64")}`;
    if (hash !== integrity) throw new Error(`${manifest.name}: integrity mismatch for ${path}`);
  }
}
