import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";

// Consumers run the publication CLI from node_modules, where Node refuses to strip TypeScript.
const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as { dependencies: Record<string, string>; peerDependencies: Record<string, string> };
const packages = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
await rm(resolve(root, "dist/publication"), { recursive: true, force: true });
await build({
  input: { cli: resolve(root, "scripts/run-package-build.ts") },
  platform: "node",
  external: source => source.startsWith("node:") || packages.some(name => source === name || source.startsWith(`${name}/`)),
  output: { dir: resolve(root, "dist/publication"), format: "esm", entryFileNames: "[name].mjs", chunkFileNames: "[name]-[hash].mjs", sourcemap: true },
});
