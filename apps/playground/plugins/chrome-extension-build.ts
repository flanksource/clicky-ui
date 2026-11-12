import { copyFile, mkdir, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { build, type Alias } from "vite";
import { grabberHostBuild } from "./bookmarklet-server";
import { writeExtensionIcons } from "./extension-icons";
import { reactDevtoolsHookScript } from "./react-devtools-hook";

/** Script entries: plain IIFEs for the worker, the isolated-world bridge, the page-world early script (with bippy's DevTools hook) and the playground and gavel-todo relay pages. */
export const EXTENSION_ENTRIES = ["background", "bridge", "early", "relay", "todo-relay"] as const;
/** React pages, built together as one multi-page app: the toolbar popup and the bundled gavel panel. */
export const EXTENSION_PAGES = ["popup", "panel"] as const;
export const EXTENSION_STATIC = ["manifest.json", "relay.html", "todo-relay.html"] as const;

/** The workspace's clicky-ui source, as `vite.config.ts` aliases it, so the pages build without a built library. */
function clickyUiAliases(uiSrc: string): Alias[] {
  const subpaths: [string, string][] = [
    ["styles\\.css", "styles.ts"],
    ["icons", "icons.ts"],
    ["comments\\/anchoring", "comment-anchoring.ts"],
    ["comments", "comments.ts"],
    ["monaco", "monaco.ts"],
    ["file-findings", "file-findings.ts"],
    ["rpc", "rpc.ts"],
    ["connections", "connections.ts"],
    ["chat", "chat.ts"],
    ["ai", "ai.ts"],
    ["ai\\/runtime-profile", "runtime-profile.ts"],
    ["utils", "utils.ts"],
    ["hooks", "hooks.ts"],
    ["components", "components.ts"],
    ["data", "data.ts"],
    ["git", "git.ts"],
    ["expressions\\/playground", "expressions/playground.ts"],
    ["expressions", "expressions.ts"],
  ];
  return [
    ...subpaths.map(([subpath, file]) => ({ find: new RegExp(`^@flanksource/clicky-ui/${subpath}$`), replacement: resolve(uiSrc, file) })),
    { find: /^@flanksource\/clicky-ui$/, replacement: resolve(uiSrc, "index.ts") },
  ];
}

/** Builds the unpacked Chrome extension into `outDir` (default `extension/dist`). */
export async function buildChromeExtension(options: { root: string; outDir?: string }): Promise<string> {
  const outDir = options.outDir ?? resolve(options.root, "extension/dist");
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  const host = grabberHostBuild(options.root);
  // The extension's grabber is the shared host plus the extension-only screenshot capture, so its entry is extension/grabber.ts, not host.ts.
  await build({ ...host, build: { ...host.build, outDir, lib: { ...host.build.lib, entry: resolve(options.root, "extension/grabber.ts"), fileName: () => "grabber.js" } } });
  const hook = `(function () {\n${reactDevtoolsHookScript(options.root)}\n})`;
  for (const entry of EXTENSION_ENTRIES) {
    await build({
      configFile: false,
      root: options.root,
      logLevel: "warn",
      publicDir: false,
      ...(entry === "early" ? { define: { __INSTALL_REACT_DEVTOOLS_HOOK__: hook } } : {}),
      build: { outDir, emptyOutDir: false, minify: false, lib: { entry: resolve(options.root, `extension/${entry}.ts`), name: `PlaygroundGrabber_${entry.replaceAll("-", "_")}`, formats: ["iife"], fileName: () => `${entry}.js` } },
    });
  }
  const extensionRoot = resolve(options.root, "extension");
  await build({
    configFile: false,
    root: extensionRoot,
    base: "./",
    logLevel: "warn",
    publicDir: false,
    plugins: [react(), tailwindcss()],
    define: { "process.env.NODE_ENV": JSON.stringify("production") },
    resolve: { dedupe: ["react", "react-dom"], alias: clickyUiAliases(resolve(options.root, "../../packages/ui/src")) },
    build: {
      outDir,
      emptyOutDir: false,
      minify: false,
      rolldownOptions: { input: Object.fromEntries(EXTENSION_PAGES.map(page => [page, resolve(extensionRoot, `${page}.html`)])) },
    },
  });
  for (const file of EXTENSION_STATIC) await copyFile(resolve(extensionRoot, file), resolve(outDir, file));
  await writeExtensionIcons(outDir);
  return outDir;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const outDir = await buildChromeExtension({ root: resolve(dirname(fileURLToPath(import.meta.url)), "..") });
  console.log(`Playground grabber extension built. Load it unpacked from ${outDir}`);
}
