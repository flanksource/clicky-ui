// Derived from react-grab (MIT, Copyright (c) 2025 Aiden Bai): packages/react-grab/vite.config.ts
import { readFileSync } from "node:fs";
import { defineConfig } from "tsdown";
import { cssTextPlugin, solidBabelPlugin, solidWebBrowserPlugin } from "./solid-babel-plugin.js";
import { solidSourceLocationBabelPlugin } from "./solid-source-location-babel-plugin.js";

const sourceLocations = process.env.REACT_GRAB_SOURCE_LOCATIONS === "true";
const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8")) as { version: string };

export default defineConfig({
  entry: { index: "./src/index.ts", "core/index": "./src/core/index.tsx", primitives: "./src/primitives.ts" },
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
