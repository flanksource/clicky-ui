import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "tsdown";
import config from "../tsdown.config.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "../dist/react-grab");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(resolve(root, "dist"), { recursive: true });
execFileSync("pnpm", ["exec", "tailwindcss", "-i", resolve(root, "src/styles.css"), "-o", resolve(root, "dist/styles.css"), "-m"], { cwd: resolve(root, ".."), stdio: "inherit" });
await import("./css-rem-to-px.js");
await build(config);
for (const file of ["LICENSE", "NOTICE.md", "FORK.md", "UPSTREAM"]) copyFileSync(resolve(root, file), resolve(outDir, file));
copyFileSync(resolve(root, "dist/styles.css"), resolve(outDir, "styles.css"));
const require = createRequire(import.meta.url);
copyFileSync(resolve(dirname(require.resolve("solid-js/package.json")), "LICENSE"), resolve(outDir, "solid-js.LICENSE"));
