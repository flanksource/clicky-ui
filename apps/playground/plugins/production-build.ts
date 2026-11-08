import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { readFile, writeFile } from "node:fs/promises";
import { build } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { playgroundProduction } from "./production-server";
import { PRODUCTION_ASSET_BASE } from "./production-assets";
import { playgroundPageActivity } from "./page-activity";

export async function buildProductionShell(root: string) {
  const outDir = resolve(root, "dist/browser");
  const manifest = JSON.parse(await readFile(resolve(root, "../../../facet/package.json"), "utf8")) as { exports: { ".": { import: string } } };
  const facet = resolve(root, "../../../facet", manifest.exports["."].import);
  await build({ configFile: false, root, base: PRODUCTION_ASSET_BASE, logLevel: "warn", plugins: [playgroundProduction({ root }), playgroundPageActivity(resolve(root, "src/pages")), react(), tailwindcss()], define: { "import.meta.env.PLAYGROUND_LIVE": "true", "import.meta.env.PLAYGROUND_BROWSER_MODE": "true" }, resolve: { dedupe: ["react", "react-dom"], alias: [{ find: /^@flanksource\/facet$/, replacement: facet }] }, build: { outDir, emptyOutDir: true, sourcemap: true } });
  await build({ configFile: false, root, logLevel: "warn", define: { "process.env.NODE_ENV": JSON.stringify("development") }, worker: { format: "es" }, build: { outDir, emptyOutDir: false, lib: { entry: resolve(root, "src/bookmarklet/host.ts"), formats: ["es"], fileName: () => "bookmarklet-entry.js" } } });
  await writeFile(resolve(outDir, "bookmarklet.js"), `(() => { const url = document.currentScript.src; import(new URL("${PRODUCTION_ASSET_BASE}bookmarklet-entry.js", url).href).then(module => module.installBookmarklet(url)).catch(error => window.alert("Playground grabber: " + error.message)); })();`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildProductionShell(resolve(dirname(fileURLToPath(import.meta.url)), ".."));
