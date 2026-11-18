import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildLibraryRuntime, type Fragment } from "../src/build/index.ts";

const [libraryDir, basePath, ...extra] = process.argv.slice(2);
if (!libraryDir || extra.length) throw new Error("usage: build-library-runtime.ts <libraryDir> [base-fragment.json]");
const base = basePath ? JSON.parse(await readFile(resolve(basePath), "utf8")) as Fragment : undefined;
const result = await buildLibraryRuntime({ libraryDir: resolve(libraryDir), outDir: resolve(libraryDir, "dist/runtime"), ...(base ? { base } : {}) });
console.log(`${result.fragment.name}: runtime built (${Object.keys(result.fragment.integrity).length} files)`);
