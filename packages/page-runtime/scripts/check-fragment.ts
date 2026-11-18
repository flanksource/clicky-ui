import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { checkFragment, type Fragment } from "../src/build/index.ts";

const [libraryDir, basePath, ...extra] = process.argv.slice(2);
if (!libraryDir || extra.length) throw new Error("usage: check-fragment.ts <libraryDir> [base-fragment.json]");
const base = basePath ? JSON.parse(await readFile(resolve(basePath), "utf8")) as Fragment : undefined;
const failures = await checkFragment({ libraryDir: resolve(libraryDir), ...(base ? { base } : {}) });
if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else console.log(`${libraryDir}: fragment checks passed`);
