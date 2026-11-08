import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export type PackageManifest = Record<string, unknown> & { name: string; version: string };
export function validateManifest(value: unknown): PackageManifest {
  if (!value || typeof value !== "object") throw new Error("Package manifest must be an object");
  const manifest = value as PackageManifest;
  if (typeof manifest.name !== "string" || !/^(?:@[a-z0-9._-]+\/)?[a-z0-9._-]+$/.test(manifest.name)) throw new Error("Invalid package name");
  if (typeof manifest.version !== "string" || !/^\d+\.\d+\.\d+(?:-[\da-zA-Z.-]+)?(?:\+[\da-zA-Z.-]+)?$/.test(manifest.version)) throw new Error("Invalid package version");
  return manifest;
}
export async function readManifest(directory: string): Promise<PackageManifest> {
  return validateManifest(JSON.parse(await readFile(resolve(directory, "package.json"), "utf8")));
}
