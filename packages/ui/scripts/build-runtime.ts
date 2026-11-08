import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildLibraryRuntime } from "../../page-runtime/src/build/index.ts";

const libraryDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const { fragment } = await buildLibraryRuntime({ libraryDir, outDir: resolve(libraryDir, "dist/runtime") });
console.log(`${fragment.name}: runtime built (${Object.keys(fragment.integrity).length} files)`);
