// Compile src/styles/full.css with the Tailwind v4 CLI and write the result
// to dist/styles.css. We invoke the v4 CLI by absolute path because pnpm
// links the v3 `tailwindcss` bin first when both v3 and v4 are installed
// in the workspace, so `pnpm exec tailwindcss` resolves to v3.
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const pkgDir = resolve(here, "..");
const require = createRequire(import.meta.url);

const v4Pkg = require.resolve("@tailwindcss/cli/package.json");
const v4Bin = resolve(dirname(v4Pkg), "dist/index.mjs");

const child = spawn(
  process.execPath,
  [v4Bin, "-i", "src/styles/full.css", "-o", "dist/styles.css", "--minify"],
  { cwd: pkgDir, stdio: "inherit" },
);
child.on("exit", (code) => process.exit(code ?? 0));
