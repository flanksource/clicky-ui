// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/vite.config.ts
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsdown";
import { cssTextPlugin, solidBabelPlugin, solidWebBrowserPlugin } from "./solid-babel-plugin.js";
import { solidSourceLocationBabelPlugin } from "./solid-source-location-babel-plugin.js";

const sourceLocations = process.env.REACT_GRAB_SOURCE_LOCATIONS === "true";
const root = dirname(fileURLToPath(import.meta.url));
const version = /^tag: react-grab@(.+)$/m.exec(readFileSync(resolve(root, "UPSTREAM"), "utf8"))?.[1];
if (!version) throw new Error("UPSTREAM must pin the React Grab version");

export default defineConfig({
  entry: { index: resolve(root, "src/index.ts"), "core/index": resolve(root, "src/core/index.tsx"), primitives: resolve(root, "src/primitives.ts") },
  outDir: resolve(root, "../dist/react-grab"),
  tsconfig: resolve(root, "tsconfig.json"),
  format: ["esm"],
  dts: true,
  clean: false,
  platform: "neutral",
  sourcemap: process.env.REACT_GRAB_SOURCEMAP === "true",
  minify: process.env.REACT_GRAB_NO_MINIFY !== "true",
  banner: "/** @license MIT\n * Copyright (c) 2025 Aiden Bai\n * See LICENSE in the package root.\n */",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
    "process.env.VERSION": JSON.stringify(process.env.VERSION ?? version),
    "process.env.IS_DEMO": JSON.stringify(""),
    "process.env.REACT_GRAB_SOURCE_LOCATIONS": JSON.stringify(sourceLocations ? "true" : ""),
  },
  deps: { alwaysBundle: [/^solid-js/], neverBundle: [/^bippy(?:\/|$)/] },
  plugins: [
    solidWebBrowserPlugin(),
    cssTextPlugin(),
    solidBabelPlugin({ plugins: sourceLocations ? [solidSourceLocationBabelPlugin] : [] }),
  ],
});
