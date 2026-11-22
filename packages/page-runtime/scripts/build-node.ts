import { readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "rolldown";

// Node refuses to strip TypeScript under node_modules, so the published package (publishConfig.exports) points
// these Node-side entries at compiled modules; the workspace keeps importing the sources.
export const NODE_ENTRIES = {
  styles: "src/styles.ts",
  schema: "src/schema.ts",
  catalog: "src/publication/schema.ts",
  publication: "src/publication/index.ts",
  "publication/cli": "scripts/run-package-build.ts",
  dev: "src/dev/index.ts",
} as const;

const root = fileURLToPath(new URL("../", import.meta.url));
const manifest = JSON.parse(await readFile(resolve(root, "package.json"), "utf8")) as { dependencies: Record<string, string>; peerDependencies: Record<string, string> };
const packages = Object.keys({ ...manifest.dependencies, ...manifest.peerDependencies });
await rm(resolve(root, "dist/node"), { recursive: true, force: true });
await build({
  input: Object.fromEntries(Object.entries(NODE_ENTRIES).map(([name, path]) => [name, resolve(root, path)])),
  platform: "node",
  external: source => source.startsWith("node:") || packages.some(name => source === name || source.startsWith(`${name}/`)),
  output: { dir: resolve(root, "dist/node"), format: "esm", entryFileNames: "[name].mjs", chunkFileNames: "chunks/[name]-[hash].mjs", sourcemap: true },
});
