import { spawnSync } from "node:child_process";
import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { compareVersions } from "../src/sw/versions.ts";

export function nextReleaseVersion({ current, published }: { current: string; published: string[] }): string {
  if (!/^\d+\.\d+\.\d+$/.test(current)) throw new Error(`Invalid stable release version ${current}`);
  for (const version of [current, ...published]) compareVersions(version, version);
  const latest = published.filter(version => /^\d+\.\d+\.\d+$/.test(version)).sort(compareVersions).at(-1);
  if (!latest || compareVersions(current, latest) > 0) return current;
  const [major, minor, patch] = latest.split(".").map(Number);
  return `${major}.${minor}.${patch! + 1}`;
}

export function readPublishedVersions(result: { status: number | null; stdout: string; stderr: string }): string[] {
  const response = JSON.parse(result.stdout) as string | string[] | { error?: { code?: string } };
  if (result.status !== 0) {
    if (typeof response === "object" && !Array.isArray(response) && response?.error?.code === "E404") return [];
    throw new Error(`npm version lookup failed (${result.status}): ${result.stderr}`);
  }
  if (typeof response === "string") return [response];
  if (Array.isArray(response) && response.every(version => typeof version === "string")) return response;
  throw new Error("npm version lookup must return a version or an array of versions");
}

export function prepareRelease(options: { manifestPath: string; tagPrefix: string; published: string[] }): { version: string; tag: string } {
  if (!/^[a-z0-9][a-z0-9._-]*$/.test(options.tagPrefix)) throw new Error(`Invalid release tag prefix ${options.tagPrefix}`);
  const manifest = JSON.parse(readFileSync(options.manifestPath, "utf8")) as { name: string; version: string };
  if (!manifest.name) throw new Error(`${options.manifestPath} must declare a package name`);
  const version = nextReleaseVersion({ current: manifest.version, published: options.published });
  writeFileSync(options.manifestPath, `${JSON.stringify({ ...manifest, version }, null, 2)}\n`);
  return { version, tag: `${options.tagPrefix}@${version}` };
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const [manifestPath, tagPrefix] = process.argv.slice(2);
  const output = process.env.GITHUB_OUTPUT;
  if (!manifestPath || !tagPrefix || !output) throw new Error("Usage: release-version.ts <manifest> <tag-prefix>, with GITHUB_OUTPUT set by CI");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as { name: string };
  if (!manifest.name) throw new Error(`${manifestPath} must declare a package name`);
  const lookup = spawnSync("npm", ["view", manifest.name, "versions", "--json"], { encoding: "utf8" });
  if (lookup.error) throw lookup.error;
  const release = prepareRelease({ manifestPath, tagPrefix, published: readPublishedVersions(lookup) });
  appendFileSync(output, `version=${release.version}\ntag=${release.tag}\n`);
}
