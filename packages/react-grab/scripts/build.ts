import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { build } from "tsdown";
import config from "../tsdown.config.js";

mkdirSync("dist", { recursive: true });
execFileSync("pnpm", ["exec", "tailwindcss", "-i", "./src/styles.css", "-o", "./dist/styles.css", "-m"], { stdio: "inherit" });
await import("./css-rem-to-px.js");
await build(config);
const require = createRequire(import.meta.url);
copyFileSync(resolve(dirname(require.resolve("solid-js/package.json")), "LICENSE"), "dist/solid-js.LICENSE");
