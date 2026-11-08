// Reads a JSON array of CommonJS module paths on stdin and prints each module's export names (or the error
// loading it threw) under the NODE_ENV the parent set.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

const paths = JSON.parse(readFileSync(0, "utf8"));
if (!Array.isArray(paths)) throw new Error("stdin must be a JSON array of module paths");

const require = createRequire(import.meta.url);
const result = {};
for (const path of paths) {
  try {
    const value = require(path);
    const exportsObject = value !== null && (typeof value === "object" || typeof value === "function");
    result[path] = { names: exportsObject ? Object.keys(value) : [] };
  } catch (error) {
    result[path] = { error: String(error instanceof Error ? error.message : error).split("\n")[0] };
  }
}
process.stdout.write(JSON.stringify(result));
// Some modules start timers when loaded; the names are all that is needed.
process.exit(0);
